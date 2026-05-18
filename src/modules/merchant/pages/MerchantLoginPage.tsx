import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { errorToast } from '../../../lib/toast';
import { ROUTES } from '../../../lib/routes';


export function MerchantLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      errorToast('Informe seu email para acessar.');
      return;
    }
    if (!password.trim()) {
      errorToast('Informe sua senha para acessar.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      void navigate(ROUTES.MERCHANT);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <section className="w-full rounded-xl border border-border-default bg-surface-elevated p-6">
          <div className="mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary font-bold text-text-inverse">
              iF
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
              Entrar no portal do lojista
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Acesso mockado pronto para conectar com autenticacao do backend.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); }}
                placeholder="lojista@francafood.com"
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
                placeholder="123456"
                className="mt-1 h-11 w-full rounded-lg border border-border-default bg-surface-background px-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                autoComplete="current-password"
              />
            </label>
            <Button fullWidth type="submit" loading={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}