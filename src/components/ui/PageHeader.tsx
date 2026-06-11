import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-display font-bold text-xl text-text-primary">{title}</h2>
      {actions && <div className="flex items-center flex-wrap gap-2">{actions}</div>}
    </div>
  );
}