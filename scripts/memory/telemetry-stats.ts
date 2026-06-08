#!/usr/bin/env node
/**
 * memory-telemetry-stats.ts — Memory v2 Phase 4
 *
 * Le `.opencode/retrieval.log` (JSONL append-only) e imprime um resumo:
 *   - Total de eventos por tipo
 *   - Ultimas N runs de lint (files, errors, warnings, duration_ms)
 *   - Top warnings por regra
 *   - Top manifests com mais warnings
 *   - Ultimas N runs de derive (phases_total, sizes)
 *   - Espaco ocupado pelo log
 *
 * Uso:
 *   tsx scripts/memory/telemetry-stats.ts
 *   MEMORY_TELEMETRY_LOG=custom.log tsx scripts/memory/telemetry-stats.ts
 */

import { readAll, logSize } from "./telemetry.js";

const events = readAll();
const size = logSize();

console.log("=== Memory Telemetry Stats ===\n");
console.log(`Log path:  ${process.env.MEMORY_TELEMETRY_LOG || ".opencode/retrieval.log"}`);
console.log(`Size:      ${size.bytes} bytes (${size.events} eventos)\n`);

if (events.length === 0) {
  console.log("Nenhum evento registrado ainda.");
  process.exit(0);
}

// 1. Eventos por tipo
const byType: Record<string, number> = {};
for (const e of events) byType[e.type] = (byType[e.type] || 0) + 1;
console.log("Eventos por tipo:");
for (const [t, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(20)} ${n}`);
}
console.log("");

// 2. Lint runs
const lintRuns = events.filter((e) => e.type === "lint_run");
if (lintRuns.length > 0) {
  console.log(`Lint runs (${lintRuns.length}):`);
  const last5 = lintRuns.slice(-5);
  for (const r of last5) {
    const p = r.payload as { files: number; errors: number; warnings: number; strict?: boolean; target?: string | null };
    const dur = r.duration_ms !== undefined ? `${r.duration_ms}ms` : "?";
    const target = p.target ? ` target=${p.target}` : "";
    console.log(`  ${r.ts}  files=${p.files} err=${p.errors} warn=${p.warnings} dur=${dur}${target}`);
  }
  const totalErr = lintRuns.reduce((s, r) => s + ((r.payload as { errors: number }).errors || 0), 0);
  const totalWarn = lintRuns.reduce((s, r) => s + ((r.payload as { warnings: number }).warnings || 0), 0);
  const avgDur = Math.round(lintRuns.reduce((s, r) => s + (r.duration_ms || 0), 0) / lintRuns.length);
  console.log(`  TOTAL:  ${totalErr} erros, ${totalWarn} warnings, avg duration ${avgDur}ms\n`);

  // Top rules
  const ruleCount: Record<string, number> = {};
  const manifestCount: Record<string, number> = {};
  for (const r of lintRuns) {
    const p = r.payload as { warnings_by_rule?: Record<string, number>; warnings_by_manifest?: Record<string, number> };
    if (p.warnings_by_rule) for (const [k, v] of Object.entries(p.warnings_by_rule)) ruleCount[k] = (ruleCount[k] || 0) + v;
    if (p.warnings_by_manifest) for (const [k, v] of Object.entries(p.warnings_by_manifest)) manifestCount[k] = (manifestCount[k] || 0) + v;
  }
  if (Object.keys(ruleCount).length > 0) {
    console.log("  Top warning rules (acumulado):");
    for (const [k, v] of Object.entries(ruleCount).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${k.padEnd(20)} ${v}`);
    }
    console.log("");
  }
  if (Object.keys(manifestCount).length > 0) {
    console.log("  Top manifests com warnings (acumulado):");
    for (const [k, v] of Object.entries(manifestCount).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${k.padEnd(30)} ${v}`);
    }
    console.log("");
  }
}

// 3. Derive runs
const deriveRuns = events.filter((e) => e.type === "derive_run");
if (deriveRuns.length > 0) {
  console.log(`Derive runs (${deriveRuns.length}):`);
  const last3 = deriveRuns.slice(-3);
  for (const r of last3) {
    const p = r.payload as { phases_total: number; phases_by_status?: Record<string, number>; activa_bytes: number; historico_bytes: number };
    const status = p.phases_by_status ? JSON.stringify(p.phases_by_status) : "?";
    console.log(`  ${r.ts}  phases=${p.phases_total} activa=${p.activa_bytes}b historico=${p.historico_bytes}b ${status}`);
  }
  const last = deriveRuns[deriveRuns.length - 1].payload as { phases_by_status: Record<string, number> };
  console.log(`  Ultimo status: ${JSON.stringify(last.phases_by_status)}\n`);
}

// 4. Phase events
const phaseEvents = events.filter((e) => e.type === "phase_event");
if (phaseEvents.length > 0) {
  console.log(`Phase events (${phaseEvents.length}):`);
  for (const r of phaseEvents.slice(-5)) {
    const p = r.payload as { phase_id: string; action: string; status: string };
    console.log(`  ${r.ts}  ${p.action} ${p.phase_id} (${p.status})`);
  }
  console.log("");
}
