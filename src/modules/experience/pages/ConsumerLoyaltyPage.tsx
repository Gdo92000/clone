import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { useConsumerLoyalty, useRedeemLoyaltyReward } from '../../../hooks/useConsumerData';
import { clsx } from 'clsx';

export function ConsumerLoyaltyPage() {
  const [branchId, setBranchId] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  const { data: loyalty, isLoading } = useConsumerLoyalty(branchId);
  const redeemMutation = useRedeemLoyaltyReward(branchId);

  return (
    <>
      <PageHeader title="Meu Programa de Fidelidade" />
      <FxQueryBoundary isLoading={isLoading} isError={false}>
        {!branchId ? (
          <div className="rounded-xl border border-dashed border-border-default p-12 text-center">
            <Icon name="Gift" size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-text-secondary">Selecione um restaurante para ver seus pontos.</p>
            {/* In a real scenario, we'd list branches the user has points in */}
            <div className="mt-6 flex justify-center gap-2">
               <Button onClick={() => { setBranchId('branch-1'); }} variant="outline" size="sm">Testar Loja 1</Button>
               <Button onClick={() => { setBranchId('branch-2'); }} variant="outline" size="sm">Testar Loja 2</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-brand-primary p-8 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-brand-primary-foreground/80 text-sm font-medium uppercase tracking-wider">Seus Pontos Acumulados</p>
                <h1 className="text-5xl font-bold mt-2">{loyalty?.balance ?? 0} <span className="text-2xl font-normal opacity-80">pts</span></h1>
                <p className="mt-4 text-sm opacity-90">Você ganha {loyalty?.points_per_real ?? '1'} ponto(s) a cada R$ 1,00 gasto.</p>
              </div>
              <Icon name="Star" size={120} className="absolute -right-4 -bottom-4 opacity-20 rotate-12" />
            </div>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recompensas Disponíveis</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {loyalty?.rewards.length === 0 ? (
                  <p className="text-sm text-text-secondary col-span-2">Nenhuma recompensa disponível no momento.</p>
                ) : (
                  loyalty?.rewards.map((reward) => {
                    const canRedeem = loyalty.balance >= reward.points_required;
                    return (
                      <article key={reward.id} className={clsx(
                        'rounded-xl border p-4 transition-all',
                        canRedeem ? 'border-border-default bg-surface-elevated' : 'border-border-default bg-surface-background opacity-60'
                      )}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-text-primary">{reward.name}</h3>
                            <p className="text-xs text-text-secondary">{reward.points_required} pontos necessários</p>
                          </div>
                          <div className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-xs font-bold">
                            {reward.discount_type === 'percentage' ? `${reward.discount_value}%` : `R$ ${reward.discount_value}`}
                          </div>
                        </div>
                        <Button 
                          disabled={!canRedeem} 
                          variant="solid" 
                          intent="primary" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                          setSelectedRewardId(reward.id);
                          redeemMutation.mutate(reward.id);
                        }}
                          loading={redeemMutation.isPending && selectedRewardId === reward.id}
                        >
                          {canRedeem ? 'Resgatar Agora' : 'Pontos Insuficientes'}
                        </Button>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </FxQueryBoundary>
    </>
  );
}

export default ConsumerLoyaltyPage;
