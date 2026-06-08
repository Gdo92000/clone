import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import type { LoginProfileConfig } from './LoginForm';
import { ROUTES } from '../../lib/routes';

const CUSTOMER_CONFIG: LoginProfileConfig = {
  title: 'Entrar',
  subtitle: 'Acesse sua conta de consumidor',
  emailPlaceholder: 'seu@email.com',
  passwordPlaceholder: 'Sua senha',
  emailValidationError: 'Informe seu email.',
  passwordValidationError: 'Informe sua senha.',
  devAllowedRoles: ['customer'],
};

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      config={CUSTOMER_CONFIG}
      onSuccess={() => { void navigate(ROUTES.HOME); }}
    />
  );
}
