import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MerchantLayout } from '../components/MerchantLayout';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { successToast, errorToast } from '../../../lib/toast';
import { clsx } from 'clsx';
import { get, post } from '../../../api/httpClient';

interface Addon {
  id: string;
  name: string;
  description: string;
  monthly_price: string;
  feature_key: string;
  is_active: boolean;
}

interface SubscriptionAddon {
  subscription_id: string;
  addon_id: string;
  activated_at: string;
}

export function MerchantKitchenAutoPrintPage() {
  const queryClient = useQueryClient();
  const [isActivating, setIsActivating] = useState(false);

  // Buscar addon kitchen_auto_print
  const { data: addons = [] } = useQuery<Addon[]>({
    queryKey: ['addons'],
    queryFn: () => get('/addons'),
  });

  const kitchenAutoPrintAddon = addons.find(a => a.feature_key === 'kitchen_auto_print');

  // Verificar se tenant já tem o addon ativado
  const { data: userAddons = [] } = useQuery<SubscriptionAddon[]>({
    queryKey: ['user-addons'],
    queryFn: () => get('/subscription-addons'),
  });

  const hasAddon = userAddons.some(a => a.addon_id === kitchenAutoPrintAddon?.id);

  // Ativar addon
  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!kitchenAutoPrintAddon) throw new Error('Addon não encontrado');
      const response = await post('/subscription-addons/toggle', {
        subscriptionId: 'current',
        addonId: kitchenAutoPrintAddon.id,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addons'] });
      successToast('Addon ativado com sucesso!');
    },
    onError: () => {
      errorToast('Erro ao ativar addon');
    },
  });

  const handleActivate = () => {
    setIsActivating(true);
    activateMutation.mutate();
  };

  return (
    <MerchantLayout title="Impressão Automática na Cozinha">
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Impressão Automática de Pedidos
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Automatize a impressão de pedidos na cozinha assim que forem aceitos.
                Compatível com impressoras térmicas ESC/POS via rede, USB ou Bluetooth.
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

          {/* Benefícios */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-surface-background p-4">
              <Icon name="Zap" className="text-brand-primary mb-2" size={24} />
              <h3 className="font-semibold text-text-primary">Automático</h3>
              <p className="text-sm text-text-secondary">
                Impressão instantânea ao aceitar pedidos
              </p>
            </div>
            <div className="rounded-lg bg-surface-background p-4">
              <Icon name="Shield" className="text-brand-primary mb-2" size={24} />
              <h3 className="font-semibold text-text-primary">Confiável</h3>
              <p className="text-sm text-text-secondary">
                Retry automático e fila de impressão
              </p>
            </div>
            <div className="rounded-lg bg-surface-background p-4">
              <Icon name="Printer" className="text-brand-primary mb-2" size={24} />
              <h3 className="font-semibold text-text-primary">Compatível</h3>
              <p className="text-sm text-text-secondary">
                Suporte a ESC/POS, rede, USB e Bluetooth
              </p>
            </div>
          </div>
        </section>

        {/* Status do Addon */}
        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <h3 className="font-semibold text-text-primary">Status da Assinatura</h3>
          
          {!hasAddon ? (
            <div className="mt-4 rounded-lg bg-feedback-warning/10 border border-feedback-warning p-4">
              <p className="text-sm text-feedback-warning">
                <strong>Requer assinatura:</strong> Este recurso faz parte do addon premium{' '}
                <strong>kitchen_auto_print</strong>.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Valor: R$ {kitchenAutoPrintAddon?.monthly_price ?? '49,00'}/mês
              </p>
              <Button
                className="mt-4"
                onClick={handleActivate}
                loading={isActivating || activateMutation.isPending}
                disabled={isActivating || activateMutation.isPending}
              >
                {isActivating ? 'Ativando...' : 'Ativar Agora'}
              </Button>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-feedback-success/10 border border-feedback-success p-4">
              <p className="text-sm text-feedback-success">
                <strong>Addon ativo!</strong> Sua empresa possui acesso ao recurso de impressão
                automática.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Próxima cobrança: R$ {kitchenAutoPrintAddon?.monthly_price ?? '49,00'}
              </p>
            </div>
          )}
        </section>

        {/* Configuração de Impressoras */}
        {hasAddon && (
          <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Configurar Impressoras</h3>
              <Button
                variant="outline"
                intent="primary"
                size="sm"
                onClick={() => {
                  window.location.href = '/merchant/printer';
                }}
              >
                Gerenciar Impressoras
              </Button>
            </div>
            <p className="text-sm text-text-secondary">
              Configure as impressoras térmicas para cada filial. Suporte para conexões via
              rede (TCP/IP), USB e Bluetooth.
            </p>
          </section>
        )}

        {/* Histórico de Impressões */}
        {hasAddon && (
          <PrintHistorySection />
        )}

        {/* Como Funciona */}
        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <h3 className="font-semibold text-text-primary">Como Funciona</h3>
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
                  O pedido chega no seu painel de gestão
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Você aceita o pedido
                </p>
                <p className="text-sm text-text-secondary">
                  Ao mudar status para "Aceito", o sistema dispara automaticamente
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Impressão automática
                </p>
                <p className="text-sm text-text-secondary">
                  O pedido é impresso na cozinha sem intervenção manual
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </MerchantLayout>
  );
}

function PrintHistorySection() {
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['branches'],
    queryFn: () => get('/branches'),
  });

  const [branchId, setBranchId] = useState('');

  const { data: history = [] } = useQuery({
    queryKey: ['print-history', branchId],
    queryFn: () => get(`/printing/history/${branchId}`),
    enabled: !!branchId,
  });

  return (
    <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Histórico de Impressões</h3>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
        >
          {branches.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {!history || (history as any[]).length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Icon name="Printer" size={40} className="mx-auto mb-2 opacity-50" />
          <p>Nenhuma impressão realizada</p>
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
              {(history as any[]).map((job: any) => (
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
    </section>
  );
}

export default MerchantKitchenAutoPrintPage;
