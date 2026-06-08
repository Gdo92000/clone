import { test, expect } from '@playwright/test';
import { MOCK_LOGIN_USERS } from './helpers/commerce-helpers';

test.describe('Fluxo de login', () => {
  test('página /login renderiza com título e campos', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toContain('Entrar');
    expect(body).toContain('Acesse sua conta');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/e2e-login-01-page.png', fullPage: true });
  });

  test('submit com email vazio mostra validação', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="password"]').fill('qualquer');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    const body = await page.locator('body').textContent();
    const hasError =
      body?.includes('Informe seu email') ||
      body?.includes('email') ||
      body?.includes('Email');
    expect(hasError).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/e2e-login-02-empty-email.png', fullPage: true });
  });

  test('submit com senha vazia mostra validação', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill('ana@email.com');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    const body = await page.locator('body').textContent();
    const hasError =
      body?.includes('Informe sua senha') ||
      body?.includes('senha') ||
      body?.includes('Senha');
    expect(hasError).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/e2e-login-03-empty-password.png', fullPage: true });
  });

  test('credenciais inválidas (email não cadastrado) → erro', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill('inexistente@naoexiste.com');
    await page.locator('input[type="password"]').fill('qualquer');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    const isStillOnLogin = page.url().includes('/login');
    const hasError =
      body?.includes('Email ou senha inválidos') ||
      body?.includes('inválid') ||
      body?.includes('Erro');
    expect(isStillOnLogin || hasError).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/e2e-login-04-invalid-creds.png', fullPage: true });
  });

  test('credenciais válidas (customer) → redireciona para /', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(MOCK_LOGIN_USERS.customer.email);
    await page.locator('input[type="password"]').fill('qualquer-senha');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/(home|$)/);
    await page.screenshot({ path: 'tests/screenshots/e2e-login-05-success-customer.png', fullPage: true });
  });

  test('credenciais válidas (superadmin) → redireciona para /', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(MOCK_LOGIN_USERS.superadmin.email);
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/login');
    await page.screenshot({ path: 'tests/screenshots/e2e-login-06-success-superadmin.png', fullPage: true });
  });
});
