# HTTPS Setup

> Configuração de certificados locais (mkcert) e produção (Caddy + Let's Encrypt).

---

## 1. Desenvolvimento Local

### 1.1 Pré-requisitos

- **mkcert** — gera certificados locais assinados por uma CA confiável.
- **Chocolatey** (Windows) ou **Homebrew** (macOS/Linux).

### 1.2 Instalação do mkcert

| SO | Comando |
|----|---------|
| Windows (admin) | `choco install mkcert` |
| macOS | `brew install mkcert` |
| Linux (Debian) | `apt install mkcert` ou `brew install mkcert` |
| Binário direto | https://github.com/FiloSottile/mkcert/releases |

### 1.3 Setup único

```bash
# Instala a CA local no trust store do SO (UMA VEZ, requer admin)
npm run certs:install

# Gera os certs em ./certs/ (idempotente, válido 4 anos)
npm run certs:generate

# Ou ambos em um comando:
npm run setup:dev
```

Saída esperada:
```
The certificate is at "certs/localhost.pem" and the key at "certs/localhost-key.pem"
It will expire on 5 September 2028
```

### 1.4 Estrutura gerada

```
certs/
├── .gitignore        # Ignora *.pem e *.key, mantém a pasta no repo
├── localhost.pem     # Certificado público (commit-safe NÃO, ignorar)
└── localhost-key.pem # Chave privada (NUNCA commitar)
```

### 1.5 Rodar o dev server

```bash
npm install         # instala dependências
npm run dev         # inicia Vite (HTTPS :5173) + Hono (HTTP :3001)
```

Acesse: **https://localhost:5173** — sem aviso de "Não seguro".

### 1.6 O que mudou no `vite.config.ts`

- **Removido**: `import basicSsl from '@vitejs/plugin-basic-ssl'` e `basicSsl()` no array de plugins.
  - Motivo: `basicSsl` gera cert auto-assinado que o navegador não confia → bloqueia Service Workers (MSW), `geolocation`, `clipboard`, etc.
- **Adicionado**: `server.https: { key, cert }` lendo os arquivos de `certs/`.
- **Fail-fast**: se os certs não existirem, o Vite lança erro com instrução para rodar `npm run setup:dev`.

### 1.7 Troubleshooting

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `Error: ENOENT .../certs/localhost.pem` | Certs não gerados | `npm run certs:generate` |
| Aviso de "Não seguro" persiste no browser | CA do mkcert não instalada | `npm run certs:install` (reabrir o browser) |
| `mkcert` não reconhecido | Não está no PATH | Reinstalar via Chocolatey ou ajustar PATH |
| Service Worker do MSW ainda falha | Browser cache do cert antigo | Limpar cache do site em DevTools → Application → Storage |

---

## 2. Produção (Caddy + Let's Encrypt)

### 2.1 Por que Caddy?

- **HTTPS automático** via Let's Encrypt (zero config).
- **Renovação automática** de certificados (Caddy faz antes de expirar).
- **HTTP → HTTPS redirect** implícito.
- **HTTP/3** habilitado por padrão.
- **Reverse proxy** nativo, sem Nginx separado.

### 2.2 Instalação do Caddy

```bash
# Linux (Debian/Ubuntu)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# macOS
brew install caddy

# Docker
docker run -d --name caddy -p 80:80 -p 443:443 \
  -v $PWD/Caddyfile:/etc/caddy/Caddyfile:ro \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy:2
```

### 2.3 Configurar domínio

Edite `Caddyfile` na raiz do projeto e substitua `fluxdelivery.example.com` pelo domínio real:

```caddyfile
fluxdelivery.com.br, www.fluxdelivery.com.br {
    reverse_proxy /api/* localhost:3001 { ... }
    reverse_proxy localhost:3000 { ... }
}
```

### 2.4 Variáveis de ambiente (backend)

No `.env` do servidor de produção:

```bash
NODE_ENV=production
CORS_ORIGINS=https://fluxdelivery.com.br,https://www.fluxdelivery.com.br
JWT_SECRET=<gerar com: openssl rand -base64 64>
DATABASE_URL=postgresql://...
```

### 2.5 Implantação

```bash
# Validar sintaxe
caddy validate --config Caddyfile

# Rodar em foreground (debug)
caddy run --config Caddyfile

# Rodar como serviço systemd
sudo systemctl enable caddy
sudo systemctl start caddy

# Status
sudo systemctl status caddy
```

### 2.6 Renovação automática

Caddy renova certificados Let's Encrypt automaticamente **30 dias antes do vencimento**. Não requer ação manual.

Para verificar:
```bash
sudo caddy list-certs
```

### 2.7 Checklist de deploy

- [ ] DNS `A`/`AAAA` apontando para o IP do servidor
- [ ] Portas 80 e 443 liberadas no firewall/security group
- [ ] `Caddyfile` editado com domínio real
- [ ] `CORS_ORIGINS` no backend aponta para o domínio HTTPS
- [ ] `JWT_SECRET` único e forte
- [ ] `NODE_ENV=production`
- [ ] `npm run build` gerou `dist/`
- [ ] Backend escutando em `0.0.0.0:3001` (não `127.0.0.1`)
- [ ] Frontend servido via Node (porta 3000) ou estático puro em `/var/www/`
- [ ] `caddy validate` passa
- [ ] `https://fluxdelivery.com.br` responde com cadeado verde

---

## 3. Migração de `@vitejs/plugin-basic-ssl`

| Aspecto | Antes (basic-ssl) | Depois (mkcert) |
|---------|-------------------|-----------------|
| Tipo de cert | Auto-assinado (não confiável) | Assinado por CA local (confiável) |
| Service Workers (MSW) | Falha com SSL error | Funciona |
| Geolocation API | Pode bloquear | Funciona |
| Aviso "Não seguro" | Sempre | Nunca (em dev) |
| Config | `import basicSsl from '@vitejs/plugin-basic-ssl'` | `https: { key, cert }` no vite.config |
| Setup extra | Nenhum | `npm run setup:dev` (uma vez) |
| Renovação | Automática (a cada dev start) | Manual a cada ~4 anos |

---

## 4. Referências

- [mkcert](https://github.com/FiloSottile/mkcert)
- [Caddy Server](https://caddyserver.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Vite server.https](https://vite.dev/config/server-options.html#server-https)
