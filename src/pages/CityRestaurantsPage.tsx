import { useEffect, useState } from 'react';
import { LocationSelector } from '../components/location/LocationSelector';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Icon } from '../components/ui/Icon';
import { useLocationContext } from '../context/LocationContext';
import { useLiveCityEstablishments } from '../hooks';
import { formatDistance } from '../services/locationService';

const radiusOptions = [2, 5, 8, 12] as const;

function formatMapsUrl(latitude: number, longitude: number): string {
   return `https://www.google.com/maps?q=${latitude},${longitude}`;
 }

export function CityRestaurantsPage() {
  const [radiusKm, setRadiusKm] = useState<(typeof radiusOptions)[number]>(5);
  const { city, requestLocation, refreshLocation, loading: locationLoading } = useLocationContext();
  const {
    establishments,
    loading,
    error,
    protection,
    search,
    clear,
  } = useLiveCityEstablishments({
    radiusKm,
    limit: 60,
  });

  useEffect(() => {
     if (protection.canSearch && !loading) {
       search();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [radiusKm, protection.canSearch]);

  const handleRadiusChange = (value: (typeof radiusOptions)[number]) => {
    setRadiusKm(value);
    clear();
  };

  return (
    <div className="min-h-screen bg-surface-background pb-20 md:pb-0">
      <FxPageNavbar title="Perto de você" />

      <main className="fx-container py-4 space-y-5">
        <LocationSelector />

        <section className="bg-surface-elevated border border-border-default rounded-xl p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-text-secondary">Cidade detectada</p>
              <h1 className="font-display text-2xl font-bold text-text-primary truncate">
                {city ? `${city.name}, ${city.state}` : 'Aguardando localização'}
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Raio ativo: {formatDistance(protection.activeRadiusKm)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={refreshLocation}
                disabled={locationLoading || loading}
                className="h-11 w-11 rounded-lg border border-border-default text-text-primary hover:border-brand-primary disabled:opacity-50"
                title="Atualizar localizacao"
                aria-label="Atualizar localizacao"
              >
                <span className="sr-only">Atualizar localizacao</span>
                <Icon name="RefreshCw" className="mx-auto" size={20} />
              </button>
              <button
                type="button"
                onClick={requestLocation}
                disabled={locationLoading || loading}
                className="h-11 w-11 rounded-lg border border-border-default text-text-primary hover:border-brand-primary disabled:opacity-50"
                title="Usar GPS"
                aria-label="Usar GPS"
              >
                <span className="sr-only">Usar GPS</span>
                <Icon name="Crosshair" className="mx-auto" size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {radiusOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { handleRadiusChange(option); }}
                className={`
                  h-9 rounded-full px-4 text-sm font-medium transition-colors
                  ${radiusKm === option
                    ? 'bg-brand-primary text-text-inverse'
                    : 'border border-border-default bg-surface-elevated text-text-secondary hover:border-brand-primary'
                  }
                `}
              >
                {option} km
              </button>
            ))}
          </div>

          {protection.reason && (
            <div className="rounded-lg border border-feedback-warning/30 bg-feedback-warning/10 p-3 text-sm text-text-primary">
              {protection.reason}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-feedback-error/30 bg-feedback-error/10 p-3 text-sm text-feedback-error">
              {error}
            </div>
          )}

        </section>

        <section>
           <div className="flex items-center justify-between mb-3">
             <h2 className="font-display text-xl font-bold text-text-primary">
               {loading ? 'Buscando...' : `${establishments.length} encontrados`}
             </h2>
           </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl border border-border-default bg-surface-elevated"
                />
              ))}
            </div>
          ) : establishments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {establishments.map((establishment) => (
                <article
                  key={establishment.id}
                  className="rounded-xl border border-border-default bg-surface-elevated p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">
                        {establishment.name}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {establishment.category}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-semibold text-brand-primary">
                      {formatDistance(establishment.distanceKm)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-text-secondary">
                    {establishment.address && (
                      <p className="line-clamp-2">{establishment.address}</p>
                    )}
                    {establishment.openingHours && (
                      <p className="line-clamp-1">{establishment.openingHours}</p>
                    )}
                    {establishment.phone && (
                      <p className="line-clamp-1">{establishment.phone}</p>
                    )}
                  </div>

                  <a
                    href={formatMapsUrl(establishment.latitude, establishment.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border-default px-3 text-sm font-medium text-text-primary hover:border-brand-primary"
                  >
                    Abrir mapa
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border-default bg-surface-elevated p-8 text-center">
              <h3 className="font-semibold text-text-primary">
                Nenhum resultado carregado
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                Use o GPS para identificar a cidade e buscar apenas onde houver cadastro local.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
