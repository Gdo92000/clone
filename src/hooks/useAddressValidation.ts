import { useCallback, useRef, useState } from "react";
import type { ValidationResult } from "../services/addressValidation/ViaCepValidationService";
import { getViaCepValidationService } from "../services/addressValidation/ViaCepValidationService";
import { logger } from "../lib/logger";

export interface UseAddressValidationReturn {
  validate: (data: {
    cep?: string;
    street?: string;
    city?: string;
    state?: string;
    number?: string;
  }) => Promise<ValidationResult>;
  clearCache: () => void;
  isValidating: boolean;
}

export function useAddressValidation(): UseAddressValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const serviceRef = useRef(getViaCepValidationService());

  const validate = useCallback(
    async (data: {
      cep?: string;
      street?: string;
      city?: string;
      state?: string;
      number?: string;
    }): Promise<ValidationResult> => {
      setIsValidating(true);
      try {
        const result = await serviceRef.current.validateFullAddress(data);
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";
        logger.error("useAddressValidation", "Validation failed", {
          error: message,
          data,
        });
        return {
          isValid: false,
          error: "Erro interno na validação. Tente novamente.",
        };
      } finally {
        setIsValidating(false);
      }
    },
    [],
  );

  const clearCache = useCallback(() => {
    serviceRef.current.clearCache();
  }, []);

  return {
    validate,
    clearCache,
    isValidating,
  };
}
