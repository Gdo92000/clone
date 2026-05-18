export type PaymentMethodType = 'pix' | 'credit' | 'debit' | 'money' | 'voucher';

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  icon: string;
  description: string;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pix',
    name: 'PIX',
    icon: '⚡',
    description: 'Aprovação instantânea',
  },
  {
    id: 'credit',
    name: 'Cartão de Crédito',
    icon: '💳',
    description: 'Mastercard, Visa, Amex',
  },
  {
    id: 'debit',
    name: 'Cartão de Débito',
    icon: '💳',
    description: 'Mastercard, Visa',
  },
  {
    id: 'money',
    name: 'Dinheiro',
    icon: '💵',
    description: 'Pagamento na entrega',
  },
  {
    id: 'voucher',
    name: 'Voucher',
    icon: '🎫',
    description: 'Vale refeição',
  },
];