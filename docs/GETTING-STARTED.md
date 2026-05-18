# Getting Started

## Pré-requisitos

- Node.js 20+ (ou 22+)
- PostgreSQL (local ou Supabase)
- npm

## Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd flux-delivery

# Instalar dependências
npm install
```

## Configuração do Ambiente

Copie o arquivo de exemplo e ajuste as variáveis:

```bash
cp .env.example .env
```

Edite `.env` com suas configurações:

```env
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/seudb"
JWT_SECRET=uma-chave-segura-aqui
CORS_ORIGINS=http://localhost:5173,http://localhost:3001
```

## Banco de Dados

```bash
# Gerar migrations a partir do schema
npm run db:generate

# Aplicar migrations
npm run db:migrate

# (Opcional) Abrir Drizzle Studio
npm run db:studio
```

## Rodar em Desenvolvimento

```bash
# Frontend + Server (concurrently)
npm run dev
```

- Frontend: `http://localhost:5173`
- Server: `http://localhost:3001`
- Health check: `GET http://localhost:3001/api/health`

## Modo Mock (dados falsos)

Em desenvolvimento, é possível usar dados mockados:

```bash
VITE_MOCK=true npm run dev
```

Isso ativa `__USE_MOCK__` no frontend, que consome dados da `fakeApi` em vez de chamadas HTTP reais.

## Build de Produção

```bash
npm run build
```

Gera `dist/` com os assets otimizados. O servidor Hono pode ser iniciado com:

```bash
NODE_ENV=production tsx server/src/index.ts
```

## Verificação

```bash
# Lint
npm run lint

# Type check completo
npx tsc --noEmit -p server/tsconfig.json
npm run build
```
