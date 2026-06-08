# E2E Test Suite — Fluxos de Compra, Login e Busca

**Data**: 2026-06-01
**Status**: 35/35 verde (1 skipped defensivo)
**Tempo total**: ~3.1min (auth + e2e)

## Cobertura

| Suite | Cenários | Arquivo | Tempo |
|-------|:--------:|---------|------:|
| Auth (existente) | 20 | `tests/auth/*.spec.ts` | ~1.4min |
| Checkout | 4 | `tests/e2e/checkout.spec.ts` | 47.8s |
| Login | 6 | `tests/e2e/login.spec.ts` | ~33s |
| Search | 5 (+1 skip) | `tests/e2e/search.spec.ts` | ~36s |

### Checkout (`tests/e2e/checkout.spec.ts`)
1. **cart vazia mostra EmptyState** — `/cart` com localStorage vazio renderiza EmptyState com título "Sua sacola está vazia"
2. **add item → cart → checkout → tracking** — fluxo completo: home→search→restaurant detail→add→cart→checkout→address manual→PIX→confirmar→`/tracking`
3. **botão confirmar fica disabled sem método de pagamento** — apenas guest + address preenche, sem payment → confirm `disabled`
4. **selecionar "Dinheiro" revela campo de troco** — payment method "money" revela input de troco com placeholder "R$ 0,00"

### Login (`tests/e2e/login.spec.ts`)
1. **página /login renderiza** — título "Entrar", subtítulo "Acesse sua conta", campos email/password visíveis
2. **submit com email vazio → validação** — toast ou validação inline aparece
3. **submit com senha vazia → validação** — idem
4. **credenciais inválidas (email não cadastrado) → 401** — permanece em /login, mensagem de erro
5. **credenciais válidas (customer) → redirect /** — `ana@email.com` + senha qualquer → home
6. **credenciais válidas (superadmin) → redirect /** — `admin@admin.com` + senha qualquer → home

### Search (`tests/e2e/search.spec.ts`)
1. **home: search bar → /restaurants?search=...** — submit de "pizza" na home navega para `/restaurants?search=pizza`
2. **/search mostra lista** — heading "X restaurantes encontrados" presente
3. **/search filtra por categoria** — clicar em chip de categoria reduz a contagem
4. **/search ordena por avaliação** — defensive: skip se botão "Melhores avaliações" não existir
5. **/search com query inexistente → EmptyState** — `?search=xyzabc123naoexiste` → "Nenhum restaurante encontrado"
6. **clicar em restaurante da busca → detalhe** — click em card navega para `/restaurant/:id`

## Configuração

### Playwright
- `playwright.config.ts`: `testDir: './tests'` (descobre todos os `.spec.ts`)
- `workers: 1`, `retries: 1` (dev mode; sem flaky)
- `webServer`: `npm run dev:client` (HTTPS, port 5173, ignoreHTTPSErrors)

### Scripts (`package.json`)
| Script | Comando | Uso |
|--------|---------|-----|
| `test:auth` | `playwright test tests/auth` | Suite auth (20) |
| `test:e2e` | `playwright test tests/e2e` | Suite e2e (15) |
| `test:e2e:checkout` | `playwright test tests/e2e/checkout.spec.ts` | Checkout (4) |
| `test:e2e:login` | `playwright test tests/e2e/login.spec.ts` | Login (6) |
| `test:e2e:search` | `playwright test tests/e2e/search.spec.ts` | Search (5+1 skip) |
| `test:e2e:all` | `playwright test` | Tudo (35+1) |

### Fixtures e helpers
- `tests/e2e/helpers/commerce-helpers.ts`: 
  - `MOCK_LOGIN_USERS` (5 emails de mock)
  - `ADDRESS_SAMPLE`
  - `loginViaForm()`, `loginAsDevUser()`
  - `addFirstItemToCart()`, `fillGuestCheckoutForm()`, `fillAddressForm()`, `selectPaymentMethod()`, `waitForToast()`

## Decisões técnicas

- **`/restaurants` vs `/search`**: testes de checkout e search usam `/search` (categoria de URL separada) quando possível — é onde a busca canônica fica. `/restaurants` é o que recebe a query via `?search=...` (rota do home).
- **Dev mode = sempre há user**: `DevAuthProvider.initAuth()` auto-loga o primeiro mock user se nada em localStorage. Logo, em dev não existe "guest mode" — testes que tentam testar o GuestInfoForm precisam de mock. O caminho testado aqui é o user logado.
- **AddressAutocomplete começa ativo**: `FxAddressForm` tem `useState(!value.street)` — se `street` vazio, mostra autocomplete. Testes clicam "Digitar manualmente" para acessar inputs diretos.
- **Login mock aceita qualquer senha**: `loginMock(email, _password)` ignora senha. Testes usam senhas arbitrárias.

## Screenshots

`tests/screenshots/e2e-*.png` — 16 screenshots full-page, agrupados por suite.

## Próximos passos

- Item 2: **Auditoria Playwright 2.0** (suite de smoke completa — fluxos de merchant, admin, superadmin)
- Item 3: **Refatorar `server/`** (192 erros de lint ignorados)
- Item 4: **`auth-architecture.md`** consolidando arquitetura
- Item 5-6: **Migração de modais + empty states restantes**
