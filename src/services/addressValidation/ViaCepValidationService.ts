import { get } from "../../api/httpClient";
import { logger } from "../../lib/logger";

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  cep?: string | undefined;
  street?: string | undefined;
  neighborhood?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  suggestions?: string[] | undefined;
  error?: string | undefined;
}

interface CacheEntry {
  result: ValidationResult;
  timestamp: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
const VALIDATION_CACHE_KEY = "address_validation_cache_v1";
const MIN_REQUEST_INTERVAL = 1100; // 1.1s

export class ViaCepValidationService {
  private cache: Map<string, CacheEntry> = new Map();
  private lastRequestTime = 0;

  constructor() {
    this.loadCache();
  }

  async validateByCep(cep: string): Promise<ValidationResult> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return {
        isValid: false,
        error: "CEP deve conter 8 dígitos",
      };
    }

    const cacheKey = `cep:${cleanCep}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }

    await this.throttle();

    try {
      const data = await this.lookupCep(cleanCep);
      if (data.erro) {
        const result: ValidationResult = {
          isValid: false,
          error: "CEP não encontrado",
        };
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        this.persistCache();
        return result;
      }

      const result: ValidationResult = {
        isValid: true,
        cep: data.cep,
        street: this.normalizeStreet(data.logradouro),
        city: data.localidade,
        state: data.uf,
      };
      if (data.bairro) {
        result.neighborhood = data.bairro;
      }

      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      this.persistCache();
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("ViaCEP", "Falha na validação por CEP", {
        cep: cleanCep,
        error: message,
      });
      return {
        isValid: false,
        error: "Não foi possível validar o CEP. Tente novamente.",
      };
    }
  }

  async validateByAddress(data: {
    uf: string;
    localidade: string;
    logradouro: string;
    numero?: string;
  }): Promise<ValidationResult> {
    const { uf, localidade, logradouro } = data;
    if (!uf || !localidade || !logradouro) {
      return {
        isValid: false,
        error: "UF, cidade e logradouro são obrigatórios",
      };
    }

    const cacheKey = `addr:${uf}:${localidade}:${this.normalizeStreet(logradouro)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }

    await this.throttle();

    try {
      const results = await this.lookupByAddress(uf, localidade, logradouro);
      if (results.length === 0) {
        const result: ValidationResult = {
          isValid: false,
          error: "Endereço não encontrado",
        };
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        this.persistCache();
        return result;
      }

      // Pega o primeiro resultado (mais relevante)
      const first = results[0];
      if (!first) {
        return {
          isValid: false,
          error: "Endereço não encontrado",
        };
      }
      const result: ValidationResult = {
        isValid: true,
        cep: first.cep,
        street: this.normalizeStreet(first.logradouro),
        city: first.localidade,
        state: first.uf,
      };
      if (first.bairro) {
        result.neighborhood = first.bairro;
      }

      // Se houver múltiplos resultados, sugerir os CEPs
      if (results.length > 1) {
        result.suggestions = results
          .map((r) => r.cep)
          .filter((v, i, a) => a.indexOf(v) === i);
      }

      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      this.persistCache();
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("ViaCEP", "Falha na validação por endereço", {
        uf,
        localidade,
        logradouro,
        error: message,
      });
      return {
        isValid: false,
        error: "Não foi possível validar o endereço. Tente novamente.",
      };
    }
  }

  async validateFullAddress(data: {
    cep?: string;
    street?: string;
    city?: string;
    state?: string;
    number?: string;
  }): Promise<ValidationResult> {
    // Se tiver CEP, validar por CEP primeiro
    if (data.cep) {
      const cepResult = await this.validateByCep(data.cep);
      if (cepResult.isValid) {
        // Se forneceu também outros campos, verificar consistência
        const inconsistencies: string[] = [];

        if (data.street && !this.fuzzyMatch(data.street, cepResult.street)) {
          inconsistencies.push(
            `Rua: esperada "${cepResult.street}", recebida "${data.street}"`,
          );
        }
        if (data.city && !this.fuzzyMatch(data.city, cepResult.city)) {
          inconsistencies.push(
            `Cidade: esperada "${cepResult.city}", recebida "${data.city}"`,
          );
        }
        if (data.state && !this.fuzzyMatch(data.state, cepResult.state)) {
          inconsistencies.push(
            `UF: esperada "${cepResult.state}", recebida "${data.state}"`,
          );
        }

        if (inconsistencies.length > 0) {
          logger.warn("ViaCEP", "Endereço fornecido não corresponde ao CEP", {
            cep: data.cep,
            inconsistencies,
          });
          return {
            isValid: false,
            error: "Os dados do endereço não correspondem ao CEP informado.",
            suggestions: inconsistencies,
            cep: cepResult.cep,
            street: cepResult.street,
            city: cepResult.city,
            state: cepResult.state,
            ...(cepResult.neighborhood
              ? { neighborhood: cepResult.neighborhood }
              : {}),
          };
        }

        return cepResult;
      }
    }

    // Se não tiver CEP ou CEP inválido, validar por endereço completo
    if (data.street && data.city && data.state) {
      const params: { uf: string; localidade: string; logradouro: string } = {
        uf: data.state,
        localidade: data.city,
        logradouro: data.street,
      };
      if (data.number !== undefined) {
        // @ts-expect-error - adiciona numero apenas se definido
        params.numero = data.number;
      }
      const addressResult = await this.validateByAddress(params);
      return addressResult;
    }

    return {
      isValid: false,
      error:
        "Forneça CEP ou endereço completo (rua, cidade, UF) para validação.",
    };
  }

  clearCache(): void {
    this.cache.clear();
    try {
      localStorage.removeItem(VALIDATION_CACHE_KEY);
    } catch {
      // ignore
    }
  }

  private async lookupCep(cep: string): Promise<ViaCepResponse> {
    const url = `/viacep/ws/${cep.slice(0, 5)}-${cep.slice(5)}/json/`;
    const res = await get<ViaCepResponse>(url);
    return res;
  }

  private async lookupByAddress(
    uf: string,
    localidade: string,
    logradouro: string,
  ): Promise<ViaCepResponse[]> {
    const encodedLogradouro = encodeURIComponent(logradouro);
    const url = `/viacep/ws/${uf}/${localidade}/${encodedLogradouro}/json/`;
    const res = await get<ViaCepResponse[]>(url);
    return Array.isArray(res) ? res : [];
  }

  private throttle(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < MIN_REQUEST_INTERVAL) {
        setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed);
      } else {
        this.lastRequestTime = now;
        resolve();
      }
    });
  }

  private loadCache(): void {
    try {
      const raw = localStorage.getItem(VALIDATION_CACHE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, CacheEntry>;
      this.cache = new Map(Object.entries(data));
    } catch {
      // cache invalid, ignore
    }
  }

  private persistCache(): void {
    try {
      const obj: Record<string, CacheEntry> = {};
      for (const [key, entry] of this.cache.entries()) {
        obj[key] = entry;
      }
      localStorage.setItem(VALIDATION_CACHE_KEY, JSON.stringify(obj));
    } catch {
      // localStorage indisponível, ignorar
    }
  }

  private normalizeStreet(street: string): string {
    return street
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .toLowerCase();
  }

  private fuzzyMatch(a: string | undefined, b: string | undefined): boolean {
    if (!a || !b) return false;
    const normA = a
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    const normB = b
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return normA === normB;
  }
}

let instance: ViaCepValidationService | null = null;

export function getViaCepValidationService(): ViaCepValidationService {
  if (!instance) {
    instance = new ViaCepValidationService();
  }
  return instance;
}
