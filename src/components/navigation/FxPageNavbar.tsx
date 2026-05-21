import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';


export interface FxPageNavbarProps {
  title: string;
  backTo?: string;
  className?: string;
  rightAction?: React.ReactNode;
}

export function FxPageNavbar({ title, backTo, className, rightAction }: FxPageNavbarProps) {
  const navigate = useNavigate();

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 bg-surface-elevated border-b border-border-default',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 py-3">
          {backTo && (
            <button
              onClick={() => { void navigate(backTo); }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-background transition-colors"
              aria-label="Voltar"
            >
              <Icon name="ChevronLeft" className="text-text-primary" size={24} />
            </button>
          )}

          <h1 className="font-semibold text-lg text-text-primary flex-1">
            {title}
          </h1>

          <div className="flex items-center gap-2">
            {rightAction}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default FxPageNavbar;