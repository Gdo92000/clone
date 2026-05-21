import { useRef, useEffect, useState } from 'react';
import { useLocationContext } from '../../context/LocationContext';
import { useAddressSearch } from '../../hooks/useAddressSearch';
import type { AutocompleteSuggestion } from '../../services/addressAutocompleteService';
import { Icon } from '../ui/Icon';
import { AddressMap } from './AddressMap';

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (address: {
    formattedAddress: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    zipcode: string;
    neighborhood: string;
    street: string;
  }) => void;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Digite seu endereço...',
}: AddressAutocompleteProps) {
  const { city } = useLocationContext();
  const targetCity = city?.name;

  const {
    query,
    setQuery,
    suggestions,
    selected,
    selectSuggestion,
    confirmAddress,
    loading,
    geocoding,
    error,
    clear,
  } = useAddressSearch(targetCity);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value, query, setQuery]);

  const lastSelectedRef = useRef<AutocompleteSuggestion | null>(null);

  useEffect(() => {
    if (selected && onChange && selected !== lastSelectedRef.current) {
      lastSelectedRef.current = selected;
      onChange({
        formattedAddress: selected.formattedAddress,
        latitude: selected.latitude,
        longitude: selected.longitude,
        city: selected.city,
        state: selected.state,
        zipcode: selected.zipcode,
        neighborhood: selected.neighborhood,
        street: selected.street,
      });
    }
  }, [selected, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
  };

  const handleSelect = (suggestion: (typeof suggestions)[0]) => {
    void selectSuggestion(suggestion);
    setActiveIndex(-1);
  };

  const scrollToActive = (index: number) => {
    const item = listRef.current?.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.min(prev + 1, suggestions.length - 1);
          scrollToActive(next);
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          scrollToActive(next);
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          const selected = suggestions[activeIndex];
          if (selected) handleSelect(selected);
        } else {
          void confirmAddress();
        }
        break;
      case 'Escape':
        setQuery('');
        setActiveIndex(-1);
        break;
    }
  };

  const showDropdown = suggestions.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="address-suggestions"
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-border-default bg-surface-elevated text-text-primary placeholder:text-text-tertiary text-sm transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
          {query && (
            <button
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              aria-label="Limpar"
            >
              <Icon name="X" size={18} />
            </button>
          )}
        </div>

        {loading && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-text-secondary">
            <span className="block w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            Buscando endereços...
          </div>
        )}

        {showDropdown && (
          <ul
            ref={listRef}
            id="address-suggestions"
            role="listbox"
            className="absolute z-50 mt-2 w-full bg-surface-elevated border border-border-default rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => { handleSelect(suggestion); }}
                className={`flex items-start gap-3 px-4 py-3 text-sm cursor-pointer transition-colors border-b border-border-default last:border-b-0 ${
                  index === activeIndex
                    ? 'bg-brand-primary/10 text-text-primary'
                    : 'text-text-secondary hover:bg-surface-background'
                }`}
              >
                <Icon name="MapPin" className="mt-0.5 shrink-0 text-brand-primary" size={16} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">
                    {suggestion.street || suggestion.formattedAddress.split(',')[0]}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                    {suggestion.neighborhood && (
                      <span className="text-xs text-text-tertiary">
                        {suggestion.neighborhood}
                      </span>
                    )}
                    {suggestion.neighborhood && suggestion.city && (
                      <span className="text-xs text-text-tertiary">&bull;</span>
                    )}
                    {suggestion.city && (
                      <span className="text-xs text-text-tertiary">
                        {suggestion.city}
                      </span>
                    )}
                    {suggestion.state && (
                      <span className="text-xs text-text-tertiary">
                        - {suggestion.state}
                      </span>
                    )}
                  </div>
                  {suggestion.zipcode && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      CEP: {suggestion.zipcode}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && suggestions.length === 0 && query.trim().length >= 3 && !error && !selected && (
          <div className="mt-2 px-3 py-2 text-sm text-text-tertiary">
            Nenhum endereço encontrado. Pressione Enter para buscar.
          </div>
        )}

        {error && (
          <div className="mt-2 px-3 py-2 text-sm text-feedback-error bg-feedback-error/10 rounded-lg">
            {error}
          </div>
        )}

        {geocoding && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-text-secondary">
            <span className="block w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            Confirmando endereço...
          </div>
        )}
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border-default bg-surface-elevated p-3">
            <p className="text-sm font-medium text-text-primary">
              <Icon name="Check" size={16} className="inline mr-1 text-feedback-success" />
              Endereço selecionado
            </p>
            <p className="text-sm text-text-secondary mt-1">{selected.formattedAddress}</p>
            <p className="text-xs text-text-tertiary mt-1">
              {selected.city}{selected.state ? `, ${selected.state}` : ''} {selected.zipcode}
            </p>
          </div>
          <AddressMap latitude={selected.latitude} longitude={selected.longitude} />
        </div>
      )}
    </div>
  );
}
