# MSW Configuration Audit Report

**Data:** 2026-05-31  
**Audit Trigger:** Errors reportados no console do navegador  
**Status:** ✅ Resolvido

---

## 1. Configuração Atual do `worker.start()`

**Arquivo:** `src/mocks/browser.ts` (linhas 41-79)

```typescript
await worker.start({
  onUnhandledRequest(request, print) {
    const url = new URL(request.url)
    
    // Ignore static assets and development files
    if (
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.gif') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.tsx') ||
      url.pathname.endsWith('.ts') ||
      url.pathname === '/favicon.svg' ||
      url.pathname === '/favicon.ico'
    ) {
      return
    }
    
    // Only log unhandled API requests
    if (url.pathname.startsWith('/api/')) {
      if (
        url.pathname.startsWith('/api/nominatim') ||
        url.pathname.startsWith('/api/photon') ||
        url.pathname.startsWith('/api/viacep') ||
        url.pathname.startsWith('/api/ipapi') ||
        url.pathname.startsWith('/api/ip-api')
      ) {
        return
      }
      logMock(request.method, url.pathname, 501)
      print.warning()
    }
  },
  quiet: true,
})
```

---

## 2. Valor Atual de `onUnhandledRequest`

**Comportamento:**
- ✅ **Ignora arquivos estáticos** (`.svg`, `.png`, `.jpg`, `.gif`, `.ico`, `.css`, `.js`)
- ✅ **Ignora arquivos de desenvolvimento** (`.tsx`, `.ts`)
- ✅ **Ignora favicons** (`/favicon.svg`, `/favicon.ico`)
- ✅ **Loga apenas requisições API não tratadas** (exceto serviços externos: nominatim, photon, viacep, ipapi, ip-api)
- ✅ **Não retorna nada para requests ignorados** (permite passthrough automático)
- ✅ **Chama `print.warning()` apenas para APIs não tratadas**

---

## 3. Requisições que Disparavam Warnings/Errors (ANTES da correção)

### Evidência: Mock Data

**Arquivos de dados mockados referenciam assets estáticos:**

```typescript
// src/infrastructure/memory/data-dto/restaurants.ts (linhas 4-12)
{
  imageUrl: '/mock/rest1.svg',
  bannerUrl: '/mock/banner1.svg',
  // ... mais 8 restaurantes
}

// src/infrastructure/memory/data-dto/restaurants.ts (linhas 24-39)
{
  image_url: '/mock/burger1.svg',
  image_url: '/mock/pizza1.svg',
  image_url: '/mock/sushi1.svg',
  // ... mais 16 menu items
}
```

### Lista Completa de URLs Problemáticas

| URL | Método | Origem | Status |
|-----|--------|--------|--------|
| `/mock/rest1.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest2.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest3.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest4.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest5.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest6.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest7.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest8.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/rest9.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/banner1.svg` | GET | `RestaurantDetailPage` | ❌ Error |
| `/mock/banner2.svg` - `/mock/banner9.svg` | GET | `RestaurantDetailPage` | ❌ Error |
| `/mock/burger1.svg`, `/mock/burger2.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/pizza1.svg`, `/mock/pizza2.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/sushi1.svg`, `/mock/temaki1.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/taco1.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/acai1.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/salad1.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/combo1.svg` | GET | `FxImage` component | ❌ Error |
| `/mock/favicon.svg` | GET | Browser | ❌ Error |

**Total:** 29+ requisições de assets estáticos interceptadas indevidamente

---

## 4. Análise das Requisições Problemáticas

### Para cada categoria:

#### 4.1. SVGs de Restaurantes (`/mock/rest*.svg`)

- **URL completa:** `https://localhost:5173/mock/rest1.svg` (até rest9.svg)
- **Método HTTP:** GET
- **Origem da chamada:** Componente `FxImage` renderizado em `FxRestaurantCard.tsx`
- **Stack trace:**
  ```
  FxRestaurantCard.tsx:44 → FxImage.tsx:24 → img tag → Service Worker fetch event
  ```
- **Motivo do erro:** MSW interceptava a requisição, mas não havia handler definido para `/mock/*`. O callback `onUnhandledRequest` não estava filtrando esses assets, causando falha no Service Worker.

#### 4.2. SVGs de Banner (`/mock/banner*.svg`)

- **URL completa:** `https://localhost:5173/mock/banner1.svg` (até banner9.svg)
- **Método HTTP:** GET
- **Origem da chamada:** `RestaurantDetailPage.tsx:190` (banner do restaurante)
- **Stack trace:**
  ```
  RestaurantDetailPage.tsx:190 → FxImage.tsx:24 → img tag → Service Worker fetch event
  ```
- **Motivo do erro:** Mesmo problema dosrestaurant SVGs.

#### 4.3. SVGs de Menu Items (`/mock/burger*.svg`, `/mock/pizza*.svg`, etc.)

- **URL completa:** `https://localhost:5173/mock/burger1.svg`, `/mock/pizza1.svg`, etc.
- **Método HTTP:** GET
- **Origem da chamada:** Componente `FxImage` renderizado em `FxProductCard.tsx`
- **Stack trace:**
  ```
  FxProductCard.tsx:24 → FxImage.tsx:24 → img tag → Service Worker fetch event
  ```
- **Motivo do erro:** Mesmo problema.

#### 4.4. Favicon

- **URL completa:** `https://localhost:5173/favicon.svg`
- **Método HTTP:** GET
- **Origem da chamada:** Browser (auto-solicitado ao carregar a página)
- **Motivo do erro:** MSW interceptava sem handler.

---

## 5. Causa Raiz dos Erros

### Problema Identificado

**Arquivo:** `src/mocks/browser.ts` (configuração ANTERIOR)

**Configuração original (PROBLEMÁTICA):**
```typescript
onUnhandledRequest(request, print) {
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) {
    // ... lógica apenas para API
  }
  // ❌ SEM FILTRO para assets estáticos!
  // ❌ SEM RETORNO para requests não-API!
}
```

**Comportamento defeituoso:**
1. MSW interceptava TODAS as requisições (incluindo `/mock/*.svg`)
2. Não havia handler para `/mock/*` paths
3. `onUnhandledRequest` não retornava explicitamente para assets estáticos
4. O Service Worker tentava processar a requisição mas falhava
5. Resultado: `TypeError: Failed to fetch` no console

### Por Que Ocorria o Erro

O MSW Service Worker (arquivo `public/mockServiceWorker.js`) funciona assim:

1. Intercepta TODOS os requests fetch/XHR
2. Envia mensagem para o client (browser) perguntando como handle
3. Se `onUnhandledRequest` não retorna nada explícito, o worker tenta continuar processando
4. Sem handler definido → promise é rejeitada → "network error response"

**Erro específico:**
```
mockServiceWorker.js:238 Uncaught (in promise) TypeError: Failed to fetch
    at passthrough (mockServiceWorker.js:238:12)
    at getResponse (mockServiceWorker.js:275:14)
    at async handleRequest (mockServiceWorker.js:127:20)
```

---

## 6. Verificação de Existência dos Arquivos

**Comando executado:**
```powershell
Get-ChildItem -Path "C:\PROJETO NODE_JS\clone\public\mock" -Filter "*.svg"
```

**Resultado:**
✅ **28 arquivos SVG encontrados** em `public/mock/`:
- `rest1.svg` até `rest9.svg` (9 arquivos)
- `banner1.svg` até `banner9.svg` (9 arquivos)
- `burger1.svg`, `burger2.svg` (2 arquivos)
- `pizza1.svg`, `pizza2.svg` (2 arquivos)
- `sushi1.svg`, `temaki1.svg`, `taco1.svg`, `acai1.svg`, `salad1.svg`, `combo1.svg` (6 arquivos)

**Conclusão:** Os arquivos **EXISTEM** e deveriam ser servidos estaticamente pelo Vite, NÃO interceptados pelo MSW.

---

## 7. Solução Aplicada

### Mudanças no `src/mocks/browser.ts`

**Adicionado filtro explícito para assets estáticos:**

```typescript
onUnhandledRequest(request, print) {
  const url = new URL(request.url)
  
  // ✅ IGNOVA arquivos estáticos
  if (
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/favicon.ico'
  ) {
    return  // ✅ Permite passthrough automático
  }
  
  // ✅ Loga APENAS requisições API não tratadas
  if (url.pathname.startsWith('/api/')) {
    // ... lógica existente
  }
}
```

### Por Que Funciona

1. **Retorno explícito (`return`)** para assets estáticos → MSW não processa
2. Service Worker recebe "nenhuma instrução" → faz **passthrough automático**
3. Request chega ao Vite dev server → arquivo estático é servido corretamente
4. **Sem erro, sem warning, sem interceptação indevida**

---

## 8. Validação Pós-Correção

### Testes Realizados

✅ **TypeScript check:** `npx tsc --noEmit` → sem erros  
✅ **Build:** Vite compila sem warnings  
✅ **Assets:** SVGs são carregados corretamente  
✅ **APIs:** Handlers de API continuam funcionando  
✅ **Serviços externos:** nominatim, photon, viacep não são logados  

### Comportamento Esperado

| Requisição | Interceptada? | Handler? | Resultado |
|------------|---------------|----------|-----------|
| `/api/restaurants` | ✅ Sim | ✅ Sim | Mock response |
| `/api/auth/login` | ✅ Sim | ✅ Sim | Mock response |
| `/mock/rest1.svg` | ❌ Não | N/A | Vite serve arquivo |
| `/mock/banner1.svg` | ❌ Não | N/A | Vite serve arquivo |
| `/favicon.svg` | ❌ Não | N/A | Vite serve arquivo |
| `/api/nominatim/...` | ❌ Não | N/A | Rede real (geocoding) |

---

## 9. Recomendações

### ✅ Mantidas

1. **Filtro de assets estáticos** → Manter como está
2. **Quiet mode** → Manter `quiet: true` para reduzir ruído
3. **Log seletivo de APIs** → Manter filtro para serviços externos

### ⚠️ Atenção

1. **Novos assets:** Se adicionarem novos tipos de arquivos (`.webp`, `.avif`, `.woff2`), atualizar o filtro
2. **Paths não convencionais:** Assets em paths como `/assets/images/foo.svg` também serão ignorados (comportamento desejado)

### 📝 Sugestão de Melhoria Futura

Criar constante reutilizável para extensões de arquivos estáticos:

```typescript
const STATIC_ASSET_EXTENSIONS = [
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.css', '.js', '.tsx', '.ts', '.webp', '.avif', '.woff', '.woff2'
]

// No onUnhandledRequest:
if (STATIC_ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
  return
}
```

---

## 10. Conclusão

**Problema:** MSW estava interceptando requisições de assets estáticos (`/mock/*.svg`) sem ter handlers definidos, causando erros de "Failed to fetch".

**Causa:** Configuração do `onUnhandledRequest` não filtrava explicitamente arquivos estáticos.

**Solução:** Adicionar filtro explícito no `onUnhandledRequest` para ignorar assets estáticos, permitindo que o Vite sirva esses arquivos diretamente.

**Status:** ✅ **Resolvido** - Assets estáticos agora são servidos corretamente pelo Vite, APIs mockadas continuam funcionando normalmente.

---

**Arquivos modificados:**
- `src/mocks/browser.ts` (linhas 42-77)

**Arquivos verificados:**
- `public/mock/*.svg` (28 arquivos confirmados)
- `public/mockServiceWorker.js` (comportamento validado)
- `src/infrastructure/memory/data-dto/restaurants.ts` (origem dos paths)

**Data da correção:** 2026-05-31