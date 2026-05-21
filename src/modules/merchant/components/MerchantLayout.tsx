import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFeatureAccess, type FeatureKey } from '../../saas';
import { useBranches, useCompanies } from '../../../hooks/useMerchantData';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';
import { ROUTES } from '../../../lib/routes';


interface MerchantLayoutProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

const navItems: { to: string; label: string; featureKey?: FeatureKey }[] = [
  { to: ROUTES.MERCHANT, label: 'Dashboard' },
  { to: ROUTES.MERCHANT_ORDERS, label: 'Pedidos' },
  { to: ROUTES.MERCHANT_CATALOG, label: 'Cardapio' },
  { to: ROUTES.MERCHANT_BRANCHES, label: 'Empresas e filiais' },
  { to: ROUTES.MERCHANT_TEAM, label: 'Equipe', featureKey: 'multi_users' },
  { to: ROUTES.MERCHANT_CAMPAIGNS, label: 'Campanhas', featureKey: 'campaigns' },
  { to: ROUTES.MERCHANT_ANALYTICS, label: 'Analytics', featureKey: 'analytics' },
  { to: ROUTES.MERCHANT_COUPONS, label: 'Cupons', featureKey: 'coupon_automation' },
  { to: ROUTES.MERCHANT_FINANCE, label: 'Financeiro', featureKey: 'financial_suite' },
  { to: ROUTES.MERCHANT_SUBSCRIPTION, label: 'Meu plano' },
  { to: ROUTES.MERCHANT_SETTINGS, label: 'Configuracoes' },
  { to: ROUTES.MERCHANT_HOURS, label: 'Horarios' },
  { to: ROUTES.MERCHANT_HOLIDAYS, label: 'Feriados' },
];

export function MerchantLayout({ title, children, actions }: MerchantLayoutProps) {
  const navigate = useNavigate();
  const { data: companies = [] } = useCompanies();
  const { data: branches = [] } = useBranches();
  const access = useFeatureAccess;
  const hasAccess = (key: FeatureKey) => access('company-1', key).enabled;

  return (
    <div className="min-h-screen bg-surface-background">
      <header className="sticky top-0 z-40 border-b border-border-default bg-surface-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => { void navigate('/'); }} className="flex items-center gap-2 shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary font-bold text-text-inverse">iF</span>
            <span className="font-display text-lg font-bold text-text-primary hidden sm:inline">Lojista</span>
          </button>

          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate text-sm font-semibold text-text-primary">
              {companies.length} empresas - {branches.length} filiais
            </p>
            <p className="text-xs text-text-secondary">{branches.length} filiais cadastradas</p>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <nav className="mx-auto max-w-7xl px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1">
          {navItems
            .filter((item) => !item.featureKey || hasAccess(item.featureKey))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.MERCHANT}
                className={({ isActive }: { isActive: boolean }) =>
                  `shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-brand-primary text-text-inverse' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-text-primary">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default MerchantLayout;