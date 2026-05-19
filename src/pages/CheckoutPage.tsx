import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FxAddressForm, type AddressData } from '../components/commerce/FxAddressForm';
import { FxPaymentMethod, type PaymentMethodType } from '../components/commerce/FxPaymentMethod';
import { FxOrderSummary } from '../components/commerce/FxOrderSummary';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../lib/routes';
import { useCart } from '../hooks/useCart';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';


export function CheckoutPage() {
  const navigate = useNavigate();
  const { subtotal, deliveryFee, discount, total } = useCart();
  const [address, setAddress] = useState<AddressData>({
    street: '', number: '', complement: '', neighborhood: '', city: 'Franca', state: 'SP', zipCode: '', reference: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [changeFor, setChangeFor] = useState('');

  const isAddressValid = address.street && address.number && address.neighborhood && address.city;

  const handleConfirmOrder = () => {
    if (isAddressValid && paymentMethod) void navigate(ROUTES.TRACKING);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Checkout" backTo={ROUTES.CART} />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        <FxQueryBoundary isLoading={false} isError={false}>
        <section className="rounded-2xl bg-surface-elevated border border-border-default p-4 space-y-4">
          <h2 className="font-semibold text-text-primary">Endereço de entrega</h2>
          <FxAddressForm value={address} onChange={setAddress} />
        </section>

        <section className="rounded-2xl bg-surface-elevated border border-border-default p-4 space-y-4">
          <h2 className="font-semibold text-text-primary">Forma de pagamento</h2>
          <FxPaymentMethod selected={paymentMethod} onSelect={(m) => { setPaymentMethod(m); }} />
          {paymentMethod === 'money' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Troco para quanto?</label>
              <input type="text" value={changeFor} onChange={(e) => { setChangeFor(e.target.value); }} placeholder="R$ 0,00"
                className="w-full h-11 px-4 rounded-xl bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          )}
        </section>

        <FxOrderSummary subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} />

        <Button variant="solid" intent="primary" size="lg" className="w-full"
          disabled={!isAddressValid || !paymentMethod} onClick={handleConfirmOrder}>
          Confirmar pedido
        </Button>
        </FxQueryBoundary>
      </main>
    </div>
  );
}

export default CheckoutPage;