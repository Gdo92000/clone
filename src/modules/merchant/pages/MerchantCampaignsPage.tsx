import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button';
import { usePlanLimits } from '../../enterprise';
import { MerchantLayout } from '../components/MerchantLayout';
import { merchantApi } from '../../../api';
import { errorToast, successToast } from '../../../lib/toast';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

interface Campaign {
  id: string;
  name: string;
  discount: string;
  status: 'active' | 'paused';
}

export function MerchantCampaignsPage() {
  const queryClient = useQueryClient();
  const { data: campaigns = [], isLoading, error } = useQuery<Campaign[]>({
    queryKey: ['merchant-campaigns'],
    queryFn: () => merchantApi.getCampaigns(),
  });
  const [name, setName] = useState('');
  const [mutating, setMutating] = useState(false);
  const limits = usePlanLimits('company-1');

  const addCampaign = async () => {
    if (!name.trim() || !limits.canCreateCampaign) return;
    setMutating(true);
    try {
      await merchantApi.createCampaign({ name: name.trim(), discount: '10%', status: 'active' });
      successToast('Campanha criada com sucesso!');
      setName('');
      await queryClient.invalidateQueries({ queryKey: ['merchant-campaigns'] });
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Erro ao criar campanha');
    } finally {
      setMutating(false);
    }
  };

  return (
    <MerchantLayout title="Campanhas e promocoes">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Nova campanha</h2>
          {!limits.canCreateCampaign && (
            <p className="mt-3 rounded-lg bg-feedback-error/10 p-3 text-sm text-feedback-error">
              Seu plano nao permite novas campanhas. Contrate o addon ou faca upgrade.
            </p>
          )}
          <input
            value={name}
            onChange={(event) => { setName(event.target.value); }}
            placeholder="Nome da campanha"
            className="mt-4 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
          />
          <Button className="mt-3" loading={mutating} onClick={addCampaign} disabled={!limits.canCreateCampaign}>Criar campanha</Button>
        </div>
        <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error instanceof Error ? error : null}>
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="font-semibold text-text-primary">{campaign.name}</p>
              <p className="mt-1 text-sm text-text-secondary">{campaign.discount} - {campaign.status}</p>
            </article>
          ))}
        </div>
        </FxQueryBoundary>
      </section>
    </MerchantLayout>
  );
}
