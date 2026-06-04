import { clsx } from 'clsx';
import { useCallback, useState } from 'react';
import { FxInput } from '../../../packages/ui/src/primitives/FxInput';
import { FxCepInput } from '../ui/FxCepInput';
import { AddressAutocomplete } from '../address/AddressAutocomplete';
import type { CepAddress } from '../../hooks';

export interface AddressData {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference: string;
}

export interface FxAddressFormProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  className?: string;
}

export function FxAddressForm({ value, onChange, className }: FxAddressFormProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(!value.street);

  const handleChange = (field: keyof AddressData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [field]: e.target.value });
  };

  const handleCepChange = useCallback(
    (cepValue: string) => {
      onChange({ ...value, zipCode: cepValue });
    },
    [value, onChange]
  );

  const handleCepFound = useCallback(
    (address: CepAddress) => {
      onChange({
        ...value,
        zipCode: address.cep,
        street: address.logradouro,
        neighborhood: address.bairro,
        city: address.localidade,
        state: address.uf,
      });
    },
    [value, onChange]
  );

  const handleAutocompleteChange = useCallback(
    (result: {
      formattedAddress: string;
      city: string;
      state: string;
      zipcode: string;
      neighborhood: string;
      street: string;
      number: string;
    }) => {
      onChange({
        ...value,
        street: result.street || (result.formattedAddress.split(',')[0]?.trim() ?? ''),
        number: result.number || value.number,
        neighborhood: result.neighborhood || value.neighborhood,
        city: result.city || value.city,
        state: result.state || value.state,
        zipCode: result.zipcode || value.zipCode,
      });
      setShowAutocomplete(false);
    },
    [value, onChange]
  );

  return (
    <div className={clsx('space-y-4', className)}>
      <h3 className="font-semibold text-text-primary">Endereço de entrega</h3>

      <div className="grid grid-cols-2 gap-3">
        {showAutocomplete ? (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Buscar endereço
            </label>
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
            <div className="col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary mb-1">Buscar endereço</span>
                <button
                  onClick={() => { setShowAutocomplete(true); }}
                  className="text-xs text-brand-primary hover:text-brand-primary-hover"
                >
                  Buscar novamente
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <FxCepInput
                label="CEP"
                placeholder="00000-000"
                value={value.zipCode}
                onChange={handleCepChange}
                onCepFound={handleCepFound}
                inputSize="md"
              />
            </div>

            <div className="col-span-2">
              <FxInput
                label="Rua"
                placeholder="Av. Brasil"
                value={value.street}
                onChange={handleChange('street')}
              />
            </div>

            <FxInput
              label="Número"
              placeholder="123"
              value={value.number}
              onChange={handleChange('number')}
            />

            <FxInput
              label="Complemento"
              placeholder="Apto 101"
              value={value.complement}
              onChange={handleChange('complement')}
            />

            <div className="col-span-2">
              <FxInput
                label="Bairro"
                placeholder="Centro"
                value={value.neighborhood}
                onChange={handleChange('neighborhood')}
              />
            </div>

            <FxInput
              label="Cidade"
              placeholder="Franca"
              value={value.city}
              onChange={handleChange('city')}
            />

            <FxInput
              label="Estado"
              placeholder="SP"
              value={value.state}
              onChange={handleChange('state')}
            />
          </>
        )}

        <div className="col-span-2">
          <FxInput
            label="Ponto de referência"
            placeholder="Próximo ao mercado X"
            value={value.reference}
            onChange={handleChange('reference')}
          />
        </div>
      </div>
    </div>
  );
}

export default FxAddressForm;