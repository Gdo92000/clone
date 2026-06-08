import type { ReverseGeocodeResult } from '../../providers/geocoding/IGeocodingProvider';
import { viaCepApi } from '../../api/viaCepApi';
import { logger } from '../../lib/logger';
import {
  recordViaCepHit,
  recordViaCepMiss,
  recordViaCepDivergence,
  recordViaCepLookupByAddress,
} from './geocodingMetrics';

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function streetRoot(value: string): string {
  return normalizeName(value).split(' ').slice(0, 2).join(' ');
}

export async function enrichWithViaCep(
  result: ReverseGeocodeResult,
): Promise<ReverseGeocodeResult> {
  if (!result.postcode || result.postcode.length !== 8) {
    return result;
  }

  try {
    const viaCepResult = await viaCepApi.lookup(result.postcode);

    if (viaCepResult.erro) {
      recordViaCepMiss();
      return result;
    }

    const viaCepNeighborhood = viaCepResult.bairro.trim();
    if (!viaCepNeighborhood) {
      recordViaCepMiss();
      return result;
    }

    recordViaCepHit();

    const originalNeighborhood = result.originalNeighborhood ?? result.neighborhood;
    const normalizedViaCep = normalizeName(viaCepNeighborhood);
    const normalizedOriginal = normalizeName(originalNeighborhood ?? '');

    if (!normalizedOriginal.includes(normalizedViaCep)) {
      recordViaCepDivergence();
      logger.info(
        'ViaCEP',
        `Divergência de bairro: Nominatim="${originalNeighborhood}", ViaCEP="${viaCepNeighborhood}", CEP=${result.postcode}`,
      );

      const refined = await refineNeighborhoodByAddressLookup(
        result,
        viaCepResult.logradouro,
      );
      if (refined) {
        return refined;
      }
    }

    const stateCode = result.stateCode ?? (result.state ? result.state.substring(0, 2).toUpperCase() : '');
    const displayName = `${viaCepNeighborhood}\n${result.city} - ${stateCode}`;

    return {
      ...result,
      neighborhood: viaCepNeighborhood,
      displayName,
    };
  } catch {
    recordViaCepMiss();
    return result;
  }
}

async function refineNeighborhoodByAddressLookup(
  result: ReverseGeocodeResult,
  viaCepStreet: string,
): Promise<ReverseGeocodeResult | null> {
  const stateCode = result.stateCode ?? (result.state ? result.state.substring(0, 2).toUpperCase() : '');
  const city = result.city;
  const nominatimStreet = result.street ?? '';

  const streetCandidate = [nominatimStreet, viaCepStreet]
    .map((s) => s.trim())
    .filter((s) => s.length >= 3)
    .sort((a, b) => b.length - a.length)[0];

  if (!streetCandidate || streetCandidate.length < 3 || !city || !stateCode) {
    return null;
  }

  const root = streetRoot(streetCandidate);
  if (root.length < 3) {
    return null;
  }

  try {
    recordViaCepLookupByAddress();
    const candidates = await viaCepApi.lookupByAddress(stateCode, city, root);
    if (candidates.length === 0) {
      return null;
    }

    const streetWords = normalizeName(streetCandidate).split(' ').filter((w) => w.length >= 3);
    const scored = candidates
      .map((c) => {
        if (!c.bairro || c.erro) return { c, score: -1 };
        const logradouroNorm = normalizeName(c.logradouro);
        const matchCount = streetWords.filter((w) => logradouroNorm.includes(w)).length;
        return { c, score: matchCount };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const best = scored[0]?.c;
    if (!best || !best.bairro) {
      return null;
    }

    const refinedNeighborhood = best.bairro.trim();
    const refinedPostcode = best.cep ? best.cep.replace(/\D/g, '') : (result.postcode ?? '');

    logger.info(
      'ViaCEP',
      `Refinado por endereço: logradouro="${best.logradouro}", bairro="${refinedNeighborhood}", CEP=${refinedPostcode}`,
    );

    return {
      ...result,
      street: best.logradouro,
      neighborhood: refinedNeighborhood,
      postcode: refinedPostcode,
      displayName: `${refinedNeighborhood}\n${result.city} - ${stateCode}`,
    };
  } catch (err) {
    logger.warn('ViaCEP', 'Falha no lookup por endereço', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

