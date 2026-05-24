import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const SRC_DIR = join(process.cwd(), 'src');
const OUT_DIR = join(process.cwd(), 'docs', 'components');

// External / third-party module prefixes to skip
const EXTERNAL_PREFIXES = [
  'react', 'react-dom', 'react-router', 'react-router-dom',
  '@tanstack', 'tanstack',
  '@hono', 'hono',
  'clsx', 'lucide-react', 'sonner',
  '@/lib/', '@/hooks/', '@/types/', '@/dto/',
  '@/api/', '@/services/', '@/utils/', '@/repositories/',
  '@/useCases/', '@/mappers/', '@/models/', '@/providers/',
  '@/context/', '@/storage/', './', '../',
  'vi.', '@testing-library', 'vitest',
  '../../packages/ui/', './components/',
  '../../lib/', '../../hooks/', '../../types/', '../../dto/',
  '../../api/', '../../services/', '../../utils/',
];

function isExternal(importPath: string): boolean {
  if (!importPath) return true;
  // absolute relative paths starting with / are external to src
  if (importPath.startsWith('@/') || importPath.startsWith('/')) return false;
  // bare module specifiers (no / or .) are external
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) return true;
  return false;
}

function toImportLabel(raw: string): string {
  // strip alias { X } from "import { X } from '@/path'"
  const braceMatch = raw.match(/import\s+(?:\{([^}]+)\}|(\*\s+as\s+\w+)|\w+)\s+from\s+['"]([^'"]+)['"]/);
  if (!braceMatch) return '';
  const named = braceMatch[1] || '';
  const source = braceMatch[3] || '';
  if (named && !isExternal(source)) {
    return named.split(',').map(s => s.trim().split(/\s+as\s+/).pop()?.trim() || '').join(', ');
  }
  const nsExport = braceMatch[2];
  if (nsExport) {
    const name = nsExport.replace(/\s+as\s+/, '').trim();
    return name;
  }
  const direct = raw.match(/import\s+(\w+)\s+from\s+['"][^'"]+['"]/);
  if (direct) return direct[1];
  return '';
}

function toWkPath(source: string): string | null {
  // source path relative to the project, e.g. '../components/ui/Icon'
  // returns a path like "src/components/ui/Icon" or null if external
  if (isExternal(source)) return null;
  // normalize the source relative to project root
  // we only handle ../ and ./ relative paths
  return null; // we will handle this differently — by resolving actual file
}

function resolveComponentPath(source: string, fromFile: string): string | null {
  // Resolve relative import source to a .tsx/.ts file path relative to SRC_DIR
  // Returns path like 'components/ui/Icon' or null if can't resolve
  if (isExternal(source)) return null;
  const fromDir = join(fromFile, '..');
  // Node's require.resolve only works for installed packages, use simple resolution
  let resolved: string | null = null;
  const candidates = [
    join(fromDir, source + '.tsx'),
    join(fromDir, source + '.ts'),
    join(fromDir, source, 'index.tsx'),
    join(fromDir, source, 'index.ts'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) {
      resolved = relative(SRC_DIR, c).replace(/\\/g, '/');
      break;
    }
  }
  return resolved;
}

function componentNameFromPath(path: string): string {
  // e.g. 'components/ui/Icon' → 'Icon'
  const parts = path.split('/');
  const file = parts[parts.length - 1];
  return file.replace(/\.(tsx?|jsx?)$/, '');
}

function sectionLabelFromPath(path: string): string {
  // e.g. 'components/ui/Icon' → 'UI'
  const parts = path.split('/');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return 'root';
}

function guessComponentPurpose(filePath: string, source: string): string {
  // None — return empty, description will be inferred from name
  return '';
}

function collectImports(content: string, fromFile: string): { local: string[], external: string[] } {
  const local: string[] = [];
  const external: string[] = [];
  const importRegex = /import\s+(?:(?:\{([^}]+)\})|(\*\s+as\s+\w+)|\w+|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(content)) !== null) {
    const source = m[3] || '';
    if (isExternal(source)) {
      external.push(source);
    } else if (source) {
      const resolved = resolveComponentPath(source, fromFile);
      if (resolved) local.push(resolved);
    }
  }
  return { local, external };
}

function slugify(name: string): string {
  return name
    .replace(/\.(tsx?|jsx?)$/, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function buildWikilink(compPath: string): string {
  const name = componentNameFromPath(compPath);
  return `[[${name}]]`;
}

function buildTagFromPath(path: string): string {
  const parts = path.split('/');
  if (parts[0] === 'components') {
    if (parts[1]) return parts[1].toLowerCase(); // ui, commerce, navigation, location, address
  }
  if (parts[0] === 'layouts') return 'layout';
  if (parts[0] === 'providers') return 'provider';
  if (parts[0] === 'hooks') return 'hook';
  if (parts[0] === 'context') return 'context';
  if (parts[0] === 'pages') return 'page';
  if (parts[0] === 'modules') {
    const mod = parts[1] || '';
    return `module/${mod}`;
  }
  // Bare file in src/ root (no folder segment) — derive tag from filename
  if (parts.length === 1) return parts[0].replace(/\.(tsx?|jsx?)$/i, '').toLowerCase();
  return 'component';
}

function generateNote(
  relPath: string,
  content: string,
  allImports: Record<string, { local: string[]; external: string[] }>,
): string {
  const name = componentNameFromPath(relPath);
  const tag = buildTagFromPath(relPath);
  const frontmatterPath = relPath.replace(/\\/g, '/');
  const { local, external } = allImports[relPath] || { local: [], external: [] };

  const wikilinkedImports = local
    .filter(p => p !== relPath && p.endsWith('.tsx'))
    .map(p => buildWikilink(p))
    .join(' ');

  const tagLabel = tag === 'component' ? 'component' : tag;

  const descLine = external.length > 0
    ? `Dependências externas: ${external.join(', ')}.`
    : '';

  let note = `---
title: ${name}
path: ${frontmatterPath}
tags:
  - ${tagLabel}
---

# ${name}

> [!info] Visão Geral
> Componente do projeto **Flux Delivery**. Localizado em \`src/${frontmatterPath}\`.

${wikilinkedImports ? `## Dependências (componentes internos)\n\n${wikilinkedImports}\n` : ''}${descLine ? `## Dependências externas\n\n${descLine}\n` : ''}

## Propriedades / Props

_Defina aqui as props exportadas do componente._

## Uso

_Adicione exemplos de uso do componente aquí._

`;

  return note;
}

// ── Main ──────────────────────────────────────────────────────────────────

const ENTRY_FILES: string[] = [];
const ENTRY_DIRS = ['components', 'layouts', 'providers', 'context', 'hooks', 'pages', 'modules'];

const allFiles: string[] = [];

function walk(dir: string) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name.endsWith('.tsx')) {
      allFiles.push(full);
    }
  }
}

walk(SRC_DIR);

// Read all files and collect info
type FileInfo = { relPath: string; name: string; localImports: string[]; externalImports: string[] };
const fileInfos: FileInfo[] = [];
const importsMap: Record<string, { local: string[]; external: string[] }> = {};

for (const full of allFiles) {
  const relPath = relative(SRC_DIR, full).replace(/\\/g, '/');
  const raw = readFileSync(full, 'utf-8');
  const { local, external } = collectImports(raw, full);
  const name = componentNameFromPath(relPath);
  fileInfos.push({ relPath, name, localImports: local, externalImports: external });
  importsMap[relPath] = { local, external };
}

// Generate all notes
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

for (const fi of fileInfos) {
  const note = generateNote(fi.relPath, '', importsMap);
  const outName = fi.name + '.md';
  const outPath = join(OUT_DIR, outName);
  writeFileSync(outPath, note, 'utf-8');
}

// Sub-folder per section for organization
const sectionGroups: Record<string, string[]> = {};
for (const fi of fileInfos) {
  const sec = buildTagFromPath(fi.relPath);
  if (!sectionGroups[sec]) sectionGroups[sec] = [];
  sectionGroups[sec].push(fi.name);
}

// Generate master index
const sortedSections = Object.entries(sectionGroups).sort(([a], [b]) => a.localeCompare(b));

let indexContent = `---
title: Component Index
tags:
  - index
---

# Índice de Componentes

Mapa completo dos componentes React do projeto **Flux Delivery**, com wikilinks entre arquivos relacionados.

`;

for (const [section, names] of sortedSections) {
  indexContent += `## ${section.toUpperCase()}\n\n`;
  for (const n of names.sort()) {
    indexContent += `- [[${n}]]\n`;
  }
  indexContent += '\n';
}

indexContent += `---

_Índice gerado automaticamente — ${fileInfos.length} componentes documentados._\n`;

writeFileSync(join(OUT_DIR, '_index.md'), indexContent, 'utf-8');
writeFileSync(join(OUT_DIR, 'README.md'), indexContent, 'utf-8');

console.log(`✅ Generated ${fileInfos.length} Obsidian notes in docs/components/`);
