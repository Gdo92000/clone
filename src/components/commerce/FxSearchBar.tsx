import { useState } from 'react';
import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';

export interface FxSearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function FxSearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Busque por restaurante ou prato',
  className,
}: FxSearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={clsx('w-full', className)}>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); }}
          placeholder={placeholder}
          className="
            w-full h-12 pl-12 pr-4 rounded-full
            bg-surface-background border border-border-default
            text-text-primary placeholder:text-text-tertiary
            transition-colors duration-150
            focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20
          "
        />

        {value && (
          <button
             type="button"
             onClick={() => { setValue(''); }}
             className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-text-tertiary/20 flex items-center justify-center hover:bg-text-tertiary/40 transition-colors"
             aria-label="Limpar busca"
           >
            <Icon name="X" size={16} className="text-text-secondary" />
          </button>
        )}
      </div>
    </form>
  );
}

export default FxSearchBar;