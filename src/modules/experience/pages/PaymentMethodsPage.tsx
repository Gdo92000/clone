import { Icon } from '../../../components/ui/Icon';
import { ExperienceLayout } from '../components/ExperienceLayout';

export function PaymentMethodsPage() {
  return (
    <ExperienceLayout title="Formas de pagamento">
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface-elevated border border-border-default p-8 text-center">
          <Icon name="CreditCard" className="mx-auto text-text-tertiary" size={40} />
          <h3 className="mt-3 font-semibold text-text-primary">Nenhum cartão salvo</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Adicione um cartão para agilizar seus pedidos.
          </p>
        </div>
        <button className="w-full py-4 rounded-2xl border-2 border-dashed border-border-default flex items-center justify-center gap-2 text-text-secondary hover:text-brand-primary hover:border-brand-primary transition-colors">
          <Icon name="Plus" size={20} />
          Adicionar novo cartão
        </button>
      </div>
    </ExperienceLayout>
  );
}
