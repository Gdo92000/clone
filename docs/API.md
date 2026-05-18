# API Reference

Base URL: `http://localhost:3001/api`

Autenticação: Rotas protegidas exigem header `Authorization: Bearer <token>` (JWT, 24h de validade).

---

## Health

### `GET /api/health`

Retorna status do servidor.

**Resposta:**
```json
{ "status": "ok", "timestamp": "2026-05-18T12:00:00.000Z" }
```

---

## Auth (público)

### `POST /api/auth/login`

Autentica usuário e retorna token JWT.

**Body:**
```json
{ "email": "user@email.com", "password": "123456" }
```

**Resposta (200):**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "customer", "avatar_url": "" },
  "token": "eyJ..."
}
```

**Erro (401):**
```json
{ "error": "Usuário ou senha inválidos" }
```

### `POST /api/auth/logout`

**Resposta:**
```json
{ "success": true }
```

---

## Restaurants (protegido)

### `GET /api/restaurants`

Lista todos os restaurantes.

### `GET /api/restaurants/:id`

Retorna um restaurante por ID.

### `POST /api/restaurants`

Cria um novo restaurante.

**Body:** `restaurantSchema` (name, cuisine, address, city, state obrigatórios)

---

## Operations (protegido)

Todas as rotas prefixadas com `:branchId`.

### `GET /api/operations/:branchId/status`

Status atual de funcionamento (aberto/fechado).

### `GET /api/operations/:branchId/today-periods`

Períodos de funcionamento do dia atual.

### `GET /api/operations/:branchId/hours`

Horários semanais da filial.

### `PUT /api/operations/:branchId/hours`

Atualiza horários semanais. Substitui todos os registros existentes.

**Body:** `weeklyHoursSchema` — array de dias com períodos (openTime, closeTime)

### `GET /api/operations/:branchId/holiday-overrides`

Lista overrides de feriado da filial.

### `POST /api/operations/:branchId/holiday-overrides`

Cria override de feriado.

**Body:** `holidayOverrideSchema` (overrideType, customDate, periods)

### `DELETE /api/operations/:branchId/holiday-overrides/:id`

Remove override de feriado.

### `GET /api/operations/:branchId/special-dates`

Lista datas especiais da filial.

### `POST /api/operations/:branchId/special-dates`

Cria data especial.

**Body:** `specialDateSchema` (date, isClosed, is24h, periods)

### `DELETE /api/operations/:branchId/special-dates/:id`

Remove data especial.

---

## Holidays (protegido)

### `GET /api/holidays`

Lista todas as regras de feriado.

### `GET /api/holidays/date/:date`

Retorna feriados para uma data específica (formato `YYYY-MM-DD`).

### `POST /api/holidays`

Cria regra de feriado.

**Body:** `holidayRuleSchema` (name, date, scope, stateCode?, cityCode?, isRecurring, year?)

### `POST /api/holidays/seed/:year`

Popula feriados nacionais brasileiros para o ano informado.

### `DELETE /api/holidays/:id`

Remove regra de feriado.

---

## Erros

| Código | Significado |
|--------|-------------|
| 400 | Dados inválidos (Zod validation) |
| 401 | Não autenticado |
| 404 | Recurso não encontrado |
| 409 | Conflito (registro duplicado) |
| 500 | Erro interno do servidor |
| 503 | Erro de conexão com banco |

Formato padrão de erro:

```json
{ "error": "Mensagem descritiva", "details": [] }
```
