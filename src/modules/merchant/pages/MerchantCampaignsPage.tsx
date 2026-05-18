import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { usePlanLimits } from '../../enterprise';
import { MerchantLayout } from '../components/MerchantLayout';

interface Campaign {
  id: string;
  name: string;
  discount: string;
  status: 'active' | 'paused';
}

const initialCampaigns: Campaign[] = [
  { id: 'campaign-1', name: 'Frete gratis Centro', discount: 'Frete gratis', status: 'active' },
];

export function MerchantCampaignsPage() {
  const [campaigns, setCampaigns] = usePersistentState<Campaign[]>('merchant.campaigns', initialCampaigns);
  const [name, setName] = useState('');
  const limits = usePlanLimits('company-1');

  const addCampaign = () => {
    if (!name.trim() || !limits.canCreateCampaign) {
      return;
    }

    setCampaigns((current) => [
      { id: `campaign-${Date.now()}`, name: name.trim(), discount: '10%', status: 'active' },
      ...current,
    ]);
    setName('');
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
          <Button className="mt-3" onClick={addCampaign} disabled={!limits.canCreateCampaign}>Criar campanha</Button>
        </div>
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="font-semibold text-text-primary">{campaign.name}</p>
              <p className="mt-1 text-sm text-text-secondary">{campaign.discount} - {campaign.status}</p>
            </article>
          ))}
        </div>
      </section>
    </MerchantLayout>
  );
}
