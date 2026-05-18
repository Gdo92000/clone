import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Icon } from '../components/ui/Icon';


interface ExperienceLayoutProps {
  title: string;
  children: ReactNode;
  backTo?: string;
}

export function ExperienceLayout({ title, children, backTo = '/' }: ExperienceLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-background">
      <header className="sticky top-0 z-40 border-b border-border-default bg-surface-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(backTo)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-background transition-colors" aria-label="Voltar">
              <Icon name="ChevronLeft" className="text-text-primary" size={24} />
            </button>
            <h1 className="font-display text-lg font-bold text-text-primary">{title}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}