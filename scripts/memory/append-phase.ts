#!/usr/bin/env node
/**
 * memory-append-phase.ts — Adiciona uma fase ao canônico phases.jsonl
 *
 * Uso:
 *   tsx scripts/memory/append-phase.ts --id <id> --title <title> --status <status> \
 *      --category <cat> --date <YYYY-MM-DD> [--summary <text>] [--owner <name>] [--tags t1,t2]
 *
 * Após append, roda derive automaticamente.
 */

import { appendFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { emit as emitTelemetry } from "./telemetry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const JSONL_PATH = resolve(ROOT, ".opencode/memory/state/phases.jsonl");

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      out[args[i].slice(2)] = args[i + 1] ?? "";
      i++;
    }
  }
  return out;
}

const REQUIRED = ["id", "title", "status", "category", "date"] as const;
const VALID_STATUSES = ["open", "in_progress", "blocked", "done", "archived"];

function main(): void {
  const args = parseArgs();
  for (const f of REQUIRED) {
    if (!args[f]) {
      console.error(`[append-phase] ERRO: campo obrigatório ausente: --${f}`);
      process.exit(1);
    }
  }
  if (!VALID_STATUSES.includes(args.status)) {
    console.error(`[append-phase] ERRO: status inválido: ${args.status}`);
    process.exit(1);
  }
  if (existsSync(JSONL_PATH)) {
    const existing = readFileSync(JSONL_PATH, "utf-8");
    if (existing.includes(`"id":"${args.id}"`)) {
      console.error(`[append-phase] ERRO: id já existe: ${args.id}`);
      process.exit(1);
    }
  }

  const entry: Record<string, unknown> = {
    id: args.id,
    date: args.date,
    title: args.title,
    status: args.status,
    category: args.category,
  };
  if (args.status === "done" && !args.closed_at) {
    entry.closed_at = new Date().toISOString().slice(0, 10);
  }
  if (args.summary) entry.summary = args.summary;
  if (args.owner) entry.owner = args.owner;
  if (args.tags) entry.tags = args.tags.split(",").map((t) => t.trim()).filter(Boolean);

  const line = JSON.stringify(entry) + "\n";
  appendFileSync(JSONL_PATH, line, "utf-8");
  console.log(`[append-phase] OK — appended: ${args.id} (${args.status})`);

  try {
    execSync("tsx scripts/memory/derive.ts", { stdio: "inherit", cwd: ROOT });
  } catch (e) {
    console.error(`[append-phase] AVISO: derive falhou, rode manualmente: npm run memory:derive`);
  }

  // Telemetria
  try {
    emitTelemetry("phase_event", {
      phase_id: args.id,
      action: "append",
      status: args.status,
      category: args.category,
    });
  } catch {
    // telemetria opcional
  }
}

main();
