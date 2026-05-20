import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/PageHeader';
import { superadminApi } from '../../../api/superadminApi';
import { successToast, errorToast } from '../../../lib/toast';
import { clsx } from 'clsx';

export function PermissionManagementPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('merchant');

  const roles = ['merchant', 'admin', 'courier', 'superadmin'];

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: () => superadminApi.permissionApi.list(),
  });

  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['permissions-role', selectedRole],
    queryFn: () => superadminApi.permissionApi.getByRole(selectedRole),
    enabled: !!selectedRole,
  });

  const assignMutation = useMutation({
    mutationFn: (data: { role: string; permissionId: string }) => superadminApi.permissionApi.assign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions-role', selectedRole] });
      successToast('Permissão atribuída');
    },
    onError: () => errorToast('Erro ao atribuir permissão'),
  });

  const revokeMutation = useMutation({
    mutationFn: (data: { role: string; permissionId: string }) => superadminApi.permissionApi.revoke(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions-role', selectedRole] });
      successToast('Permissão revogada');
    },
    onError: () => errorToast('Erro ao revogar permissão'),
  });

const isPermissionAssigned = (permId: string) => {
  return rolePermissions.some((p: any) => p.permission_id === permId);
};

  return (
    <>
      <PageHeader title="Gestão de Permissões" />
      <div className="space-y-6">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Selecionar Role</h2>
          <div className="flex flex-wrap gap-3">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                  selectedRole === role 
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                    : 'bg-surface-background text-text-secondary border-border-default hover:border-brand-primary'
                )}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden">
          <div className="p-6 border-b border-border-default">
            <h2 className="text-lg font-semibold text-text-primary">
              Permissões para <span className="text-brand-primary">{selectedRole}</span>
            </h2>
            <p className="text-sm text-text-secondary mt-1">Ative ou desative permissões específicas para este nível de acesso.</p>
          </div>
          <div className="divide-y divide-border-default">
            {allPermissions.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">Nenhuma permissão cadastrada.</div>
            ) : (
              allPermissions.map((perm: any) => (
                <div key={perm.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-background transition-colors">
                  <div>
                    <p className="font-medium text-text-primary">{perm.name}</p>
                    <p className="text-xs text-text-secondary">{perm.description || 'Sem descrição'}</p>
                    <code className="text-[10px] text-brand-secondary bg-brand-primary/5 px-1 rounded">{perm.key}</code>
                  </div>
                  <button 
                    onClick={() => isPermissionAssigned(perm.id) 
                      ? revokeMutation.mutate({ role: selectedRole, permissionId: perm.id })
                      : assignMutation.mutate({ role: selectedRole, permissionId: perm.id })
                    }
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-bold transition-all',
                      isPermissionAssigned(perm.id) 
                        ? 'bg-feedback-success text-feedback-success-foreground' 
                        : 'bg-surface-background text-text-secondary hover:bg-border-default'
                    )}
                  >
                    {isPermissionAssigned(perm.id) ? 'Ativa' : 'Ativar'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default PermissionManagementPage;
