#!/usr/bin/env node
/**
 * memory-lint.ts — Memory v2 Phase 2 + Phase 3
 *
 * Valida todos os manifests em .opencode/capabilities/ contra .opencode/capabilities/_schema.json.
 * Regras:
 *   1. Schema compliance (campos obrigatórios, tipos, ranges)
 *   2. Disjunção: hot ∩ warm = ∅, hot ∩ cold = ∅, warm ∩ cold = ∅
 *   3. Existência: paths em hot_docs e warm_docs DEVEM existir; cold_docs é OK se não existir
 *   4. Cold coverage: paths em cold_storage_skip (profile.json) DEVEM aparecer em cold_docs
 *      de todos os manifests que não os listam em hot/warm
 *   5. output_budget obrigatório e dentro dos limites da policy global
 *      (output-budget.policy.json: defaults, minimums, maximums, booleans_required_true)
 *
 * Uso:
 *   tsx scripts/memory/lint.ts                 # valida tudo
 *   tsx scripts/memory/lint.ts <manifest>      # valida 1 manifest
 *   tsx scripts/memory/lint.ts --strict        # falha em warning
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, basename, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { emit as emitTelemetry } from "./telemetry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const CAPS_DIR = resolve(ROOT, ".opencode/capabilities");
const SCHEMA_PATH = resolve(CAPS_DIR, "_schema.json");
const PROFILE_PATH = resolve(ROOT, ".opencode/profile.json");
const POLICY_PATH = resolve(ROOT, ".opencode/memory/policies/output-budget.policy.json");

type Level = "hot_docs" | "warm_docs" | "cold_docs";
type LintIssue = { level: "error" | "warning"; manifest: string; rule: string; msg: string };

interface OutputBudgetPolicy {
  policy_id: string;
  version: string;
  description?: string;
  defaults: Record<string, number | boolean>;
  minimums: Record<string, number | boolean>;
  maximums?: Record<string, number>;
  booleans_required_true: string[];
}

interface Manifest {
  capability: string;
  description?: string;
  version: string;
  max_bootstrap_tokens: number;
  max_working_tokens: number;
  max_retrieval_depth: number;
  hot_docs: string[];
  warm_docs: string[];
  cold_docs: string[];
  allowed_skills: string[];
  output_budget: {
    max_preamble_chars: number;
    no_repeat_user_input: boolean;
    prefer_tables: boolean;
    max_items_before_summary: number;
    truncate_grep_at?: number;
  };
}

function walkRepo(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === ".opencode" || entry === ".kilo" || entry === ".zed" || entry === ".windsurf" || entry === ".roo" || entry === ".obsidian") continue;
    const p = resolve(dir, entry);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walkRepo(p, acc);
    else if (s.isFile()) acc.push(p);
  }
  return acc;
}

const ALL_FILES: string[] = walkRepo(ROOT);
const REL_FILES: string[] = ALL_FILES.map((p) => relative(ROOT, p).replace(/\\/g, "/"));

function globToRegex(glob: string): RegExp {
  let re = "^";
  let i = 0;
  while (i < glob.length) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      re += ".*";
      i += 2;
      if (glob[i] === "/") i++;
    } else if (c === "*") {
      re += "[^/]*";
      i++;
    } else if (c === "?") {
      re += "[^/]";
      i++;
    } else if (".+^$()|{}[]\\".includes(c)) {
      re += "\\" + c;
      i++;
    } else {
      re += c;
      i++;
    }
  }
  re += "$";
  return new RegExp(re);
}

function matchGlob(pattern: string, paths: string[]): string[] {
  const re = globToRegex(pattern);
  return paths.filter((p) => re.test(p));
}

function isGlobFamily(path: string): boolean {
  return /[*?]/.test(path);
}

function manifestExists(path: string): { exists: boolean; isFamily: boolean; matches: number } {
  const normalized = path.replace(/\//g, sep);
  const abs = resolve(ROOT, normalized);
  if (existsSync(abs)) return { exists: true, isFamily: false, matches: 1 };
  if (isGlobFamily(path)) {
    const matches = matchGlob(path, REL_FILES);
    return { exists: matches.length > 0, isFamily: true, matches: matches.length };
  }
  return { exists: false, isFamily: false, matches: 0 };
}

function validateManifest(data: unknown, issues: LintIssue[], manifestName: string): data is Manifest {
  if (typeof data !== "object" || data === null) {
    issues.push({ level: "error", manifest: manifestName, rule: "schema", msg: "manifest não é objeto" });
    return false;
  }
  const m = data as Record<string, unknown>;
  const errors: string[] = [];

  // Required string fields
  for (const f of ["capability", "version"] as const) {
    if (typeof m[f] !== "string" || (m[f] as string).length === 0) errors.push(`${f} obrigatório`);
  }
  if (typeof m.capability === "string" && !/^[a-z][a-z0-9-]*$/.test(m.capability)) {
    errors.push(`capability fora do padrão kebab-case: ${m.capability}`);
  }
  if (typeof m.version === "string" && !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(m.version)) {
    errors.push(`version fora do padrão semver: ${m.version}`);
  }

  // Required integer fields
  for (const f of ["max_bootstrap_tokens", "max_working_tokens", "max_retrieval_depth"] as const) {
    if (typeof m[f] !== "number" || !Number.isInteger(m[f])) errors.push(`${f} deve ser integer`);
  }
  if (typeof m.max_retrieval_depth === "number" && (m.max_retrieval_depth < 1 || m.max_retrieval_depth > 5)) {
    errors.push(`max_retrieval_depth fora de [1,5]: ${m.max_retrieval_depth}`);
  }

  // Required array fields
  for (const f of ["hot_docs", "warm_docs", "cold_docs", "allowed_skills"] as const) {
    if (!Array.isArray(m[f])) errors.push(`${f} deve ser array`);
  }
  if (Array.isArray(m.hot_docs) && m.hot_docs.length > 5) errors.push("hot_docs > 5 items (deve ser raro)");

  // output_budget
  const ob = m.output_budget as Record<string, unknown> | undefined;
  if (!ob || typeof ob !== "object") {
    errors.push("output_budget obrigatório");
  } else {
    if (typeof ob.max_preamble_chars !== "number") errors.push("output_budget.max_preamble_chars obrigatório");
    if (typeof ob.no_repeat_user_input !== "boolean") errors.push("output_budget.no_repeat_user_input obrigatório");
    if (typeof ob.prefer_tables !== "boolean") errors.push("output_budget.prefer_tables obrigatório");
    if (typeof ob.max_items_before_summary !== "number") errors.push("output_budget.max_items_before_summary obrigatório");
  }

  for (const e of errors) {
    issues.push({ level: "error", manifest: manifestName, rule: "schema", msg: e });
  }
  return errors.length === 0;
}

function checkDisjunction(m: Manifest, issues: LintIssue[], manifestName: string): void {
  const sets: Record<Level, Set<string>> = {
    hot_docs: new Set(m.hot_docs),
    warm_docs: new Set(m.warm_docs),
    cold_docs: new Set(m.cold_docs),
  };
  const overlap = (a: Level, b: Level): string | null => {
    for (const x of sets[a]) if (sets[b].has(x)) return x;
    return null;
  };
  const o1 = overlap("hot_docs", "warm_docs");
  if (o1) issues.push({ level: "error", manifest: manifestName, rule: "disjunction", msg: `hot_docs ∩ warm_docs: ${o1}` });
  const o2 = overlap("hot_docs", "cold_docs");
  if (o2) issues.push({ level: "error", manifest: manifestName, rule: "disjunction", msg: `hot_docs ∩ cold_docs: ${o2}` });
  const o3 = overlap("warm_docs", "cold_docs");
  if (o3) issues.push({ level: "error", manifest: manifestName, rule: "disjunction", msg: `warm_docs ∩ cold_docs: ${o3}` });
}

function checkExistence(m: Manifest, issues: LintIssue[], manifestName: string): void {
  for (const p of m.hot_docs) {
    const r = manifestExists(p);
    if (!r.exists) {
      issues.push({ level: "error", manifest: manifestName, rule: "existence", msg: `hot_docs path não existe: ${p}` });
    }
  }
  for (const p of m.warm_docs) {
    const r = manifestExists(p);
    if (!r.exists) {
      if (r.isFamily) {
        issues.push({ level: "warning", manifest: manifestName, rule: "existence", msg: `warm_docs family sem matches atuais: ${p} (intencional para docs futuros?)` });
      } else {
        issues.push({ level: "error", manifest: manifestName, rule: "existence", msg: `warm_docs path não existe: ${p}` });
      }
    }
  }
}

function checkColdCoverage(m: Manifest, profile: { loading_rules: { cold_storage_skip: string[] } }, issues: LintIssue[], manifestName: string): void {
  // Cada path em cold_storage_skip que NÃO esteja em hot_docs/warm_docs DEVE estar em cold_docs
  const skip = profile.loading_rules.cold_storage_skip;
  const referenced = new Set([...m.hot_docs, ...m.warm_docs, ...m.cold_docs]);
  for (const skipPath of skip) {
    // Se o manifest não toca esse path (nem hot, nem warm, nem cold), é OK
    // Se o manifest toca, mas só em cold_docs → OK
    // Se o manifest toca em hot ou warm → ERRO (deveria ser cold)
    for (const ref of [skipPath, skipPath.replace(/\/$/, "") + "/**"]) {
      if (m.hot_docs.some((p) => p.includes(skipPath.replace(/\/$/, "")))) {
        issues.push({ level: "error", manifest: manifestName, rule: "cold-coverage", msg: `hot_docs referencia path em cold_storage_skip: ${skipPath}` });
        return;
      }
      if (m.warm_docs.some((p) => p.includes(skipPath.replace(/\/$/, "")))) {
        issues.push({ level: "error", manifest: manifestName, rule: "cold-coverage", msg: `warm_docs referencia path em cold_storage_skip: ${skipPath}` });
        return;
      }
    }
  }
}

function checkDeprecation(m: Manifest, raw: Record<string, unknown>, issues: LintIssue[], manifestName: string): void {
  if ("allowed_docs_patterns" in raw || "forbidden_docs_patterns" in raw || "forbidden_skills" in raw) {
    issues.push({
      level: "error",
      manifest: manifestName,
      rule: "deprecation",
      msg: "campos legados detectados (allowed_docs_patterns/forbidden_docs_patterns/forbidden_skills). Use hot_docs/warm_docs/cold_docs.",
    });
  }
  // allowed_skills vazio é warning
  if (m.allowed_skills.length === 0) {
    issues.push({ level: "warning", manifest: manifestName, rule: "skills", msg: "allowed_skills vazio" });
  }
}

function checkOutputBudget(m: Manifest, policy: OutputBudgetPolicy | null, issues: LintIssue[], manifestName: string): void {
  if (!policy) {
    // policy ausente é só warning (não bloqueia dev local)
    issues.push({ level: "warning", manifest: manifestName, rule: "output_budget", msg: "policy global ausente, pulando validação" });
    return;
  }
  const b = m.output_budget;

  // booleans_required_true
  for (const f of policy.booleans_required_true) {
    if (typeof (b as Record<string, unknown>)[f] === "boolean" && (b as Record<string, unknown>)[f] === false) {
      issues.push({ level: "error", manifest: manifestName, rule: "output_budget", msg: `${f}=false viola policy (obrigatório true)` });
    }
  }

  // minimums (numéricos e booleanos)
  for (const [f, min] of Object.entries(policy.minimums)) {
    const v = (b as Record<string, unknown>)[f];
    if (typeof v === "number" && typeof min === "number" && v < min) {
      issues.push({ level: "error", manifest: manifestName, rule: "output_budget", msg: `${f}=${v} abaixo do mínimo ${min}` });
    }
  }

  // maximums (numéricos)
  if (policy.maximums) {
    for (const [f, max] of Object.entries(policy.maximums)) {
      const v = (b as Record<string, unknown>)[f];
      if (typeof v === "number" && typeof max === "number" && v > max) {
        issues.push({ level: "error", manifest: manifestName, rule: "output_budget", msg: `${f}=${v} acima do máximo ${max}` });
      }
    }
  }

  // defaults: NAO ha warning por estar abaixo do default.
  // Minimums ja impedem que o budget seja tao apertado que prejudique clareza.
  // Maximums ja impedem que seja tao generoso que prejudique economia.
  // Estar entre [min, default] = escolha de design, nao violacao.
  // policy.defaults continua existindo no JSON para documentacao e como
  // fill-in value em `npm run memory:manifest --create` (futuro).
}

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const onlyArg = args.find((a) => !a.startsWith("--"));
  const target = onlyArg ? resolve(CAPS_DIR, onlyArg) : null;
  const startedAt = Date.now();

  if (!existsSync(SCHEMA_PATH)) {
    console.error(`[memory-lint] ERRO: schema não encontrado: ${SCHEMA_PATH}`);
    process.exit(1);
  }
  if (!existsSync(PROFILE_PATH)) {
    console.error(`[memory-lint] ERRO: profile.json não encontrado: ${PROFILE_PATH}`);
    process.exit(1);
  }
  const profile = JSON.parse(readFileSync(PROFILE_PATH, "utf-8"));

  let policy: OutputBudgetPolicy | null = null;
  if (existsSync(POLICY_PATH)) {
    try {
      policy = JSON.parse(readFileSync(POLICY_PATH, "utf-8")) as OutputBudgetPolicy;
    } catch (e) {
      console.error(`[memory-lint] ERRO: policy inválida: ${(e as Error).message}`);
      process.exit(1);
    }
  }

  const files = target
    ? [target]
    : readdirSync(CAPS_DIR)
        .filter((f) => f.endsWith(".manifest.json"))
        .map((f) => resolve(CAPS_DIR, f));

  if (files.length === 0) {
    console.error("[memory-lint] Nenhum manifesto encontrado");
    process.exit(1);
  }

  const issues: LintIssue[] = [];
  for (const f of files) {
    const name = basename(f);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(f, "utf-8"));
    } catch (e) {
      issues.push({ level: "error", manifest: name, rule: "json", msg: `JSON inválido: ${(e as Error).message}` });
      continue;
    }
    if (!validateManifest(raw, issues, name)) continue;
    const m = raw as Manifest;
    checkDisjunction(m, issues, name);
    checkExistence(m, issues, name);
    checkColdCoverage(m, profile, issues, name);
    checkDeprecation(m, raw as Record<string, unknown>, issues, name);
    checkOutputBudget(m, policy, issues, name);
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const warningsByRule: Record<string, number> = {};
  const warningsByManifest: Record<string, number> = {};
  for (const w of warnings) {
    warningsByRule[w.rule] = (warningsByRule[w.rule] || 0) + 1;
    warningsByManifest[w.manifest] = (warningsByManifest[w.manifest] || 0) + 1;
  }

  // Telemetria (fire-and-forget; modulo nao lanca)
  try {
    emitTelemetry("lint_run", {
      files: files.length,
      errors: errors.length,
      warnings: warnings.length,
      strict,
      target: onlyArg || null,
      warnings_by_rule: warningsByRule,
      warnings_by_manifest: warningsByManifest,
    }, Date.now() - startedAt);
  } catch {
    // telemetria opcional, nunca bloqueia lint
  }

  if (issues.length === 0) {
    console.log(`[memory-lint] OK — ${files.length} manifesto(s) válido(s).`);
    return;
  }

  for (const i of issues) {
    const color = i.level === "error" ? "\x1b[31m" : "\x1b[33m";
    const reset = "\x1b[0m";
    console.log(`${color}[${i.level.toUpperCase()}]${reset} ${i.manifest} :: ${i.rule} — ${i.msg}`);
  }
  console.log("");
  console.log(`[memory-lint] ${errors.length} error(s), ${warnings.length} warning(s) em ${files.length} manifesto(s).`);

  if (errors.length > 0 || (strict && warnings.length > 0)) {
    process.exit(1);
  }
}

main();
