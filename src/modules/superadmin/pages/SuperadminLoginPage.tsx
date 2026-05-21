import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../auth/LoginForm';
import type { LoginProfileConfig } from '../../auth/LoginForm';
import { ROUTES } from '../../../lib/routes';

const SUPERADMIN_CONFIG: LoginProfileConfig = {
  title: 'Superadmin',
  subtitle: 'Acesso administrativo da plataforma',
  emailPlaceholder: 'admin@francafood.com',
  passwordPlaceholder: 'Sua senha',
  emailValidationError: 'Informe seu email.',
  passwordValidationError: 'Informe sua senha.',
};

export function SuperadminLoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      config={SUPERADMIN_CONFIG}
      onSuccess={() => { void navigate(ROUTES.SUPERADMIN); }}
    />
  );
}
