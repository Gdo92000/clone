import { useState, useCallback, useRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Icon } from './Icon';
import { useCepLookup, type CepAddress } from '../../hooks';

export interface FxCepInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  onCepFound?: (address: CepAddress) => void;
  onCepError?: (error: string) => void;
  onCepLoading?: (loading: boolean) => void;
  inputSize?: 'sm' | 'md' | 'lg';
  debounceMs?: number;
  label?: string;
}

const sizeClasses = {
  sm: 'h-9 text-sm px-3',
  md: 'h-11 text-base px-4',
  lg: 'h-14 text-lg px-5',
};

export function FxCepInput({
  value,
  onChange,
  onCepFound,
  onCepError,
  onCepLoading,
  inputSize = 'md',
  debounceMs = 500,
  label,
  className,
  disabled,
  ...props
}: FxCepInputProps) {
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLookupRef = useRef<string>('');

  const handleCepSuccess = useCallback(
    (address: CepAddress) => {
      setHasAutoFilled(true);
      onCepFound?.(address);
    },
    [onCepFound]
  );

  const handleCepError = useCallback(
    (error: string) => {
      setHasAutoFilled(false);
      onCepError?.(error);
    },
    [onCepError]
  );

  const handleCepLoading = useCallback(
    (loading: boolean) => {
      onCepLoading?.(loading);
    },
    [onCepLoading]
  );

  const { lookup, loading, formatCep } = useCepLookup({
    onSuccess: handleCepSuccess,
    onError: handleCepError,
    onLoading: handleCepLoading,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCep(rawValue);
    const cleanedCep = rawValue.replace(/\D/g, '');

    onChange(formattedValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (cleanedCep.length === 8 && cleanedCep !== lastLookupRef.current) {
      lastLookupRef.current = cleanedCep;
      debounceTimerRef.current = setTimeout(() => {
        void lookup(cleanedCep);
      }, debounceMs);
    } else if (cleanedCep.length < 8) {
      setHasAutoFilled(false);
    }
  };

  const handleFocus = () => {
    if (value && !hasAutoFilled) {
      lastLookupRef.current = value.replace(/\D/g, '');
    }
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="00000-000"
          className={clsx(
            'w-full rounded-lg border bg-surface-background',
            'text-text-primary placeholder:text-text-tertiary',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2',
            sizeClasses[inputSize],
            loading && 'pr-10',
            hasAutoFilled && !disabled && 'border-feedback-success focus:border-feedback-success focus:ring-feedback-success/20',
            !hasAutoFilled && 'border-border-default focus:border-border-focus focus:ring-brand-primary/20',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-elevated',
            className
          )}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && hasAutoFilled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon name="CheckCircle" className="text-feedback-success" size={20} />
          </div>
        )}
      </div>
    </div>
  );
}