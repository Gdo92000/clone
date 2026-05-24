---
type: system
status: active
domain: obsidian
layer: memory
semantic_priority: 5
tags:
  - type/system
  - domain/obsidian
  - tech/rag
created_at: 2026-05-24
updated_at: 2026-05-24
related:
  - System Index
  - GRAPH_HEALTH
  - RETRIEVAL_RULES
  - VECTOR_SEARCH
  - MEMORY_LIFECYCLE
  - ORPHAN_REPORT
  - AUTO_LINKING
---

# Semantic Index

Hub central do grafo semântico do vault. Authority note sobre estrutura do grafo, hubs, taxonomia, metadata e regras de MOC. Use para navegação contextual por IA/RAG.

> [!info] Propósito
> Authority note para navegação contextual. Para entry point estrutural, use [[System Index]].

## AI Operational Memory Layer

O vault Obsidian é a camada de memória operacional persistente do agente:

- **Continuidade entre sessões**: cada sessão lê [[CURRENT_STATE]] + [[MEMORY]] para restaurar contexto completo do estado anterior
- **Recuperação contextual**: notas são interligadas por wikilinks formando um grafo semântico navegável por domínio, perfil e camada
- **Persistência cognitiva**: decisões, investigações e descobertas são registradas como notas permanentes, não apenas no histórico do chat
- **Graph-based retrieval**: o grafo de wikilinks permite navegação associativa entre domínios, perfis e decisões arquiteturais

## Hubs semânticos

| Hub | Tipo | Domínio | Prioridade |
|-----|------|---------|------------|
| [[MOC Architecture]] | MOC | architecture | 5 |
| [[MOC Frontend]] | MOC | frontend | 4 |
| [[MOC Backend]] | MOC | backend | 4 |
| [[MOC Auth]] | MOC | auth | 4 |
| [[MOC Delivery Flow]] | MOC | delivery | 5 |
| [[MOC Database]] | MOC | database | 3 |
| [[MOC Testing]] | MOC | testing | 3 |
| [[MOC Addons]] | MOC | addons | 2 |
| [[MOC SaaS]] | MOC | saas | 3 |
| [[MOC Merchant]] | MOC | merchant | 4 |
| [[MOC Courier]] | MOC | courier | 4 |
| [[MOC Admin]] | MOC | admin | 3 |
| [[MOC SuperAdmin]] | MOC | superadmin | 3 |
| [[MOC RAG]] | MOC | rag | 2 |
| [[MOC Obsidian System]] | MOC | obsidian | 5 |

### Hierarquia de hubs semânticos

| Propriedade | `_index.md` | MOC semântico |
|-------------|-------------|---------------|
| Propósito | Navegação estrutural | Navegação contextual |
| Agrupamento | Por diretório físico | Por domínio/conceito |
| Escopo | Local (um diretório) | Global (todo o vault) |
| Audiência | Humana | Humana + IA/RAG |

- **`_index.md`** — índice estrutural. Organização hierárquica por localização física no diretório.
- **MOC semântico** — organização por domínio. Conecta notas relacionadas independente de localização.

### Regras formais dos MOCs

1. Todo domínio principal deve possuir um MOC central em `docs/obsidian/mocs/`.
2. MOCs são semantic hubs e authority notes — fonte primária de verdade sobre o domínio.
3. Toda nota importante deve apontar para ao menos um MOC via wikilink.
4. MOCs reduzem orphan notes e fragmentação semântica ao centralizar referências.
5. MOCs servem como:
   - **Semantic routers**: direcionam navegação por domínio
   - **Retrieval entrypoints**: ponto de entrada para consultas RAG
   - **Contextual hubs**: agrupam notas por contexto semântico
   - **Canonical navigation layers**: camada canônica de navegação
6. MOCs melhoram embeddings, semantic search, RAG retrieval, token economy e continuidade contextual.

### Metadata de MOC

Frontmatter obrigatório para todo MOC em `docs/obsidian/mocs/`:

```md
---
type: moc
domain: [domínio de negócio]
semantic_priority: 1-5
related_mocs: [MOCs relacionados]
status: active|idle|concluded|archived
---
```

## Authority notes

| Nota | Domínio | Escopo |
|------|---------|--------|
| [[System Index]] | obsidian | Catálogo do sistema semântico |
| [[SEMANTIC_INDEX]] | obsidian | Mapa do grafo semântico |
| [[GRAPH_HEALTH]] | obsidian | Métricas de conectividade |
| [[RETRIEVAL_RULES]] | obsidian | Regras de retrieval |
| [[MEMORY_LIFECYCLE]] | obsidian | Ciclo de vida da memória |
| [[AGENTS|AGENTS.md]] | core | Instruções do agente |

## Principais clusters

| Cluster | MOC central |
|---------|-------------|
| Arquitetura | [[MOC Architecture]] |
| Frontend | [[MOC Frontend]] |
| Backend | [[MOC Backend]] |
| Auth | [[MOC Auth]] |
| Delivery | [[MOC Delivery Flow]] |
| Merchant | [[MOC Merchant]] |
| Courier | [[MOC Courier]] |
| Admin | [[MOC Admin]] |
| SuperAdmin | [[MOC SuperAdmin]] |
| SaaS | [[MOC SaaS]] |
| Addons | [[MOC Addons]] |
| Database | [[MOC Database]] |
| Testes | [[MOC Testing]] |
| RAG | [[MOC RAG]] |
| Obsidian | [[MOC Obsidian System]] |

## Taxonomia oficial de tags

Todas as tags devem seguir o padrão `namespace/valor`:

| Namespace | Propósito | Exemplos |
|-----------|-----------|----------|
| `profile/*` | Perfil de usuário | `profile/merchant`, `profile/courier`, `profile/admin` |
| `domain/*` | Domínio de negócio | `domain/auth`, `domain/delivery`, `domain/payments` |
| `type/*` | Tipo de nota | `type/state`, `type/knowledge`, `type/adr`, `type/worklog` |
| `layer/*` | Camada arquitetural | `layer/L1`, `layer/L2`, `layer/L3`, `layer/api` |
| `tech/*` | Tecnologia envolvida | `tech/react`, `tech/hono`, `tech/drizzle`, `tech/tailwind` |
| `guide/*` | Tipo de guia | `guide/architecture`, `guide/api`, `guide/testing` |

Regras:
- proibido duplicação semântica (ex: `auth` + `domain/auth` na mesma nota — usar apenas `domain/auth`)
- proibido inconsistência singular/plural (usar `domain/auth`, não `domains/auth` ou `domain/auths`)
- proibido mistura de case (usar `profile/merchant`, não `profile/Merchant` ou `profile/MERCHANT`)
- evitar tags genéricas (preferir `tech/react` a `react` ou `frontend`)
- toda nota deve ter ao menos uma tag `type/*`
- tags hierárquicas são preferenciais a tags planas

## Semantic routing

O roteamento semântico segue: domínio → MOC → authority note → nota específica.

```
domínio → MOC → authority note → nota
```

## Metadata expandido

> [!example] Frontmatter padrão
> Campos `domain`, `layer`, `moc`, `semantic_priority` são definidos por este índice.

Frontmatter obrigatório expandido — aplicável a toda nota nova:

```md
---
type: knowledge|worklog|adr|state|memory
status: active|idle|concluded|archived
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
domain: [domínio de negócio]
profile: [perfil relacionado, se aplicável]
layer: [camada arquitetural L1-L6]
tech: [tecnologia principal]
moc: [MOC pai, se aplicável]
semantic_priority: 1-5
related: [arquivos relacionados]
supersedes: [nota substituída, se aplicável]
source: [fonte original, se conteúdo importado]
---
```

Campos obrigatórios:
- `type`, `status`, `created_at`, `updated_at` — obrigatórios em toda nota
- `domain`, `layer`, `tech`, `semantic_priority` — obrigatórios em knowledge/ADR
- `source` — obrigatório em conteúdo importado via defuddle
- `moc` — recomendado para notas filhas de um MOC semântico

## Workflow de criação de notas

1. Nova nota criada
2. Classificar domínio principal
3. Associar ao MOC correspondente via wikilink no conteúdo
4. Registrar backlinks para notas relacionadas
5. Atualizar o MOC se a nota adicionar novo aspecto ao domínio

## Related system notes

- [[System Index]] — Entry point do sistema semântico
- [[System _index]] — Índice estrutural do diretório system/
- [[MOC _index]] — Índice estrutural do diretório mocs/
- [[GRAPH_HEALTH]] — Métricas de conectividade do grafo
- [[RETRIEVAL_RULES]] — Regras de prioridade e ranking
- [[MEMORY_LIFECYCLE]] — Ciclo de vida da memória
- [[ORPHAN_REPORT]] — Detecção de notas órfãs
- [[AUTO_LINKING]] — Heurísticas de linking
