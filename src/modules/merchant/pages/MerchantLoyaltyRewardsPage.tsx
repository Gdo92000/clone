import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { MerchantLayout } from '../components/MerchantLayout';
import { useBranches } from '../../../hooks/useMerchantData';
import { useLoyaltyRewards, useSaveLoyaltyReward, useDeleteLoyaltyReward } from '../../../hooks/useMerchantLoyaltyRewards';
import { clsx } from 'clsx';

interface Reward {
  id: string;
  name: string;
  points_required: number;
  discount_value: number;
  discount_type: string;
  active: boolean;
}

export function MerchantLoyaltyRewardsPage() {
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [form, setForm] = useState({
    name: '',
    points_required: 0,
    discount_value: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    is_active: true,
  });

  const { data: rewards = [] } = useLoyaltyRewards(branchId);

  const mutation = useSaveLoyaltyReward(editingReward?.id ?? null, branchId);

  const deleteMutation = useDeleteLoyaltyReward(branchId);

  const handleStartEdit = (reward: Reward) => {
    setEditingReward(reward);
    setForm({
      name: reward.name,
      points_required: reward.points_required,
      discount_value: String(reward.discount_value),
      discount_type: reward.discount_type as 'percentage' | 'fixed',
      is_active: reward.active,
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingReward(null);
    setForm({ name: '', points_required: 0, discount_value: '', discount_type: 'percentage', is_active: true });
    setIsModalOpen(true);
  };

  return (
    <MerchantLayout
      title="Recompensas de Fidelidade"
      actions={
        <div className="flex gap-3">
          <select
            value={branchId}
            onChange={(e) => { setBranchId(e.target.value); }}
            className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
          >
            <option value="">Selecione a filial</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <Button onClick={handleCreate} size="sm" variant="solid" intent="primary">
            <Icon name="Plus" size={16} className="mr-2" /> Nova Recompensa
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6">
        {!branchId ? (
          <div className="rounded-xl border border-dashed border-border-default p-12 text-center">
            <Icon name="Store" size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-text-secondary">Selecione uma filial para gerenciar as recompensas.</p>
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
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {rewards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Nenhuma recompensa cadastrada.</td>
                  </tr>
                ) : (
                  rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-background/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">{r.name}</td>
                      <td className="px-4 py-3">{r.points_required} pts</td>
                      <td className="px-4 py-3">
                        {r.discount_type === 'percentage' ? `${r.discount_value}%` : `R$ ${r.discount_value}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          r.active ? 'bg-feedback-success/10 text-feedback-success' : 'bg-feedback-error/10 text-feedback-error'
                        )}>
                          {r.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => { handleStartEdit(r); }} className="p-1.5 rounded-md hover:bg-surface-background text-text-tertiary transition-colors">
                          <Icon name="Pencil" size={16} />
                        </button>
                        <button onClick={() => { deleteMutation.mutate(r.id); }} className="p-1.5 rounded-md hover:bg-surface-background text-feedback-error transition-colors">
                          <Icon name="Trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border-default rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); }} className="p-2 rounded-lg hover:bg-surface-background">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-text-primary">Nome da Recompensa</span>
                <input
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); }}
                  placeholder="Ex: Desconto de R$ 10,00"
                  className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Pontos Necessários</span>
                  <input
                    type="number"
                    value={form.points_required}
                    onChange={(e) => { setForm({ ...form, points_required: Number(e.target.value) }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">Valor do Desconto</span>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => { setForm({ ...form, discount_value: e.target.value }); }}
                    className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                    step="0.01"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-text-primary">Tipo de Desconto</span>
                <select
                  value={form.discount_type}
                  onChange={(e) => { setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' }); }}
                  className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </label>

              <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
                <span className="text-sm font-medium text-text-primary">Ativa</span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => { setForm({ ...form, is_active: e.target.checked }); }}
                />
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" intent="secondary" className="flex-1" onClick={() => { setIsModalOpen(false); }}>
                Cancelar
              </Button>
              <Button variant="solid" intent="primary" className="flex-1" onClick={() => { mutation.mutate(form, { onSuccess: () => { setIsModalOpen(false); setEditingReward(null); setForm({ name: '', points_required: 0, discount_value: '', discount_type: 'percentage', is_active: true }); } }); }} loading={mutation.isPending}>
                {editingReward ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MerchantLayout>
  );
}

export default MerchantLoyaltyRewardsPage;
