import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';
import { paymentMethods, type PaymentMethodType } from './payment-methods.data';

export type { PaymentMethodType };

export interface FxPaymentMethodProps {
  selected: PaymentMethodType | null;
  onSelect: (method: PaymentMethodType) => void;
  className?: string;
}

export function FxPaymentMethod({
  selected,
  onSelect,
  className,
}: FxPaymentMethodProps) {
  return (
    <div className={clsx('space-y-3', className)}>
      <h3 className="font-semibold text-text-primary">Forma de pagamento</h3>

      <div className="grid grid-cols-2 gap-2">
        {paymentMethods.map((method) => (
          <button
             key={method.id}
             onClick={() => { onSelect(method.id); }}
             aria-pressed={selected === method.id}
             className={clsx(
              'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
              selected === method.id
                ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                : 'border-border-default hover:border-border-focus hover:bg-surface-elevated'
            )}
          >
            <span className="text-xl">{method.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary text-sm">{method.name}</p>
              <p className="text-xs text-text-tertiary truncate">{method.description}</p>
            </div>
            {selected === method.id && (
              <Icon name="CheckCircle" className="text-brand-primary shrink-0" size={20} fill="currentColor" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FxPaymentMethod;