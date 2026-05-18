import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Icon } from '../components/ui/Icon';
import { ROUTES } from '../lib/routes';


interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  badge?: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    void navigate('/');
  };

  const menuItems: MenuItem[] = [
    {
      id: 'addresses',
      label: 'Endereços',
      icon: <Icon name="MapPin" size={20} />,
      action: () => navigate(ROUTES.ADDRESSES),
    },
    {
       id: 'payment',
       label: 'Formas de pagamento',
       icon: <Icon name="CreditCard" size={20} />,
       badge: '2 cartões',
       action: () => navigate(ROUTES.PAYMENT_METHODS),
     },
    {
      id: 'orders',
      label: 'Meus pedidos',
      icon: <Icon name="ShoppingBag" size={20} />,
      action: () => navigate(ROUTES.ORDERS),
    },
    {
      id: 'favorites',
      label: 'Restaurantes favoritos',
      icon: <Icon name="Heart" size={20} />,
      action: () => navigate(ROUTES.FAVORITES),
    },
    {
      id: 'promotions',
      label: 'Cupons e promoções',
      icon: <Icon name="Tag" size={20} />,
      action: () => navigate(ROUTES.PROMOTIONS),
    },
    {
      id: 'support',
      label: 'Suporte',
      icon: <Icon name="Headset" size={20} />,
      action: () => navigate(ROUTES.SUPPORT),
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: <Icon name="Bell" size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Perfil" />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="flex items-center gap-4 p-4 rounded-2xl bg-surface-elevated border border-border-default">
          <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-bold">
            U
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-text-primary">Usuário</h2>
            <p className="text-sm text-text-secondary">usuario@email.com</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.SESSION)}
            className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover"
          >
            Editar
          </button>
        </section>

        <section className="rounded-2xl bg-surface-elevated border border-border-default overflow-hidden divide-y divide-border-default">
          {menuItems.map((item) => {
            const isNotification = item.id === 'notifications';
            const Container = isNotification ? 'div' : 'button';
            const containerProps = isNotification
              ? { className: 'flex items-center gap-3 w-full px-4 py-4 text-left' }
              : { onClick: item.action, className: clsx('flex items-center gap-3 w-full px-4 py-4 text-left transition-colors', item.action ? 'hover:bg-surface-background cursor-pointer' : 'cursor-default') };

            return (
              <Container key={item.id} {...containerProps}>
                <span className="w-10 h-10 rounded-xl bg-surface-background flex items-center justify-center text-text-primary shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 font-medium text-text-primary text-sm">
                  {item.label}
                </span>
                {isNotification && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationsEnabled(!notificationsEnabled);
                    }}
                    className={clsx(
                      'w-12 h-7 rounded-full transition-colors relative',
                      notificationsEnabled ? 'bg-brand-primary' : 'bg-border-default'
                    )}
                    aria-label={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
                    type="button"
                  >
                    <span
                      className={clsx(
                        'absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                        notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                )}
                {item.badge && (
                  <span className="text-sm text-text-tertiary">{item.badge}</span>
                )}
                {item.action && !item.badge && !isNotification && (
                  <Icon name="ChevronRight" className="text-text-tertiary" size={18} />
                )}
              </Container>
            );
          })}
        </section>

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-border-default text-text-secondary text-sm font-medium hover:bg-surface-elevated hover:text-feedback-error transition-colors"
        >
          Sair da conta
        </button>
      </main>
    </div>
  );
}

export default ProfilePage;