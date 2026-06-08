import { useState, useCallback, useEffect } from "react";
import { storageService } from "../storage/storageService";

export interface GuestInfo {
  name: string;
  phone: string;
  email: string;
}

const STORAGE_KEY = "guest_checkout_info";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
}

/**
 * Hook para gerenciar informações do usuário guest durante o checkout.
 * Persiste em localStorage para não perder ao recarregar a página.
 */
export function useGuestCheckout() {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(() => {
    const saved = storageService.get(STORAGE_KEY) as GuestInfo | null;
    return saved ?? { name: "", phone: "", email: "" };
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const hasData = guestInfo.name || guestInfo.phone || guestInfo.email;
    if (hasData) {
      storageService.set(STORAGE_KEY, guestInfo);
    }
  }, [guestInfo]);

  const updateField = useCallback((field: keyof GuestInfo, value: string) => {
    setGuestInfo((prev) => ({ ...prev, [field]: value }));
    setTouched(true);

    // Limpar erro do campo ao digitar
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const validateField = useCallback((field: keyof GuestInfo, value: string): string | undefined => {
    if (field === "name") {
      if (!value.trim()) return "Nome é obrigatório";
      if (value.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
      return undefined;
    }
    if (field === "phone") {
      if (!value.trim()) return "Telefone é obrigatório";
      const cleanPhone = value.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return "Telefone inválido. Use DDD + número (ex: 16999999999)";
      }
      if (!PHONE_REGEX.test(value)) {
        return "Formato de telefone inválido";
      }
      return undefined;
    }
    if (!value.trim()) return "E-mail é obrigatório";
    if (!EMAIL_REGEX.test(value)) return "E-mail inválido";
    return undefined;
  }, []);

  const onBlurField = useCallback((field: keyof GuestInfo) => {
    setTouched(true);
    const value = guestInfo[field];
    const error = validateField(field, value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, [field]: error };
      }
      const { [field]: _removed, ...rest } = prev;
      void _removed;
      return rest;
    });
  }, [guestInfo, validateField]);

  const validate = useCallback((): boolean => {
    const filtered: ValidationErrors = {};
    const nameError = validateField("name", guestInfo.name);
    if (nameError) filtered.name = nameError;
    const phoneError = validateField("phone", guestInfo.phone);
    if (phoneError) filtered.phone = phoneError;
    const emailError = validateField("email", guestInfo.email);
    if (emailError) filtered.email = emailError;
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  }, [guestInfo, validateField]);

  const clear = useCallback(() => {
    setGuestInfo({ name: "", phone: "", email: "" });
    setErrors({});
    setTouched(false);
    storageService.remove(STORAGE_KEY);
  }, []);

  const isValid =
    guestInfo.name.trim().length >= 3 &&
    guestInfo.phone.replace(/\D/g, "").length >= 10 &&
    EMAIL_REGEX.test(guestInfo.email);

  return {
    guestInfo,
    errors,
    touched,
    isValid,
    updateField,
    onBlurField,
    validate,
    clear,
  };
}
