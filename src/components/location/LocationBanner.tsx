import { useState, useCallback, type ReactNode } from "react";
import { clsx } from "clsx";
import { Icon } from "../ui/Icon";
import { useLocationContext } from "../../context/LocationContext";
import type { AnonymousAddress } from "../../services/anonymousAddressStorage";
import { anonymousAddressStorage } from "../../services/anonymousAddressStorage";
import { LocationManualModal } from "./LocationManualModal";

interface LocationBannerProps {
  className?: string;
  onLocationFound?: (data: AnonymousAddress) => void;
}

type BannerState = "hidden" | "idle" | "requesting" | "denied" | "cached";

function resolveBannerState(
  status: string,
  loading: boolean,
  coordinates: unknown,
  city: unknown,
  source: string | null,
  hasAnonymousCache: boolean,
  dismissed: boolean,
): BannerState {
  const hasGpsLocation =
    (status === "SUCCESS" || status === "FALLBACK_IP") &&
    coordinates != null &&
    city != null;

  if (hasGpsLocation && source != null && source !== "cache") return "hidden";
  if (hasGpsLocation && dismissed) return "hidden";
  if (hasAnonymousCache && dismissed) return "hidden";
  if (loading || status === "REQUESTING") return "requesting";
  if ((status === "DENIED" || status === "ERROR") && !city) return "denied";
  if (hasAnonymousCache && !dismissed) return "cached";
  if (status === "IDLE") return "idle";

  return "hidden";
}

/**
 * Banner principal de localização para a HomePage.
 *
 * Gerencia os estados:
 * - IDLE: CTA "Usar minha localização"
 * - REQUESTING: Spinner de detecção
 * - DENIED/ERROR: Mensagem + botões de retry e manual
 * - CACHED: Badge informativo com endereço anônimo
 * - HIDDEN: Localização GPS real ativa, não exibe nada
 */
export function LocationBanner({
  className,
  onLocationFound,
}: LocationBannerProps) {
  const { city, coordinates, loading, error, status, requestLocation, source } =
    useLocationContext();

  const [showManualModal, setShowManualModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const hasAnonymousCache = anonymousAddressStorage.exists();
  const bannerState = resolveBannerState(
    status,
    loading,
    coordinates,
    city,
    source,
    hasAnonymousCache,
    dismissed,
  );

  const handleRequestLocation = useCallback(() => {
    void requestLocation();
  }, [requestLocation]);

  const handleOpenManual = useCallback(() => {
    setShowManualModal(true);
  }, []);

  const handleManualLocation = useCallback(
    (data: AnonymousAddress) => {
      anonymousAddressStorage.save(data);
      setShowManualModal(false);
      setDismissed(true);
      onLocationFound?.(data);
    },
    [onLocationFound],
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (bannerState === "hidden") return null;

  return (
    <>
      {bannerState === "idle" && (
        <BannerContainer className={className}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-primary/15 flex items-center justify-center shrink-0">
              <Icon name="MapPin" className="text-brand-primary" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-lg text-text-primary">
                Onde você está?
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Use sua localização para ver restaurantes perto de você
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={handleRequestLocation}
                  className={clsx(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                    "bg-brand-primary text-text-inverse font-semibold text-sm",
                    "hover:bg-brand-primary-hover transition-all active:scale-95",
                    "shadow-sm",
                  )}
                >
                  <Icon name="Crosshair" size={16} />
                  Usar minha localização
                </button>
                <button
                  onClick={handleOpenManual}
                  className={clsx(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                    "border border-border-default text-text-primary font-medium text-sm",
                    "hover:border-brand-primary hover:text-brand-primary transition-all active:scale-95",
                  )}
                >
                  <Icon name="Pen" size={16} />
                  Digitar endereço
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-background transition-colors shrink-0"
              aria-label="Fechar banner"
            >
              <Icon name="X" className="text-text-tertiary" size={18} />
            </button>
          </div>
        </BannerContainer>
      )}

      {bannerState === "requesting" && (
        <BannerContainer className={className}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <span className="block w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">
                Detectando sua localização...
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                Permita o acesso à localização quando solicitado
              </p>
            </div>
          </div>
        </BannerContainer>
      )}

      {bannerState === "denied" && (
        <BannerContainer className={className}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-feedback-warning/15 flex items-center justify-center shrink-0">
              <Icon name="MapPin" className="text-feedback-warning" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-lg text-text-primary">
                Localização indisponível
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {error ?? "Não foi possível acessar sua localização."}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={handleRequestLocation}
                  disabled={loading}
                  className={clsx(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                    "bg-brand-primary text-text-inverse font-semibold text-sm",
                    "hover:bg-brand-primary-hover transition-all",
                    "disabled:opacity-50",
                  )}
                >
                  <Icon name="RefreshCw" size={16} />
                  Tentar novamente
                </button>
                <button
                  onClick={handleOpenManual}
                  className={clsx(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                    "border border-border-default text-text-primary font-medium text-sm",
                    "hover:border-brand-primary hover:text-brand-primary transition-all active:scale-95",
                  )}
                >
                  <Icon name="Pen" size={16} />
                  Digitar endereço manualmente
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-background transition-colors shrink-0"
              aria-label="Fechar banner"
            >
              <Icon name="X" className="text-text-tertiary" size={18} />
            </button>
          </div>
        </BannerContainer>
      )}

      {bannerState === "cached" && (
        <BannerContainer className={className} compact>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Icon name="MapPin" className="text-brand-primary" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {city?.name ?? "Localização salva"}
              </p>
              <p className="text-xs text-text-secondary">
                Endereço informado anteriormente
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenManual}
                className="p-2 rounded-lg hover:bg-surface-background transition-colors text-text-secondary hover:text-brand-primary"
                aria-label="Alterar localização"
                title="Alterar localização"
              >
                <Icon name="Pen" size={16} />
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg hover:bg-surface-background transition-colors text-text-secondary hover:text-text-primary"
                aria-label="Fechar"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        </BannerContainer>
      )}

      {/* Modal de endereço manual — renderizado em todos os estados visíveis */}
      <LocationManualModal
        isOpen={showManualModal}
        onClose={() => {
          setShowManualModal(false);
        }}
        onConfirm={handleManualLocation}
      />
    </>
  );
}

/** Container compartilhado entre os estados do banner */
function BannerContainer({
  children,
  className,
  compact = false,
}: {
  children: ReactNode;
  className?: string | undefined;
  compact?: boolean | undefined;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-border-default bg-surface-elevated min-h-[200px]",
        compact ? "p-3" : "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export default LocationBanner;
