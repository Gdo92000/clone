import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../merchant/format';
import { featureLabels, useSaasWorkspace } from '../../saas';
import type { FeatureKey, SaasAddon } from '../../saas';
import { PageHeader } from '../../../components/ui/PageHeader';

const featureOptions = Object.entries(featureLabels) as [FeatureKey, string][];

export function AddonsPage() {
  const { addons, setAddons } = useSaasWorkspace();
  const [form, setForm] = useState({
    name: '',
    monthlyPrice: '',
    featureKey: 'analytics' as FeatureKey,
    description: '',
  });

  const addAddon = () => {
    const monthlyPrice = Number(form.monthlyPrice.replace(',', '.'));

    if (!form.name.trim() || Number.isNaN(monthlyPrice)) {
      return;
    }

    const nextAddon: SaasAddon = {
      id: `addon-${Date.now()}`,
      name: form.name.trim(),
      monthlyPrice,
      featureKey: form.featureKey,
      description: form.description.trim(),
    };

    setAddons((currentAddons) => [nextAddon, ...currentAddons]);
    setForm({ name: '', monthlyPrice: '', featureKey: 'analytics', description: '' });
  };

  return (
    <><PageHeader title="Addons compraveis" />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Novo addon</h2>
          <div className="mt-4 space-y-3">
            <input
              value={form.name}
              onChange={(event) => { setForm({ ...form, name: event.target.value }); }}
              placeholder="Nome"
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
            <input
              value={form.monthlyPrice}
              onChange={(event) => { setForm({ ...form, monthlyPrice: event.target.value }); }}
              placeholder="Preco mensal"
              inputMode="decimal"
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
            <select
              value={form.featureKey}
              onChange={(event) => { setForm({ ...form, featureKey: event.target.value as FeatureKey }); }}
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            >
              {featureOptions.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <textarea
              value={form.description}
              onChange={(event) => { setForm({ ...form, description: event.target.value }); }}
              placeholder="Descricao"
              rows={4}
              className="w-full rounded-lg border border-border-default bg-surface-background px-3 py-2 text-sm"
            />
            <Button fullWidth onClick={addAddon}>Criar addon</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {addons.map((addon) => (
            <article key={addon.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm font-semibold text-brand-secondary">{featureLabels[addon.featureKey]}</p>
              <h2 className="mt-2 font-semibold text-text-primary">{addon.name}</h2>
              <p className="mt-1 text-sm text-text-secondary">{addon.description}</p>
              <p className="mt-3 font-bold text-text-primary">{formatCurrency(addon.monthlyPrice)}/mes</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );

}

