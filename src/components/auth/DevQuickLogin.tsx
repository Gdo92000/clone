import { useState } from 'react';
import { login as authLogin } from '../../services/authService';
import { errorToast } from '../../lib/toast';
import { roleLabels } from '../../modules/auth/authData';
import { Icon } from '../../components/ui/Icon';
import type { UserRole } from '../../modules/auth/types';
import type { MockUser } from '../../auth/dev-mock-data';
import { MOCK_USERS } from '../../auth/dev-mock-data';

declare const __USE_MOCK__: boolean;

interface DevQuickLoginProps {
  allowedRoles: UserRole[];
  onSuccess: () => void;
}

const ROLE_ICON: Record<UserRole, string> = {
  superadmin: 'Shield',
  admin: 'Crown',
  company_owner: 'Store',
  branch_manager: 'Building2',
  attendant: 'Headset',
  finance: 'DollarSign',
  courier: 'Truck',
  customer: 'User',
};

const ROLE_TINT: Record<UserRole, string> = {
  superadmin: 'bg-brand-primary/10 text-brand-primary',
  admin: 'bg-feedback-info/10 text-feedback-info',
  company_owner: 'bg-feedback-success/10 text-feedback-success',
  branch_manager: 'bg-feedback-warning/10 text-feedback-warning',
  attendant: 'bg-feedback-warning/10 text-feedback-warning',
  finance: 'bg-text-tertiary/10 text-text-secondary',
  courier: 'bg-feedback-danger/10 text-feedback-danger',
  customer: 'bg-brand-primary/10 text-brand-primary',
};

export function DevQuickLogin({ allowedRoles, onSuccess }: DevQuickLoginProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (!import.meta.env.DEV || !__USE_MOCK__) return null;

  const candidates = MOCK_USERS.filter((u) => allowedRoles.includes(u.role));

  const handleClick = async (user: MockUser) => {
    setPendingId(user.id);
    try {
      await authLogin({ email: user.email, password: 'dev' });
      onSuccess();
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Falha no login dev');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section
      aria-label="Login rápido de desenvolvimento"
      data-testid="dev-quick-login"
      className="mt-4 rounded-xl border border-dashed border-feedback-warning/40 bg-feedback-warning/5 p-4"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-feedback-warning">
          Login rápido · DEV
        </h2>
        <span className="rounded-full bg-feedback-warning/15 px-2 py-0.5 text-[10px] font-medium text-feedback-warning">
          {candidates.length} {candidates.length === 1 ? 'perfil' : 'perfis'}
        </span>
      </header>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {candidates.map((user) => {
          const initials = user.name
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? '')
            .join('');
          const isLoading = pendingId === user.id;
          return (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => { void handleClick(user); }}
                disabled={pendingId !== null}
                aria-busy={isLoading}
                className="flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${ROLE_TINT[user.role]}`}
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-primary">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">
                    {roleLabels[user.role]}
                  </span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ROLE_TINT[user.role]}`}
                  aria-hidden="true"
                >
                  <Icon name={ROLE_ICON[user.role]} size={14} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-text-tertiary">
        Disponível apenas em dev com mocks ativos. Não incluído em produção.
      </p>
    </section>
  );
}
