import { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { MerchantLayout } from '../components/MerchantLayout';
import { useBranches } from '../../../hooks/useMerchantData';
import type { PrintHistoryDTO } from '../../../dto/superadminDto';
import { usePrinterConfig, usePrintHistory, useSavePrinterConfig } from '../../../hooks/useMerchantPrinterConfig';
import { clsx } from 'clsx';

interface PrinterConfig {
  printer_type: string;
  ip_address: string;
  port: number;
  model: string;
  enabled: boolean;
}

export function MerchantPrinterConfigPage() {
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState('');

  const effectiveBranchId = useMemo(() => branchId || (branches[0]?.id ?? ''), [branchId, branches]);

  const { data: config } = usePrinterConfig(effectiveBranchId);

  const [form, setForm] = useState<PrinterConfig>({
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

  const saveMutation = useSavePrinterConfig(effectiveBranchId);

  const { data: history = [] } = usePrintHistory(effectiveBranchId);

  return (
    <MerchantLayout
      title="Configurações de Impressão"
      actions={
        <select
          value={branchId}
          onChange={(e) => { setBranchId(e.target.value); }}
          className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
        >
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Configuração da Impressora</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Tipo de Impressora</span>
              <select
                value={form.printer_type}
                onChange={(e) => { setForm({ ...form, printer_type: e.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              >
                <option value="network">Rede (TCP/IP)</option>
                <option value="usb">USB</option>
                <option value="bluetooth">Bluetooth</option>
              </select>
            </label>

            {form.printer_type === 'network' && (
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Endereço IP</span>
                  <input
                    type="text"
                    value={form.ip_address}
                    onChange={(e) => { setForm({ ...form, ip_address: e.target.value }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    placeholder="192.168.1.100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Porta</span>
                  <input
                    type="number"
                    value={form.port}
                    onChange={(e) => { setForm({ ...form, port: Number(e.target.value) }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  />
                </label>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Modelo / Protocolo</span>
              <input
                type="text"
                value={form.model}
                onChange={(e) => { setForm({ ...form, model: e.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
              <span className="text-sm font-medium text-text-primary">Ativar Impressão Automática</span>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => { setForm({ ...form, enabled: e.target.checked }); }}
              />
            </label>

            <Button onClick={() =>     { saveMutation.mutate(form as unknown as Record<string, unknown>); }} loading={saveMutation.isPending} disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Histórico de Impressões</h2>
            <div className="flex items-center gap-2">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                config?.enabled ? 'bg-feedback-success' : 'bg-feedback-error'
              )} />
              <span className="text-xs text-text-secondary">{config?.enabled ? 'Online' : 'Offline'}</span>
            </div>
          </div>
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
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-text-secondary">Nenhuma impressão realizada.</td>
                  </tr>
                ) : (
                  history.map((job: PrintHistoryDTO) => (
                    <tr key={job.id} className="hover:bg-surface-background transition-colors">
                      <td className="py-2">#{job.order_id.slice(-6)}</td>
                      <td className="py-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium',
                          job.status === 'completed' ? 'bg-feedback-success/10 text-feedback-success' : 
                          job.status === 'failed' ? 'bg-feedback-error/10 text-feedback-error' : 'bg-brand-primary/10 text-brand-primary'
                        )}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-2 text-text-secondary">{new Date(job.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MerchantLayout>
  );
}

export default MerchantPrinterConfigPage;
