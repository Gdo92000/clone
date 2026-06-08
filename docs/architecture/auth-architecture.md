---
type: architecture
status: active
domain: auth
layer: L1
aliases:
  - Auth Architecture
  - Authentication Architecture
created_at: 2026-06-01
updated_at: 2026-06-01
---

# Auth Architecture

Documentação consolidada do sistema de autenticação e autorização do **Flux Delivery**.

> **Status**: Implementação completa, validada por 20 cenários E2E (Playwright).
> **Lint**: 0 erros. **Plataforma**: SPA React (Vite + React Router).
> **Última auditoria**: 2026-06-01.

---

## 1. Visão geral

O sistema de autenticação adota o padrão **Provider** com **DI manual via Context**, inspirado em `AuthProvider` do NextAuth e no contrato `IAuthProvider` do `auth0-spa-js`. Permite trocar o backend (dev mock / produção real) sem alterar nenhum consumer.

### 1.1 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│ App.tsx                                                     │
│   └─ <AuthProvider>  (seleciona dev | production)          │
│        └─ <AuthContext.Provider value={{ provider }}>      │
│             ├─ <ProtectedRoute roles={[...]} permission=   │
│             │    └─ page contents                          │
│             └─ <GuestRoute>                                │
│                  └─ page contents                          │
└─────────────────────────────────────────────────────────────┘

useAuth() ─┐
usePermissions() ─┴─> useAuthProvider() → IAuthProvider

IAuthProvider (contrato)
  ├─ DevAuthProvider       (localStorage + 10 mock users)
  └─ ProductionAuthProvider (authService → backend real)
```

### 1.2 Princípios

1. **Contrato antes de implementação** — `IAuthProvider` é o único ponto de contato entre UI e backend de auth.
2. **DI manual** — sem libs de DI; `useMemo` + `Context` bastam.
3. **Stateless refresh** — providers expõem `getUser()` síncrono. Refresh via `useState` tick (`useAuth`).
4. **Fail-safe** — erro fora de `<AuthProvider>` lança `Error` (não silent fail).
5. **Mock-first em dev** — `DevAuthProvider.initAuth()` auto-loga o primeiro usuário, removendo fricção de "qual user estou?".

---

## 2. Contrato `IAuthProvider`

**Arquivo**: `src/auth/contracts/IAuthProvider.ts:3-15`

```ts
export interface IAuthProvider {
  readonly name: 'dev' | 'production';

  getUser(): AuthUser | null;
  getUsers(): AuthUser[];
  hasRole(roles: UserRole[]): boolean;
  hasPermission(permission: PermissionKey): boolean;
  loginAs(userId: string): void;
  logout(): Promise<void>;
  getToken(): string | null;
  getRefreshToken(): string | null;
  initAuth(): void;
}
```

### 2.1 Semântica de cada método

| Método | Quando chamar | Retorno |
|--------|---------------|---------|
| `getUser()` | sempre (síncrono) | usuário ativo ou `null` |
| `getUsers()` | para listar perfis no dev login switcher | array de usuários |
| `hasRole(roles)` | guard condicional | `true` se role do user ∈ `roles` |
| `hasPermission(perm)` | guard condicional | `true` se `rolePermissions[user.role]` inclui `perm` |
| `loginAs(userId)` | dev only — troca perfil | `void` |
| `logout()` | sign out (async) | `Promise<void>` |
| `getToken()` | Authorization header | JWT ou `null` |
| `getRefreshToken()` | refresh flow | refresh token ou `null` |
| `initAuth()` | boot — chamado uma vez em `<AuthProvider>` | `void` |

### 2.2 Tipos auxiliares

`UserRole` e `PermissionKey` vivem em `src/modules/auth/types.ts`:

- **8 roles**: `superadmin`, `admin`, `company_owner`, `branch_manager`, `attendant`, `finance`, `courier`, `customer`.
- **17 permissions** (vide `authData.ts:14-41`): `plans.manage`, `billing.manage`, `orders.manage`, `menu.edit`, `checkout.use`, etc.

Mapeamento `role → permissions` em `src/modules/auth/authData.ts:14-41`:

| Role | # Permissions | Destaque |
|------|:-------------:|----------|
| `superadmin` | 17 (todas) | Acesso total |
| `admin` | 4 | `companies.block`, `orders.manage`, `deliveries.manage`, `analytics.view` |
| `company_owner` | 10 | `billing.*`, `addons.manage`, `users.invite`, `menu.edit` |
| `branch_manager` | 6 | `campaigns.create`, `kitchen.manage`, `orders.manage`, `menu.edit` |
| `attendant` | 1 | `orders.manage` |
| `finance` | 3 | `billing.view`, `analytics.view`, `finance.view` |
| `courier` | 1 | `deliveries.manage` |
| `customer` | 1 | `checkout.use` |

---

## 3. Implementações de `IAuthProvider`

### 3.1 `DevAuthProvider`

**Arquivo**: `src/auth/providers/DevAuthProvider.ts:7-69`

Mock-first provider para desenvolvimento. Estado vive em `localStorage` chave `fluxds-dev-active-user`.

```ts
export class DevAuthProvider implements IAuthProvider {
  readonly name = 'dev' as const;

  getUser(): MockUser | null {
    const stored = this.getStored();
    return stored ?? MOCK_USERS[0] ?? null;
  }

  // ... 10 mock users em dev-mock-data.ts

  loginAs(userId: string): void {
    try { localStorage.setItem(MOCK_ACTIVE_USER_KEY, userId); }
    catch { /* storage unavailable */ }
  }

  async logout(): Promise<void> {
    try { localStorage.removeItem(MOCK_ACTIVE_USER_KEY); }
    catch { /* storage unavailable */ }
    return Promise.resolve();
  }

  initAuth(): void {
    const stored = this.getStored();
    if (!stored) {
      try {
        const first = MOCK_USERS[0];
        if (first) localStorage.setItem(MOCK_ACTIVE_USER_KEY, first.id);
      } catch { /* storage unavailable */ }
    }
  }
}
```

**Características**:

- **10 mock users** cobrindo todos os roles (`dev-mock-data.ts:14-104`).
- **Auto-login**: se `localStorage` vazio em `initAuth()`, seta o primeiro user (superadmin). Remove fricção de "qual perfil?" no dev.
- **Try/catch em storage**: SSR-safe, browsers sem localStorage não quebram.
- **Token fixo**: `getToken()` retorna `'dev-mock-token'` (bypass MSW).
- **Logout é no-op real**: apenas limpa localStorage; próximo `getUser()` retorna o primeiro mock user novamente.

**Mock users** (`dev-mock-data.ts`):

| ID | Nome | Email | Role | Company | Branch |
|----|------|-------|------|---------|--------|
| `dev-superadmin` | Admin Master | `admin@fluxds.dev` | superadmin | — | — |
| `dev-admin` | Carlos Gestor | `admin@fluxds.dev` | admin | — | — |
| `dev-owner-1` | Maria Silva | `maria@restaurante1.dev` | company_owner | company-1 | — |
| `dev-owner-2` | Joao Tanaka | `joao@restaurante2.dev` | company_owner | company-3 | — |
| `dev-manager-1` | Ana Pereira | `ana@filial1.dev` | branch_manager | company-1 | branch-1 |
| `dev-manager-2` | Ricardo Lima | `ricardo@filial2.dev` | branch_manager | company-1 | branch-2 |
| `dev-attendant` | Luiz Santos | `luiz@filial1.dev` | attendant | company-1 | branch-1 |
| `dev-finance` | Fernanda Costa | `financeiro@restaurante1.dev` | finance | company-1 | — |
| `dev-courier` | Pedro Alves | `pedro@entregas.dev` | courier | — | — |
| `dev-customer` | Julia Mendes | `julia@cliente.dev` | customer | — | — |

### 3.2 `ProductionAuthProvider`

**Arquivo**: `src/auth/providers/ProductionAuthProvider.ts:6-46`

Wrapper sobre `src/services/authService.ts` (camada que fala com o backend real).

```ts
export class ProductionAuthProvider implements IAuthProvider {
  readonly name = 'production' as const;

  getUser() { return authService.getStoredUser(); }
  getUsers() { return []; } // não exposto em produção

  hasRole(roles) {
    const user = this.getUser();
    return !!user && roles.includes(user.role);
  }
  hasPermission(permission) {
    const user = this.getUser();
    return !!user && (rolePermissions[user.role] as readonly PermissionKey[]).includes(permission);
  }

  loginAs(_userId: string): void { /* no-op — login real obrigatório */ }
  async logout(): Promise<void> { await authService.logout(); }
  getToken() { return authService.getToken(); }
  getRefreshToken() { return authService.getRefreshToken(); }
  initAuth() { authService.initAuthSync(); }
}
```

**Diferenças em relação ao dev**:

- `getUsers()` retorna `[]` — não há lista de usuários em produção (é UI do dev login switcher).
- `loginAs()` é **no-op** — produção exige login real (email+senha ou SSO).
- Tokens vêm de `authService` (lê de localStorage com chave separada).

**`authService`** (`src/services/authService.ts`):
- `initAuthSync()` — sincroniza estado de auth com localStorage no boot.
- `login(input)` — POST `/auth/login` real.
- `logout()` — POST `/auth/logout` + limpa tokens.
- `getToken()` / `getRefreshToken()` — leitura síncrona.
- `setToken(token)` — escrita (usado pelo refresh interceptor).
- `getStoredUser()` — user persistido.
- `clearAuth()` — limpeza total.

---

## 4. Hooks de consumo

### 4.1 `useAuth()`

**Arquivo**: `src/auth/hooks/useAuth.ts:4-17`

```ts
export function useAuth() {
  const provider = useAuthProvider();
  const [, setTick] = useState(0);
  const refresh = useCallback(() => { setTick((t) => t + 1); }, []);

  return {
    user: provider.getUser(),
    users: provider.getUsers(),
    isAuthenticated: provider.getUser() !== null,
    loginAs: (userId: string) => { provider.loginAs(userId); refresh(); },
    logout: async () => { await provider.logout(); refresh(); },
  };
}
```

**API retornada**:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user` | `AuthUser \| null` | Usuário ativo |
| `users` | `AuthUser[]` | Lista (vazio em prod) |
| `isAuthenticated` | `boolean` | `user !== null` |
| `loginAs(userId)` | `(id) => void` | dev only — força re-render |
| `logout()` | `() => Promise<void>` | async, força re-render |

**Por que `setTick`?** `IAuthProvider` é **stateless** (apenas `localStorage`). Para forçar React a re-renderizar após `loginAs()`/`logout()`, incrementamos um tick. Alternativa seria um observable, mas o tick é o suficiente.

### 4.2 `usePermissions()`

**Arquivo**: `src/auth/hooks/usePermissions.ts:4-11`

```ts
export function usePermissions() {
  const provider = useAuthProvider();
  return {
    hasRole: (roles: UserRole[]) => provider.hasRole(roles),
    hasPermission: (permission: PermissionKey) => provider.hasPermission(permission),
  };
}
```

Wrapper fino sobre `IAuthProvider`. Não mantém estado — sempre lê do provider no momento da chamada (síncrono).

### 4.3 `useAuthProvider()` (interno)

**Arquivo**: `src/auth/context.ts:10-16`

```ts
export function useAuthProvider(): IAuthProvider {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthProvider must be used within <AuthProvider>');
  }
  return ctx.provider;
}
```

Lança `Error` se usado fora de `<AuthProvider>`. Comportamento intencional — auth é fundamental; silent fail mascararia bugs.

---

## 5. Guards de rota

### 5.1 `ProtectedGuard`

**Arquivo**: `src/auth/guards/ProtectedGuard.tsx:14-53`

```ts
interface ProtectedGuardProps {
  roles?: UserRole[];
  permission?: PermissionKey;
  children: ReactNode;
}
```

**Comportamento** (em ordem):

1. `user == null` → renderiza tela "Sessão expirada" + link para login.
2. `roles` definido e user.role não ∈ `roles` → tela "Acesso bloqueado".
3. `permission` definido e user.role não tem essa permission → tela "Acesso bloqueado".
4. Senão → renderiza `children`.

**Telemetria amigável**:

- Mensagem específica quando falta user vs. falta role/permission.
- CTA "Ir para login" / "Trocar perfil" aponta para `getLoginUrlForPath(location.pathname)` — login contextual.

### 5.2 `GuestGuard`

**Arquivo**: `src/auth/guards/GuestGuard.tsx:9-21`

```ts
interface GuestGuardProps {
  children: ReactNode;
  allowAuthenticated?: boolean; // default true
}
```

**Comportamento**:

- `user` logado + `allowAuthenticated` (default `true`) → renderiza children (visitante que virou customer vê landing).
- `user` ausente → renderiza children (visitante anônimo).
- `user` logado + `allowAuthenticated=false` → retorna `null` (redireciona para home — ver uso).

**Uso típico**: rotas `/login`, `/welcome` (landing) — para acessá-las com user já logado, `allowAuthenticated={false}`.

### 5.3 Re-exports em `src/modules/auth/`

| Componente | Arquivo | Linhas |
|------------|---------|:------:|
| `ProtectedRoute` | `src/modules/auth/ProtectedRoute.tsx` | 1-3 |
| `GuestRoute` | `src/modules/auth/GuestRoute.tsx` | 1-3 |

`ProtectedRoute` e `GuestRoute` são aliases para `ProtectedGuard` e `GuestGuard`. Mantidos para familiaridade com React Router idiomático.

---

## 6. `<AuthProvider>` — wiring

**Arquivo**: `src/auth/AuthProvider.tsx:11-26`

```tsx
export function AuthProvider({ children, provider: providerType }: AuthProviderProps) {
  const provider = useMemo(() => {
    if (providerType === 'production') {
      return new ProductionAuthProvider();
    }
    return new DevAuthProvider();
  }, [providerType]);

  provider.initAuth();

  return (
    <AuthContext.Provider value={{ provider }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Pontos importantes**:

- `useMemo` instancia provider uma vez por sessão (mesmo se o componente re-renderizar).
- `initAuth()` é chamado em todo render — barato (apenas `localStorage.getItem`).
- Default é `dev` (omitir prop = DevAuthProvider).
- Não tem "test provider" — testes E2E usam o provider real + MSW.

### 6.1 Integração com `App.tsx`

**Arquivo**: `src/App.tsx:371, 1102`

```tsx
<AuthProvider>  {/* default: dev */}
  <Router>
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/merchant/*" element={<ProtectedRoute roles={['superadmin', 'admin', 'company_owner', 'branch_manager']}>...</ProtectedRoute>} />
      <Route path="/superadmin/*" element={<ProtectedRoute roles={['superadmin']}>...</ProtectedRoute>} />
      ...
    </Routes>
  </Router>
</AuthProvider>
```

**125 usos de `<ProtectedRoute>`** em `App.tsx` (vide grep). Padrões observados:

- Rotas superadmin-only: `<ProtectedRoute roles={['superadmin']}>`.
- Rotas merchant: `<ProtectedRoute roles={['superadmin', 'company_owner']}>` (superadmin cross-access).
- Permissão específica: `<ProtectedRoute permission="plans.manage">`.
- Combinação: roles + permission (AND lógico).

---

## 7. `MockUser` vs `AuthUser`

`AuthUser` (em `src/modules/auth/types.ts:30-39`) é o **tipo de produção** — modelo do backend.
`MockUser` (em `src/auth/dev-mock-data.ts:3-12`) é **idêntico em estrutura** — mesmo shape.

Decisão consciente: **`IAuthProvider` opera sobre `AuthUser`**, e o dev provider retorna `MockUser` que é **structuralmente compatível**. Nenhum cast necessário; TS infere o tipo correto.

```ts
// Em DevAuthProvider
getUser(): MockUser | null { ... }
// Mas IAuthProvider declara
getUser(): AuthUser | null;
```

A interface é compatível porque `MockUser` é estruturalmente idêntico a `AuthUser`. **Não há acoplamento de tipos entre os módulos** (dev data não importa `AuthUser`).

---

## 8. Fluxos canônicos

### 8.1 Boot

```
1. App.tsx monta
2. <AuthProvider> instancia DevAuthProvider
3. DevAuthProvider.initAuth():
   - localStorage.getItem('fluxds-dev-active-user')
   - se null → setItem(firstMockUser.id)  (auto-login dev)
4. <AuthContext.Provider value={{ provider }}>
5. Filhos renderizam; <ProtectedRoute> já tem user
6. Login screen / dashboard acessível imediatamente
```

### 8.2 Trocar perfil (dev only)

```
1. User clica "Trocar perfil" → LoginForm
2. LoginForm chama useAuth().loginAs('dev-admin')
3. DevAuthProvider.loginAs: localStorage.setItem('dev-admin')
4. useAuth() refresh() → setTick(t+1) → re-render
5. ProtectedGuard re-avalia hasRole com novo user
6. UI atualiza (dashboard / sidebar / etc)
```

### 8.3 Logout

```
1. User clica "Sair" → ProfilePage handler
2. useAuth().logout() → provider.logout()
3. DevAuthProvider: localStorage.removeItem + Promise.resolve()
4. (Em produção: authService.logout() → POST /auth/logout)
5. refresh() → re-render
6. user = null → ProtectedGuard mostra "Sessão expirada"
7. (Dev) Próximo getUser() retorna primeiro mock user (auto-relogin)
```

### 8.4 Acesso negado

```
1. User (customer) tenta /merchant
2. <ProtectedRoute roles={['superadmin', 'company_owner', ...]}> avalia
3. user.role = 'customer' ∉ roles
4. Renderiza "Acesso bloqueado" + link "Trocar perfil"
5. (NÃO redireciona) — usuário pode voltar manualmente
```

---

## 9. Validação E2E

**Suite**: `tests/auth/*.spec.ts` (4 specs × 5 cenários médios)  
**Relatório completo**: `audit-results/auth-validation.md`  
**Data**: 2026-05-31  
**Resultado**: 20 cenários, 19 verdes, 0 vermelhos, 1 flaky (retry passou).

### 9.1 Cobertura por perfil

| Perfil | Permitidos | Bloqueados | Cenários |
|--------|:----------:|:----------:|:--------:|
| Customer | 5 | 3 | `tests/auth/consumer.spec.ts` |
| Company Owner | 3 | 2 | `tests/auth/merchant.spec.ts` |
| Admin | 1 | 1 | `tests/auth/admin.spec.ts` |
| SuperAdmin | 5 | 0 | `tests/auth/superadmin.spec.ts` |
| **Total** | **14** | **6** | **20** |

### 9.2 Cenários validados (resumo)

**Customer** (`dev-customer`):
- ✅ `/`, `/restaurants`, `/cart`, `/orders`, `/profile`
- ✅ Bloqueado em `/merchant`, `/admin`, `/superadmin`

**Lojista** (`dev-owner-1`):
- ✅ `/merchant`, `/merchant/orders`, `/merchant/catalog`
- ✅ Bloqueado em `/admin`, `/superadmin`

**Admin** (`dev-admin`):
- ✅ `/admin`
- ✅ Bloqueado em `/superadmin`

**SuperAdmin** (`dev-superadmin`):
- ✅ `/superadmin`, `/superadmin/plans`, `/superadmin/users`, `/merchant` (cross), `/admin` (cross)
- ⚠️ Flaky em `/superadmin/users` (networkidle 30s, retry OK — ver audit)

### 9.3 Comandos

```bash
npm run test:auth        # 20 cenários, ~1.5min
npx playwright show-report
```

---

## 10. Decisões arquiteturais

### 10.1 Por que `IAuthProvider` stateless?

**Decisão**: provider é **stateless**. Estado vive no `authService` (localStorage) e o provider apenas lê.

**Alternativa rejeitada**: provider com `subscribe()` / observer pattern.
- **Pro**: refresh automático em `loginAs`/`logout`.
- **Contra**: mais código, mais bugs (cleanup de listener), React 19 StrictMode duplica effects.

**Solução adotada**: `useAuth` mantém um `tick` e força re-render. Custo: 1 linha em `useAuth`, zero listeners.

### 10.2 Por que `getUser()` é síncrono?

**Decisão**: síncrono.

**Alternativa rejeitada**: `getUser(): Promise<AuthUser | null>`.
- **Contra**: quebra o render síncrono de `<ProtectedRoute>`. Tela pisca. Hooks adicionais (loading, error) para um caso que é "ler localStorage".

**Solução adotada**: `authService.initAuthSync()` popula localStorage no boot. `getUser()` é apenas `localStorage.getItem` + lookup.

### 10.3 Por que `try/catch` em todo localStorage?

**Decisão**: defensivo em **todos** os 4 pontos de acesso a localStorage.

**Causa**: SSR (ainda que não usemos), browsers com localStorage desabilitado (modo privado no Safari, políticas de cookie), e quota exceeded. Em qualquer um desses, `localStorage.setItem` lança `QuotaExceededError` ou similar.

**Custo**: 4 try/catch (8 linhas). **Benefício**: 0 crashes em produção.

### 10.4 Por que auto-login no dev?

**Decisão**: `DevAuthProvider.initAuth()` auto-loga o primeiro user se localStorage vazio.

**Alternativa rejeitada**: começar com `user = null` (visitante).
- **Contra**: dev precisa fazer login toda vez que limpa cache. Atrito desnecessário.

**Solução adotada**: dev começa logado como superadmin. Para testar fluxos guest, fazer logout. UX simples, reversível.

### 10.5 Por que `name: 'dev' | 'production'` no contrato?

**Decisão**: discriminar provider por `'dev' | 'production'`.

**Alternativa rejeitada**: `name: string` genérico.
- **Contra**: impossível garantir cobertura de providers em testes.

**Solução adotada**: literal type. Refator adicionar provider vira "estende o union".

---

## 11. Limitações conhecidas

| Limitação | Workaround | Status |
|-----------|-----------|:------:|
| Dev `logout()` remove user mas próximo `getUser()` retorna o primeiro mock | logout no dev é "reset para superadmin" | By design |
| `getUsers()` retorna `[]` em produção | LoginForm mostra dropdown só em dev | By design |
| `ProtectedGuard` mostra "Acesso bloqueado" mas não redireciona | User pode voltar manualmente | UX deliberada |
| 1 flaky em `/superadmin/users` (networkidle 30s) | Retry automático do Playwright (`retries: 1`) | Aceitável |
| `Provider` discrimination string-via-literal — refator exige cast | — | Aceitável (TS infere) |

---

## 12. Como adicionar um novo role

1. Adicionar ao `UserRole` em `src/modules/auth/types.ts:1-9`.
2. Adicionar `roleLabels[role]` em `src/modules/auth/authData.ts:3-12`.
3. Adicionar `rolePermissions[role]` em `src/modules/auth/authData.ts:14-41` (lista de `PermissionKey`).
4. (Opcional) Adicionar mock user em `dev-mock-data.ts:14-104` para dev.
5. Atualizar matriz de testes em `audit-results/auth-validation.md`.

Sem mudança no contrato `IAuthProvider`. Sem mudança em guards. Sem mudança em hooks.

---

## 13. Como adicionar um novo provider (ex: SSO)

1. Criar `src/auth/providers/SsoAuthProvider.ts` implementando `IAuthProvider`.
2. Atualizar `IAuthProvider.name` union para incluir `'sso'`.
3. Adicionar case em `AuthProvider.tsx:13-17`:
   ```tsx
   if (providerType === 'sso') return new SsoAuthProvider();
   ```
4. Wiring em `App.tsx`: `<AuthProvider provider="sso">`.
5. Atualizar esta doc (seção 3.3 nova).

Sem mudança no contrato. Sem mudança em guards. Sem mudança em hooks.

---

## 14. Referências

- **Contrato**: `src/auth/contracts/IAuthProvider.ts`
- **Dev provider**: `src/auth/providers/DevAuthProvider.ts`
- **Production provider**: `src/auth/providers/ProductionAuthProvider.ts`
- **Mock users**: `src/auth/dev-mock-data.ts`
- **AuthProvider**: `src/auth/AuthProvider.tsx`
- **Context**: `src/auth/context.ts`
- **Hooks**: `src/auth/hooks/useAuth.ts`, `src/auth/hooks/usePermissions.ts`
- **Guards**: `src/auth/guards/ProtectedGuard.tsx`, `src/auth/guards/GuestGuard.tsx`
- **Re-exports**: `src/modules/auth/ProtectedRoute.tsx`, `src/modules/auth/GuestRoute.tsx`
- **Tipos**: `src/modules/auth/types.ts` (UserRole, PermissionKey, AuthUser)
- **Role data**: `src/modules/auth/authData.ts` (roleLabels, rolePermissions)
- **authService (prod)**: `src/services/authService.ts`
- **Wiring**: `src/App.tsx:14, 371, 1102`
- **Validação E2E**: `tests/auth/*.spec.ts`, `audit-results/auth-validation.md`
- **Wider E2E (e2e + smoke)**: `audit-results/e2e-commerce-flows.md`, `tests/e2e/`, `tests/e2e/smoke/`

---

**Mantido por**: time Flux Delivery.  
**Próxima revisão**: ao adicionar novo role, novo provider, ou novo flow de auth.
