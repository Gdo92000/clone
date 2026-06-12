---
title: ADR-008 Repository Pattern como padrão para novos módulos
aliases:
  - ADR-008 Repository
  - ADR-008 Fat Services
tags:
  - type/adr
  - domain/core
  - layer/L2
  - status/active
  - tech/typescript
  - tech/drizzle
  - domain/architecture
created_at: 2026-06-12
updated_at: 2026-06-12
related:
  - "[[MOC Architecture]]"
  - "[[MOC Backend]]"
  - "[[MOC Database]]"
supersedes: []
---

# ADR-008 — Repository Pattern como padrão para novos módulos

## Status

✅ Aprovado em 2026-06-12 (pós-LOOP 4 — Auditoria Arquitetural)

## Contexto

Após extrair lógica de negócio de 4 rotas para serviços dedicados (couponService, financeService, analyticsService, orderService), uma auditoria arquitetural revelou:

**Violação confirmada**: todos os 11 serviços na camada `server/src/services/` importam `db` diretamente (`import { db } from '../db'`), ignorando a interface `RepositoryPort` existente em `ports/repository.ts`.

### Problemas observados

| Problema | Impacto |
|----------|---------|
| Acoplamento ao Drizzle em 11 serviços | Trocar ORM exige reescrever lógica de negócio |
| Mock frágil nos testes | `vi.mock('../db')` mocka chain inteira — qualquer mudança quebra |
| Query duplicada entre serviços | Sem reuso, sem contrato explícito |
| `RepositoryPort` genérica | `Record<string, unknown>` — sem tipagem de domínio |

### Lição do LOOP 4

O padrão "rota fina, serviço gordo" apenas moveu o problema — `orderService.ts` (255 linhas) prova que sem repositórios a complexidade se acumula em outra camada. Serviço com acoplamento direto a DB + schema + notificações + SSE + push é tão difícil de testar quanto a rota original.

## Decisão

### Obrigatório para novos módulos

Todo **novo módulo de domínio** (ex: `enterprise/`, `experience/`, novos recursos em `merchant/`, `admin/`) DEVE:

1. Definir uma **interface de repositório de domínio** (ex: `CouponRepository`)
2. Implementar um **PostgresRepository** concreto
3. O serviço receber o repositório **por injeção** (constructor param)
4. O **controller/rota** instanciar o repositório e passar ao serviço

### Optativo para módulos existentes

Os 11 serviços legados que importam `db` diretamente **NÃO precisam ser refatorados imediatamente**. O custo (3-5 dias, risco médio-alto) não se justifica sem driver externo (ex: troca de ORM, bugs recorrentes).

### Padrão

```typescript
// 1. Interface de domínio
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}

// 2. Implementação concreta
class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly _db: Db) {}

  async findById(id: string): Promise<Order | null> {
    const [row] = await this._db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return row ?? null;
  }
}

// 3. Serviço recebe interface por injeção
class OrderService {
  constructor(private readonly _orderRepo: OrderRepository) {}

  async getOrder(id: string): Promise<Order | null> {
    return this._orderRepo.findById(id);
  }
}

// 4. Controller instancia e injeta
const orderRepo = new PostgresOrderRepository(db);
const orderService = new OrderService(orderRepo);
```

### Gatilhos para refatoração de serviço legado

- Troca de ORM ou driver de DB
- Bug recorrente em queries de determinado domínio
- Feature nova que exigiria duplicar query existente
- Nova interface de repositório que beneficia múltiplos módulos

## Consequências

### Positivas

- Contrato explícito de acesso a dados (documentação)
- Mock de 1 método vs. chain Drizzle nos testes
- Reuso de queries entre módulos
- Troca de ORM vira substituição de implementação, não reescrita
- Serviços ficam testáveis sem mock de DB real

### Negativas

- Mais arquivos por módulo (interface + impl + service + controller)
- Boilerplate inicial maior
- Curva de aprendizado para devs novos
- Risco de over-engineering em CRUDs simples

### Neutras

- `RepositoryPort` genérica existente (`base-postgres.ts`) permanece disponível para queries simples, mas novos módulos devem preferir interfaces de domínio específicas
- Serviços legados continuam funcionando — sem refatoração retroativa obrigatória

