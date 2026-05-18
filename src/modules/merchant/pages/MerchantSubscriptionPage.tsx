import { MerchantLayout } from '../components/MerchantLayout';
import { Icon } from '../../../components/ui/Icon';
import { useSaasWorkspace } from '../../saas';
import { calculateSubscriptionTotal } from '../../saas';
import { useCompanies } from '../../../hooks/useMerchantData';

export function MerchantSubscriptionPage() {
  const { plans, addons, subscriptions } = useSaasWorkspace();
  const { data: companies = [] } = useCompanies();
  const company = companies[0];
  const sub = company ? subscriptions.find((s) => s.companyId === company.id) : undefined;
  const plan = plans.find((p) => p.id === sub?.planId);
  const myAddons = addons.filter((a) => sub?.addonIds.includes(a.id));
  const total = sub ? calculateSubscriptionTotal(sub, plans, addons) : 0;

  if (!sub || !plan) {
    return (
      <MerchantLayout title="Meu plano">
        <div className="text-center py-12 rounded-xl border border-border-default bg-surface-elevated">
          <Icon name="CreditCard" size={40} className="mx-auto text-text-tertiary" />
          <p className="text-text-secondary mt-3">Nenhuma assinatura encontrada</p>
        </div>
      </MerchantLayout>
    );
  }

  const statusLabel: Record<string, string> = { trial: 'Trial', active: 'Ativo', past_due: 'Vencido', blocked: 'Bloqueado', cancelled: 'Cancelado' };
  const statusColor: Record<string, string> = { trial: 'text-feedback-info', active: 'text-feedback-success', past_due: 'text-feedback-warning', blocked: 'text-feedback-error', cancelled: 'text-text-disabled' };

  return (
    <MerchantLayout title="Meu plano">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_2fr]">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-5 space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto">
              <Icon name="Crown" size={32} className="text-brand-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-text-primary mt-3">{plan.name}</h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className={statusColor[sub.billingStatus]}>{statusLabel[sub.billingStatus] ?? sub.billingStatus}</span>
              {sub.billingStatus === 'trial' && <span className="text-xs text-text-tertiary"> - {sub.trialEndsAt ? `expira ${new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}` : ''}</span>}
            </div>
          </div>

          <div className="text-center py-4 border-y border-border-default">
            <p className="text-3xl font-bold text-text-primary">R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}</p>
            <p className="text-sm text-text-tertiary">/mês</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">Limites do plano:</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Filiais</span>
              <span className="font-medium text-text-primary">{plan.limits.branches}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Produtos</span>
              <span className="font-medium text-text-primary">{plan.limits.products}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Usuários</span>
              <span className="font-medium text-text-primary">{plan.limits.users}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Campanhas</span>
              <span className="font-medium text-text-primary">{plan.limits.campaigns}</span>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border-default bg-surface-elevated p-5">
            <h3 className="font-semibold text-text-primary mb-4">Features incluídas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.includedFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-surface-background">
                  <Icon name="Check" size={16} className="text-feedback-success shrink-0" />
                  <span className="text-sm text-text-primary capitalize">{feature.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </section>

          {myAddons.length > 0 && (
            <section className="rounded-xl border border-border-default bg-surface-elevated p-5">
              <h3 className="font-semibold text-text-primary mb-4">Addons contratados</h3>
              <div className="space-y-2">
                {myAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-background">
                    <div className="flex items-center gap-3">
                      <Icon name="Package" size={18} className="text-brand-primary" />
                      <div>
                        <p className="font-medium text-text-primary text-sm">{addon.name}</p>
                        <p className="text-xs text-text-tertiary">{addon.description}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-text-primary">R$ {addon.monthlyPrice.toFixed(2).replace('.', ',')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border-default bg-surface-elevated p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total mensal</p>
                <p className="text-2xl font-bold text-text-primary">R$ {total.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Empresa</p>
                <p className="font-medium text-text-primary">{company?.name ?? '-'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MerchantLayout>
  );
}

export default MerchantSubscriptionPage;