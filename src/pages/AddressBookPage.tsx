import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Icon } from '../components/ui/Icon';
import { FxCepInput } from '../components/ui/FxCepInput';
import { FxInput } from '../../packages/ui/src/primitives/FxInput';
import { AddressAutocomplete } from '../components/address/AddressAutocomplete';
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from '../hooks/useAddresses';
import type { CepAddress } from '../hooks';
import { ROUTES } from '../lib/routes';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';


const emptyForm = {
  label: 'Casa',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

export function AddressBookPage() {
  const { data: addresses = [], isLoading, isError } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showAutocomplete, setShowAutocomplete] = useState(true);

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress.mutate(addressId);
  };

  const handleDelete = (addressId: string) => {
    deleteAddress.mutate(addressId);
  };

  const handleChange = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCepChange = useCallback((cepValue: string) => {
    setForm((prev) => ({ ...prev, zipCode: cepValue }));
  }, []);

  const handleCepFound = useCallback((address: CepAddress) => {
    setForm((prev) => ({
      ...prev,
      zipCode: address.cep,
      street: address.logradouro || prev.street,
      neighborhood: address.bairro || prev.neighborhood,
      city: address.localidade || prev.city,
      state: address.uf || prev.state,
    }));
  }, []);

  const handleAutocompleteChange = useCallback((result: {
    formattedAddress: string;
    city: string;
    state: string;
    zipcode: string;
    neighborhood: string;
    street: string;
    number: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    setForm((prev) => ({
      ...prev,
      street: result.street || (result.formattedAddress.split(',')[0]?.trim() ?? prev.street),
      number: result.number || prev.number,
      neighborhood: result.neighborhood || prev.neighborhood,
      city: result.city || prev.city,
      state: result.state || prev.state,
      zipCode: result.zipcode || prev.zipCode,
    }));
    setShowAutocomplete(false);
  }, []);

  const handleAdd = () => {
    if (!form.street || !form.number || !form.city) return;

    createAddress.mutate({
      label: form.label,
      street: form.street,
      number: form.number,
      complement: form.complement,
      neighborhood: form.neighborhood || 'Centro',
      city: form.city,
      state: form.state || 'SP',
      zipCode: form.zipCode,
      isDefault: addresses.length === 0,
    }, {
      onSuccess: () => {
        setForm(emptyForm);
        setShowForm(false);
        setShowAutocomplete(true);
      },
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setShowAutocomplete(true);
  };

  return (
    <FxQueryBoundary isLoading={isLoading} isError={isError}>
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Endereços" backTo={ROUTES.PROFILE} />

      <main>
        <div className="fx-container py-4 space-y-4">
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 rounded-xl bg-surface-elevated border border-border-default"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-medium">
                        Padrão
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { handleSetDefault(address.id); }}
                      className="p-2 text-text-tertiary hover:text-brand-primary transition-colors"
                      title="Definir como padrão"
                    >
                      <Icon name="Heart" size={20} fill={address.isDefault ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => { handleDelete(address.id); }}
                      className="p-2 text-text-tertiary hover:text-feedback-error transition-colors"
                      title="Remover"
                    >
                      <Icon name="Trash2" size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-text-primary font-medium">
                  {address.street}, {address.number}
                </p>
                {address.complement && (
                  <p className="text-text-secondary text-sm">{address.complement}</p>
                )}
                <p className="text-text-secondary text-sm">
                  {address.neighborhood} &bull; {address.city} &bull; {address.state}
                </p>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="rounded-xl bg-surface-elevated border border-border-default p-4 space-y-3">
              <h3 className="font-semibold text-text-primary">Novo endereço</h3>

              <div className="flex gap-2">
                {['Casa', 'Trabalho', 'Outro'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setForm({ ...form, label: opt }); }}
                    className={clsx(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      form.label === opt
                        ? 'bg-brand-primary text-text-inverse'
                        : 'border border-border-default text-text-secondary hover:border-brand-primary'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {showAutocomplete ? (
                <div>
                  <AddressAutocomplete
                    placeholder="Digite seu endereço para buscar..."
                    onChange={handleAutocompleteChange}
                  />
                  <button
                    onClick={() => { setShowAutocomplete(false); }}
                    className="mt-2 text-xs text-brand-primary hover:text-brand-primary-hover"
                  >
                    Digitar manualmente
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-secondary">Buscar endereço</span>
                    <button
                      onClick={() => { setShowAutocomplete(true); }}
                      className="text-xs text-brand-primary hover:text-brand-primary-hover"
                    >
                      Buscar novamente
                    </button>
                  </div>

                  <div className="grid grid-cols-[2fr_1fr] gap-2">
                    <FxInput
                      label="Rua"
                      placeholder="Av. Brasil"
                      value={form.street}
                      onChange={handleChange('street')}
                      fullWidth
                    />
                    <FxInput
                      label="Número"
                      placeholder="123"
                      value={form.number}
                      onChange={handleChange('number')}
                      fullWidth
                    />
                  </div>

                  <div className="grid grid-cols-[2fr_1fr] gap-2">
                    <FxCepInput
                      label="CEP"
                      placeholder="00000-000"
                      value={form.zipCode}
                      onChange={handleCepChange}
                      onCepFound={handleCepFound}
                      inputSize="md"
                    />
                    <FxInput
                      label="Complemento"
                      placeholder="Apto 101"
                      value={form.complement}
                      onChange={handleChange('complement')}
                      fullWidth
                    />
                  </div>

                  <FxInput
                    label="Bairro"
                    placeholder="Centro"
                    value={form.neighborhood}
                    onChange={handleChange('neighborhood')}
                    fullWidth
                  />

                  <div className="grid grid-cols-[2fr_1fr] gap-2">
                    <FxInput
                      label="Cidade"
                      placeholder="Franca"
                      value={form.city}
                      onChange={handleChange('city')}
                      fullWidth
                    />
                    <FxInput
                      label="UF"
                      placeholder="SP"
                      value={form.state}
                      onChange={handleChange('state')}
                      fullWidth
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!form.street || !form.number || !form.city}
                  className="flex-1 h-11 rounded-xl bg-brand-primary text-text-inverse font-semibold text-sm hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
                >
                  Salvar endereço
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 h-11 rounded-xl border border-border-default text-text-secondary font-medium text-sm hover:border-brand-primary transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => { setShowForm(true); }}
              className={clsx(
                'w-full p-4 rounded-xl border-2 border-dashed border-border-default',
                'flex items-center justify-center gap-2',
                'text-text-secondary hover:text-brand-primary hover:border-brand-primary',
                'transition-colors'
              )}
            >
              <Icon name="Plus" size={20} />
              Adicionar novo endereço
            </button>
          )}
        </div>
      </main>
    </div>
    </FxQueryBoundary>
  );
}

export default AddressBookPage;
