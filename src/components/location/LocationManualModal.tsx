import { useState, useCallback } from "react";
import { clsx } from "clsx";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal";
import { AddressAutocomplete } from "../address/AddressAutocomplete";
import { useCepLookup } from "../../hooks/useCepLookup";
import type { AnonymousAddress } from "../../services/anonymousAddressStorage";
import { logger } from "../../lib/logger";

interface LocationManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AnonymousAddress) => void;
}

type ModalStep = "autocomplete" | "preview";

export function LocationManualModal({
  isOpen,
  onClose,
  onConfirm,
}: LocationManualModalProps) {
  const [step, setStep] = useState<ModalStep>("autocomplete");
  const [selectedAddress, setSelectedAddress] = useState<{
    formattedAddress: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    zipcode: string;
    neighborhood: string;
    street: string;
  } | null>(null);

  const {
    lookup: lookupCep,
    loading: cepLoading,
    error: cepError,
  } = useCepLookup();

  const [cepInput, setCepInput] = useState("");

  const handleAddressChange = useCallback(
    (address: {
      formattedAddress: string;
      latitude: number;
      longitude: number;
      city: string;
      state: string;
      zipcode: string;
      neighborhood: string;
      street: string;
    }) => {
      setSelectedAddress(address);
      setStep("preview");
    },
    [],
  );

  const handleCepLookup = useCallback(async () => {
    const result = await lookupCep(cepInput);
    if (result) {
      const address = {
        formattedAddress: `${result.logradouro}, ${result.bairro} - ${result.localidade}/${result.uf}`,
        latitude: 0,
        longitude: 0,
        city: result.localidade,
        state: result.uf,
        zipcode: result.cep,
        neighborhood: result.bairro,
        street: result.logradouro,
      };
      setSelectedAddress(address);
      setStep("preview");
    }
  }, [cepInput, lookupCep]);

  const handleConfirm = useCallback(() => {
    if (!selectedAddress) return;

    const data: AnonymousAddress = {
      coordinates: {
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      },
      city: selectedAddress.city,
      state: selectedAddress.state,
      ...(selectedAddress.neighborhood
        ? { neighborhood: selectedAddress.neighborhood }
        : {}),
      formattedAddress: selectedAddress.formattedAddress,
      source: "manual",
      timestamp: Date.now(),
    };

    logger.info("LocationModal", "Endereço manual confirmado", {
      city: data.city,
      neighborhood: data.neighborhood,
    });

    onConfirm(data);
  }, [selectedAddress, onConfirm]);

  const handleBack = useCallback(() => {
    setStep("autocomplete");
    setSelectedAddress(null);
  }, []);

  const handleClose = useCallback(() => {
    setStep("autocomplete");
    setSelectedAddress(null);
    setCepInput("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="fullscreen"
      hideBackdrop
      hideCloseButton
      closeOnEsc
      footer={
        step === "preview" ? (
          <div className="px-4 py-4 pb-safe">
            <button
              onClick={handleConfirm}
              className={clsx(
                "w-full h-12 rounded-xl font-bold text-sm",
                "bg-brand-primary text-text-inverse",
                "hover:bg-brand-primary-hover transition-all active:scale-95",
                "shadow-sm",
              )}
            >
              Confirmar localização
            </button>
            <button
              onClick={handleBack}
              className={clsx(
                "w-full h-10 mt-2 rounded-xl font-medium text-sm",
                "text-text-secondary hover:text-text-primary",
                "transition-colors",
              )}
            >
              Alterar endereço
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default shrink-0 pt-safe -mx-5 -mt-5">
        {step === "preview" ? (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-surface-elevated transition-colors"
            aria-label="Voltar"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
        ) : (
          <button
            onClick={handleClose}
            className="p-2 -ml-2 rounded-lg hover:bg-surface-elevated transition-colors"
            aria-label="Fechar"
          >
            <Icon name="X" size={20} />
          </button>
        )}
        <h1 className="font-display font-bold text-lg text-text-primary">
          {step === "preview" ? "Confirmar endereço" : "Onde você está?"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === "autocomplete" && (
          <div className="p-4 space-y-6">
            <div>
              <h2 className="font-medium text-sm text-text-secondary mb-3">
                Buscar endereço
              </h2>
              <AddressAutocomplete
                onChange={handleAddressChange}
                placeholder="Digite seu endereço..."
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-border-default" />
              <span className="text-xs font-medium text-text-tertiary">ou</span>
              <span className="flex-1 h-px bg-border-default" />
            </div>

            <div>
              <h2 className="font-medium text-sm text-text-secondary mb-3">
                Buscar por CEP
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cepInput}
                  autoFocus
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
                    const formatted =
                      raw.length > 5
                        ? `${raw.slice(0, 5)}-${raw.slice(5)}`
                        : raw;
                    setCepInput(formatted);
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (
                      e.key === "Enter" &&
                      cepInput.replace(/\D/g, "").length === 8
                    ) {
                      e.preventDefault();
                      void handleCepLookup();
                    }
                  }}
                  placeholder="00000-000"
                  inputMode="numeric"
                  aria-label="Digite o CEP"
                  className={clsx(
                    "flex-1 h-12 px-4 rounded-xl border text-sm",
                    "bg-surface-elevated text-text-primary placeholder:text-text-tertiary",
                    "border-border-default focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                    "transition-all",
                  )}
                />
                <button
                  onClick={() => {
                    void handleCepLookup();
                  }}
                  disabled={
                    cepLoading || cepInput.replace(/\D/g, "").length !== 8
                  }
                  className={clsx(
                    "h-12 px-5 rounded-xl font-semibold text-sm",
                    "bg-brand-primary text-text-inverse",
                    "hover:bg-brand-primary-hover transition-all active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "inline-flex items-center gap-2",
                  )}
                >
                  {cepLoading ? (
                    <>
                      <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    "Buscar"
                  )}
                </button>
              </div>
              {cepError && (
                <p className="mt-2 text-sm text-feedback-error">{cepError}</p>
              )}
            </div>

            <p className="text-xs text-text-tertiary text-center">
              Seu endereço é usado apenas para mostrar restaurantes próximos.
              Nenhum dado é salvo permanentemente sem seu consentimento.
            </p>
          </div>
        )}

        {step === "preview" && selectedAddress && (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border border-border-default bg-surface-elevated p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <Icon
                    name="MapPin"
                    className="text-brand-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary">
                    {selectedAddress.street || selectedAddress.formattedAddress}
                  </p>
                  {selectedAddress.neighborhood && (
                    <p className="text-sm text-text-secondary mt-0.5">
                      {selectedAddress.neighborhood}
                    </p>
                  )}
                  <p className="text-sm text-text-secondary">
                    {selectedAddress.city}
                    {selectedAddress.state ? `, ${selectedAddress.state}` : ""}
                    {selectedAddress.zipcode
                      ? ` - ${selectedAddress.zipcode}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-default bg-surface-elevated p-5">
              <h3 className="font-medium text-sm text-text-primary mb-2">
                Endereço confirmado
              </h3>
              <p className="text-sm text-text-secondary">
                Seu endereço foi definido como:
              </p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {selectedAddress.formattedAddress}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-feedback-success">
                <Icon name="CheckCircle" size={14} />
                Endereço válido
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default LocationManualModal;
