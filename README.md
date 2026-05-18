# Flux Delivery - Plataforma SaaS de Delivery

Plataforma completa de delivery multi-perfil com frontend React + Vite e backend Hono + Drizzle ORM + PostgreSQL.

## Perfis

- **Cliente** — navega, pede, acompanha entrega
- **Lojista** — gerencia filiais, cardápio, pedidos, horários
- **Admin** — operacional: empresas, cidades, auditoria
- **Superadmin** — SaaS: planos, addons, billing, feature flags
- **Entregador** — entregas disponíveis, rota, ganhos

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, Vite 8, TypeScript 6 |
| Roteamento | React Router 7 |
| Estado | TanStack React Query 5 |
| Estilos | Tailwind CSS 4 + tailwind-variants |
| Ícones | Lucide React |
| Backend | Hono 4, @hono/node-server |
| ORM | Drizzle ORM 0.45 |
| Validação | Zod 4 |
| Banco | PostgreSQL (Supabase) |
| Auth | JWT (bcryptjs + hono/jwt) |
| Build | tsc -b + vite build |

## Repositório

```
npm install       # instala dependências
npm run dev       # frontend + server concurrently
npm run build     # build de produção
npm run lint      # ESLint
```

## Estrutura

```
src/               # Frontend React
  components/      # UI, address, commerce, location, navigation
  hooks/           # React Query hooks + custom hooks
  modules/         # admin, auth, courier, enterprise, experience, merchant, saas, superadmin
  pages/           # Páginas públicas
  services/        # API calls, fakeApi, geocode
  providers/       # Toast (Sonner), React Query
  lib/             # Routes, toast, utils
  context/         # LocationContext
  layouts/         # PublicLayout, DashboardLayout

server/            # Backend Hono
  src/
    db/            # Drizzle schema + conexão
    routes/        # auth, holidays, operations
    middleware/    # JWT auth middleware
    services/      # Business logic (operations)
    lib/           # Error handler
    validations/   # Zod schemas (shared)

shared/            # Schemas compartilhados
  validations/     # operations, restaurant, address
```
