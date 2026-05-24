[MODO=GERAR]

> [!tip] Navegação
> ← [[MOC — Histórico do Projeto]] · [[Sources Index]]

# FluxDS — Enterprise Design System para Clone do iFood

---

## 🎯 INSTRUÇÃO PRIMÁRIA PARA A LLM

> **Você deve criar um clone funcional e visual do iFood.**
>
> O iFood é o maior marketplace de delivery de comida do Brasil. Seu produto principal é uma plataforma onde usuários buscam restaurantes, montam pedidos, realizam checkout, acompanham entregas em tempo real e gerenciam seu histórico de pedidos.
>
> **Sua tarefa é construir todas as interfaces, componentes, telas e fluxos necessários para replicar essa experiência completa**, utilizando o design system FluxDS definido abaixo como fundação técnica e visual.
>
> Cada componente, tela e token deve ser pensado e construído com o contexto do iFood em mente:
> cores vermelho/branco/cinza, cards de restaurantes, banners promocionais, fluxo de pedido, rastreamento de entrega, autenticação, carrinho, checkout, avaliações e painel administrativo de restaurantes.

---

## 🍔 PRODUTO A SER CLONADO: iFood

### O que é o iFood

O iFood é uma plataforma de delivery com as seguintes áreas principais:

| Área | Descrição |
|------|-----------|
| **Home / Marketplace** | Feed com banners, categorias (Pizza, Hambúrguer, Sushi…), restaurantes em destaque e promoções |
| **Busca / Catálogo** | Filtros por categoria, distância, avaliação, tempo de entrega, faixa de preço |
| **Página do Restaurante** | Logo, banner, informações, cardápio com seções, itens com foto e preço |
| **Item / Produto** | Detalhe do prato, adicionais, observações, quantidade |
| **Carrinho** | Resumo do pedido, cupom, endereço, forma de pagamento |
| **Checkout** | Endereço de entrega, pagamento (cartão, Pix, vale), confirmação |
| **Rastreamento** | Timeline do pedido: Confirmado → Em preparo → A caminho → Entregue |
| **Histórico** | Pedidos anteriores, reorder, avaliação |
| **Autenticação** | Login por telefone/email, OTP, cadastro |
| **Perfil** | Dados pessoais, endereços salvos, cartões, notificações |
| **Admin / Parceiro** | Dashboard do restaurante: pedidos, cardápio, métricas, configurações |

---

## 🎨 IDENTIDADE VISUAL DO CLONE

### Paleta de Cores (baseada no iFood)

```
Primária:    #EA1D2C  (vermelho iFood)
Hover:       #C5161F
Secundária:  #FF6900  (laranja promocional)
Background:  #F7F7F7  (cinza claro)
Surface:     #FFFFFF
Text:        #3E3E3E
Subtle:      #717171
Border:      #E0E0E0
Success:     #50A773
Warning:     #F5A623
Error:       #EA1D2C
Info:        #0070CC
```

### Tipografia

```
Display:  'Nunito', sans-serif  (títulos de restaurantes, banners)
Body:     'Inter', sans-serif   (textos gerais, preços, descrições)
Mono:     'JetBrains Mono'      (códigos de pedido, OTP)
```

### Iconografia

- Ícones do pacote `lucide-react`
- Ícones customizados para categorias de comida (pizza, burger, sushi, etc.)
- Ícones de status de pedido

---

## 🖥️ TELAS A SEREM IMPLEMENTADAS

A LLM deve implementar as seguintes telas completas do clone iFood:

### Tela 1 — Home / Marketplace

```
- Header com logo, busca, localização e carrinho
- Banner carrossel com promoções
- Seção de categorias horizontais (scroll)
- Seção "Mais pedidos perto de você"
- Seção "Parceiros exclusivos"
- Cards de restaurantes com foto, nome, avaliação, tempo, taxa de entrega
- Bottom Navigation (mobile)
```

### Tela 2 — Listagem de Restaurantes

```
- Filtros por categoria, ordenação e distância
- Grid de cards de restaurantes
- Indicador de aberto/fechado
- Badge de promoção/destaque
- Paginação infinita / load more
```

### Tela 3 — Página do Restaurante

```
- Banner do restaurante
- Info: nome, avaliação, categorias, tempo estimado, taxa
- Abas de navegação do cardápio
- Seções do cardápio com scroll lateral
- Cards de itens com foto, nome, descrição, preço
- Botão de adicionar ao carrinho
- Mini carrinho flutuante (sticky)
```

### Tela 4 — Detalhe do Item

```
- Foto grande do produto
- Nome e descrição
- Adicionais / complementos com preços
- Campo de observações
- Seletor de quantidade
- Botão "Adicionar ao carrinho" com preço total
```

### Tela 5 — Carrinho

```
- Lista de itens com quantidade e preço
- Resumo de valores (subtotal, entrega, desconto)
- Campo de cupom
- Endereço de entrega selecionado
- Botão "Ir para o pagamento"
```

### Tela 6 — Checkout

```
- Endereço de entrega com mapa
- Forma de pagamento (cartão, Pix, vale)
- Resumo do pedido
- Botão de confirmação
- Loading state ao confirmar
```

### Tela 7 — Rastreamento do Pedido

```
- Número e resumo do pedido
- Timeline de status (Confirmado / Em preparo / Saiu / Entregue)
- Nome do entregador + foto + avaliação
- Mapa com rota (simulado)
- Countdown de tempo estimado
```

### Tela 8 — Autenticação

```
- Login por telefone com flag de país
- Validação de OTP (6 dígitos)
- Login por e-mail/senha
- Cadastro novo usuário
- Recuperação de senha
```

### Tela 9 — Perfil do Usuário

```
- Dados pessoais editáveis
- Endereços salvos
- Cartões cadastrados
- Histórico de pedidos
- Configurações de notificação
- Logout
```

### Tela 10 — Dashboard Administrativo (Restaurante Parceiro)

```
- Métricas: pedidos hoje, faturamento, ticket médio, avaliação
- Lista de pedidos em tempo real com status
- Gerenciamento de cardápio
- Configurações do restaurante
- Relatórios e analytics
```

---

## 🏗️ ARQUITETURA DO SISTEMA

### Stack Oficial

| Camada | Tecnologia |
|--------|-----------|
| Framework | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + tailwind-variants + clsx |
| Headless UI | Radix UI + cmdk |
| Documentação | Storybook + MDX |
| Monorepo | Turborepo + pnpm |
| Tokens | Style Dictionary |
| Testes | Vitest + Testing Library + Playwright |
| Qualidade | ESLint + Prettier + Changesets |

### Estrutura do Monorepo

```txt
fluxds-ifood/
│
apps/
 ├── docs/              → Storybook + documentação viva
 ├── playground/        → Ambiente de testes de componentes
 ├── storefront/        → Clone do iFood (app principal do usuário)
 └── admin/             → Painel do restaurante parceiro
│
packages/
 ├── ui/                → Todos os componentes Fx
 ├── tokens/            → Design tokens (Style Dictionary)
 ├── icons/             → Iconografia customizada
 ├── hooks/             → Hooks reutilizáveis
 ├── themes/            → Temas light/dark/high-contrast
 ├── animations/        → Framer Motion + CSS transitions
 ├── eslint-config/
 ├── tsconfig/
 ├── tailwind-config/
 └── utils/
```

---

## 📦 COMPONENTES DO DESIGN SYSTEM

### Prefixo Oficial: `Fx`

Todos os componentes usam PascalCase com prefixo `Fx`.

---

### Primitivos

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxButton` | CTA "Pedir agora", "Adicionar ao carrinho", "Confirmar pedido" |
| `FxInput` | Busca, campos de formulário, cupom |
| `FxText` | Preços, descrições, nomes de restaurante |
| `FxIcon` | Ícones de categoria, status, ações |
| `FxAvatar` | Foto do usuário, entregador, restaurante |
| `FxBadge` | "Aberto", "Promoção", "Novo", status do pedido |
| `FxDivider` | Separação de seções do cardápio |
| `FxSpinner` | Loading ao confirmar pedido, carregar restaurantes |

---

### Formulários

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxSearchField` | Busca de restaurantes e pratos |
| `FxPasswordField` | Login com senha |
| `FxOtpField` | Validação do número de telefone (6 dígitos) |
| `FxPhoneField` | Cadastro / login por telefone |
| `FxCurrencyField` | Valor do voucher / troco |
| `FxSelect` | Seleção de endereço, forma de pagamento |
| `FxCheckbox` | Adicionais do item (ex: "Com bacon?") |
| `FxSwitch` | Notificações, disponibilidade de item no admin |
| `FxRadioGroup` | Escolha de tamanho da pizza, ponto da carne |
| `FxTextarea` | Observações do pedido |

---

### Navegação

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxNavbar` | Header com logo, busca, localização, carrinho |
| `FxSidebar` | Menu lateral no admin |
| `FxBottomNavigation` | Home, Busca, Pedidos, Perfil (mobile) |
| `FxBreadcrumb` | Navegação no admin |
| `FxTabs` | Seções do cardápio do restaurante |
| `FxPagination` | Listagem de pedidos no admin |
| `FxCommandMenu` | Busca rápida (cmd+k) |
| `FxStepper` | Etapas do checkout |

---

### Overlays

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxModal` | Detalhe do item, confirmação de exclusão |
| `FxDrawer` | Carrinho lateral (desktop), filtros (mobile) |
| `FxPopover` | Tooltip de endereço, info de frete |
| `FxTooltip` | Info adicional em ícones |
| `FxDropdownMenu` | Ações do pedido, menu de usuário |
| `FxAlertDialog` | Confirmar cancelamento de pedido |
| `FxContextMenu` | Ações rápidas em cards |

---

### Feedback

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxToast` | "Item adicionado ao carrinho!", "Pedido confirmado!" |
| `FxSnackbar` | Notificação de status do pedido |
| `FxAlert` | Restaurante fechado, item indisponível |
| `FxEmptyState` | Sem restaurantes na área, carrinho vazio |
| `FxSkeleton` | Loading de cards de restaurantes |
| `FxLoadingOverlay` | Processando pagamento |
| `FxProgressBar` | Upload de foto de perfil, progresso do pedido |

---

### Commerce (Componentes Específicos do iFood)

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxProductCard` | Card de item do cardápio com foto, nome, preço |
| `FxRestaurantCard` | Card do restaurante na listagem |
| `FxCartDrawer` | Carrinho lateral com resumo |
| `FxCheckoutSummary` | Resumo antes de confirmar pedido |
| `FxDeliveryBadge` | Tempo estimado + taxa de entrega |
| `FxPriceTag` | Preço original vs preço promocional |
| `FxCouponField` | Campo para aplicar cupom de desconto |
| `FxOrderTimeline` | Timeline: Confirmado → Em preparo → Saiu → Entregue |
| `FxOrderStatus` | Badge de status do pedido |
| `FxQuantitySelector` | Seletor de quantidade (+/-) no carrinho |

---

### Layouts

| Componente | Uso no Clone iFood |
|------------|--------------------|
| `FxContainer` | Wrapper de largura máxima |
| `FxStack` | Empilhamento vertical/horizontal de elementos |
| `FxGrid` | Grid de restaurantes, categorias |
| `FxSection` | Seção da home com título e conteúdo |
| `FxSpacer` | Espaçamento controlado |
| `FxPageLayout` | Layout base das páginas do storefront |
| `FxDashboardLayout` | Layout do painel admin do restaurante |
| `FxCheckoutLayout` | Layout de 2 colunas para checkout |
| `FxAuthLayout` | Layout centralizado para login/cadastro |

---

## 🎨 DESIGN TOKENS SEMÂNTICOS

### Cores (mapeadas para o clone iFood)

```ts
// Brand
color.brand.primary        → #EA1D2C  (vermelho iFood)
color.brand.primaryHover   → #C5161F
color.brand.secondary      → #FF6900  (laranja promo)
color.brand.accent         → #FFD600  (amarelo destaque)

// Surface
color.surface.background   → #F7F7F7
color.surface.elevated     → #FFFFFF
color.surface.overlay      → rgba(0,0,0,0.5)
color.surface.inverse      → #3E3E3E

// Text
color.text.primary         → #3E3E3E
color.text.secondary       → #717171
color.text.tertiary        → #9E9E9E
color.text.disabled        → #BDBDBD
color.text.inverse         → #FFFFFF

// Feedback
color.feedback.success     → #50A773
color.feedback.warning     → #F5A623
color.feedback.error       → #EA1D2C
color.feedback.info        → #0070CC

// Border
color.border.default       → #E0E0E0
color.border.focus         → #EA1D2C
color.border.error         → #EA1D2C
color.border.disabled      → #EEEEEE
```

### Regra obrigatória

```diff
- PROIBIDO:  bg-red-500, text-gray-700, border-blue-300
+ OBRIGATÓRIO: bg-[color.brand.primary], text-[color.text.secondary]
```

---

## 📐 SISTEMA DE VARIANTES

Todos os componentes seguem este sistema:

```ts
// Exemplo: FxButton
<FxButton
  variant="solid"        // solid | outline | ghost | link
  intent="primary"       // primary | secondary | danger | success
  size="md"              // xs | sm | md | lg | xl
  state="default"        // default | hover | focus | loading | disabled
/>

// Exemplo: FxRestaurantCard
<FxRestaurantCard
  variant="default"      // default | featured | compact
  elevation="sm"         // none | sm | md | lg
  density="comfortable"  // compact | comfortable | spacious
/>
```

---

## 🔄 FLUXOS PRINCIPAIS A IMPLEMENTAR

### Fluxo 1 — Pedido Completo

```
Home → Seleção de Restaurante → Cardápio → Detalhe do Item
     → Adicionar ao Carrinho → Revisão do Carrinho
     → Checkout (endereço + pagamento) → Confirmação
     → Rastreamento em Tempo Real → Avaliação
```

### Fluxo 2 — Autenticação

```
Splash → Inserir Telefone → Validar OTP → Completar Perfil → Home
       ou
Login com E-mail → Recuperar Senha → Redefinir → Home
```

### Fluxo 3 — Admin do Restaurante

```
Login Parceiro → Dashboard → Gestão de Pedidos em Tempo Real
              → Editar Cardápio → Adicionar/Remover Itens
              → Configurações → Relatórios
```

---

## ♿ ACESSIBILIDADE (OBRIGATÓRIO)

- WCAG AA em todos os componentes
- Navegação completa por teclado
- `focus-visible` visível
- `aria-label` em todos os elementos interativos
- Suporte a `prefers-reduced-motion`
- Screen reader (NVDA, VoiceOver) compatível
- Contraste mínimo 4.5:1 para texto normal

---

## 🌙 TEMAS

```ts
theme.light        → Padrão do iFood (fundo claro, vermelho primário)
theme.dark         → Versão dark com superfícies escuras
theme.highContrast → Para acessibilidade avançada
theme.brand        → Versão customizável para multi-marca
```

---

## 📱 RESPONSIVIDADE

Estratégia: **mobile-first**

```
xs  → 320px  (iPhone SE)
sm  → 390px  (iPhone 14)
md  → 768px  (iPad)
lg  → 1024px (laptop)
xl  → 1280px (desktop)
2xl → 1536px (wide)
```

Grid System:
```
Mobile  → 4 colunas
Tablet  → 8 colunas
Desktop → 12 colunas
Wide    → 16 colunas
```

---

## 📋 CONVENÇÃO DE ARQUIVOS

```txt
FxRestaurantCard/
 ├── FxRestaurantCard.tsx       → Implementação principal
 ├── FxRestaurantCard.types.ts  → Tipos e interfaces
 ├── FxRestaurantCard.styles.ts → Variantes (tailwind-variants)
 ├── FxRestaurantCard.test.tsx  → Testes unitários
 ├── FxRestaurantCard.stories.tsx → Storybook stories
 ├── FxRestaurantCard.docs.mdx  → Documentação MDX
 └── index.ts                   → Export público
```

---

## 🏃 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1 — Fundação (Semanas 1–2)

```
✅ Tokens: cores, tipografia, espaçamento, sombra, motion
✅ Theme Provider (light/dark)
✅ Primitivos: FxButton, FxText, FxInput, FxIcon, FxAvatar
✅ Layout: FxContainer, FxStack, FxGrid, FxPageLayout
```

### Fase 2 — Telas Core do iFood (Semanas 3–5)

```
✅ Tela Home / Marketplace
✅ Tela Listagem de Restaurantes
✅ Tela Restaurante + Cardápio
✅ Tela Detalhe do Item
✅ FxRestaurantCard, FxProductCard, FxDeliveryBadge
✅ FxSearchField, FxBottomNavigation, FxNavbar
```

### Fase 3 — Checkout e Pedidos (Semanas 6–8)

```
✅ Tela Carrinho → Checkout → Confirmação
✅ Tela Rastreamento de Pedido
✅ FxCartDrawer, FxCheckoutSummary, FxOrderTimeline
✅ FxCouponField, FxPriceTag, FxQuantitySelector
✅ FxStepper, FxAlertDialog, FxLoadingOverlay
```

### Fase 4 — Auth e Perfil (Semana 9)

```
✅ Tela Login por Telefone + OTP
✅ Tela Cadastro + Recuperação de Senha
✅ Tela Perfil do Usuário
✅ FxOtpField, FxPhoneField, FxAuthLayout
```

### Fase 5 — Admin do Restaurante (Semanas 10–11)

```
✅ Dashboard com métricas
✅ Gestão de pedidos em tempo real
✅ Gerenciamento de cardápio
✅ FxDashboardLayout, FxSidebar, FxProgressBar
```

### Fase 6 — Polimento Enterprise (Semana 12)

```
✅ Dark mode completo
✅ Multi-brand (suporte a outras marcas sobre o mesmo DS)
✅ Visual regression tests (Playwright)
✅ Storybook com todos os componentes documentados
✅ Performance audit (Lighthouse > 90)
✅ Publicação via Changesets + Semantic Versioning
```

---

## ✅ CRITÉRIOS DE ACEITAÇÃO FINAIS

| Critério | Condição |
|----------|----------|
| Clone visual do iFood | As telas devem ser reconhecíveis como iFood |
| Componentes desacoplados | Sem dependências cruzadas não declaradas |
| Tokens semânticos | Zero hardcode de cor ou espaçamento |
| Tree-shaking | Build final sem código morto |
| Dark mode | Todas as telas compatíveis |
| Responsividade | Validado de 320px a 1920px |
| Acessibilidade | WCAG AA em 100% dos componentes |
| Storybook | Cada componente com story, docs e playground |
| Performance | LCP < 2.5s, CLS < 0.1 |
| Testes | Cobertura > 80% em componentes críticos |
| Naming | Prefixo `Fx` em todos os componentes |

---

## 🔑 RESUMO EXECUTIVO PARA A LLM

> Você está construindo o **FluxDS**, um design system enterprise completo que serve como base para um **clone funcional do iFood**.
>
> O produto final deve ter:
> 1. **Identidade visual fiel ao iFood** — vermelho, branco, tipografia limpa, UX de food delivery
> 2. **Todas as telas do usuário** — da home até o rastreamento do pedido
> 3. **Painel admin para restaurantes** — dashboard, pedidos, cardápio
> 4. **Design system robusto** — tokens, componentes, temas, acessibilidade
> 5. **Arquitetura escalável** — monorepo, tree-shaking, multi-brand ready
>
> **Comece pela Fase 1 e avance sequencialmente. Cada componente deve ser implementado seguindo rigorosamente as convenções de naming, arquivo, variantes e tokens definidos neste documento.**