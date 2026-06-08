import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const MOCK_USERS = {
  consumer: { id: 'dev-customer', name: 'Julia Mendes', role: 'customer' },
  merchant: { id: 'dev-owner-1', name: 'Maria Silva', role: 'company_owner' },
  admin: { id: 'dev-admin', name: 'Carlos Gestor', role: 'admin' },
  superadmin: { id: 'dev-superadmin', name: 'Admin Master', role: 'superadmin' },
} as const;

export const AREAS = {
  consumer: {
    allowed: ['/', '/restaurants', '/cart', '/orders', '/profile'],
    blocked: ['/merchant', '/admin', '/superadmin'],
  },
  merchant: {
    allowed: ['/merchant', '/merchant/orders', '/merchant/catalog'],
    blocked: ['/admin', '/superadmin'],
  },
  admin: {
    allowed: ['/admin'],
    blocked: ['/superadmin'],
  },
  superadmin: {
    allowed: ['/superadmin', '/superadmin/plans', '/superadmin/users', '/merchant', '/admin'],
    blocked: [],
  },
} as const;

export const BLOCKED_TEXT = 'Acesso bloqueado';
export const SESSION_EXPIRED_TEXT = 'Sessão expirada';

export async function loginAs(page: Page, userId: string): Promise<void> {
  await page.addInitScript((id: string) => {
    localStorage.setItem('fluxds-dev-active-user', id);
  }, userId);
}

export async function navigateAndExpectAllowed(
  page: Page,
  url: string,
  screenshotName: string,
): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `tests/screenshots/${screenshotName}.png`, fullPage: true });
  const body = await page.locator('body').textContent();
  expect(body).not.toContain(BLOCKED_TEXT);
  expect(body).not.toContain(SESSION_EXPIRED_TEXT);
}

export async function navigateAndExpectBlocked(
  page: Page,
  url: string,
  screenshotName: string,
): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `tests/screenshots/${screenshotName}.png`, fullPage: true });
  const body = await page.locator('body').textContent();
  expect(body).toContain(BLOCKED_TEXT);
}