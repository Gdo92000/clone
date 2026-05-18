import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Icon } from '../components/ui/Icon';


export interface DashboardNavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

interface DashboardLayoutProps {
  logo: string;
  title: string;
  navItems: DashboardNavItem[];
}

export function DashboardLayout({ logo, title, navItems }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-background">
      <header className="sticky top-0 z-40 border-b border-border-default bg-surface-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSidebarOpen(!sidebarOpen); }}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-background transition-colors"
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <Icon name={sidebarOpen ? 'X' : 'Menu'} size={20} className="text-text-primary" />
            </button>
            <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary font-bold text-text-inverse text-sm">
                {logo}
              </span>
              <span className="font-display text-lg font-bold text-text-primary">{title}</span>
            </button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 flex gap-6">
        <aside
          className={clsx(
            'fixed inset-0 z-30 lg:relative lg:inset-auto lg:z-auto',
            'w-60 shrink-0 pt-4',
            'transition-transform duration-200 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className={clsx(
            'h-full lg:h-auto bg-surface-elevated lg:bg-transparent',
            'border-r lg:border-0 border-border-default',
            'p-4 lg:p-0',
            'lg:sticky lg:top-20'
          )}>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  {...(item.end !== undefined ? { end: item.end } : {})}
                  onClick={() => { setSidebarOpen(false); }}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-secondary hover:bg-surface-background hover:text-text-primary'
                  )}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 -z-10 bg-black/20 lg:hidden"
              onClick={() => { setSidebarOpen(false); }}
            />
          )}
        </aside>

        <main className="flex-1 min-w-0 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}