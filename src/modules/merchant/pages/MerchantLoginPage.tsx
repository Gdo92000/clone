import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../auth/LoginForm';
import type { LoginProfileConfig } from '../../auth/LoginForm';
import { ROUTES } from '../../../lib/routes';

const MERCHANT_CONFIG: LoginProfileConfig = {
  title: 'Entrar no portal do lojista',
  subtitle: 'Acesse sua conta para gerenciar pedidos, cardápio e operações.',
  emailPlaceholder: 'lojista@francafood.com',
  passwordPlaceholder: '123456',
  emailValidationError: 'Informe seu email para acessar.',
  passwordValidationError: 'Informe sua senha para acessar.',
  icon: (
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary font-bold text-text-inverse">
      iF
    </span>
  ),
  devAllowedRoles: ['company_owner', 'branch_manager', 'attendant', 'finance'],
};

export function MerchantLoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      config={MERCHANT_CONFIG}
      onSuccess={() => { void navigate(ROUTES.MERCHANT); }}
    />
  );
}
