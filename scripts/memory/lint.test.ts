import { describe, it, expect, vi } from "vitest";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const CAPS_DIR = resolve(ROOT, ".opencode/capabilities");
const TMP_DIR = resolve(ROOT, ".opencode/capabilities/.tmp-test");

const VALID = {
  capability: "test-valid",
  version: "1.0.0",
  max_bootstrap_tokens: 500,
  max_working_tokens: 8000,
  max_retrieval_depth: 2,
  hot_docs: [],
  warm_docs: ["AGENTS.md"],
  cold_docs: ["docs/obsidian/project-operating-system/04-AGENTS/*.md"],
  allowed_skills: ["x"],
  output_budget: {
    max_preamble_chars: 240,
    no_repeat_user_input: true,
    prefer_tables: true,
    max_items_before_summary: 5,
  },
};

describe("memory-lint", () => {
  beforeAll(() => mkdirSync(TMP_DIR, { recursive: true }));
  afterAll(() => { if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true }); });
  // 5s default é curto para spawnSync de npx tsx; o suite usa ~5s por teste
  vi.setConfig({ testTimeout: 15000 });

  const runLint = (file: string): { stdout: string; stderr: string; code: number } => {
    try {
      const stdout = execSync(`npx tsx scripts/memory/lint.ts ${file}`, { cwd: ROOT, encoding: "utf-8", stdio: "pipe" });
      return { stdout, stderr: "", code: 0 };
    } catch (e) {
      const r = e as { stdout: string; stderr: string; status: number };
      return { stdout: r.stdout, stderr: r.stderr, code: r.status };
    }
  };

  const rel = (name: string): string => `.tmp-test/${name}`;

  it("manifest válido passa", () => {
    const path = resolve(TMP_DIR, "test-valid.manifest.json");
    writeFileSync(path, JSON.stringify(VALID), "utf-8");
    const r = runLint(rel("test-valid.manifest.json"));
    expect(r.code).toBe(0);
  });

  it("rejeita campos legados (allowed_docs_patterns)", () => {
    const path = resolve(TMP_DIR, "legacy.manifest.json");
    const bad = { ...VALID, capability: "legacy", allowed_docs_patterns: ["x"] };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("legacy.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("legados");
  });

  it("rejeita hot ∩ warm", () => {
    const path = resolve(TMP_DIR, "overlap.manifest.json");
    const bad = { ...VALID, capability: "overlap", hot_docs: ["AGENTS.md"], warm_docs: ["AGENTS.md"] };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("overlap.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("hot_docs ∩ warm_docs");
  });

  it("rejeita warm ∩ cold", () => {
    const path = resolve(TMP_DIR, "overlap-warm-cold.manifest.json");
    const bad = { ...VALID, capability: "owc", warm_docs: ["docs/obsidian/x.md"], cold_docs: ["docs/obsidian/x.md"] };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("overlap-warm-cold.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("warm_docs ∩ cold_docs");
  });

  it("rejeita hot_docs path inexistente", () => {
    const path = resolve(TMP_DIR, "missing.manifest.json");
    const bad = { ...VALID, capability: "missing", hot_docs: ["nonexistent/path.md"] };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("missing.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("hot_docs path não existe");
  });

  it("rejeita hot_docs referenciando cold_storage_skip (99-TEMPLATES)", () => {
    const path = resolve(TMP_DIR, "cold-leak.manifest.json");
    const bad = { ...VALID, capability: "leak", warm_docs: ["docs/obsidian/project-operating-system/99-TEMPLATES/reusable/FEATURE_SPEC.template.md"] };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("cold-leak.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("cold_storage_skip");
  });

  it("rejeita output_budget faltando", () => {
    const path = resolve(TMP_DIR, "no-budget.manifest.json");
    const bad = { ...VALID, capability: "no-budget" } as Record<string, unknown>;
    delete bad.output_budget;
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("no-budget.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("output_budget");
  }, 15000);

  it("rejeita capability fora do padrão kebab-case", () => {
    const path = resolve(TMP_DIR, "bad-name.manifest.json");
    const bad = { ...VALID, capability: "BadName" };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("bad-name.manifest.json"));
    expect(r.code).toBe(1);
  });

  it("rejeita output_budget abaixo do minimum", () => {
    const path = resolve(TMP_DIR, "below-min.manifest.json");
    const bad = { ...VALID, capability: "below-min", output_budget: { ...VALID.output_budget, max_preamble_chars: 50 } };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("below-min.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("abaixo do mínimo");
  });

  it("rejeita output_budget acima do maximum", () => {
    const path = resolve(TMP_DIR, "above-max.manifest.json");
    const bad = { ...VALID, capability: "above-max", output_budget: { ...VALID.output_budget, max_preamble_chars: 1000 } };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("above-max.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("acima do máximo");
  });

  it("rejeita no_repeat_user_input=false", () => {
    const path = resolve(TMP_DIR, "repeat-input.manifest.json");
    const bad = { ...VALID, capability: "repeat", output_budget: { ...VALID.output_budget, no_repeat_user_input: false } };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("repeat-input.manifest.json"));
    expect(r.code).toBe(1);
    expect(r.stdout).toContain("no_repeat_user_input=false");
  });

  it("output_budget abaixo do default NAO emite warning (escolha de design)", () => {
    const path = resolve(TMP_DIR, "tight-budget.manifest.json");
    const bad = { ...VALID, capability: "tight", output_budget: { ...VALID.output_budget, max_preamble_chars: 150, max_items_before_summary: 3, truncate_grep_at: 10 } };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    const r = runLint(rel("tight-budget.manifest.json"));
    expect(r.code).toBe(0);
    expect(r.stdout).not.toContain("abaixo do default");
  });

  it("--strict passa em output_budget abaixo do default (nao e violacao)", () => {
    const path = resolve(TMP_DIR, "tight-strict.manifest.json");
    const bad = { ...VALID, capability: "tight-strict", output_budget: { ...VALID.output_budget, max_preamble_chars: 150 } };
    writeFileSync(path, JSON.stringify(bad), "utf-8");
    let r: { code: number };
    try {
      execSync(`npx tsx scripts/memory/lint.ts ${rel("tight-strict.manifest.json")} --strict`, { cwd: ROOT, stdio: "pipe" });
      r = { code: 0 };
    } catch (e) {
      r = { code: (e as { status: number }).status };
    }
    expect(r.code).toBe(0);
  });

  it("9 manifests oficiais passam lint", () => {
    const r = runLint(""); // todos
    expect(r.code).toBe(0);
  }, 30000);
});
