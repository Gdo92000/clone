import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../../packages/ui/src/context';
import { Icon } from './Icon';

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Claro',
    icon: <Icon name="Sun" size={20} />,
  },
  {
    value: 'dark' as const,
    label: 'Escuro',
    icon: <Icon name="Moon" size={20} />,
  },
  {
    value: 'system' as const,
    label: 'Sistema',
    icon: <Icon name="Monitor" size={20} />,
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const currentIcon = themeOptions.find((o) => o.value === theme)?.icon;
  const ariaLabel = `Tema: ${themeOptions.find((o) => o.value === theme)?.label}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); }}
        className={clsx(
          'w-11 h-11 rounded-full',
          'bg-surface-background border border-border-default',
          'flex items-center justify-center',
          'transition-colors hover:border-border-focus',
          'text-text-primary'
        )}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        {currentIcon}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-40 bg-surface-elevated border border-border-default rounded-xl shadow-lg overflow-hidden">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setOpen(false);
              }}
              className={clsx(
                'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                theme === option.value
                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                  : 'text-text-primary hover:bg-surface-background'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}