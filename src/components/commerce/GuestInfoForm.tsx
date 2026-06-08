import { clsx } from "clsx";
import { Icon } from "../ui/Icon";
import type { GuestInfo , ValidationErrors } from "../../hooks/useGuestCheckout";


interface GuestInfoFormProps {
  value: GuestInfo;
  errors: ValidationErrors;
  onChange: (field: keyof GuestInfo, value: string) => void;
  onBlur?: (field: keyof GuestInfo) => void;
}

/**
 * Formulário de informações básicas para checkout como guest.
 * Coleta nome, telefone e email sem exigir cadastro.
 */
export function GuestInfoForm({ value, errors, onChange, onBlur }: GuestInfoFormProps) {
  const nameError = errors["name"];
  const phoneError = errors["phone"];
  const emailError = errors["email"];

  return (
    <div className="space-y-4">
      {/* Região de anúncio de erros para leitores de tela */}
      {(nameError || phoneError || emailError) && (
        <div role="alert" aria-live="polite" className="sr-only">
          {nameError && `Nome: ${nameError}. `}
          {phoneError && `Telefone: ${phoneError}. `}
          {emailError && `E-mail: ${emailError}. `}
        </div>
      )}
      <div>
        <label
          htmlFor="guest-name"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Nome completo *
        </label>
        <input
          id="guest-name"
          type="text"
          value={value.name}
          onChange={(e) => {
            onChange("name", e.target.value);
          }}
          onBlur={() => {
            onBlur?.("name");
          }}
          placeholder="Seu nome"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "guest-name-error" : undefined}
          className={clsx(
            "w-full h-11 px-4 rounded-xl border text-sm transition-all",
            "bg-surface-elevated text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
            nameError
              ? "border-feedback-error focus:border-feedback-error"
              : "border-border-default focus:border-brand-primary",
          )}
        />
        {nameError && (
          <p id="guest-name-error" className="mt-1 text-xs text-feedback-error">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="guest-phone"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Telefone (WhatsApp) *
        </label>
        <input
          id="guest-phone"
          type="tel"
          value={value.phone}
          onChange={(e) => {
            onChange("phone", e.target.value);
          }}
          onBlur={() => {
            onBlur?.("phone");
          }}
          placeholder="(16) 99999-9999"
          inputMode="numeric"
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? "guest-phone-error" : undefined}
          className={clsx(
            "w-full h-11 px-4 rounded-xl border text-sm transition-all",
            "bg-surface-elevated text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
            phoneError
              ? "border-feedback-error focus:border-feedback-error"
              : "border-border-default focus:border-brand-primary",
          )}
        />
        {phoneError && (
          <p
            id="guest-phone-error"
            className="mt-1 text-xs text-feedback-error"
          >
            {phoneError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="guest-email"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          E-mail *
        </label>
        <input
          id="guest-email"
          type="email"
          value={value.email}
          onChange={(e) => {
            onChange("email", e.target.value);
          }}
          onBlur={() => {
            onBlur?.("email");
          }}
          placeholder="seu@email.com"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "guest-email-error" : undefined}
          className={clsx(
            "w-full h-11 px-4 rounded-xl border text-sm transition-all",
            "bg-surface-elevated text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
            emailError
              ? "border-feedback-error focus:border-feedback-error"
              : "border-border-default focus:border-brand-primary",
          )}
        />
        {emailError && (
          <p
            id="guest-email-error"
            className="mt-1 text-xs text-feedback-error"
          >
            {emailError}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-brand-primary/5 p-3 text-xs text-text-secondary">
        <Icon
          name="Info"
          className="mt-0.5 shrink-0 text-brand-primary"
          size={14}
        />
        <p>
          Seus dados são usados apenas para este pedido. Você pode criar uma
          conta depois para acompanhar o histórico.
        </p>
      </div>
    </div>
  );
}
