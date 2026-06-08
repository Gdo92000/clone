# Kernel Override Log

Log cronológico de pedidos de override para arquivos imutáveis.

Formato recomendado: `## [YYYY-MM-DD HH:MM] tipo | arquivo | motivo`

Exemplo:
```
## [2026-05-28 10:30] OVERRIDE_APPROVED | docs/.../FILE.md | Aumento de timeout para operações longas
```

## Entradas

<!-- Adicionar novas entradas no topo -->

## Consulta

Para ver作为 últimas entradas (se houver):
```bash
grep "^## \[" log.md | head -5
```

Este log é parte do kernel e deve ser mantido como EPHEMERAL (pode ser truncado, mas preservar histórico recente).
