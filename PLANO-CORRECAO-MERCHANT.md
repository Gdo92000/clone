# Plano de Correção — Bloqueadores Produção Merchant

## Objetivo
Corrigir os 5 bloqueadores que impedem deploy em produção do módulo Merchant.

## Estimativa Total: 14h

---

## Tarefas

### 1. Corrigir vazamento multi-tenant em GET /companies e GET /branches
- [ ] Adicionar filtro por `company_id` em `server/src/routes/companies.ts` (`GET /`)
- [ ] Adicionar filtro por `company_id` em `server/src/routes/branches.ts` (`GET /`)
- [ ] Verificar: `curl` como merchant retorna apenas dados da própria company
- **Esforço:** 1h

### 2. Enforce limites de plano no backend
- [ ] identificar todas as rotas que criam branches/menu-items: `server/src/routes/branches.ts`, `server/src/routes/menu-items.ts` e derivadas
- [ ] Adicionar validação `requirePlanLimit` antes de `POST` em cada rota (verificar contagem atual vs `max_branches`, `max_products`)
- [ ] Retornar `409 Conflict` com mensagem clara quando limite excedido
- [ ] Verificar: `POST /branches` Burp Suite burla o limite visual frontend
- **Esforço:** 4h

### 3. Parametrizar taxas financeiras (remover hardcoded)
- [ ] Criar tabela `billing_rules` ou adicionar campos no schema `plans` (`platform_fee_rate`, `delivery_fee_per_order`)
- [ ] Atualizar `server/src/routes/merchant-finance.ts` para buscar taxas do plano ativo
- [ ] Atualizar seed para incluir taxas padrão (manter retrocompatibilidade)
- [ ] Eliminar literais `0.12` e `5` — substituir por lookup do plano
- [ ] Verificar: valores de faturamento batem com regra do plano configurado
- **Esforço:** 2h

### 4. Implementar SSE cliente no módulo merchant
- [ ] Criar hook `useMerchantSSE()` em `src/hooks/useMerchantSSE.ts`
- [ ] Substituir `refetchInterval: 5000` em `useKdsOrders()` por subscription SSE (`/sse/orders`)
- [ ] Implementar reconexão com backoff exponencial
- [ ] Atualizar `MerchantKDSPage.tsx` para consumir eventos SSE
- [ ] Verificar: novo pedido aparece no KDS em <1s sem polling
- **Esforço:** 3h

### 5. Implementar push notifications para merchant
- [ ] Criar endpoint `POST /push/subscribe` para merchant (separar de customer)
- [ ] Disparar push em `server/src/routes/orders.ts` quando `status = 'new'` (branch afetada)
- [ ] Disparar push ao alterar status (cozinha avança pedido)
- [ ] Frontend: registrar service worker para merchant channel
- [ ] Verificar: push chega com página fechada (teste em Chrome)
- **Esforço:** 4h

---

## Feito Quando
- [ ] `GET /api/companies` retorna apenas empresas do próprio tenant
- [ ] `GET /api/branches` retorna apenas filiais do próprio tenant
- [ ] `POST /branches` retorna erro 409 se exceeds `max_branches`
- [ ] `POST /branches/:id/menu-items` retorna erro 409 se exceeds `max_products`
- [ ] Taxa de plataforma e entrega são configuráveis por plano
- [ ] KDS atualiza em tempo real via SSE (sem polling)
- [ ] Merchant recebe push de novo pedido com página fechada

---

## Ordem de Execução
1. Segurança (tarefa 1) — 1h
2. Backend enforcement (tarefa 2) — 4h
3. Taxas dinâmicas (tarefa 3) — 2h (pode paralelizar com 2)
4. SSE (tarefa 4) — 3h
5. Push (tarefa 5) — 4h

**Caminho crítico:** Tarefa 1 → 2 → 4 (sequenciais). Tarefa 3 e 5 podem ser paralelas após 1 e 2.
