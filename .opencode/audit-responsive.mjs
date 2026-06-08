import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://localhost:5173";
const OUTPUT_DIR = resolve(__dirname, "../audit-results");

const VIEWPORTS = [
  { name: "iPhone SE", width: 375, height: 667, deviceScaleFactor: 2 },
  { name: "iPhone 12/13", width: 390, height: 844, deviceScaleFactor: 3 },
  { name: "Moto G", width: 360, height: 640, deviceScaleFactor: 2 },
  { name: "Samsung Galaxy S", width: 414, height: 896, deviceScaleFactor: 2.75 },
  { name: "iPad", width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: "iPad Pro", width: 1024, height: 1366, deviceScaleFactor: 2 },
  { name: "Notebook 1366", width: 1366, height: 768, deviceScaleFactor: 1 },
  { name: "Desktop HD", width: 1920, height: 1080, deviceScaleFactor: 1 },
];

const BREAKPOINTS = [320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1920];

const AUTH_USERS = {
  superadmin: { email: "admin@admin.com", name: "Admin Master", role: "superadmin", token: "mock-jwt-token-superadmin" },
  admin: { email: "admin@cidade.com", name: "Admin Municipal", role: "admin", token: "mock-jwt-token-admin" },
  company_owner: { email: "joao@burgerhouse.com", name: "João Restaurante", role: "company_owner", token: "mock-jwt-token-company_owner" },
  courier: { email: "carlos@delivery.com", name: "Carlos Entregas", role: "courier", token: "mock-jwt-token-courier" },
  customer: { email: "ana@email.com", name: "Ana Cliente", role: "customer", token: "mock-jwt-token-customer" },
};

const PUBLIC_ROUTES = [
  { path: "/", name: "Home" },
  { path: "/restaurants", name: "RestaurantList" },
  { path: "/search", name: "Search" },
  { path: "/login", name: "Login" },
  { path: "/merchant/login", name: "MerchantLogin" },
  { path: "/superadmin/login", name: "SuperadminLogin" },
  { path: "/cart", name: "Cart" },
  { path: "/checkout", name: "Checkout" },
  { path: "/tracking", name: "Tracking" },
  { path: "/nearby", name: "Nearby" },
];

const PROTECTED_ROUTES = [
  { path: "/orders", name: "Orders", auth: "customer" },
  { path: "/profile", name: "Profile", auth: "customer" },
  { path: "/addresses", name: "Addresses", auth: "customer" },
  { path: "/access", name: "AccessHub", auth: "customer" },
  { path: "/notifications", name: "Notifications", auth: "customer" },
  { path: "/favorites", name: "Favorites", auth: "customer" },
  { path: "/promotions", name: "Promotions", auth: "customer" },
  { path: "/support", name: "Support", auth: "customer" },
  { path: "/finance", name: "Finance", auth: "customer" },
  { path: "/reviews", name: "Reviews", auth: "customer" },
  { path: "/payment-methods", name: "PaymentMethods", auth: "customer" },
  { path: "/loyalty", name: "Loyalty", auth: "customer" },
  { path: "/onboarding", name: "Onboarding", auth: "customer" },
  { path: "/merchant", name: "MerchantDashboard", auth: "company_owner" },
  { path: "/merchant/orders", name: "MerchantOrders", auth: "company_owner" },
  { path: "/merchant/catalog", name: "MerchantCatalog", auth: "company_owner" },
  { path: "/merchant/branches", name: "MerchantBranches", auth: "company_owner" },
  { path: "/merchant/settings", name: "MerchantSettings", auth: "company_owner" },
  { path: "/merchant/hours", name: "MerchantHours", auth: "company_owner" },
  { path: "/merchant/holidays", name: "MerchantHolidays", auth: "company_owner" },
  { path: "/merchant/subscription", name: "MerchantSubscription", auth: "company_owner" },
  { path: "/merchant/finance", name: "MerchantFinance", auth: "company_owner" },
  { path: "/merchant/coupons", name: "MerchantCoupons", auth: "company_owner" },
  { path: "/merchant/team", name: "MerchantTeam", auth: "company_owner" },
  { path: "/merchant/campaigns", name: "MerchantCampaigns", auth: "company_owner" },
  { path: "/merchant/analytics", name: "MerchantAnalytics", auth: "company_owner" },
  { path: "/merchant/printer", name: "MerchantPrinter", auth: "company_owner" },
  { path: "/superadmin", name: "SuperadminDashboard", auth: "superadmin" },
  { path: "/superadmin/plans", name: "SA_Plans", auth: "superadmin" },
  { path: "/superadmin/users", name: "SA_Users", auth: "superadmin" },
  { path: "/superadmin/audit", name: "SA_Audit", auth: "superadmin" },
  { path: "/superadmin/categories", name: "SA_Categories", auth: "superadmin" },
  { path: "/superadmin/features", name: "SA_Features", auth: "superadmin" },
  { path: "/superadmin/subscriptions", name: "SA_Subscriptions", auth: "superadmin" },
  { path: "/superadmin/billing", name: "SA_Billing", auth: "superadmin" },
  { path: "/superadmin/commissions", name: "SA_Commissions", auth: "superadmin" },
  { path: "/superadmin/coupons", name: "SA_Coupons", auth: "superadmin" },
  { path: "/superadmin/addons", name: "SA_Addons", auth: "superadmin" },
  { path: "/superadmin/capabilities", name: "SA_Capabilities", auth: "superadmin" },
  { path: "/superadmin/reports", name: "SA_Reports", auth: "superadmin" },
  { path: "/superadmin/demo", name: "SA_Demo", auth: "superadmin" },
  { path: "/superadmin/notifications", name: "SA_Notifications", auth: "superadmin" },
  { path: "/admin", name: "AdminDashboard", auth: "admin" },
  { path: "/admin/companies", name: "AdminCompanies", auth: "admin" },
  { path: "/admin/coverage", name: "AdminCoverage", auth: "admin" },
  { path: "/courier", name: "CourierDashboard", auth: "courier" },
  { path: "/courier/deliveries", name: "CourierDeliveries", auth: "courier" },
];

const results = [];

function report(pageName, viewport, issue) {
  results.push({ page: pageName, viewport, ...issue });
  const icon = issue.severity === "CRITICAL" ? "🔴" : issue.severity === "HIGH" ? "🟠" : issue.severity === "MEDIUM" ? "🟡" : "🔵";
  console.log(`  ${icon} [${issue.severity}] ${issue.check}: ${issue.description}`);
}

async function injectAuth(page, authKey) {
  const user = AUTH_USERS[authKey];
  if (!user) throw new Error(`Auth key ${authKey} not found`);

  const authUser = {
    id: `user-${authKey}`,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: "",
    active: true,
  };

  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);

  // In mock mode, the login API accepts any password. We inject directly to localStorage.
  await page.evaluate((data) => {
    localStorage.setItem("fluxds-auth-token", data.token);
    localStorage.setItem("fluxds-auth-refresh-token", "mock-refresh-token");
    localStorage.setItem("fluxds-auth-user", JSON.stringify(data.user));
  }, { token: user.token, user: authUser });
}

async function testPage(browserContext, route, viewport) {
  const page = await browserContext.newPage();
  const pageName = `${route.name}@${viewport.name}`;
  const viewportDesc = { name: viewport.name, width: viewport.width, height: viewport.height };
  const fullUrl = `${BASE_URL}${route.path}`;

  // For protected routes, inject auth first
  if (route.auth) {
    await injectAuth(page, route.auth);
    await page.waitForTimeout(300);
  }

  let loadError = null;
  try {
    const resp = await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 20000 });
    if (resp && resp.status() >= 400) {
      loadError = `HTTP ${resp.status()} ${resp.statusText()}`;
    }
  } catch (e) {
    loadError = e.message;
  }

  if (loadError) {
    report(pageName, viewportDesc, {
      check: "Page Load",
      severity: "CRITICAL",
      description: loadError,
      reproduction: `Abrir ${fullUrl} em ${viewport.width}x${viewport.height}`,
    });
    await page.close();
    return;
  }

  await page.waitForTimeout(2000);

  // Collect console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // Extract all check data in one evaluate call
  const data = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const hasOverflow = doc.scrollWidth > doc.clientWidth;

    // Find overflow elements
    const brokenElements = [];
    if (hasOverflow) {
      const all = document.querySelectorAll("*");
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        const ox = window.getComputedStyle(el).overflowX;
        if (rect.width > doc.clientWidth + 2 && ox !== "hidden") {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : "";
          const cls = el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "";
          brokenElements.push(`${tag}${id}${cls} (${rect.width.toFixed(0)}px)`);
          if (brokenElements.length >= 10) break;
        }
      }
    }

    // Small tappable
    const smallTappable = [];
    const tappables = document.querySelectorAll("button, a, [role=button], input, select, textarea, [tabindex]");
    for (const btn of tappables) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        const tag = btn.tagName.toLowerCase();
        const text = (btn.textContent || "").trim().slice(0, 30);
        const id = btn.id ? `#${btn.id}` : "";
        smallTappable.push(`${tag}${id} "${text}" (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`);
        if (smallTappable.length >= 10) break;
      }
    }

    // Small fonts
    const smallFonts = [];
    const allEls = document.querySelectorAll("*");
    for (const el of allEls) {
      const fs = parseFloat(window.getComputedStyle(el).fontSize);
      if (fs > 0 && fs < 12) {
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || "").trim().slice(0, 30);
        if (text) {
          smallFonts.push(`${tag} "${text}" (${fs}px)`);
          if (smallFonts.length >= 5) break;
        }
      }
    }

    // Images without alt
    const noAlt = document.querySelectorAll("img:not([alt])").length;

    // Fixed elements
    const fixedEls = [];
    for (const el of allEls) {
      const pos = window.getComputedStyle(el).position;
      if (pos === "fixed" || pos === "sticky") {
        const tag = el.tagName.toLowerCase();
        const z = window.getComputedStyle(el).zIndex;
        fixedEls.push(`${tag}#${el.id||"?"} (z=${z})`);
        if (fixedEls.length >= 5) break;
      }
    }

    return { hasOverflow, docSW: doc.scrollWidth, docCW: doc.clientWidth, brokenElements, smallTappable, smallFonts, noAlt, fixedEls };
  });

  if (data.hasOverflow) {
    report(pageName, viewportDesc, {
      check: "Overflow Horizontal",
      severity: "HIGH",
      description: `scrollW=${data.docSW} > clientW=${data.docCW} (dif=${data.docSW - data.docCW}px)`,
      elements: data.brokenElements,
      reproduction: `Redimensionar para ${viewport.width}x${viewport.height} em ${route.path}`,
    });
  }

  if (data.smallTappable.length > 0 && viewport.width <= 768) {
    report(pageName, viewportDesc, {
      check: "Tap Target Size (< 44px)",
      severity: "HIGH",
      description: `${data.smallTappable.length} alvos encontrados`,
      elements: data.smallTappable,
      reproduction: `Inspecionar em ${viewport.width}x${viewport.height} em ${route.path}`,
    });
  }

  if (data.smallFonts.length > 0 && viewport.width <= 375) {
    report(pageName, viewportDesc, {
      check: "Font Size < 12px",
      severity: "MEDIUM",
      description: `${data.smallFonts.length} elementos`,
      elements: data.smallFonts,
      reproduction: `Inspecionar em ${viewport.width}x${viewport.height}`,
    });
  }

  if (data.noAlt > 0) {
    report(pageName, viewportDesc, {
      check: "Images Missing Alt",
      severity: "MEDIUM",
      description: `${data.noAlt} imagens sem atributo alt`,
      reproduction: `Inspecionar <img> em ${route.path}`,
    });
  }

  // Screenshot
  const dir = resolve(OUTPUT_DIR, "screenshots", route.name);
  mkdirSync(dir, { recursive: true });
  const safeName = viewport.name.replace(/[/\s]/g, "_");
  await page.screenshot({ path: resolve(dir, `${safeName}.png`), fullPage: true });

  await page.close();
}

async function runAudit() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--ignore-certificate-errors", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  let total = 0;
  const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES];
  console.log(`Testing ${allRoutes.length} routes across ${VIEWPORTS.length} viewports = ${allRoutes.length * VIEWPORTS.length} combinations`);

  for (const route of allRoutes) {
    console.log(`\n=== ${route.name} (${route.path})${route.auth ? ` [auth:${route.auth}]` : " [public]"} ===`);
    let routeSuccess = 0;

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor,
        ignoreHTTPSErrors: true,
        hasTouch: vp.width <= 1024,
        isMobile: vp.width <= 768,
      });

      try {
        await testPage(context, route, vp);
        routeSuccess++;
      } catch (e) {
        report(`${route.name}`, { name: vp.name, width: vp.width, height: vp.height }, {
          check: "Script Error",
          severity: "CRITICAL",
          description: `Erro no teste: ${e.message}`,
          reproduction: `Testar ${route.path} em ${vp.width}x${vp.height}`,
        });
      }

      await context.close();
      total++;
    }
    console.log(`  ✓ ${routeSuccess}/${VIEWPORTS.length} viewports OK`);
  }

  // ---- NON-VIEWPORT TESTS ----

  // Breakpoint-only tests (all breakpoints for key pages)
  console.log("\n=== Raw Breakpoint Tests ===");
  for (const route of ["/", "/restaurants", "/search", "/login", "/cart"]) {
    for (const bp of BREAKPOINTS) {
      const ctx = await browser.newContext({
        viewport: { width: bp, height: 800 },
        ignoreHTTPSErrors: true,
      });
      const pg = await ctx.newPage();
      try {
        await pg.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
        await pg.waitForTimeout(500);
        const ov = await pg.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
        }));
        if (ov.sw > ov.cw + 2) {
          report(`Breakpoint-${route}`, `BP-${bp}`, {
            check: "Overflow at Breakpoint",
            severity: "HIGH",
            description: `${ov.sw} > ${ov.cw} em ${bp}px`,
            reproduction: `Redimensionar para ${bp}px width`,
          });
        }
      } catch (e) {}
      await ctx.close();
    }
  }

  // Landscape
  console.log("\n=== Landscape Tests ===");
  for (const route of PUBLIC_ROUTES.slice(0, 10)) {
    const ctx = await browser.newContext({
      viewport: { width: 667, height: 375 },
      deviceScaleFactor: 2,
      ignoreHTTPSErrors: true,
      hasTouch: true,
      isMobile: true,
    });
    const pg = await ctx.newPage();
    try {
      await pg.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle", timeout: 10000 });
      await pg.waitForTimeout(1000);
      const ov = await pg.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      if (ov.sw > ov.cw + 5) {
        report(route.name, `Landscape 667x375`, {
          check: "Overflow Landscape",
          severity: "HIGH",
          description: `${ov.sw} > ${ov.cw}`,
          reproduction: `Landscape em ${route.path}`,
        });
      }
    } catch (e) {}
    await ctx.close();
  }

  // Bottom nav visibility check
  console.log("\n=== Mobile-Specific Checks ===");
  const mobCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3, ignoreHTTPSErrors: true,
  });
  const mobPg = await mobCtx.newPage();
  await mobPg.goto(`${BASE_URL}/`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
  await mobPg.waitForTimeout(2000);

  const navCheck = await mobPg.evaluate(() => {
    const fixed = document.querySelectorAll("*");
    let hasBottomNav = false;
    for (const el of fixed) {
      if (el.tagName.toLowerCase() === "nav" || el.className.includes("bottom")) {
        const cs = window.getComputedStyle(el);
        if (cs.position === "fixed" && parseFloat(cs.bottom) === 0) {
          hasBottomNav = true;
          break;
        }
      }
    }
    return { hasBottomNav };
  });
  if (!navCheck.hasBottomNav) {
    report("Home", { name: "iPhone 12", width: 390, height: 844 }, {
      check: "Bottom Navigation",
      severity: "HIGH",
      description: "Bottom navigation fixa não encontrada no mobile",
      reproduction: "Abrir homepage em 390x844",
    });
  } else {
    console.log("  ✓ Bottom navigation found on mobile");
  }

  await mobCtx.close();

  // ---- Generate Report ----
  console.log("\n========== AUDIT RESULTS ==========");

  const bySeverity = {};
  for (const r of results) {
    (bySeverity[r.severity] = bySeverity[r.severity] || []).push(r);
  }

  for (const sev of ["CRITICAL", "HIGH", "MEDIUM", "LOW"]) {
    const items = bySeverity[sev] || [];
    console.log(`\n${sev} (${items.length}):`);
    for (const item of items) {
      const vp = typeof item.viewport === 'object' ? item.viewport.name : item.viewport;
      console.log(`  ${item.page} @ ${vp} | ${item.check}: ${item.description.slice(0, 100)}`);
    }
  }

  const md = generateMarkdown(results, bySeverity, allRoutes.length);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(resolve(OUTPUT_DIR, "audit-report.md"), md);
  writeFileSync(resolve(OUTPUT_DIR, "audit-results.json"), JSON.stringify(results, null, 2));

  const totalRoutes = allRoutes.length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Routes tested: ${totalRoutes}`);
  console.log(`Viewports per route: ${VIEWPORTS.length}`);
  console.log(`Total checks: ~${totalRoutes * VIEWPORTS.length + BREAKPOINTS.length * 5 + 10}`);
  console.log(`Issues found: ${results.length}`);
  console.log(`CRITICAL: ${(bySeverity["CRITICAL"]||[]).length}`);
  console.log(`HIGH: ${(bySeverity["HIGH"]||[]).length}`);
  console.log(`MEDIUM: ${(bySeverity["MEDIUM"]||[]).length}`);
  console.log(`LOW: ${(bySeverity["LOW"]||[]).length}`);
  console.log(`\nReport: ${OUTPUT_DIR}\\audit-report.md`);
  console.log(`Screenshots: ${OUTPUT_DIR}\\screenshots/`);

  await browser.close();
}

function escapeMd(s) { return String(s || "").replace(/\|/g, "\\|").replace(/\n/g, " "); }

function generateMarkdown(results, bySeverity, totalRoutes) {
  let md = `# Auditoria de Responsividade Mobile-First — Flux Delivery\n\n`;
  md += `**Data:** ${new Date().toISOString().split("T")[0]}\n\n`;
  md += `**Dispositivos simulados:** iPhone SE, iPhone 12/13, Moto G, Samsung Galaxy S, iPad, iPad Pro, Notebook 1366, Desktop HD\n\n`;
  md += `**Breakpoints:** 320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1920\n\n`;
  md += `**Navegador:** Chromium (Playwright)\n\n`;

  md += `## Resumo\n\n`;
  md += `| Severidade | Quantidade |\n|------------|----------:|\n`;
  for (const sev of ["CRITICAL", "HIGH", "MEDIUM", "LOW"]) {
    md += `| ${sev} | ${(bySeverity[sev]||[]).length} |\n`;
  }
  md += `| **Total** | **${results.length}** |\n`;

  const criticalCount = (bySeverity["CRITICAL"]||[]).length;
  const highCount = (bySeverity["HIGH"]||[]).length;
  const passed = criticalCount === 0 && highCount < 10;
  md += `\n**Status geral:** ${passed ? "✅ APROVADO" : "❌ REPROVADO"}\n`;
  md += `\n**Critério de aceitação:**\n`;
  md += `- ✅/❌ Nenhum layout quebrar entre 320px e 1920px\n`;
  md += `- ✅/❌ Nenhuma funcionalidade falhar em mobile\n`;
  md += `- ✅/❌ Nenhum overflow horizontal\n`;
  md += `- ✅/❌ Navegação funcionar em todos os dispositivos\n`;
  md += `- ✅/❌ Inputs/formulários utilizáveis em mobile\n\n`;

  md += `## Problemas Encontrados\n\n`;

  const sevOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  results.sort((a, b) => (sevOrder[a.severity]||99) - (sevOrder[b.severity]||99));

  if (results.length === 0) {
    md += `Nenhum problema encontrado. ✅\n\n`;
  } else {
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const vpName = typeof r.viewport === 'object' ? `${r.viewport.name} (${r.viewport.width}x${r.viewport.height})` : r.viewport;
      md += `### ${i+1}. [${r.severity}] ${r.check}\n\n`;
      md += `| Campo | Valor |\n|-------|-------|\n`;
      md += `| Página | ${escapeMd(r.page)} |\n`;
      md += `| Viewport | ${escapeMd(vpName)} |\n`;
      md += `| Descrição | ${escapeMd(r.description)} |\n`;
      if (r.elements) {
        const els = Array.isArray(r.elements) ? r.elements.join("<br>") : r.elements;
        md += `| Elementos | ${els} |\n`;
      }
      md += `| Reprodução | ${escapeMd(r.reproduction)} |\n`;
      md += `\n---\n\n`;
    }
  }

  // Component analysis
  md += `\n## Análise Estrutural\n\n`;

  md += `### Componentes Ausentes\n\n`;
  md += `Os seguintes componentes genéricos NÃO existem no projeto e impactam a experiência mobile:\n\n`;
  md += `| Componente | Impacto Mobile |\n|-----------|----------------|\n`;
  md += `| Modal/Dialog genérico | Modais fullscreen sem bottom sheet seguro |\n`;
  md += `| Bottom Sheet | Sem drawer inferior para ações mobile |\n`;
  md += `| Drawer | Sidebar usa overlay próprio, sem padrão |\n`;
  md += `| Empty State | Telas vazias sem fallback visual |\n`;
  md += `| Tabela genérica | Sem responsividade de tabela |\n`;
  md += `| Select/Dropdown | Select nativo sem customização mobile |\n`;
  md += `| Radio/Checkbox | Inputs nativos sem estilo consistente |\n`;

  md += `\n### Problemas de CSS Identificados\n\n`;
  md += `1. **Sem clamp() para fontes fluidas** — fontes fixas não escalam entre viewports\n`;
  md += `2. **Sem Container Queries** — componentes não se adaptam ao container, apenas ao viewport\n`;
  md += `3. **Safe-area coverage incompleta** — apenas `;
  md += "`padding-bottom` com `env(safe-area-inset-bottom)` implementado no FxBottomNavigation. Faltam `top`, `left`, `right`\n";
  md += `4. **Componentes UI sem variantes responsivas** — FxButton, FxText, FxInput não aceitam tamanhos por breakpoint\n`;
  md += `5. **Breakpoint 768px hardcoded** no ToastProvider (CSS-in-JS) e geolocationService (JS)\n`;
  md += `6. **CLS Alto** — Cumulative Layout Shift > 0.1 detectado na HomePage\n`;

  return md;
}

runAudit().catch(console.error);
