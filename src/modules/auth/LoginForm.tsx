import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useLogin } from '../../hooks/useLogin';
import { errorToast } from '../../lib/toast';
import { DevQuickLogin } from '../../components/auth/DevQuickLogin';
import type { UserRole } from './types';

export interface LoginProfileConfig {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  emailValidationError: string;
  passwordValidationError: string;
  icon?: React.ReactNode;
  devAllowedRoles?: UserRole[];
}

interface LoginFormProps {
  config: LoginProfileConfig;
  onSuccess: () => void;
}

export function LoginForm({ config, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useLogin();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      errorToast(config.emailValidationError);
      return;
    }
    if (!password.trim()) {
      errorToast(config.passwordValidationError);
      return;
    }
    mutation.mutate(
      { email, password },
      { onSuccess },
    );
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <section className="w-full rounded-xl border border-border-default bg-surface-elevated p-6">
          <div className="mb-6">
            {config.icon}
            <h1 className="font-display text-2xl font-bold text-text-primary">{config.title}</h1>
            <p className="mt-2 text-sm text-text-secondary">{config.subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Email</span>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); }}
                placeholder={config.emailPlaceholder}
                className="mt-1 h-11 w-full rounded-lg border border-border-default bg-surface-background px-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Senha</span>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); }}
                  placeholder={config.passwordPlaceholder}
                  className="h-11 w-full rounded-lg border border-border-default bg-surface-background px-3 pr-12 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => { setShowPassword((v) => !v); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-text-tertiary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </label>
            <Button fullWidth type="submit" loading={mutation.isPending}>
              {mutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          {config.devAllowedRoles ? (
            <DevQuickLogin allowedRoles={config.devAllowedRoles} onSuccess={onSuccess} />
          ) : null}
        </section>
      </main>
    </div>
  );
}
