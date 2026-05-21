import { useState } from 'react';
import { useAllPermissions, useRolePermissions, useAssignPermission, useRevokePermission } from '../../../hooks/useSuperadminData';
import { PageHeader } from '../../../components/ui/PageHeader';
import { clsx } from 'clsx';

export function PermissionManagementPage() {
  const [selectedRole, setSelectedRole] = useState('merchant');

  const roles = ['merchant', 'admin', 'courier', 'superadmin'];

  const { data: allPermissions = [] } = useAllPermissions();
  const { data: rolePermissions = [] } = useRolePermissions(selectedRole);
  const assignMutation = useAssignPermission();
  const revokeMutation = useRevokePermission();

  const isPermissionAssigned = (permId: string) => {
    return (rolePermissions as unknown as Array<{ permission_id: string }>).some((p) => p.permission_id === permId);
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
                onClick={() => { setSelectedRole(role); }}
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
              (allPermissions as unknown as Array<{ id: string; name: string; description?: string; key: string }>).map((perm) => (
                <div key={perm.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-background transition-colors">
                  <div>
                    <p className="font-medium text-text-primary">{perm.name}</p>
                    <p className="text-xs text-text-secondary">{perm.description || 'Sem descrição'}</p>
                    <code className="text-[10px] text-brand-secondary bg-brand-primary/5 px-1 rounded">{perm.key}</code>
                  </div>
                  <button
                    onClick={() => {
                      if (isPermissionAssigned(perm.id)) {
                        revokeMutation.mutate({ role: selectedRole, permissionId: perm.id });
                      } else {
                        assignMutation.mutate({ role: selectedRole, permissionId: perm.id });
                      }
                    }}
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
