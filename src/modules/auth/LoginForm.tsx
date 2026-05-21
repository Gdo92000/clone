import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useLogin } from '../../hooks/useLogin';
import { errorToast } from '../../lib/toast';

export interface LoginProfileConfig {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  emailValidationError: string;
  passwordValidationError: string;
  icon?: React.ReactNode;
}

interface LoginFormProps {
  config: LoginProfileConfig;
  onSuccess: () => void;
}

export function LoginForm({ config, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
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
                value={email}
                onChange={(e) => { setEmail(e.target.value); }}
                placeholder={config.emailPlaceholder}
                className="mt-1 h-11 w-full rounded-lg border border-border-default bg-surface-background px-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); }}
                placeholder={config.passwordPlaceholder}
                className="mt-1 h-11 w-full rounded-lg border border-border-default bg-surface-background px-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                autoComplete="current-password"
              />
            </label>
            <Button fullWidth type="submit" loading={mutation.isPending}>
              {mutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
