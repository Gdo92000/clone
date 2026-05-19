import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useAuthSession } from '../../auth';
import { useAuditLog } from '../../enterprise';
import { useBranches, useCompanies } from '../../../hooks/useMerchantData';
import { featureLabels, resolveFeatureAccess, useSaasWorkspace } from '../../saas';
import type { FeatureFlagOverride, FeatureKey } from '../../saas';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

const featureOptions = Object.entries(featureLabels) as [FeatureKey, string][];

export function FeatureFlagsPage() {
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useCompanies();
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useBranches();
  const isLoading = companiesLoading || branchesLoading;
  const error = companiesError ?? branchesError;
  const { plans, addons, subscriptions, overrides, setOverrides } = useSaasWorkspace();
  const { currentUser, users } = useAuthSession();
  const { recordAudit } = useAuditLog();
  const [form, setForm] = useState({
    scope: 'company',
    companyId: companies[0]?.id ?? '',
    branchId: '',
    userId: '',
    featureKey: 'analytics' as FeatureKey,
    enabled: true,
    reason: '',
  });

  const upsertFlag = () => {
    const nextFlag: FeatureFlagOverride = {
      id: `flag-${Date.now()}`,
      ...(form.scope !== 'global' && { companyId: form.companyId }),
      ...(form.scope === 'branch' && form.branchId ? { branchId: form.branchId } : {}),
      ...(form.scope === 'user' && form.userId ? { userId: form.userId } : {}),
      featureKey: form.featureKey,
      enabled: form.enabled,
      reason: form.reason.trim() || 'Controle manual do Superadmin.',
    };

    setOverrides((current) => [
      nextFlag,
      ...current.filter(
        (item) =>
          !(
            item.companyId === nextFlag.companyId &&
            item.branchId === nextFlag.branchId &&
            item.featureKey === nextFlag.featureKey
          )
      ),
    ]);
    recordAudit(currentUser?.id ?? 'system', 'Alterou feature flag', `${nextFlag.companyId}:${nextFlag.featureKey}`);
  };

  return (
    <><PageHeader title="Feature flags" />
      <FxQueryBoundary isLoading={isLoading} isError={error !== null} error={error}>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Controle manual</h2>
          <div className="mt-4 space-y-3">
            <select
              value={form.scope}
              onChange={(event) => { setForm({ ...form, scope: event.target.value }); }}
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            >
              <option value="global">Global</option>
              <option value="company">Empresa</option>
              <option value="branch">Filial</option>
              <option value="user">Usuario</option>
            </select>
             <select
               value={form.companyId}
               onChange={(event) => { setForm({ ...form, companyId: event.target.value, branchId: '' }); }}
               className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
               disabled={form.scope === 'global'}
             >
               {companies.map((company) => (
                 <option key={company.id} value={company.id}>{company.name}</option>
               ))}
             </select>
             <select
               value={form.branchId}
               onChange={(event) => { setForm({ ...form, branchId: event.target.value }); }}
               className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
               disabled={form.scope !== 'branch'}
             >
               <option value="">Todas as filiais da empresa</option>
               {branches
                 .filter((branch) => branch.companyId === form.companyId)
                 .map((branch) => (
                   <option key={branch.id} value={branch.id}>{branch.name}</option>
                 ))}
             </select>
            <select
              value={form.userId}
              onChange={(event) => { setForm({ ...form, userId: event.target.value }); }}
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              disabled={form.scope !== 'user'}
            >
              <option value="">Selecione um usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <select
              value={form.featureKey}
              onChange={(event) => { setForm({ ...form, featureKey: event.target.value as FeatureKey }); }}
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            >
              {featureOptions.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <label className="flex items-center justify-between rounded-lg border border-border-default bg-surface-background p-3">
              <span className="text-sm font-medium text-text-primary">Feature habilitada</span>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => { setForm({ ...form, enabled: event.target.checked }); }}
              />
            </label>
            <input
              value={form.reason}
              onChange={(event) => { setForm({ ...form, reason: event.target.value }); }}
              placeholder="Motivo"
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
            <Button fullWidth onClick={upsertFlag}>Salvar feature flag</Button>
          </div>
        </div>

         <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
           <h2 className="font-semibold text-text-primary">Matriz de acesso</h2>
           <div className="mt-4 space-y-4">
             {companies.map((company) => (
               <article key={company.id} className="rounded-lg bg-surface-background p-3">
                <h3 className="font-semibold text-text-primary">{company.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featureOptions.map(([featureKey, label]) => {
                    const access = resolveFeatureAccess({
                      companyId: company.id,
                      featureKey,
                      plans,
                      addons,
                      subscriptions,
                      overrides,
                    });
                    return (
                      <span
                        key={featureKey}
                        title={access.reason}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          access.enabled ? 'bg-feedback-success/10 text-feedback-success' : 'bg-feedback-error/10 text-feedback-error'
                        }`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      </FxQueryBoundary>
    </>
  );

}

