import { test, expect } from '@playwright/test';
import { loginAsDevUser } from '../helpers/commerce-helpers';

test.describe('Smoke: Merchant dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevUser(page, 'dev-owner-1');
  });

  test('dashboard carrega com cards de stats', async ({ page }) => {
    await page.goto('/merchant');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Acesso bloqueado');
    expect(body).not.toContain('Sessão expirada');
    await page.screenshot({ path: 'tests/screenshots/smoke-merchant-01-dashboard.png', fullPage: true });
  });

  test('navega para /merchant/orders sem redirecionar', async ({ page }) => {
    await page.goto('/merchant/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/merchant\/orders/);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Acesso bloqueado');
    await page.screenshot({ path: 'tests/screenshots/smoke-merchant-02-orders.png', fullPage: true });
  });

  test('navega para /merchant/catalog', async ({ page }) => {
    await page.goto('/merchant/catalog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/merchant\/catalog/);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Acesso bloqueado');
    await page.screenshot({ path: 'tests/screenshots/smoke-merchant-03-catalog.png', fullPage: true });
  });

  test('navega para /merchant/analytics', async ({ page }) => {
    await page.goto('/merchant/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/merchant\/analytics/);
    await page.screenshot({ path: 'tests/screenshots/smoke-merchant-04-analytics.png', fullPage: true });
  });

  test('navega para /merchant/finance', async ({ page }) => {
    await page.goto('/merchant/finance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/merchant\/finance/);
    await page.screenshot({ path: 'tests/screenshots/smoke-merchant-05-finance.png', fullPage: true });
  });

  test('navega para /merchant/coupons', async ({ page }) => {
    await page.goto('/merchant/coupons');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/merchant\/coupons/);
    await page.screenshot({ path: 'tests/screenshots/smoke-merchant-06-coupons.png', fullPage: true });
  });
});
