import { test, expect, type Page } from '@playwright/test';
import { loginAsDevUser } from './helpers/commerce-helpers';

async function addFirstItemToCart(page: Page): Promise<void> {
  await page.goto('/search');
  await page.waitForLoadState('networkidle');
  const firstRestaurant = page
    .locator('article[role="button"], article[class*="cursor-pointer"]')
    .first();
  await expect(firstRestaurant).toBeVisible({ timeout: 10000 });
  await firstRestaurant.click();
  await page.waitForURL(/\/restaurant\//, { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  const addButton = page
    .locator('button[aria-label*="Adicionar"], button:has-text("+")')
    .first();
  await expect(addButton).toBeVisible({ timeout: 5000 });
  await addButton.click();
  await page.waitForTimeout(500);
}

async function switchAddressToManual(page: Page): Promise<void> {
  const manualButton = page.locator('button:has-text("Digitar manualmente")').first();
  if ((await manualButton.count()) > 0) {
    await manualButton.click();
    await page.waitForTimeout(200);
  }
}

async function fillAddressManually(
  page: Page,
  address = { street: 'Rua das Flores', number: '123', neighborhood: 'Centro' },
): Promise<void> {
  await switchAddressToManual(page);
  await page.locator('input[placeholder*="Av. Brasil"], input[placeholder*="Av Brasil"]').first().fill(address.street);
  await page.locator('input[placeholder="123"]').first().fill(address.number);
  await page.locator('input[placeholder="Centro"]').first().fill(address.neighborhood);
}

test.describe('Fluxo de checkout completo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevUser(page, 'dev-customer');
  });

  test('cart vazia mostra EmptyState', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const emptyTitle = page.locator('text=Sua sacola está vazia');
    await expect(emptyTitle).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-01-empty-cart.png', fullPage: true });
  });

  test('add item → cart mostra item → checkout → tracking', async ({ page }) => {
    await addFirstItemToCart(page);
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-02-item-added.png', fullPage: true });

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const cartBody = await page.locator('body').textContent();
    expect(cartBody).not.toContain('Sua sacola está vazia');
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-03-cart-with-item.png', fullPage: true });

    const checkoutButton = page.locator('button:has-text("Finalizar"), button:has-text("Checkout"), button:has-text("Continuar")').first();
    await checkoutButton.click();
    await page.waitForURL(/\/checkout/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-04-checkout-page.png', fullPage: true });

    await fillAddressManually(page);

    const pixButton = page.locator('button[aria-pressed]').filter({ hasText: /PIX/i }).first();
    await pixButton.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-05-form-filled.png', fullPage: true });

    const confirmButton = page.locator('button:has-text("Finalizar pedido"), button:has-text("Confirmar pedido")').last();
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();

    await page.waitForURL(/\/tracking/, { timeout: 5000 });
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-06-tracking.png', fullPage: true });
  });

  test('botão confirmar fica disabled sem método de pagamento', async ({ page }) => {
    await addFirstItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await fillAddressManually(page);

    const confirmButton = page.locator('button:has-text("Finalizar pedido"), button:has-text("Confirmar pedido")').last();
    await expect(confirmButton).toBeDisabled();
  });

  test('selecionar "Dinheiro" revela campo de troco', async ({ page }) => {
    await addFirstItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moneyButton = page.locator('button[aria-pressed]').filter({ hasText: /Dinheiro/i }).first();
    await moneyButton.click();
    await page.waitForTimeout(300);

    const changeField = page.locator('input[placeholder*="R$"], input[placeholder*="troco"], input[placeholder*="Troco"]');
    await expect(changeField.first()).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/e2e-checkout-08-change-field.png', fullPage: true });
  });
});

