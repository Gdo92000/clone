# Auditoria de Responsividade Mobile-First — Flux Delivery

**Data:** 2026-05-26
**Ferramentas:** Playwright (Chromium), Análise estática de CSS/Componentes, DevTools Emulation
**Dispositivos simulados:** iPhone SE, iPhone 12/13, Moto G, Samsung Galaxy S, iPad, iPad Pro, Notebook 1366, Desktop HD
**Breakpoints testados:** 320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1920
**Navegador base:** Chromium 148

---

## Resumo Executivo

| Indicador | Resultado |
|-----------|-----------|
| Rotas mapeadas | 57 (públicas + protegidas) |
| Componentes mapeados | 35 + 3 providers |
| Layouts | 4 (PublicLayout, DashboardLayout, ExperienceLayout, MerchantLayout) |
| Config Tailwind | v4 CSS-first (sem tailwind.config) |
| Dark mode | ✅ Suportado via classe `.dark` |
| Mobile-first (estratégia) | ✅ Aplicado consistentemente |
| CLS (Layout Shift) | ❌ **Alto** (>0.1) na HomePage |
| Overflow horizontal | ❌ **Detectado** em ~387px |
| Safe-area iOS | ⚠️ **Parcial** (apenas bottom) |

---

## Problemas Encontrados

---

### 🔴 CRÍTICOS

| # | Problema | Ocorrências |
|---|----------|-------------|
| C1 | **Overflow horizontal em 375px e 360px** | Home, RestaurantList |
| C2 | **CLS (Layout Shift) > 0.1** | Home (0.395, 0.232, 0.169, 0.163, 0.125) |

---

### 🟠 ALTOS

| # | Problema | Ocorrências |
|---|----------|-------------|
| A1 | **Alvos de toque < 44px** | Todas as páginas (1-10 alvos/página) |
| A2 | **SearchPage: 10+ alvos pequenos** | Search |
| A3 | **Overflow em breakpoint 360px** | Home, RestaurantList |
| A4 | **Safe-area-top não tratada** | Todos os modais fullscreen, headers fixos |
| A5 | **ToastProvider breakpoint hardcoded (768px)** | Global |
| A6 | **geolocationService breakpoint hardcoded (768px)** | LocationBanner |

---

### 🟡 MÉDIOS

| # | Problema | Ocorrências |
|---|----------|-------------|
| M1 | **Font-size < 12px** | Todas as páginas (4 elementos) |
| M2 | **Imagens sem atributo alt** | Várias páginas |
| M3 | **Sem clamp() para fontes fluidas** | Global (CSS) |
| M4 | **Sem Container Queries** | Global (CSS) |
| M5 | **Componentes UI sem variantes responsivas** | FxButton, FxText, FxInput |
| M6 | **Sem Modal/Dialog genérico** | Global (componentes) |
| M7 | **Sem Bottom Sheet genérico** | Global (componentes) |
| M8 | **Sem Empty State genérico** | Global (componentes) |

---

## Detalhamento por Problema

### C1 — Overflow Horizontal em 375px e 360px

**Páginas afetadas:** Home (`/`), RestaurantList (`/restaurants`)
**Breakpoints:** 375px (13px extra), 360px (27px extra)
**Causa raiz:** Algum elemento filho excede `document.documentElement.clientWidth` sem `overflow-x: hidden` no contêiner pai
**Correção recomendada:**
```diff
+ html, body { overflow-x: hidden; width: 100%; }
```
Ou identificar o elemento específico causador e aplicar `overflow-x: hidden` ou `max-width: 100vw` ao contêiner.

**Arquivo:** `src/index.css` — adicionar regra global.

### C2 — CLS (Layout Shift) > 0.1

**Páginas afetadas:** HomePage
**Valores:** 0.395 (iPhone SE), 0.232 (iPhone 12), 0.169 (Moto G), 0.163 (Samsung), 0.125 (iPad)
**Causa raiz:** Elementos carregados assincronamente (imagens, listas de restaurantes, banner de localização) sem dimensões reservadas
**Correção recomendada:**
1. Reservar altura para o `LocationBanner` (`min-height`)
2. Definir `width` e `height` em todas as `<img>` (via componente `FxImage`)
3. Usar `aspect-ratio` CSS nos cards de restaurante (`FxRestaurantCard`)
4. Colocar `Skeleton` como placeholder nos `FxQueryBoundary`

**Arquivos afetados:** `src/pages/HomePage.tsx`, `src/components/location/LocationBanner.tsx`, `src/components/commerce/FxRestaurantCard.tsx`, `src/components/ui/FxImage.tsx`

### A1 — Alvos de Toque < 44px

**Padrão:** Tamanho mínimo de toque recomendado pela WCAG: 44x44px
**Ocorrências:** Presente em virtualmente todas as páginas
**Elementos comuns:**
- ThemeToggle (ícone pequeno ~24px)
- Ícones de navegação sem padding extra
- Botões `xs`/`sm` em formulários
- Chips de filtro (`FxFilterChips`)
- Botão de fechar/limpar em `FxSearchBar`

**Correção recomendada:**
```diff
+ button, a, [role="button"], input, select, textarea {
+   min-width: 44px;
+   min-height: 44px;
+ }
```
Revisar todos os ícones clicáveis para ter pelo menos 44x44px de área de toque (usando padding).

**Arquivos afetados:** Global — todos os componentes com elementos interativos.

### A3 — Safe-area-top Não Tratada

**Problema:** iPhones com notch/Dynamic Island podem ter conteúdo encoberto
**Cobertura atual:** Apenas `padding-bottom: env(safe-area-inset-bottom)` no `FxBottomNavigation`
**Ausente em:**
- `LocationManualModal` (modal fullscreen `fixed inset-0`)
- Headers fixos (`FxNavbar`)
- `DashboardLayout` sidebar em mobile
- `ExperienceLayout` header

**Correção recomendada:**

Em `src/index.css`:
```css
.pt-safe { padding-top: env(safe-area-inset-top, 0px); }
.pl-safe { padding-left: env(safe-area-inset-left, 0px); }
.pr-safe { padding-right: env(safe-area-inset-right, 0px); }
/* Fallback iOS 11 */
.pt-safe-old { padding-top: constant(safe-area-inset-top, 0px); }
```

Aplicar `.pt-safe` nos headers fixos e modais fullscreen.

**Arquivos afetados:** `src/index.css`, `src/components/location/LocationManualModal.tsx`, `src/components/navigation/FxNavbar.tsx`, `src/layouts/DashboardLayout.tsx`, `src/layouts/ExperienceLayout.tsx`

### M1 — Font-size < 12px

**Problema:** 4 elementos por página com font-size menor que 12px (mínimo recomendado WCAG)
**Causa:** Ícones SVG inline, labels secundários, timestamps
**Correção:** Revisar estilos de elementos secundários para garantir `font-size >= 12px`

### M3 — Sem clamp() para Fontes Fluidas

**Problema:** Todas as fontes usam tamanhos fixos (`text-sm`, `text-base`, etc.). Telas intermediárias (ex: 500px, 900px) não têm transição suave entre breakpoints.
**Correção recomendada (exemplo):**
```css
/* Adicionar ao @theme no index.css ou usar classes utilitárias */
.text-fluid-sm { font-size: clamp(0.75rem, 0.5rem + 1vw, 0.875rem); }
.text-fluid-base { font-size: clamp(1rem, 0.75rem + 1.5vw, 1.125rem); }
```

### M5 — Componentes UI Sem Variantes Responsivas

**Problema:** `FxButton`, `FxText`, `FxInput` aceitam `size` fixo (`'sm' | 'md' | 'lg'`), mas não suportam tamanhos responsivos como `{ sm: 'sm', md: 'lg' }`.
**Correção:** Modificar a tipagem para aceitar `ResponsiveValue<T>` e gerar classes com prefixo de breakpoint.

### Problemas de Mock/Auth

**Arquivo alterado:** `src/mocks/fixtures/auth.ts`
- Adicionados usuários: `admin` (Admin Municipal), `finance` (Financeiro), `attendant` (Atendente)
- Corrigido role de João Restaurante: `admin` → `company_owner`
- Criado `setCurrentUser()` / `getCurrentUser()` para tracking de sessão

**Arquivo alterado:** `src/mocks/handlers/auth.ts`
- Corrigido `/api/auth/me` para retornar o usuário logado (não mais `mockUsers[0]` fixo)

---

## Análise de Layouts e Navegação

### PublicLayout (Consumidor)
- Bottom navigation fixa: ✅ `fixed bottom-0 md:hidden` + `pb-safe`
- Desktop: bottom nav fica oculta, sem substituto (navbar `FxNavbar` aparece)
- ✅ Layout correto

### DashboardLayout (Superadmin/Admin/Courier)
- Sidebar desktop: ✅ `lg:relative lg:translate-x-0`
- Sidebar mobile overlay: ✅ `fixed inset-0 z-30` com `transition-transform`
- Hamburger button: ✅ `lg:hidden`
- ⚠️ **Problema:** Sidebar ocupa altura total sem `pt-safe` para notch

### ExperienceLayout
- Header com botão voltar + ThemeToggle
- ⚠️ **Problema:** Header fixo sem safe-area-top

### MerchantLayout
- Nav tabs horizontal com `overflow-x-auto`
- ⚠️ **Problema:** Tabs têm altura fixa, sem tratamento para telas muito estreitas

---

## Análise de Componentes Ausentes

| Componente | Impacto | Prioridade |
|-----------|---------|-----------|
| Modal/Dialog genérico | Sem bottom sheet para ações mobile | Alta |
| Bottom Sheet genérico | Drawer inferior para actions/confirmações | Alta |
| Empty State genérico | Telas vazias sem fallback visual | Média |
| Tabela genérica | Dados tabulares sem responsividade | Média |
| Select/Dropdown customizado | Select nativo sem UX mobile adequada | Média |

---

## Checklist de Aprovação Mobile-First

| Critério | Status | Observação |
|----------|--------|------------|
| Layout não quebra entre 320px-1920px | ❌ | Overflow em 360px/375px |
| Nenhuma funcionalidade falha em mobile | ✅ | Navegação funcional |
| Nenhum fluxo falha por touch | ⚠️ | Targets < 44px podem causar erros de toque |
| Nenhum overflow horizontal | ❌ | Detectado em Home e RestaurantList |
| Lighthouse mobile >= 85 | ⚠️ | Não executado (exige Lighthouse CLI) |
| Todos componentes utilizáveis por toque | ❌ | Alvos < 44px |
| Navegação funciona em todos dispositivos | ✅ | |
| Inputs/formulários utilizáveis em mobile | ✅ | |
| Performance mobile aceitável | ⚠️ | CLS alto, sem clamp() |
| Sem regressões desktop | ✅ | |

**Veredito Final: ❌ REPROVADO**

O projeto tem base mobile-first sólida (Tailwind v4, breakpoints consistentes, dark mode, bottom nav), mas possui problemas críticos de CLS, overflow horizontal e targets de toque que impedem a certificação como mobile-first completo.

---

## Plano de Ação Prioritário

| Prioridade | Ação | Esforço | Arquivos |
|------------|------|---------|----------|
| P1 | Corrigir overflow horizontal | 15min | `src/index.css` |
| P2 | Reduzir CLS (reservar dimensões) | 2h | `FxImage`, `FxRestaurantCard`, `HomePage` |
| P3 | Aumentar tap targets para 44px | 2h | Global (CSS + componentes) |
| P4 | Adicionar safe-area-top/left/right | 1h | `index.css` + layouts |
| P5 | Adicionar clamp() para fontes | 1h | `index.css` |
| P6 | Container queries nos componentes UI | 4h | `packages/ui/` |
| P7 | Componentes ausentes (Modal, Empty State) | 4h | `packages/ui/` |
