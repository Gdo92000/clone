import { clsx } from 'clsx';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  onClick?: () => void;
};

export interface FxBottomNavigationProps {
  items: NavItem[];
  activeId?: string;
  className?: string;
}

export function FxBottomNavigation({
  items,
  activeId,
  className,
}: FxBottomNavigationProps) {
  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-surface-elevated border-t border-border-default',
        'px-2 py-1 pb-safe md:hidden',
        className
      )}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={clsx(
                'relative flex flex-col items-center gap-0.5 p-2 rounded-lg min-w-[64px] transition-colors',
                isActive
                  ? 'text-brand-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-primary rounded-full" />
              )}
              <span className={clsx('w-6 h-6 transition-transform duration-200', isActive && 'scale-110')}>
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
              </span>
              <span className={clsx(
                'text-[10px] font-medium transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default FxBottomNavigation;