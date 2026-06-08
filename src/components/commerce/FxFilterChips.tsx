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
    <div className={clsx('flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-pl-4', className)}>
      {options.map((option) => {
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            onClick={() => { onSelect(isSelected ? null : option.id); }}
            className={clsx(
              'shrink-0 px-4 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all',
              'flex items-center',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              'active:scale-[0.98]',
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