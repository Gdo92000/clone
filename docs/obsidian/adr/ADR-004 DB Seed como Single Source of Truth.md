---
title: "ADR-004: DB Seed como Single Source of Truth para Dev"
type: adr
status: active
created_at: 2026-06-06
updated_at: 2026-06-06
supersedes: null
related:
  - "[[ADR-003 Cobertura Geofencing-Ready]]"
  - "[[CURRENT_STATE]]"
  - "[[MEMORY]]"
tags:
  - type/adr
  - domain/core
  - layer/L1
aliases:
  - ADR-004
  - DB Seed como Single Source of Truth
  - Franca Dev Seed
---

# ADR-004: DB Seed como Single Source of Truth para Dev

> [!info] Status
> ✅ **Aprovado** (2026-06-06)

## Contexto

O dev server (`npm run dev`) inicializa com Postgres vazio porque as migrations criam schema mas não dados. O frontend depende de `__USE_MOCK__=true` (VITE_MOCK=true) para ativar o MSW e retornar fixtures. Em **dispositivos cujo cert HTTPS não é confiável** (celular físico sem CA mkcert instalada), o **Service Worker do MSW falha em registrar**, fazendo com que `/api/*` caia no proxy Vite → backend → Postgres vazio → `[]` → "0 encontrados".

A tentativa inicial foi criar um **Vite plugin middleware** que servisse os mocks direto em `/api/*` no dev. Funcionaria em qualquer device, mas **viola múltiplos princípios do AGENTS.md**:

- ❌ Single source of truth (3 fontes: MSW handlers + middleware + fixtures TS)
- ❌ Validação Zod ignorada (middleware retorna JSON cru)
- ❌ DTOs DB não passam pelo mapper
- ❌ Cria wrapper desnecessário (princípio: "proibido criar wrappers desnecessários apenas para satisfazer tipagem")
- ❌ Erros reais do backend ficam escondidos
- ❌ Comportamento de dev diverge de prod (testa caminho que não existe em prod)

## Decisão

**Popular Postgres com seed de Franca-SP em dev e usar o backend real como única fonte.**

### Implementação

1. **`server/src/db/seeds/franca-dev.seed.ts`** — módulo idempotente que popula:
   - 8 categorias (`Hambúrgueres`, `Pizzas`, `Brasileira`, `Japonesa`, `Mexicana`, `Doces & Sobremesas`, `Açaí & Sorvetes`, `Saudável`)
   - 9 restaurants (8 originais Fase 29 + Bahia Lanches) com coords Google Maps validadas
   - 1 `coverage_city` (Franca, lat -20.5386, lng -47.4008, raio 18km)
   - **Idempotente**: se já há dados, pula. `force=true` limpa e repopula.

2. **`server/src/db/schema/core/coverage-cities.ts`** — schema Drizzle para a tabela `coverage_cities` (que já existia no SQL mas não tinha schema TS).

3. **Auto-seed no boot do dev** (`server/src/index.ts:bootstrapDev`) — só em `NODE_ENV=development`, só se DB vazio, falhas são warn (não-fatal).

4. **Script npm** `db:seed:franca-dev` para forçar/popular manualmente.

5. **`src/mocks/fixtures/restaurants.ts` permanece como fonte de testes Vitest** (já usado por MSW em test mode). Não duplica mais nada.

### Alternativa rejeitada: Vite middleware de mocks

| Critério | DB Seed | Vite Middleware |
|---|---|---|
| Single source of truth | ✅ DB | ❌ 3 fontes |
| Zod validation | ✅ | ❌ |
| DTOs separados | ✅ via mappers | ❌ JSON cru |
| Código de prod exercitado | ✅ | ❌ |
| Erros reais visíveis | ✅ | ❌ (esconde) |
| Mesma experiência PC/mobile | ✅ | ✅ |
| Acordo com AGENTS | ✅ | ❌ viola 5 princípios |
| Setup inicial | ⚠️ requer seed (auto no boot) | ✅ zero setup |

## Consequências

### Positivas
- Mobile funciona out-of-the-box após `npm run dev` (auto-seed popula se vazio)
- MSW se torna opcional em dev (só usado por Vitest)
- Cobertura de Franca derivada de restaurants ativos (consistente com ADR-003)
- Mudanças no backend (validadores, DTOs) são exercitadas em dev

### Negativas / Riscos
- Dev requer Postgres rodando (já era requisito do AGENTS.md)
- Seed precisa ser atualizado quando adicionar cidades
- `force=true` apaga dados Franca — se dev customizou dados, perde

### Mitigações
- Idempotência do seed: só popula se vazio
- Schema versionado via migrations Drizzle
- `db:seed:franca-dev` (sem force) é seguro rodar múltiplas vezes

## Validação

| Check | Resultado |
|-------|-----------|
| `npm run db:seed:franca-dev` | ✅ 9 restaurants + 1 coverage_city |
| `GET /api/restaurants` (Postgres) | ✅ 9 items Franca |
| `GET /api/cities/has-coverage?city=Franca&state=SP` | ✅ `{"covered":true}` |
| Playwright `https://192.168.0.9:5173/restaurants` | ✅ 9 restaurants exibidos |
| `npm run lint` | ✅ 0 erros |
| `npx tsc -b` | ✅ exit 0 |
| `npx vitest run` | ✅ 297/297 |
| `npm run build` | ✅ 42.64s |
