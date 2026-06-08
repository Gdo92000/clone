import { networkInterfaces } from 'node:os';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const certsDir = join(projectRoot, 'certs');
const keyPath = join(certsDir, 'localhost-key.pem');
const certPath = join(certsDir, 'localhost.pem');

if (!existsSync(certsDir)) mkdirSync(certsDir, { recursive: true });

function getLanHosts() {
  const hosts = new Set(['localhost', '127.0.0.1', '::1']);
  const ifaces = networkInterfaces();
  for (const [, list] of Object.entries(ifaces)) {
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === 'IPv4' && !iface.internal) {
        hosts.add(iface.address);
      }
    }
  }
  return [...hosts];
}

const hosts = getLanHosts();
console.log('[certs:generate] Hosts detectados:', hosts.join(', '));

try {
  execSync('mkcert -install', { stdio: 'inherit' });
} catch (err) {
  console.warn('[certs:generate] mkcert -install falhou (pode já estar instalado). Continuando...');
}

const cmd = `mkcert -cert-file "${certPath}" -key-file "${keyPath}" ${hosts.join(' ')}`;
console.log('[certs:generate]', cmd);
execSync(cmd, { stdio: 'inherit', cwd: projectRoot });
console.log(`[certs:generate] Certificados gerados em: ${certsDir}`);
console.log(`[certs:generate] Acesse pelo celular: https://<ip-lan>:5173/`);
