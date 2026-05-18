import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { FxImage } from '../../../components/ui/FxImage';
import { roleLabels, useAuthSession } from '../../auth';
import type { AuthUser, UserRole } from '../../auth';
import { useBranches, useCompanies } from '../../../hooks/useMerchantData';
import { usePlanLimits } from '../../enterprise';
import { useAuditLog } from '../../enterprise';
import { PageHeader } from '../../../components/ui/PageHeader';

const roles = Object.keys(roleLabels) as UserRole[];

export function UsersPage() {
  const { data: companies = [] } = useCompanies();
  const { data: branches = [] } = useBranches();
  const { currentUser, setUsers, users } = useAuthSession();
  const { recordAudit } = useAuditLog();
  const limits = usePlanLimits('company-1');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'attendant' as UserRole,
    companyId: companies[0]?.id ?? 'company-1',
    branchId: '',
  });

  const inviteUser = () => {
    if (!form.name.trim() || !form.email.trim() || !limits.canInviteUser) {
      return;
    }

    const nextUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      ...(form.companyId ? { companyId: form.companyId } : {}),
      ...(form.branchId ? { branchId: form.branchId } : {}),
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop',
      active: true,
    };

    setUsers((current) => [nextUser, ...current]);
    recordAudit(currentUser?.id ?? 'system', 'Convidou usuario', nextUser.email);
    setForm({ name: '', email: '', role: 'attendant', companyId: 'company-1', branchId: '' });
  };

  const toggleUser = (userId: string) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, active: !user.active } : user))
    );
    recordAudit(currentUser?.id ?? 'system', 'Alterou acesso de usuario', userId);
  };

  const updateRole = (userId: string, role: UserRole) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role } : user))
    );
    recordAudit(currentUser?.id ?? 'system', 'Alterou papel de usuario', userId);
  };

  return (
    <><PageHeader title="Usuarios e RBAC" />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Convidar usuario</h2>
          {!limits.canInviteUser && (
            <p className="mt-2 rounded-lg bg-feedback-error/10 p-3 text-sm text-feedback-error">
              Limite de usuarios atingido. Faça upgrade para convidar mais pessoas.
            </p>
          )}
          <div className="mt-4 space-y-3">
            <input value={form.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); }} placeholder="Nome" className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm" />
            <input value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); }} placeholder="Email" className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm" />
            <select value={form.role} onChange={(event) => { setForm({ ...form, role: event.target.value as UserRole }); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
              {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </select>
             <select value={form.companyId} onChange={(event) => { setForm({ ...form, companyId: event.target.value }); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
               {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
             </select>
             <select value={form.branchId} onChange={(event) => { setForm({ ...form, branchId: event.target.value }); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
               <option value="">Sem filial fixa</option>
               {branches.filter((branch) => branch.companyId === form.companyId).map((branch) => (
                 <option key={branch.id} value={branch.id}>{branch.name}</option>
               ))}
             </select>
            <Button fullWidth onClick={inviteUser}>Enviar convite mockado</Button>
          </div>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <article key={user.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <FxImage src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={user.role} onChange={(event) => { updateRole(user.id, event.target.value as UserRole); }} className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm">
                    {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                  </select>
                  <Button size="sm" variant="outline" intent={user.active ? 'danger' : 'success'} onClick={() => { toggleUser(user.id); }}>
                    {user.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );

}

