import { Icon } from '../../../components/ui/Icon';
import { ExperienceLayout } from '../components/ExperienceLayout';
import { infoToast } from '../../../lib/toast';

interface SavedCard {
  id: string;
  brand: string;
  lastDigits: string;
  holderName: string;
  expiry: string;
  isDefault: boolean;
}

const mockCards: SavedCard[] = [
  {
    id: 'card-1',
    brand: 'Mastercard',
    lastDigits: '4532',
    holderName: 'Usuário Teste',
    expiry: '12/27',
    isDefault: true,
  },
  {
    id: 'card-2',
    brand: 'Visa',
    lastDigits: '8910',
    holderName: 'Usuário Teste',
    expiry: '08/26',
    isDefault: false,
  },
];

const brandIcons: Record<string, string> = {
  Mastercard: 'CreditCard',
  Visa: 'CreditCard',
  Elo: 'CreditCard',
  Amex: 'CreditCard',
};

export function PaymentMethodsPage() {
  const cards = mockCards;

  return (
    <ExperienceLayout title="Formas de pagamento">
      <div className="space-y-4">
        {cards.length === 0 ? (
          <div className="rounded-2xl bg-surface-elevated border border-border-default p-8 text-center">
            <Icon name="CreditCard" className="mx-auto text-text-tertiary" size={40} />
            <h3 className="mt-3 font-semibold text-text-primary">Nenhum cartão salvo</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Adicione um cartão para agilizar seus pedidos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl bg-surface-elevated border border-border-default p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
                      <Icon name={brandIcons[card.brand] ?? 'CreditCard'} size={20} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {card.brand} •••• {card.lastDigits}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {card.holderName} &middot; Validade {card.expiry}
                      </p>
                    </div>
                  </div>
                  {card.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-medium">
                      Padrão
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <button onClick={() => { infoToast('Em breve você poder? adicionar cartões diretamente pelo app.'); }} className="w-full py-4 rounded-2xl border-2 border-dashed border-border-default flex items-center justify-center gap-2 text-text-secondary hover:text-brand-primary hover:border-brand-primary transition-colors">
            <Icon name="Plus" size={20} />
            Adicionar novo cartão
          </button>
        )}
      </div>
    </ExperienceLayout>
  );
}