import type { ReactNode } from 'react';

interface MerchantStatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

export function MerchantStatCard({
  label,
  value,
  detail,
  icon,
}: MerchantStatCardProps) {
  return (
    <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
          <p className="mt-1 text-xs text-text-tertiary">{detail}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          {icon}
        </span>
      </div>
    </article>
  );
}
