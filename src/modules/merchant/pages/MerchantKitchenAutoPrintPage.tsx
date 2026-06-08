import { useState, useMemo } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { clsx } from 'clsx';
import { useSaasAddons, useSaasUserAddons, useActivateAddon, usePrintHistoryBranches, usePrintHistoryByBranch } from '../../../hooks/useMerchantKitchenAutoPrint';
import { usePrinterConfig, useSavePrinterConfig } from '../../../hooks/useMerchantPrinterConfig';
import { useBranches } from '../../../hooks/useMerchantData';
import type { PrinterConfigDTO, PrintHistoryDTO } from '../../../dto/superadminDto';

interface Addon {
  id: string;
  name: string;
  description: string;
  monthly_price: string;
  feature_key: string;
  is_active: boolean;
}

export function MerchantKitchenAutoPrintPage() {
  const [isActivating, setIsActivating] = useState(false);
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState('');
  const effectiveBranchId = useMemo(() => branchId || (branches[0]?.id ?? ''), [branchId, branches]);

  const { data: addons = [] } = useSaasAddons();
  const kitchenAutoPrintAddon: Addon | undefined = addons.find(a => a.feature_key === 'kitchen_auto_print');
  const { data: userAddons = [] } = useSaasUserAddons();
  const hasAddon = userAddons.some(a => a.addon_id === kitchenAutoPrintAddon?.id);
  const activateMutation = useActivateAddon(kitchenAutoPrintAddon?.id);

  const handleActivate = () => {
    setIsActivating(true);
    activateMutation.mutate();
  };

  return (
    <>
      <PageHeader
        title="Impressao automatica na cozinha"
        actions={
          <select
            value={branchId}
            onChange={(event) => { setBranchId(event.target.value); }}
            className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            aria-label="Selecionar filial"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="space-y-6">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Impressao automatica de pedidos
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Automatize a impressao de pedidos na cozinha assim que forem aceitos.
                Compativel com impressoras termicas ESC/POS via rede, USB ou Bluetooth.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-3 h-3 rounded-full',
                hasAddon ? 'bg-feedback-success' : 'bg-text-tertiary'
              )} />
              <span className="text-sm text-text-secondary">
                {hasAddon ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-surface-background p-4">
              <Icon name="Zap" className="text-brand-primary mb-2" size={24} />
              <h3 className="font-semibold text-text-primary">Automatico</h3>
              <p className="text-sm text-text-secondary">
                Impressao instantanea ao aceitar pedidos
              </p>
            </div>
            <div className="rounded-lg bg-surface-background p-4">
              <Icon name="Shield" className="text-brand-primary mb-2" size={24} />
              <h3 className="font-semibold text-text-primary">Confiavel</h3>
              <p className="text-sm text-text-secondary">
                Retry automatico e fila de impressao
              </p>
            </div>
            <div className="rounded-lg bg-surface-background p-4">
              <Icon name="Printer" className="text-brand-primary mb-2" size={24} />
              <h3 className="font-semibold text-text-primary">Compativel</h3>
              <p className="text-sm text-text-secondary">
                Suporte a ESC/POS, rede, USB e Bluetooth
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <h3 className="font-semibold text-text-primary">Status da assinatura</h3>

          {!hasAddon ? (
            <div className="mt-4 rounded-lg bg-feedback-warning/10 border border-feedback-warning p-4">
              <p className="text-sm text-feedback-warning">
                <strong>Requer assinatura:</strong> Este recurso faz parte do addon premium{' '}
                <strong>kitchen_auto_print</strong>.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Valor: R$ {kitchenAutoPrintAddon?.monthly_price ?? '49,00'}/mes
              </p>
              <Button
                className="mt-4"
                onClick={handleActivate}
                loading={isActivating || activateMutation.isPending}
                disabled={isActivating || activateMutation.isPending}
              >
                {isActivating ? 'Ativando...' : 'Ativar agora'}
              </Button>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-feedback-success/10 border border-feedback-success p-4">
              <p className="text-sm text-feedback-success">
                <strong>Addon ativo!</strong> Sua empresa possui acesso ao recurso de impressao
                automatica.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Proxima cobranca: R$ {kitchenAutoPrintAddon?.monthly_price ?? '49,00'}
              </p>
            </div>
          )}
        </section>

        {hasAddon && effectiveBranchId && (
          <PrinterConfigSection branchId={effectiveBranchId} />
        )}

        {hasAddon && (
          <PrintHistorySection />
        )}

        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <h3 className="font-semibold text-text-primary">Como funciona</h3>
          <ol className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Cliente faz pedido
                </p>
                <p className="text-sm text-text-secondary">
                  O pedido chega no seu painel de gestao
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Voce aceita o pedido
                </p>
                <p className="text-sm text-text-secondary">
                  Ao mudar status para &quot;Aceito&quot;, o sistema dispara automaticamente
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Impressao automatica
                </p>
                <p className="text-sm text-text-secondary">
                  O pedido e impresso na cozinha sem intervencao manual
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </>
  );
}

function PrinterConfigSection({ branchId }: { branchId: string }) {
  const { data: config } = usePrinterConfig(branchId);
  const saveMutation = useSavePrinterConfig(branchId);

  const [form, setForm] = useState<PrinterConfigDTO>({
    printer_type: 'network',
    ip_address: '',
    port: 9100,
    model: 'ESC/POS',
    enabled: true,
  });
  const [hasSyncedForm, setHasSyncedForm] = useState(false);

  if (config && !hasSyncedForm) {
    setHasSyncedForm(true);
    setForm({
      printer_type: config.printer_type || 'network',
      ip_address: config.ip_address || '',
      port: config.port || 9100,
      model: config.model || 'ESC/POS',
      enabled: config.enabled,
    });
  }

  return (
    <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Configuracao da impressora</h3>
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-2 h-2 rounded-full',
            config?.enabled ? 'bg-feedback-success' : 'bg-feedback-error'
          )} />
          <span className="text-xs text-text-secondary">{config?.enabled ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-text-primary">Tipo de impressora</span>
          <select
            value={form.printer_type}
            onChange={(event) => { setForm({ ...form, printer_type: event.target.value }); }}
            className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <option value="network">Rede (TCP/IP)</option>
            <option value="usb">USB</option>
            <option value="bluetooth">Bluetooth</option>
          </select>
        </label>

        {form.printer_type === 'network' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Endereco IP</span>
              <input
                type="text"
                value={form.ip_address}
                onChange={(event) => { setForm({ ...form, ip_address: event.target.value }); }}
                className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                placeholder="192.168.1.100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Porta</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.port}
                onChange={(event) => { setForm({ ...form, port: Number(event.target.value) }); }}
                className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-text-primary">Modelo / protocolo</span>
          <input
            type="text"
            value={form.model}
            onChange={(event) => { setForm({ ...form, model: event.target.value }); }}
            className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          />
        </label>

        <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3 min-h-[44px]">
          <span className="text-sm font-medium text-text-primary">Ativar impressao automatica</span>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(event) => { setForm({ ...form, enabled: event.target.checked }); }}
            className="min-h-[44px] min-w-[44px] accent-brand-primary"
            aria-label="Ativar impressao automatica"
          />
        </label>

        <Button
          onClick={() => { saveMutation.mutate(form); }}
          loading={saveMutation.isPending}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? 'Salvando...' : 'Salvar configuracoes'}
        </Button>
      </div>
    </section>
  );
}

function PrintHistorySection() {
  const { data: branches = [] } = usePrintHistoryBranches();
  const [branchId, setBranchId] = useState('');
  const { data: history = [], isLoading, error } = usePrintHistoryByBranch(branchId);

  return (
    <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Historico de impressoes</h3>
        <select
          value={branchId}
          onChange={(event) => { setBranchId(event.target.value); }}
          className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
          aria-label="Selecionar filial para historico"
        >
          <option value="">Selecione a filial</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error instanceof Error ? error : null}>
        {!branchId ? (
          <div className="text-center py-8 text-text-secondary">
            <Icon name="Printer" size={40} className="mx-auto mb-2 opacity-50" />
            <p>Selecione uma filial para ver o historico.</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Icon name="Printer" size={40} className="mx-auto mb-2 opacity-50" />
            <p>Nenhuma impressao realizada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-default">
                <tr>
                  <th className="pb-2 font-medium text-text-secondary">Pedido</th>
                  <th className="pb-2 font-medium text-text-secondary">Status</th>
                  <th className="pb-2 font-medium text-text-secondary">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {history.map((job: PrintHistoryDTO) => (
                  <tr key={job.id} className="hover:bg-surface-background transition-colors">
                    <td className="py-2">#{job.order_id.slice(-6)}</td>
                    <td className="py-2">
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium',
                          job.status === 'completed'
                            ? 'bg-feedback-success/10 text-feedback-success'
                            : job.status === 'failed'
                            ? 'bg-feedback-error/10 text-feedback-error'
                            : 'bg-brand-primary/10 text-brand-primary'
                        )}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2 text-text-secondary">
                      {new Date(job.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FxQueryBoundary>
    </section>
  );
}

export default MerchantKitchenAutoPrintPage;
