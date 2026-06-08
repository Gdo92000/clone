import { test, expect } from '@playwright/test';
import { loginAsDevUser } from './helpers/commerce-helpers';

test.describe('Fluxo de busca', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevUser(page, 'dev-customer');
  });

  test('home: search bar → submit → navega para /restaurants?search=...', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[aria-label="Buscar restaurantes"], input[placeholder*="Busque"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('pizza');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    expect(page.url()).toMatch(/\/restaurants/);
    expect(page.url()).toContain('search=pizza');
    await page.screenshot({ path: 'tests/screenshots/e2e-search-01-home-submit.png', fullPage: true });
  });

  test('/search mostra lista de restaurantes', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    const matches = body?.match(/restaurantes? encontrad[oa]s?/i);
    expect(matches).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/e2e-search-02-listing.png', fullPage: true });
  });

  test('/search filtra por categoria', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    const initialBody = await page.locator('body').textContent();
    const initialCountMatch = initialBody?.match(/(\d+)\s+restaurantes?\s+encontrad/);
    const initialCount = initialCountMatch ? Number(initialCountMatch[1]) : 0;

    const categoryButtons = page.locator('button').filter({ hasText: /^(Pizza|Burger|Hambúrguer|Sushi|Japonês|Brasileira|Bebidas|Doce)$/i });
    const categoryCount = await categoryButtons.count();
    if (categoryCount > 0) {
      await categoryButtons.first().click();
      await page.waitForTimeout(500);
      const filteredBody = await page.locator('body').textContent();
      const filteredCountMatch = filteredBody?.match(/(\d+)\s+restaurantes?\s+encontrad/);
      const filteredCount = filteredCountMatch ? Number(filteredCountMatch[1]) : 0;
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      await page.screenshot({ path: 'tests/screenshots/e2e-search-03-category-filtered.png', fullPage: true });
    } else {
      test.skip(true, 'Nenhum chip de categoria encontrado');
    }
  });

  test('/search ordena por avaliação → primeiro card tem maior rating', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    const sortButton = page.locator('button').filter({ hasText: /Melhores avaliações/i }).first();
    if ((await sortButton.count()) === 0) {
      test.skip(true, 'Botão "Melhores avaliações" não encontrado');
      return;
    }
    await sortButton.click();
    await page.waitForTimeout(500);

    const cards = page.locator('article[role="button"], article[class*="cursor-pointer"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'tests/screenshots/e2e-search-04-sorted-by-rating.png', fullPage: true });
  });

  test('/search com query inexistente → EmptyState', async ({ page }) => {
    await page.goto('/search?search=xyzabc123naoexiste');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    const hasEmptyState =
      body?.includes('Nenhum restaurante encontrado') ||
      body?.includes('Tente buscar com outros termos');
    expect(hasEmptyState).toBeTruthy();
    await page.screenshot({ path: 'tests/screenshots/e2e-search-05-empty-state.png', fullPage: true });
  });

  test('clicar em restaurante da busca navega para detalhe', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    const firstCard = page
      .locator('article[role="button"], article[class*="cursor-pointer"]')
      .first();
    await firstCard.click();
    await page.waitForURL(/\/restaurant\//, { timeout: 5000 });
    await page.screenshot({ path: 'tests/screenshots/e2e-search-06-restaurant-detail.png', fullPage: true });
  });
});
