import { useMemo, useState, useCallback } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useBranches, useCompanies, useCreateBranch } from '../../../hooks/useMerchantData';
import { usePlanLimits } from '../../enterprise';
import { geocodeEstablishment } from '../../../services/geocodeSearchService';
import { FxCepInput } from '../../../components/ui/FxCepInput';
import { AddressAutocomplete } from '../../../components/address/AddressAutocomplete';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import type { CepAddress } from '../../../hooks';

interface BranchForm {
  name: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryRadiusKm: string;
  coordinates?: { lat: number; lng: number };
}

const emptyBranch: BranchForm = {
  name: '',
  cep: '',
  address: '',
  number: '',
  neighborhood: '',
  city: 'Franca',
  state: 'SP',
  deliveryRadiusKm: '8',
};

export function MerchantBranchesPage() {
  const { data: branches = [], isLoading: branchesLoading, isError: branchesError } = useBranches();
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError } = useCompanies();
  const createBranch = useCreateBranch();
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '');
  const [form, setForm] = useState<BranchForm>(emptyBranch);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [busyGeocode, setBusyGeocode] = useState(false);
  const limits = usePlanLimits(companyId);

  const filteredBranches = useMemo(
    () => branches.filter((branch) => branch.companyId === companyId),
    [branches, companyId]
  );

  const selectedCompany = companies.find((company) => company.id === companyId);

  const handleCepFound = useCallback((address: CepAddress) => {
    setForm((prev) => ({
      ...prev,
      address: address.logradouro || prev.address,
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
      address: result.street || (result.formattedAddress.split(',')[0]?.trim() ?? prev.address),
      number: result.number || prev.number,
      neighborhood: result.neighborhood || prev.neighborhood,
      city: result.city || prev.city,
      state: result.state || prev.state,
      cep: result.zipcode || prev.cep,
      ...(result.coordinates ? { coordinates: result.coordinates } : {}),
    }));
    setShowAutocomplete(false);
  }, []);

  const addBranch = async () => {
    if (!companyId || !form.name.trim() || !form.cep.trim() || !form.address.trim() || !limits.canAddBranch) {
      return;
    }

    const radiusNum = Number(form.deliveryRadiusKm) || 8;
    const submitData: Parameters<typeof createBranch.mutate>[0] = {
      company_id: companyId,
      name: form.name,
      cep: form.cep || null,
      address: form.address,
      number: form.number || null,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      delivery_radius_km: radiusNum,
    };
    if (form.coordinates) {
      submitData.latitude = form.coordinates.lat;
      submitData.longitude = form.coordinates.lng;
    }

    setBusyGeocode(true);
    await geocodeEstablishment(form.name, `${form.address}, ${form.number}`, form.city, form.state);
    setBusyGeocode(false);

    createBranch.mutate(submitData, {
      onSuccess: () => {
        setForm(emptyBranch);
      },
    });
  };

  // Handle loading states
  if (branchesLoading || companiesLoading) {
    return (
      <>
        <PageHeader title="Empresas e filiais" />
        <section className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary">Carregando dados...</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <FxQueryBoundary isLoading={false} isError={branchesError || companiesError}>
      <PageHeader
        title="Empresas e filiais"
        actions={
         <select
           value={companyId}
           onChange={(event) => { setCompanyId(event.target.value); }}
           className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
           disabled={companiesLoading}
         >
           {companies.map((company) => (
             <option key={company.id} value={company.id}>
               {company.name}
             </option>
           ))}
         </select>
        }
      />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Empresa ativa</h2>
          <div className="mt-3 rounded-lg bg-surface-background p-3">
            <p className="font-semibold text-text-primary">{selectedCompany?.name}</p>
            <p className="text-sm text-text-secondary">{selectedCompany?.document}</p>
            <p className="mt-2 text-sm font-medium text-brand-primary">
              Plano {selectedCompany?.plan}
            </p>
          </div>

          <h3 className="mt-6 font-semibold text-text-primary">Nova filial</h3>
          {!limits.canAddBranch && (
            <p className="mt-3 rounded-lg bg-feedback-error/10 p-3 text-sm text-feedback-error">
              Limite de filiais do plano atingido. Faca upgrade para cadastrar outra filial.
            </p>
          )}

          {showAutocomplete ? (
            <div className="mt-3 space-y-3">
              <AddressAutocomplete
                placeholder="Digite seu endereço para buscar..."
                onChange={handleAutocompleteChange}
              />
              <button
                onClick={() => { setShowAutocomplete(false); }}
                className="text-xs text-brand-primary hover:text-brand-primary-hover"
              >
                Digitar manualmente
              </button>
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Buscar endereço</span>
                <button
                  onClick={() => { setShowAutocomplete(true); }}
                  className="text-xs text-brand-primary hover:text-brand-primary-hover"
                >
                  Buscar novamente
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Nome do estabelecimento</span>
                  <input
                    value={form.name}
                    onChange={(event) => { setForm({ ...form, name: event.target.value }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    placeholder="Ex: Pizza Brescian - Centro"
                  />
                </label>

                <FxCepInput
                  label="CEP"
                  value={form.cep}
                  onChange={(value) => { setForm((prev) => ({ ...prev, cep: value })); }}
                  onCepFound={handleCepFound}
                  inputSize="md"
                />

                <div className="grid grid-cols-[3fr_1fr] gap-2">
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">Logradouro</span>
                    <input
                      value={form.address}
                      onChange={(event) => { setForm({ ...form, address: event.target.value }); }}
                      className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                      placeholder="Rua, Avenida..."
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">Nº</span>
                    <input
                      value={form.number}
                      onChange={(event) => { setForm({ ...form, number: event.target.value }); }}
                      className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                      placeholder="S/N"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">Bairro</span>
                    <input
                      value={form.neighborhood}
                      onChange={(event) => { setForm({ ...form, neighborhood: event.target.value }); }}
                      className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                      placeholder="Centro"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">Raio km</span>
                    <input
                      value={form.deliveryRadiusKm}
                      onChange={(event) => { setForm({ ...form, deliveryRadiusKm: event.target.value }); }}
                      inputMode="numeric"
                      className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">Cidade</span>
                    <input
                      value={form.city}
                      onChange={(event) => { setForm({ ...form, city: event.target.value }); }}
                      className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">UF</span>
                    <input
                      value={form.state}
                      onChange={(event) => { setForm({ ...form, state: event.target.value }); }}
                      className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    />
                  </label>
                </div>

                {busyGeocode && (
                  <p className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="block w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    Geolocalizando estabelecimento...
                  </p>
                )}

                <Button fullWidth onClick={() => { void addBranch(); }} disabled={!limits.canAddBranch || busyGeocode}>
                  {busyGeocode ? 'Buscando localização...' : 'Cadastrar filial'}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Filiais cadastradas</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Cada filial opera cardapio, raio e status de abertura de forma separada.
          </p>

          <div className="mt-4 space-y-3">
            {filteredBranches.map((branch) => (
              <article
                key={branch.id}
                className="rounded-lg border border-border-default bg-surface-background p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{branch.name}</p>
                    <p className="text-sm text-text-secondary">
                      {branch.address}, {branch.number} - {branch.neighborhood}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {branch.city}, {branch.state} &middot; CEP {branch.cep} &middot; raio {branch.deliveryRadiusKm} km
                    </p>
                    {branch.coordinates && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-brand-primary">
                        <Icon name="MapPin" size={12} />
                        {branch.coordinates.lat.toFixed(4)}, {branch.coordinates.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {}}
                  disabled
                >
                  Gerenciar horarios
                </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </FxQueryBoundary>
  );
}