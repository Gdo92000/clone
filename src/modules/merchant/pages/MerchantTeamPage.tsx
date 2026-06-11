import { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { FxImage } from '../../../components/ui/FxImage';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { PageHeader } from '../../../components/ui/PageHeader';
import { roleLabels, useAuthSession } from '../../auth';
import { useBranches } from '../../../hooks/useMerchantData';
import { useTeam, useInviteTeamMember, useUpdateTeamMember, useDeactivateTeamMember, useReactivateTeamMember } from '../../../hooks/useMerchantTeam';
import { usePlanLimits } from '../../enterprise';
import type { TeamMemberDTO } from '../../../api/teamApi';

const employeeRoles = ['company_owner', 'branch_manager', 'attendant', 'finance'] as const;

function EditMemberModal({
  member,
  branches,
  onClose,
}: {
  member: TeamMemberDTO;
  branches: Array<{ id: string; name: string }>;
  onClose: () => void;
}) {
  const updateMember = useUpdateTeamMember();
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState(member.sub_role ?? 'attendant');
  const [branchId, setBranchId] = useState(member.branch_id ?? '');

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    updateMember.mutate(
      { id: member.id, data: { name: name.trim(), email: email.trim(), role: role as typeof employeeRoles[number], branch_id: branchId } },
      { onSuccess: () => { onClose(); } },
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-elevated p-6 shadow-xl">
          <h3 className="font-semibold text-text-primary">Editar funcionario</h3>
          <div className="mt-4 space-y-3">
            <input value={name} onChange={(e) => { setName(e.target.value); }} placeholder="Nome" className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm" />
            <input value={email} onChange={(e) => { setEmail(e.target.value); }} placeholder="Email" className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm" />
            <select value={role} onChange={(e) => { setRole(e.target.value); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
              {employeeRoles.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
            <select value={branchId} onChange={(e) => { setBranchId(e.target.value); }} className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm">
              <option value="">Selecione uma filial</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <Button fullWidth variant="outline" onClick={onClose}>Cancelar</Button>
            <Button fullWidth onClick={handleSave} loading={updateMember.isPending}>Salvar</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function MerchantTeamPage() {
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: members = [], isLoading: membersLoading, isError: membersError } = useTeam();
  const { currentUser } = useAuthSession();
  const inviteMutation = useInviteTeamMember();
  const deactivateMutation = useDeactivateTeamMember();
  const reactivateMutation = useReactivateTeamMember();
  const companyId = currentUser?.companyId ?? '';
  const limits = usePlanLimits(companyId);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'attendant' as typeof employeeRoles[number],
    branchId: '',
  });

  const [editingMember, setEditingMember] = useState<TeamMemberDTO | null>(null);

  const firstBranchId = useMemo(() => branches[0]?.id ?? '', [branches]);

  const effectiveBranchId = form.branchId || firstBranchId;

  const companyMembers = useMemo(
    () => members.filter((m) => m.company_id === companyId),
    [members, companyId],
  );

  const activeMembers = useMemo(() => companyMembers.filter((m) => m.is_active), [companyMembers]);
  const activeCount = activeMembers.length;

  const inviteEmployee = () => {
    if (!form.name.trim() || !form.email.trim() || !effectiveBranchId) return;
    if (activeCount >= limits.limits.users) return;

    inviteMutation.mutate(
      { name: form.name.trim(), email: form.email.trim(), role: form.role, branch_id: effectiveBranchId },
      {
        onSuccess: () => {
          setForm({ name: '', email: '', role: 'attendant', branchId: '' });
        },
      },
    );
  };

  const handleDeactivate = (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este funcionario?')) {
      deactivateMutation.mutate(id);
    }
  };

  return (
    <>
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          branches={branches}
          onClose={() => { setEditingMember(null); }}
        />
      )}
      <PageHeader title="Equipe e permissoes" />
      <FxQueryBoundary isLoading={membersLoading || branchesLoading} isError={membersError}>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h2 className="font-semibold text-text-primary">Convidar funcionario</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {activeCount}/{limits.limits.users} usuarios do plano atual.
            </p>
            {activeCount >= limits.limits.users && (
              <p className="mt-3 rounded-lg bg-feedback-error/10 p-3 text-sm text-feedback-error">
                Limite de usuarios atingido. Contrate o addon de equipe ou faca upgrade.
              </p>
            )}
            <div className="mt-4 space-y-3">
              <input
                value={form.name}
                onChange={(event) => { setForm({ ...form, name: event.target.value }); }}
                placeholder="Nome"
                className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
              <input
                value={form.email}
                onChange={(event) => { setForm({ ...form, email: event.target.value }); }}
                placeholder="Email"
                className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
              <select
                value={form.role}
                onChange={(event) => { setForm({ ...form, role: event.target.value as typeof employeeRoles[number] }); }}
                className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              >
                {employeeRoles.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
              </select>
              <select
                value={effectiveBranchId}
                onChange={(event) => { setForm({ ...form, branchId: event.target.value }); }}
                className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              >
                <option value="">Selecione uma filial</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              <Button
                fullWidth
                onClick={inviteEmployee}
                loading={inviteMutation.isPending}
                disabled={activeCount >= limits.limits.users || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? 'Convidando...' : 'Convidar funcionario'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {companyMembers.map((member) => {
              const branchName = branches.find((b) => b.id === member.branch_id)?.name ?? '—';
              return (
                <article key={member.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <FxImage
                        src={member.avatar_url || `https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop`}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-text-primary">{member.name}</p>
                        <p className="text-sm text-text-secondary">
                          {member.sub_role && roleLabels[member.sub_role as keyof typeof roleLabels]
                            ? roleLabels[member.sub_role as keyof typeof roleLabels]
                            : member.role} - {member.email}
                        </p>
                        <p className="text-xs text-text-tertiary">{branchName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${member.is_active ? 'bg-feedback-success' : 'bg-feedback-error'}`} />
                      <span className="text-xs text-text-secondary">{member.is_active ? 'Ativo' : 'Inativo'}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        intent="secondary"
                        onClick={() => { setEditingMember(member); }}
                      >
                        Editar
                      </Button>
                      {member.is_active ? (
                        <Button
                          size="sm"
                          variant="outline"
                          intent="danger"
                          onClick={() => { handleDeactivate(member.id); }}
                          loading={deactivateMutation.isPending}
                        >
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          intent="success"
                          onClick={() => { reactivateMutation.mutate(member.id); }}
                          loading={reactivateMutation.isPending}
                        >
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </FxQueryBoundary>
    </>
  );
}
