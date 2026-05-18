import { clsx } from 'clsx';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FxFilterChipsProps {
  options: FilterOption[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

export function FxFilterChips({
  options,
  selected,
  onSelect,
  className,
}: FxFilterChipsProps) {
  return (
    <div className={clsx('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {options.map((option) => {
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            onClick={() => { onSelect(isSelected ? null : option.id); }}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              isSelected
                ? 'bg-brand-primary text-text-inverse'
                : 'bg-surface-elevated border border-border-default text-text-secondary hover:border-border-focus hover:text-text-primary'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default FxFilterChips;