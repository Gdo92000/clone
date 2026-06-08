import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const TMP_DIR = resolve(ROOT, ".opencode/memory/telemetry/.tmp-test");
const TMP_LOG = resolve(TMP_DIR, "test.log");

describe("memory-telemetry", () => {
  vi.setConfig({ testTimeout: 15000 });

  beforeAll(() => mkdirSync(TMP_DIR, { recursive: true }));
  afterAll(() => { if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true }); });
  beforeEach(() => {
    process.env.MEMORY_TELEMETRY_LOG = TMP_LOG;
    if (existsSync(TMP_LOG)) rmSync(TMP_LOG);
  });

  it("emit escreve evento JSONL no log path custom", async () => {
    const { emit, readAll } = await import("./telemetry.js");
    emit("lint_run", { files: 9, errors: 0, warnings: 5 }, 123);
    const events = readAll(TMP_LOG);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("lint_run");
    expect(events[0].duration_ms).toBe(123);
    expect(events[0].payload.files).toBe(9);
    expect(events[0].ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("emit ignora quando MEMORY_TELEMETRY_DISABLED=1", async () => {
    process.env.MEMORY_TELEMETRY_DISABLED = "1";
    const { emit, readAll } = await import("./telemetry.js");
    emit("derive_run", { phases: 10 });
    expect(readAll(TMP_LOG)).toHaveLength(0);
    delete process.env.MEMORY_TELEMETRY_DISABLED;
  });

  it("emit não quebra se diretório do log não existe (cria)", async () => {
    const deep = resolve(TMP_DIR, "deep/nested/path.log");
    process.env.MEMORY_TELEMETRY_LOG = deep;
    const { emit, readAll } = await import("./telemetry.js");
    emit("lint_run", { files: 1 });
    expect(existsSync(deep)).toBe(true);
    expect(readAll(deep)).toHaveLength(1);
  });

  it("readAll ignora linhas corrompidas", async () => {
    const { readAll } = await import("./telemetry.js");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(
      TMP_LOG,
      JSON.stringify({ ts: "2026-01-01T00:00:00Z", type: "lint_run", payload: { a: 1 } }) + "\n" +
      "this is not json\n" +
      JSON.stringify({ ts: "2026-01-02T00:00:00Z", type: "derive_run", payload: { b: 2 } }) + "\n",
      "utf-8",
    );
    const events = readAll(TMP_LOG);
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("lint_run");
    expect(events[1].type).toBe("derive_run");
  });

  it("logSize retorna 0/0 para log inexistente", async () => {
    const { logSize } = await import("./telemetry.js");
    const ghost = resolve(TMP_DIR, "ghost.log");
    const s = logSize(ghost);
    expect(s.bytes).toBe(0);
    expect(s.events).toBe(0);
  });

  it("lint real emite evento lint_run com métricas", async () => {
    const { readAll, logSize } = await import("./telemetry.js");
    const before = logSize(TMP_LOG).events;
    try {
      execSync("npx tsx scripts/memory/lint.ts", { cwd: ROOT, stdio: "pipe" });
    } catch {
      // lint pode retornar exit 1 se warnings, isso é OK
    }
    const events = readAll(TMP_LOG);
    const lintEvents = events.filter((e) => e.type === "lint_run");
    expect(lintEvents.length).toBeGreaterThan(0);
    const last = lintEvents[lintEvents.length - 1];
    expect(last.payload.files).toBe(9);
    expect(typeof last.payload.errors).toBe("number");
    expect(typeof last.payload.warnings).toBe("number");
    expect(typeof last.duration_ms).toBe("number");
    expect(last.duration_ms).toBeGreaterThan(0);
    // espera que logSize cresceu
    expect(logSize(TMP_LOG).events).toBeGreaterThan(before);
  });
});
