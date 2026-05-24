---
title: Kitchen Auto-Print Addon
aliases:
- Impressao Cozinha
- Auto Print
- Kitchen Printer
- Impressao Automatica
- Cozinha Addon
section: raw-sources
tags:
- domain/addon
---

# Kitchen Auto Print Addon

## Visão Geral

O addon **kitchen_auto_print** é um recurso premium que permite a impressão automática de pedidos na cozinha assim que são aceitos pelo restaurante. Este módulo utiliza arquitetura assíncrona e tolerante a falhas para garantir que a impressão ocorra sem bloquear o fluxo principal do pedido.

## Funcionalidades

- ✅ Impressão automática ao aceitar pedidos
- ✅ Feature gating por tenant (addon)
- ✅ Fila assíncrona de impressão
- ✅ Retry com backoff exponencial
- ✅ Idempotência (evita duplicidade)
- ✅ Logs estruturados JSON
- ✅ Suporte a impressoras ESC/POS
- ✅ Conexões: Rede (TCP/IP), USB, Bluetooth
- ✅ Histórico de impressões
- ✅ Status em tempo real (conectado, offline, erro)

## Arquitetura

```
┌─────────────────┐
│   Cliente       │
│   (Pedido)      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  API de Pedidos │
│  POST /:id/status  │
└────────┬────────┘
         │ status = 'accepted'
         v
┌─────────────────┐
│ Feature Gate    │
│ (Addon Check)   │
└────────┬────────┘
         │ Tem addon?
         v
┌─────────────────┐
│ PrintingService │
│ enqueuePrintJob │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Print Queue     │
│ (Banco de Dados)│
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Driver          │
│ (ESC/POS)       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Impressora      │
│ Térmica         │
└─────────────────┘
```

## Instalação e Configuração

### 1. Registrar o Addon

Executar o seed no banco de dados:

```bash
cd server
bun run src/db/seeds/kitchen-auto-print-addon.seed.ts
```

### 2. Ativar para Tenant

Pela API:

```bash
POST /subscription-addons/toggle
{
  "subscriptionId": "subscription-id",
  "addonId": "addon-kitchen-auto-print"
}
```

Ou pela interface administrativa (SubscriptionsPage).

### 3. Configurar Impressora

Acessar `/merchant/printer` e configurar:
- Tipo de conexão (rede, USB, Bluetooth)
- IP/Porta (para rede)
- Modelo (ESC/POS)
- Habilitar/desabilitar

## Uso

### Frontend

O addon aparece automaticamente no catálogo de capabilities:

```typescript
import { capabilityCatalog } from '@/modules/saas/capabilityCatalog';

const kitchenAutoPrint = capabilityCatalog.find(
  c => c.featureKey === 'kitchen_auto_print'
);
// kitchenAutoPrint.monthlyPrice === 49.00
```

### Backend

A validação é automática no endpoint de pedidos. Quando o status muda para `accepted`:

```typescript
// server/src/routes/orders.ts
if (status === 'accepted') {
  const hasAddon = await hasKitchenAutoPrintAddon(restaurantId);
  
  if (hasAddon) {
    await PrintingService.enqueuePrintJob(
      restaurantId,
      orderId,
      payload
    );
  }
}
```

## Estrutura de Dados

### Tabela: `addons`

```sql
CREATE TABLE addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2) NOT NULL,
  feature_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: `subscription_addons`

```sql
CREATE TABLE subscription_addons (
  subscription_id TEXT REFERENCES subscriptions(company_id),
  addon_id TEXT REFERENCES addons(id),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (subscription_id, addon_id)
);
```

### Tabela: `print_jobs`

```sql
CREATE TABLE print_jobs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  branch_id TEXT REFERENCES branches(id),
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  payload TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Reference

### Endpoints

#### `POST /orders/:id/status`

Muda o status de um pedido.

**Body:**
```json
{
  "status": "accepted"
}
```

**Feature Gating:** Se o tenant não tem o addon `kitchen_auto_print`, a impressão não é acionada.

#### `GET /printing/config/:branchId`

Obtém configuração de impressora de uma filial.

**Response:**
```json
{
  "branch_id": "branch-123",
  "printer_type": "network",
  "ip_address": "192.168.1.100",
  "port": 9100,
  "model": "ESC/POS",
  "enabled": true
}
```

#### `PUT /printing/config/:branchId`

Configura impressora para uma filial.

**Body:**
```json
{
  "printer_type": "network",
  "ip_address": "192.168.1.100",
  "port": 9100,
  "model": "ESC/POS",
  "enabled": true
}
```

#### `GET /printing/history/:branchId`

Histórico de impressões de uma filial.

**Response:**
```json
[
  {
    "id": "print-job-123",
    "order_id": "order-456",
    "status": "completed",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

## Observabilidade

### Logs Estruturados

O sistema gera logs JSON para:

```json
{
  "eventType": "kitchen_auto_print_triggered",
  "orderId": "order-123",
  "branchId": "branch-456",
  "jobId": "print-job-789",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Métricas

- ✅ Impressão enviada
- ✅ Impressão concluída
- ✅ Falha na impressão
- ✅ Retry realizado
- ✅ addon não ativo (skipped)

## Tratamento de Erros

### Retry Automático

- Máximo de 3 tentativas
- Backoff exponencial: `2^retry_count * 1000ms`
- Após falha, status muda para `failed`

### Fallback Controlado

Se a impressora falhar:
1. Job é marcado como `failed`
2. Log estruturado é gerado
3. Pedido continua normalmente (não bloqueia)
4. Histórico fica disponível para auditoria

## Segurança

### Validações

- ✅ Ownership do tenant
- ✅ Feature gating por addon
- ✅ Autenticação e autorização
- ✅ Validação de permissões

### Isolamento por Tenant

Cada tenant tem:
- Suas próprias configurações de impressora
- Seus próprios jobs de impressão
- Seu próprio histórico

## Testes

Executar testes:

```bash
cd server
bun test src/services/printing/__tests__/kitchen-auto-print.test.ts
```

### Casos de Teste

1. ✅ Enfileirar job de impressão
2. ✅ ID único por job
3. ✅ Falha sem impressora configurada
4. ✅ Retry em falha temporária
5. ✅ Feature gating (addon ativo/inativo)

## Troubleshooting

### Impressão não ocorre

1. Verificar se addon está ativo:
   ```sql
   SELECT * FROM subscription_addons 
   WHERE addon_id = 'addon-kitchen-auto-print';
   ```

2. Verificar configuração da impressora:
   ```sql
   SELECT * FROM printer_configs 
   WHERE branch_id = 'branch-id';
   ```

3. Verificar histórico de jobs:
   ```sql
   SELECT * FROM print_jobs 
   WHERE branch_id = 'branch-id' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### Erros Comuns

- **Printer not configured**: Configurar impressora em `/merchant/printer`
- **Addon not active**: Ativar addon via assinatura
- **Network timeout**: Verificar conexão de rede com impressora

## Limitações Conhecidas

- Suporte inicial apenas para ESC/POS
- Impressão USB requer driver no servidor
- Bluetooth requer pareamento prévio

## Roadmap

- [ ] Suporte a ZPL (Zebra)
- [ ] Fila distribuída (Redis)
- [ ] Webhook de confirmação
- [ ] Dashboard de métricas
- [ ] Impressão em múltiplas estações

## Licença

Addon premium - requer assinatura mensal ativa.

> [!tip] Navegação
> ← [[MOC Addons]] · [[PRINTING_ARCHITECTURE]]
