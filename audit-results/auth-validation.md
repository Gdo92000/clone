# Auth Validation — Resultados

**Data:** 2026-05-31  
**Ferramenta:** Playwright 1.60 (Chromium)  
**Total de testes:** 20  
**Aprovados:** 19 ✅ (1 flaky, passou no retry)  
**Falhos:** 0 ❌  

---

## Resumo por Perfil

### Consumidor (`dev-customer`)

| Rota | Acesso Esperado | Resultado | Screenshot |
|------|:---------------:|:---------:|:----------:|
| `/` | ✅ Permitido | ✅ OK | `consumer-allowed-_.png` |
| `/restaurants` | ✅ Permitido | ✅ OK | `consumer-allowed-_restaurants.png` |
| `/cart` | ✅ Permitido | ✅ OK | `consumer-allowed-_cart.png` |
| `/orders` | ✅ Permitido | ✅ OK | `consumer-allowed-_orders.png` |
| `/profile` | ✅ Permitido | ✅ OK | `consumer-allowed-_profile.png` |
| `/merchant` | ❌ Bloqueado | ✅ OK | `consumer-blocked-_merchant.png` |
| `/admin` | ❌ Bloqueado | ✅ OK | `consumer-blocked-_admin.png` |
| `/superadmin` | ❌ Bloqueado | ✅ OK | `consumer-blocked-_superadmin.png` |

### Lojista (`dev-owner-1` — company_owner)

| Rota | Acesso Esperado | Resultado | Screenshot |
|------|:---------------:|:---------:|:----------:|
| `/merchant` | ✅ Permitido | ✅ OK | `merchant-allowed-_merchant.png` |
| `/merchant/orders` | ✅ Permitido | ✅ OK | `merchant-allowed-_merchant_orders.png` |
| `/merchant/catalog` | ✅ Permitido | ✅ OK | `merchant-allowed-_merchant_catalog.png` |
| `/admin` | ❌ Bloqueado | ✅ OK | `merchant-blocked-_admin.png` |
| `/superadmin` | ❌ Bloqueado | ✅ OK | `merchant-blocked-_superadmin.png` |

### Admin (`dev-admin`)

| Rota | Acesso Esperado | Resultado | Screenshot |
|------|:---------------:|:---------:|:----------:|
| `/admin` | ✅ Permitido | ✅ OK | `admin-allowed-_admin.png` |
| `/superadmin` | ❌ Bloqueado | ✅ OK | `admin-blocked-_superadmin.png` |

### SuperAdmin (`dev-superadmin`)

| Rota | Acesso Esperado | Resultado | Screenshot |
|------|:---------------:|:---------:|:----------:|
| `/superadmin` | ✅ Permitido | ✅ OK | `superadmin-allowed-_superadmin.png` |
| `/superadmin/plans` | ✅ Permitido | ✅ OK | `superadmin-allowed-_superadmin_plans.png` |
| `/superadmin/users` | ✅ Permitido | ✅ OK (flaky, retry passou) | `superadmin-allowed-_superadmin_users.png` |
| `/merchant` | ✅ Permitido | ✅ OK | `superadmin-allowed-_merchant.png` |
| `/admin` | ✅ Permitido | ✅ OK | `superadmin-allowed-_admin.png` |

---

## Observações

1. **1 teste flaky** — `/superadmin/users` timeout no primeiro attempt (30s `networkidle`). Passou no retry. Causa provável: requisições de dados mockados que demoram a resolver em ambiente dev com MSW.
2. **Todos os bloqueios foram confirmados** com o texto "Acesso bloqueado" no body da resposta.
3. **SuperAdmin acessa todas as áreas** conforme esperado — `/superadmin`, `/merchant` e `/admin`.

---

## Comandos

```bash
# Executar suite de autenticação
npm run test:auth

# Abrir relatório HTML interativo
npx playwright show-report
```

---

## Arquivos de Teste

| Arquivo | Perfil | Cenários |
|---------|--------|:--------:|
| `tests/auth/consumer.spec.ts` | Consumidor | 5 permitidos + 3 bloqueados |
| `tests/auth/merchant.spec.ts` | Lojista | 3 permitidos + 2 bloqueados |
| `tests/auth/admin.spec.ts` | Admin | 1 permitido + 1 bloqueado |
| `tests/auth/superadmin.spec.ts` | SuperAdmin | 5 permitidos |
| `tests/auth/auth-helpers.ts` | Helpers | `loginAs()`, `navigateAndExpectAllowed()`, `navigateAndExpectBlocked()` |

**Total: 20 cenários validados — 19 verdes, 0 vermelhos.**