import { test, expect } from '@playwright/test';
import { loginAsDevUser } from '../helpers/commerce-helpers';

test.describe('Smoke: SuperAdmin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevUser(page, 'dev-superadmin');
  });

  test('dashboard carrega com stats globais', async ({ page }) => {
    await page.goto('/superadmin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Acesso bloqueado');
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-01-dashboard.png', fullPage: true });
  });

  test('navega para /superadmin/plans', async ({ page }) => {
    await page.goto('/superadmin/plans');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/superadmin\/plans/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-02-plans.png', fullPage: true });
  });

  test('navega para /superadmin/users', async ({ page }) => {
    await page.goto('/superadmin/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/superadmin\/users/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-03-users.png', fullPage: true });
  });

  test('navega para /superadmin/coupons', async ({ page }) => {
    await page.goto('/superadmin/coupons');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/superadmin\/coupons/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-04-coupons.png', fullPage: true });
  });

  test('navega para /superadmin/categories', async ({ page }) => {
    await page.goto('/superadmin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/superadmin\/categories/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-05-categories.png', fullPage: true });
  });

  test('navega para /superadmin/feature-flags', async ({ page }) => {
    await page.goto('/superadmin/feature-flags');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/superadmin\/feature-flags/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-06-flags.png', fullPage: true });
  });

  test('navega para /superadmin/subscriptions', async ({ page }) => {
    await page.goto('/superadmin/subscriptions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/superadmin\/subscriptions/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-07-subs.png', fullPage: true });
  });

  test('navega para /superadmin/reports', async ({ page }) => {
    await page.goto('/superadmin/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/superadmin\/reports/);
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-08-reports.png', fullPage: true });
  });

  test('superadmin tem cross-access para /merchant', async ({ page }) => {
    await page.goto('/merchant');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Acesso bloqueado');
    await page.screenshot({ path: 'tests/screenshots/smoke-superadmin-09-cross-merchant.png', fullPage: true });
  });
});
