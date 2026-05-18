# Testing

## Status Atual

O projeto **não possui testes automatizados** atualmente. Esta documentação descreve o setup desejado e as áreas prioritárias para cobertura.

## Stack Recomendada

| Ferramenta | Finalidade |
|------------|------------|
| Vitest | Test runner (já incluso como dependência do Vite 8) |
| React Testing Library | Testes de componentes |
| Playwright | Testes E2E |
| MSW | Mock de requisições HTTP |

## Áreas Prioritárias

### 1. Testes Unitários — Serviços do Backend
- `server/src/services/operations.ts` — lógica de horários, feriados, status
- `server/src/lib/errors.ts` — AppError + errorHandler

### 2. Testes de Integração — Rotas da API
- `POST /api/auth/login` — autenticação
- `GET /api/restaurants`, `POST /api/restaurants` — CRUD
- Rotas de `holidays.ts` e `operations.ts` com validação Zod

### 3. Testes de Componentes — Frontend
- Componentes reutilizáveis em `src/components/ui/`
- Hooks React Query (useRestaurants, useMerchantData, useOperations)

### 4. Testes E2E — Fluxos Críticos
- Fluxo de pedido: Home → Restaurante → Carrinho → Checkout
- Login e navegação por perfil (cliente, lojista, superadmin)

## Configuração Sugerida

### Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

## Convenções

- Test files: `*.test.ts` ou `*.test.tsx` ao lado do arquivo testado
- Mocks em `__mocks__/` ou `src/test/mocks/`
- Factory functions para dados de teste (avoid fixtures fixas)
