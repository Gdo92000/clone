import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export const MOCK_LOGIN_USERS = {
  customer: { email: 'ana@email.com', name: 'Ana Cliente' },
  customerAlt: { email: 'carlos@cliente.com', name: 'Carlos Cliente' },
  merchant: { email: 'joao@burgerhouse.com', name: 'João Restaurante' },
  admin: { email: 'admin@cidade.com', name: 'Admin Municipal' },
  superadmin: { email: 'admin@admin.com', name: 'Admin Master' },
} as const;

export const ADDRESS_SAMPLE = {
  street: 'Rua das Flores',
  number: '123',
  neighborhood: 'Centro',
  city: 'Franca',
  state: 'SP',
  zipCode: '14400-100',
};

export async function loginViaForm(
  page: Page,
  email: string,
  password = 'qualquer-senha',
): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
}

const DEV_USERS: Record<string, { id: string; name: string; email: string; role: string; companyId?: string; branchId?: string; avatarUrl: string; active: boolean }> = {
  'dev-superadmin': { id: 'dev-superadmin', name: 'Admin Master', email: 'admin@fluxds.dev', role: 'superadmin', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AM&backgroundColor=6C5CE7', active: true },
  'dev-admin': { id: 'dev-admin', name: 'Carlos Gestor', email: 'admin@fluxds.dev', role: 'admin', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=CG&backgroundColor=0984E3', active: true },
  'dev-owner-1': { id: 'dev-owner-1', name: 'Maria Silva', email: 'maria@restaurante1.dev', role: 'company_owner', companyId: 'company-1', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=MS&backgroundColor=00B894', active: true },
  'dev-courier': { id: 'dev-courier', name: 'Lucas Entregador', email: 'lucas@entregador.dev', role: 'courier', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=LE&backgroundColor=E17055', active: true },
};

export async function loginAsDevUser(page: Page, userId: string): Promise<void> {
  const user = DEV_USERS[userId];
  if (!user) throw new Error(`Unknown dev user: ${userId}`);
  const userJson = JSON.stringify(user);
  await page.addInitScript((args: { id: string; userJson: string }) => {
    localStorage.setItem('fluxds-dev-active-user', args.id);
    localStorage.setItem('fluxds-auth-user', args.userJson);
  }, { id: userId, userJson });
}

export async function addFirstItemFromFirstRestaurant(
  page: Page,
  options: { fromHome?: boolean } = {},
): Promise<void> {
  if (options.fromHome) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const firstRestaurant = page
      .locator('article[role="button"], article[class*="cursor-pointer"]')
      .first();
    await firstRestaurant.click();
  } else {
    await page.goto('/restaurants');
    await page.waitForLoadState('networkidle');
    const firstRestaurant = page
      .locator('article[role="button"], article[class*="cursor-pointer"]')
      .first();
    await firstRestaurant.click();
  }
  await page.waitForLoadState('networkidle');

  const addButton = page
    .locator('button[aria-label*="Adicionar"], button:has-text("+")')
    .first();
  await addButton.click({ timeout: 5000 }).catch(() => {
    throw new Error('Botão "Adicionar" não encontrado no detalhe do restaurante');
  });
  await page.waitForTimeout(500);
}

export async function fillGuestCheckoutForm(
  page: Page,
  guest = { name: 'João Teste', email: 'joao.teste@email.com', phone: '16999998888' },
): Promise<void> {
  await page.locator('input[name="name"], input[autocomplete="name"]').first().fill(guest.name);
  await page.locator('input[name="email"], input[type="email"]').first().fill(guest.email);
  await page.locator('input[name="phone"], input[type="tel"]').first().fill(guest.phone);
}

export async function fillAddressForm(page: Page, address = ADDRESS_SAMPLE): Promise<void> {
  const zipInput = page.locator('input[name="zipCode"], input[placeholder*="CEP"], input[placeholder*="00000"]').first();
  await zipInput.fill(address.zipCode).catch(() => {
    // se o campo CEP não aparecer, pular
  });

  const streetInput = page.locator('input[name="street"], input[placeholder*="Rua"], input[placeholder*="rua"]').first();
  await streetInput.fill(address.street).catch(() => {
    throw new Error('Campo de rua não encontrado');
  });

  const numberInput = page.locator('input[name="number"], input[placeholder*="Número"], input[placeholder*="Nº"]').first();
  await numberInput.fill(address.number);

  const neighborhoodInput = page
    .locator('input[name="neighborhood"], input[placeholder*="Bairro"], input[placeholder*="bairro"]')
    .first();
  await neighborhoodInput.fill(address.neighborhood);
}

export async function selectPaymentMethod(
  page: Page,
  method: 'pix' | 'credit' | 'debit' | 'money' | 'voucher',
): Promise<void> {
  const button = page.locator(`button[aria-pressed]:has-text("${methodLabel(method)}")`).first();
  await button.click();
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    pix: 'PIX',
    credit: 'Cartão de Crédito',
    debit: 'Cartão de Débito',
    money: 'Dinheiro',
    voucher: 'Vale',
  };
  return labels[method] ?? method;
}

export async function waitForToast(
  page: Page,
  text: string | RegExp,
  options: { timeout?: number } = {},
): Promise<Locator> {
  const toast = page.locator('[role="alert"], [data-toast], .toast').filter({ hasText: text });
  await expect(toast).toBeVisible({ timeout: options.timeout ?? 5000 });
  return toast;
}
