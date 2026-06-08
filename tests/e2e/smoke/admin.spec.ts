import { test, expect } from '@playwright/test';
import { loginAsDevUser } from '../helpers/commerce-helpers';

test.describe('Smoke: Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevUser(page, 'dev-admin');
  });

  test('dashboard carrega', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Painel geral' })).toBeVisible({ timeout: 10000 });
    const body = await page.locator('main').textContent();
    expect(body).not.toContain('Sessão expirada');
    await page.screenshot({ path: 'tests/screenshots/smoke-admin-01-dashboard.png', fullPage: true });
  });

  test('navega para /admin/companies', async ({ page }) => {
    await page.goto('/admin/companies');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/admin\/companies/);
    await page.screenshot({ path: 'tests/screenshots/smoke-admin-02-companies.png', fullPage: true });
  });

  test('navega para /admin/coverage', async ({ page }) => {
    await page.goto('/admin/coverage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/admin\/coverage/);
    await page.screenshot({ path: 'tests/screenshots/smoke-admin-03-coverage.png', fullPage: true });
  });

  test('admin não tem acesso a /superadmin', async ({ page }) => {
    await page.goto('/superadmin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Acesso bloqueado' })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/smoke-admin-04-blocked-superadmin.png', fullPage: true });
  });
});
