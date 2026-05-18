import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { FxImage } from '../../../components/ui/FxImage';
import { roleLabels, useAuthSession } from '../../auth';
import type { AuthUser, UserRole } from '../../auth';
import { useAuditLog, usePlanLimits } from '../../enterprise';
import { useBranches } from '../../../hooks/useMerchantData';
import { MerchantLayout } from '../components/MerchantLayout';

const employeeRoles: UserRole[] = [
  'company_owner',
  'branch_manager',
  'attendant',
  'finance',
  'courier',
];

export function MerchantTeamPage() {
  const { data: branches = [] } = useBranches();
  const { currentUser, setUsers, users } = useAuthSession();
  const { recordAudit } = useAuditLog();
  const limits = usePlanLimits('company-1');
  const companyUsers = users.filter((user) => user.companyId === 'company-1');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'attendant' as UserRole,
    branchId: 'branch-1',
  });

  const inviteEmployee = () => {
    if (!form.name.trim() || !form.email.trim() || companyUsers.length >= limits.limits.users) {
      return;
    }

    const nextUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      companyId: 'company-1',
      branchId: form.branchId,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop',
      active: true,
    };

    setUsers((current) => [nextUser, ...current]);
    recordAudit(currentUser?.id ?? 'system', 'Lojista convidou funcionario', nextUser.email);
    setForm({ name: '', email: '', role: 'attendant', branchId: 'branch-1' });
  };

  const toggleAccess = (userId: string) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, active: !user.active } : user))
    );
    recordAudit(currentUser?.id ?? 'system', 'Lojista alterou acesso de funcionario', userId);
  };

  return (
    <MerchantLayout title="Equipe e permissoes">
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Convidar funcionario</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {companyUsers.length}/{limits.limits.users} usuarios do plano atual.
          </p>
          {companyUsers.length >= limits.limits.users && (
            <p className="mt-3 rounded-lg bg-feedback-error/10 p-3 text-sm text-feedback-error">
              Limite de usuarios atingido. Contrate o addon de equipe ou faca upgrade.
            </p>
          )}
          <div className="mt-4 space-y-3">
            <input value={form.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); }} placeholder="Nome" className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm" />
            <input value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); }} placeholder="Email" className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm" />
            <select value={form.role} onChange={(event) => { setForm({ ...form, role: event.target.value as UserRole }); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
              {employeeRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </select>
             <select value={form.branchId} onChange={(event) => { setForm({ ...form, branchId: event.target.value }); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
               {branches.filter((branch) => branch.companyId === 'company-1').map((branch) => (
                 <option key={branch.id} value={branch.id}>{branch.name}</option>
               ))}
             </select>
            <Button fullWidth onClick={inviteEmployee} disabled={companyUsers.length >= limits.limits.users}>Convidar funcionario</Button>
          </div>
        </div>

        <div className="space-y-3">
          {companyUsers.map((user) => (
            <article key={user.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <FxImage src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{roleLabels[user.role]} - {user.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" intent={user.active ? 'danger' : 'success'} onClick={() => { toggleAccess(user.id); }}>
                  {user.active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MerchantLayout>
  );
}
