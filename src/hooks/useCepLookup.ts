import { useState, useCallback, useRef } from 'react';

export interface CepAddress {
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
}

export interface UseCepLookupOptions {
  onSuccess?: (address: CepAddress) => void;
  onError?: (error: string) => void;
  onLoading?: (loading: boolean) => void;
}

export interface UseCepLookupReturn {
  lookup: (cep: string) => Promise<CepAddress | null>;
  loading: boolean;
  error: string | null;
  address: CepAddress | null;
  reset: () => void;
  formatCep: (value: string) => string;
}

function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '');
}

function isValidCep(cep: string): boolean {
  const cleaned = cleanCep(cep);
  return cleaned.length === 8;
}

export function useCepLookup(options?: UseCepLookupOptions): UseCepLookupReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<CepAddress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
    setAddress(null);
  }, []);

  const lookup = useCallback(
    async (cep: string): Promise<CepAddress | null> => {
      const cleanedCep = cleanCep(cep);

      if (!isValidCep(cleanedCep)) {
        setError('CEP inválido');
        setAddress(null);
        options?.onError?.('CEP inválido');
        return null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);
      options?.onLoading?.(true);

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanedCep}/json/`,
          {
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao consultar CEP');
        }

        const data = await response.json() as CepAddress & { erro?: boolean };

        if (data.erro) {
          throw new Error('CEP não encontrado');
        }

        const addressData: CepAddress = data;

        setAddress(addressData);
        setError(null);
        options?.onSuccess?.(addressData);
        options?.onLoading?.(false);

        return addressData;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao consultar CEP';
        setError(errorMessage);
        setAddress(null);
        options?.onError?.(errorMessage);
        options?.onLoading?.(false);

        return null;
      }
    },
    [options]
  );

  const formatCep = useCallback((value: string): string => {
    const cleaned = cleanCep(value);
    if (cleaned.length <= 5) {
      return cleaned;
    }
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  }, []);

  return {
    lookup,
    loading,
    error,
    address,
    reset,
    formatCep,
  };
}