import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../auth/LoginForm';
import type { LoginProfileConfig } from '../../auth/LoginForm';
import { ROUTES } from '../../../lib/routes';

const ADMIN_CONFIG: LoginProfileConfig = {
  title: 'Administração',
  subtitle: 'Acesso à gestão de empresas e cobertura',
  emailPlaceholder: 'admin@empresa.com',
  passwordPlaceholder: 'Sua senha',
  emailValidationError: 'Informe seu email.',
  passwordValidationError: 'Informe sua senha.',
  devAllowedRoles: ['admin'],
};

export function AdminLoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      config={ADMIN_CONFIG}
      onSuccess={() => { void navigate(ROUTES.ADMIN); }}
    />
  );
}

export default AdminLoginPage;
