import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { MerchantLayout } from '../components/MerchantLayout';
import { useBranches } from '../../../hooks/useMerchantData';

export function MerchantSettingsPage() {
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [settings, setSettings] = usePersistentState('merchant.settings', {
    openingTime: '18:00',
    closingTime: '23:30',
    preparationTime: '35',
    minimumOrder: '25',
    acceptsDelivery: true,
    acceptsPickup: true,
    pixKey: 'financeiro@francafood.com.br',
  });
  const [saved, setSaved] = useState(false);

  const selectedBranch = branches.find((branch) => branch.id === branchId);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => { setSaved(false); }, 1800);
  };

  return (
    <MerchantLayout
      title="Configuracoes"
      actions={
         <select
           value={branchId}
           onChange={(event) => { setBranchId(event.target.value); }}
           className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
         >
           {branches.map((branch) => (
             <option key={branch.id} value={branch.id}>
               {branch.name}
             </option>
           ))}
         </select>
      }
    >
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Operacao da filial</h2>
          <p className="mt-1 text-sm text-text-secondary">{selectedBranch?.name}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Abertura</span>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(event) => { setSettings({ ...settings, openingTime: event.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Fechamento</span>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(event) => { setSettings({ ...settings, closingTime: event.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Preparo medio</span>
              <input
                value={settings.preparationTime}
                onChange={(event) => { setSettings({ ...settings, preparationTime: event.target.value }); }}
                inputMode="numeric"
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Pedido minimo</span>
              <input
                value={settings.minimumOrder}
                onChange={(event) => { setSettings({ ...settings, minimumOrder: event.target.value }); }}
                inputMode="decimal"
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
              <span className="text-sm font-medium text-text-primary">Aceita entrega</span>
              <input
                type="checkbox"
                checked={settings.acceptsDelivery}
                onChange={(event) => { setSettings({ ...settings, acceptsDelivery: event.target.checked }); }}
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
              <span className="text-sm font-medium text-text-primary">Aceita retirada</span>
              <input
                type="checkbox"
                checked={settings.acceptsPickup}
                onChange={(event) => { setSettings({ ...settings, acceptsPickup: event.target.checked }); }}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-primary">Chave Pix</span>
            <input
              value={settings.pixKey}
              onChange={(event) => { setSettings({ ...settings, pixKey: event.target.value }); }}
              className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={saveSettings}>Salvar configuracoes</Button>
            {saved && (
              <span className="text-sm font-medium text-feedback-success">
                Configuracoes salvas no mock local
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Contrato para backend</h2>
          <div className="mt-4 space-y-3 text-sm text-text-secondary">
            <p>Empresa controla CNPJ, plano e permissoes.</p>
            <p>Filial controla cidade, raio, status de abertura e cardapio.</p>
            <p>Pedidos usam status sequencial para aceite, preparo, entrega e conclusao.</p>
            <p>Configuracoes ficam por filial para suportar multiempresa e expansao.</p>
          </div>
        </div>
      </section>
    </MerchantLayout>
  );
}
