import { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { MerchantLayout } from '../components/MerchantLayout';
import { useBranches } from '../../../hooks/useMerchantData';
import { useBranchSettings, useLoyaltySettings, useSaveBranchSettings } from '../../../hooks/useMerchantSettings';

export function MerchantSettingsPage() {
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState('');

  const effectiveBranchId = useMemo(() => branchId || (branches[0]?.id ?? ''), [branchId, branches]);

  const [settings, setSettings] = useState({
    opening_time: '09:00',
    closing_time: '18:00',
    preparation_time: '30',
    minimum_order: '20',
    accepts_delivery: true,
    accepts_pickup: true,
    pix_key: '',
  });

  const { data: remoteSettings } = useBranchSettings(effectiveBranchId);

  const { data: remoteLoyalty } = useLoyaltySettings(effectiveBranchId);

  const [loyaltySettings, setLoyaltySettings] = useState({
    enabled: false,
    points_per_real: '1.00',
  });

  const [hasSyncedSettings, setHasSyncedSettings] = useState(false);
  const [hasSyncedLoyalty, setHasSyncedLoyalty] = useState(false);
  const [prevSyncBranch, setPrevSyncBranch] = useState(effectiveBranchId);

  if (effectiveBranchId !== prevSyncBranch) {
    setPrevSyncBranch(effectiveBranchId);
    setHasSyncedSettings(false);
    setHasSyncedLoyalty(false);
  }

  if (remoteSettings && 'branch_id' in remoteSettings && !hasSyncedSettings) {
    setHasSyncedSettings(true);
    setSettings({
      opening_time: remoteSettings.opening_time,
      closing_time: remoteSettings.closing_time,
      preparation_time: remoteSettings.preparation_time,
      minimum_order: remoteSettings.minimum_order,
      accepts_delivery: remoteSettings.accepts_delivery,
      accepts_pickup: remoteSettings.accepts_pickup,
       pix_key: remoteSettings.pix_key,
    });
  }

  if (remoteLoyalty && !hasSyncedLoyalty) {
    setHasSyncedLoyalty(true);
    setLoyaltySettings({
      enabled: remoteLoyalty.enabled,
      points_per_real: remoteLoyalty.points_per_currency.toString(),
    });
  }

  const saveMutation = useSaveBranchSettings(effectiveBranchId);


  const selectedBranch = branches.find((b) => b.id === branchId);

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
                value={settings.opening_time}
                onChange={(event) => { setSettings({ ...settings, opening_time: event.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Fechamento</span>
              <input
                type="time"
                value={settings.closing_time}
                onChange={(event) => { setSettings({ ...settings, closing_time: event.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Preparo medio</span>
              <input
                value={settings.preparation_time}
                onChange={(event) => { setSettings({ ...settings, preparation_time: event.target.value }); }}
                inputMode="numeric"
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Pedido minimo</span>
              <input
                value={settings.minimum_order}
                onChange={(event) => { setSettings({ ...settings, minimum_order: event.target.value }); }}
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
                checked={settings.accepts_delivery}
                onChange={(event) => { setSettings({ ...settings, accepts_delivery: event.target.checked }); }}
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
              <span className="text-sm font-medium text-text-primary">Aceita retirada</span>
              <input
                type="checkbox"
                checked={settings.accepts_pickup}
                onChange={(event) => { setSettings({ ...settings, accepts_pickup: event.target.checked }); }}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-primary">Chave Pix</span>
            <input
              value={settings.pix_key}
              onChange={(event) => { setSettings({ ...settings, pix_key: event.target.value }); }}
              className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
          </label>

           <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={() =>     { saveMutation.mutate({ settings, loyaltySettings }); }} loading={saveMutation.isPending} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar configuracoes'}
              </Button>
           </div>
         </div>

         <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
           <h2 className="font-semibold text-text-primary">Programa de Fidelidade</h2>
           <p className="mt-1 text-sm text-text-secondary"> Configure a pontuação por real gasto. </p>

           <div className="mt-4 space-y-4">
             <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
               <span className="text-sm font-medium text-text-primary">Habilitar Fidelidade</span>
               <input
                 type="checkbox"
                 checked={loyaltySettings.enabled}
                 onChange={(event) => { setLoyaltySettings({ ...loyaltySettings, enabled: event.target.checked }); }}
               />
             </label>

             <label className="block">
               <span className="text-sm font-medium text-text-primary">Pontos por R$ 1,00</span>
               <input
                 type="number"
                 value={loyaltySettings.points_per_real}
                 onChange={(event) => { setLoyaltySettings({ ...loyaltySettings, points_per_real: event.target.value }); }}
                 className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                 step="0.01"
               />
             </label>
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
