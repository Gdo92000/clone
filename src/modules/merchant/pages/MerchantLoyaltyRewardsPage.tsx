import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useBranches } from '../../../hooks/useMerchantData';
import { useLoyaltySettings, useSaveBranchSettings } from '../../../hooks/useMerchantSettings';
import { merchantApi } from '../../../api/merchantApi';
import { merchantKeys } from '../../../api/queryKeys';
import { successToast, errorToast } from '../../../lib/toast';
import { clsx } from 'clsx';
import type { LoyaltyRewardDTO } from '../../../dto/superadminDto';

type DiscountType = 'percentage' | 'fixed';

interface RewardForm {
  name: string;
  points_required: number;
  discount_value: string;
  discount_type: DiscountType;
  is_active: boolean;
}

const emptyForm: RewardForm = {
  name: '',
  points_required: 0,
  discount_value: '',
  discount_type: 'percentage',
  is_active: true,
};

export function MerchantLoyaltyRewardsPage() {
  const queryClient = useQueryClient();
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RewardForm>(emptyForm);

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: merchantKeys.loyaltyRewards(branchId),
    queryFn: () => merchantApi.getLoyaltyRewards(branchId),
    enabled: !!branchId,
  });

  const { data: loyaltySettings } = useLoyaltySettings(branchId);
  const saveBranchSettings = useSaveBranchSettings(branchId);

  const [loyaltyForm, setLoyaltyForm] = useState({ enabled: false, points_per_real: '1.00' });
  const [hasSyncedLoyalty, setHasSyncedLoyalty] = useState(false);
  const [prevSyncBranch, setPrevSyncBranch] = useState(branchId);

  if (branchId !== prevSyncBranch) {
    setPrevSyncBranch(branchId);
    setHasSyncedLoyalty(false);
  }

  if (loyaltySettings && !hasSyncedLoyalty) {
    setHasSyncedLoyalty(true);
    setLoyaltyForm({
      enabled: loyaltySettings.enabled,
      points_per_real: loyaltySettings.points_per_currency.toString(),
    });
  }

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: merchantKeys.loyaltyRewards(branchId) });
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; points_required: number; discount_type: DiscountType; discount_value: string; is_active: boolean; branch_id: string }) =>
      merchantApi.createLoyaltyReward(data),
    onSuccess: () => { invalidate(); setIsModalOpen(false); setEditingId(null); setForm(emptyForm); successToast('Recompensa criada'); },
    onError: () => { errorToast('Erro ao criar recompensa'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      merchantApi.updateLoyaltyReward(id, data),
    onSuccess: () => { invalidate(); setIsModalOpen(false); setEditingId(null); setForm(emptyForm); successToast('Recompensa atualizada'); },
    onError: () => { errorToast('Erro ao atualizar recompensa'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => merchantApi.deleteLoyaltyReward(id),
    onSuccess: () => { invalidate(); successToast('Recompensa removida'); },
    onError: () => { errorToast('Erro ao remover recompensa'); },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (reward: LoyaltyRewardDTO) => {
    setEditingId(reward.id);
    setForm({
      name: reward.name,
      points_required: reward.points_required,
      discount_value: String(reward.discount_value),
      discount_type: reward.discount_type === 'fixed' ? 'fixed' : 'percentage',
      is_active: reward.active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = () => {
    if (!form.name.trim() || form.points_required < 0 || !form.discount_value.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { ...form, branch_id: branchId } });
    } else {
      createMutation.mutate({ ...form, branch_id: branchId });
    }
  };

  const saveLoyaltySettings = () => {
    saveBranchSettings.mutate(
      { settings: {}, loyaltySettings: loyaltyForm },
      { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: merchantKeys.loyaltySettings(branchId) }); } },
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <PageHeader
        title="Recompensas de fidelidade"
        actions={
          <div className="flex gap-3">
            <select
              value={branchId}
              onChange={(event) => { setBranchId(event.target.value); }}
              className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              aria-label="Selecionar filial"
            >
              <option value="">Selecione a filial</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <Button onClick={openCreate} size="sm" variant="solid" intent="primary" disabled={!branchId}>
              <Icon name="Plus" size={16} className="mr-2" />Nova recompensa
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4">
        {branchId && (
          <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h2 className="font-semibold text-text-primary">Programa de fidelidade</h2>
            <p className="mt-1 text-sm text-text-secondary">Configure a pontuacao por real gasto e ative o programa.</p>

            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3 min-h-[44px]">
                <span className="text-sm font-medium text-text-primary">Habilitar fidelidade</span>
                <input
                  type="checkbox"
                  checked={loyaltyForm.enabled}
                  onChange={(event) => { setLoyaltyForm({ ...loyaltyForm, enabled: event.target.checked }); }}
                  className="min-h-[44px] min-w-[44px] accent-brand-primary"
                  aria-label="Habilitar programa de fidelidade"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-primary">Pontos por R$ 1,00</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={loyaltyForm.points_per_real}
                  onChange={(event) => { setLoyaltyForm({ ...loyaltyForm, points_per_real: event.target.value }); }}
                  className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  step="0.01"
                  min={0}
                />
              </label>

              <Button
                onClick={saveLoyaltySettings}
                loading={saveBranchSettings.isPending}
                disabled={saveBranchSettings.isPending}
                size="sm"
              >
                {saveBranchSettings.isPending ? 'Salvando...' : 'Salvar configuracoes'}
              </Button>
            </div>
          </section>
        )}

        {!branchId ? (
          <div className="rounded-xl border border-dashed border-border-default bg-surface-elevated p-12">
            <EmptyState
              icon="Store"
              title="Selecione uma filial"
              description="Escolha uma filial para gerenciar as recompensas de fidelidade dos clientes."
              size="md"
            />
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 text-text-secondary">Carregando recompensas...</div>
        ) : rewards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-default bg-surface-elevated">
            <EmptyState
              icon="Gift"
              title="Nenhuma recompensa cadastrada"
              description="Crie a primeira recompensa que seus clientes poderao resgatar com pontos."
              size="md"
              action={{
                label: 'Nova recompensa',
                onClick: openCreate,
                variant: 'solid',
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-background border-b border-border-default">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Recompensa</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Pontos</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Valor</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-surface-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{reward.name}</td>
                    <td className="px-4 py-3">{reward.points_required} pts</td>
                    <td className="px-4 py-3">
                      {reward.discount_type === 'percentage'
                        ? `${reward.discount_value}%`
                        : `R$ ${reward.discount_value}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        reward.active
                          ? 'bg-feedback-success/10 text-feedback-success'
                          : 'bg-feedback-error/10 text-feedback-error',
                      )}>
                        {reward.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => { openEdit(reward); }}
                        className="p-1.5 rounded-md hover:bg-surface-background text-text-tertiary transition-colors min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        aria-label="Editar recompensa"
                      >
                        <Icon name="Pencil" size={16} />
                      </button>
                      <button
                        onClick={() => { deleteMutation.mutate(reward.id); }}
                        className="p-1.5 rounded-md hover:bg-surface-background text-feedback-error transition-colors min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        aria-label="Remover recompensa"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar recompensa' : 'Nova recompensa'}
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" intent="secondary" className="flex-1" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="solid"
              intent="primary"
              className="flex-1"
              onClick={submit}
              loading={isSaving}
              disabled={isSaving || !form.name.trim() || form.points_required < 0 || !form.discount_value.trim()}
            >
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-text-primary">Nome da recompensa</span>
            <input
              value={form.name}
              onChange={(event) => { setForm({ ...form, name: event.target.value }); }}
              placeholder="Ex: Desconto de R$ 10,00"
              className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Pontos necessarios</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.points_required}
                onChange={(event) => { setForm({ ...form, points_required: Number(event.target.value) }); }}
                className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                min={0}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Valor do desconto</span>
              <input
                type="number"
                inputMode="decimal"
                value={form.discount_value}
                onChange={(event) => { setForm({ ...form, discount_value: event.target.value }); }}
                className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                min={0}
                step="0.01"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-text-primary">Tipo de desconto</span>
            <select
              value={form.discount_type}
              onChange={(event) => { setForm({ ...form, discount_type: event.target.value as DiscountType }); }}
              className="mt-1 h-11 min-h-[44px] w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <option value="percentage">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </label>

          <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3 min-h-[44px]">
            <span className="text-sm font-medium text-text-primary">Ativa</span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => { setForm({ ...form, is_active: event.target.checked }); }}
              className="min-h-[44px] min-w-[44px] accent-brand-primary"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}

export default MerchantLoyaltyRewardsPage;

