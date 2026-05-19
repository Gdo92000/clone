import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { login as authLogin } from '../../../services/authService';
import { errorToast } from '../../../lib/toast';
import { ROUTES } from '../../../lib/routes';


export function SuperadminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { errorToast('Informe seu email.'); return; }
    if (!password.trim()) { errorToast('Informe sua senha.'); return; }
    setLoading(true);
    try {
      await authLogin({ email, password });
      void navigate(ROUTES.SUPERADMIN);
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <section className="w-full rounded-xl border border-border-default bg-surface-elevated p-6">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-text-primary">Superadmin</h1>
            <p className="mt-2 text-sm text-text-secondary">Acesso administrativo da plataforma</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); }}
                placeholder="admin@francafood.com"
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
                placeholder="Sua senha"
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
