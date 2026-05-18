import { useNavigate } from 'react-router-dom';
import { FxImage } from '../../components/ui/FxImage';
import { roleLabels } from './authData';
import { useAuthSession } from './useAuthSession';
import { ROUTES } from '../../lib/routes';


export function SessionPage() {
  const navigate = useNavigate();
  const { currentUser, loginAs, users } = useAuthSession();

  return (
    <div className="min-h-screen bg-surface-background">
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Sessao mockada persistente</p>
          <h1 className="font-display text-2xl font-bold text-text-primary">Trocar perfil</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Perfil atual: {currentUser?.name} - {currentUser ? roleLabels[currentUser.role] : 'nenhum'}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                loginAs(user.id);
                void navigate(ROUTES.ACCESS);
              }}
              className="rounded-xl border border-border-default bg-surface-elevated p-4 text-left hover:border-brand-primary disabled:opacity-60"
              disabled={!user.active}
              aria-label={`Entrar como ${user.name}${user.active ? '' : ' (inativo)'}`}
              title={user.active ? `Entrar como ${user.name}` : 'Usuário inativo'}
            >
              <div className="flex items-center gap-3">
                <FxImage
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-text-primary">{user.name}</p>
                  <p className="text-sm text-text-secondary">{roleLabels[user.role]}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary">{user.email}</p>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}
