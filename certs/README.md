# Certificados locais

Este diretório armazena os certificados TLS gerados pelo **mkcert** para desenvolvimento local.

Os arquivos `*.pem` e `*.key` são ignorados pelo `.gitignore` (NUNCA commitar).

## Como gerar

```bash
npm run setup:dev
```

Isso executa:
1. `mkcert -install` — registra a CA local no trust store (requer admin, uma vez)
2. `mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1 ::1` — gera os certs

## Arquivos esperados

- `localhost.pem` — certificado público (válido 4 anos)
- `localhost-key.pem` — chave privada (NUNCA compartilhar)

## Renovação

A cada ~4 anos, ou se mudar de máquina, rode `npm run certs:generate` novamente.

Veja [`docs/HTTPS_SETUP.md`](../docs/HTTPS_SETUP.md) para detalhes completos.
