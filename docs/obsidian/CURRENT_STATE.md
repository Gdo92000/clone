---
type: state
status: idle
created_at: 2026-06-08
updated_at: 2026-06-09
related:
  - Fase A — Correção Bloqueadores Produção
  - Fase B — SSE + Push Merchant
  - MEMORY.md
  - PLANO-FASE-A.md
  - PLANO-CORRECAO-MERCHANT.md
  - server/src/routes/companies.ts
  - server/src/routes/branches.ts
  - server/src/routes/campaigns.ts
  - server/src/routes/merchant-finance.ts
  - server/src/middleware/planLimits.ts
  - server/src/routes/orders.ts
  - src/hooks/useMerchantSSE.ts
  - src/modules/merchant/pages/MerchantKDSPage.tsx
  - src/hooks/useMerchantData.ts
---

# CURRENT_STATE

## Fase Atual
**Idle** — Fases 38-43 concluídas. **Fase A + Fase B concluídas** (2026-06-09, working tree).

## Ultimo Commit Valido
`5ebc84d` — feat: analytics, financeiro, remocao enterprise e fluxo condicional de pedidos
**Fase A + B:** alterações em working tree (NÃO commitadas ainda)

## Comandos de Validacao
| Comando | Status |
|---------|--------|
| `npx tsc -b` | ✅ 0 erros |
| `npx eslint <arquivos Fase A+B>` | ✅ 0 erros (1 warning em useMerchantSSE — useEffect deps) |
| `npm run test:run` | ✅ 393/393 pass |
| `npm run lint` (full) | ⏳ Não executado (timeout histórico) |

## Bloqueios
- Migration 0015 não aplicada (DB Supabase indisponível)
- Working tree sujo — aguardando commit

## Status Geral
| Dominio | Status |
|---------|--------|
| Frontend (tsc) | ✅ |
| Backend (tsc) | ✅ |
| Testes (vitest) | ✅ 393/393 |
| Fase A — Bloqueadores produção | ✅ Concluída |
| Fase B — SSE + Push Merchant | ✅ Concluída |

## Fase A — Correção Bloqueadores Produção (CONCLUÍDA)

### 1. Multi-tenant GET /companies e GET /branches ✅
- `companies.ts` GET / agora filtra por `userCompanyId`
- `branches.ts` GET / agora filtra por `userCompanyId`
- Middleware: `requireTenantOwnership('companyId')`

### 2. Enforce Limites de Plano Backend ✅
- Middleware novo: `server/src/middleware/planLimits.ts` — `requirePlanLimit(resourceType)`
- Aplicado em: `branches.ts POST /`, `branches.ts POST /:id/menu-items`, `campaigns.ts POST /`

### 3. Taxas Financeiras Parametrizadas ✅
- `plans.ts`: `platform_fee_rate` + `delivery_fee_per_order`
- `merchant-finance.ts`: busca taxas via JOIN subscriptions→plans
- Fallback para 0.12 e 5.00 se plano não encontrado

## Fase B — SSE no KDS + Push Merchant (CONCLUÍDA)

### 4. SSE Cliente no módulo merchant ✅
- Hook novo: `src/hooks/useMerchantSSE.ts`
- Conecta em `/api/realtime/orders?branch_id=:id`
- Reconexão com backoff exponencial (até 10 retries, max 30s)
- `useKdsOrders(branchId)` agora:
  - sem `refetchInterval: 5000`
  - usa `useMerchantSSE` para invalidar queries via SSE
  - filtra por branch nativamente (query por branch)
- `MerchantKDSPage.tsx`: indicador SSE no header + hook integrado

### 5. Push notifications para merchant ✅
- `orders.ts` agora envia push para merchant users da branch após cada mudança de status
- Busca `users` com `role='merchant'` e `branch_id`, depois `pushSubscriptions` por `user_id`
- Mensagem: `"Pedido #{id} atualizado para: {status}"`
- `void sendPush()` — fire-and-forget, mesma abordagem de `consumer-orders.ts`
- Frontend já coberto: `usePushNotifications` ativo via `ProtectedRoute` (KDS está em rota protegida)

## Percentual Estimado de Conclusão do Merchant (pós Fase A+B)

| Área | Antes | Pós Fase A | Pós Fase B |
|------|-------|-----------|-----------|
| 5. Pedidos | 100% | 100% | 100% |
| 6. KDS | 100% | 100% | **95%** (SSE integrado, polling removido) |
| 8. Financeiro | 60% | 85% | 85% |
| 10. Planos/limites | 50% | 85% | 85% |
| 12. Multi-tenant | 70% | 95% | 95% |
| 15. SSE/Push | 20% | 20% | **~80%** (SSE cliente ok, push merchant + customer ok) |

**Percentual consolidado: ~88%** (antes ~68%, Fase A/B + Push somaram ~20 pontos)

## Próximo Passo
1. ✅ Testes 393/393 passando
2. ✅ Tarefa 5 (Push merchant) implementada
3. Commit do working tree
4. Aplicar migration 0015 quando DB disponível
