import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../auth/LoginForm';
import type { LoginProfileConfig } from '../../auth/LoginForm';
import { ROUTES } from '../../../lib/routes';

const COURIER_CONFIG: LoginProfileConfig = {
  title: 'Entregador',
  subtitle: 'Acesse suas entregas disponíveis',
  emailPlaceholder: 'entregador@email.com',
  passwordPlaceholder: 'Sua senha',
  emailValidationError: 'Informe seu email.',
  passwordValidationError: 'Informe sua senha.',
  devAllowedRoles: ['courier'],
};

export function CourierLoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      config={COURIER_CONFIG}
      onSuccess={() => { void navigate(ROUTES.COURIER); }}
    />
  );
}

export default CourierLoginPage;
