#!/usr/bin/env node
/**
 * memory-telemetry.ts — Memory v2 Phase 4
 *
 * Modulo de telemetria append-only. Escreve eventos estruturados em
 * `.opencode/retrieval.log` (JSONL) para analise posterior.
 *
 * Tipos de evento:
 *   - lint_run     { files, errors, warnings, duration_ms, warnings_by_rule }
 *   - derive_run   { phases_total, phases_by_status, activa_bytes, historico_bytes, duration_ms }
 *   - doc_read     { capability, path, level: hot|warm|cold }  (reservado para instrumentacao futura)
 *   - phase_event  { phase_id, action: append|close, status }  (reservado)
 *
 * Configuracao:
 *   MEMORY_TELEMETRY_DISABLED=1  →  no-op (util para testes que rodam muitas vezes)
 *   MEMORY_TELEMETRY_LOG=<path>  →  custom log path (default: .opencode/retrieval.log)
 */

import { appendFileSync, existsSync, readFileSync, mkdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";

export type TelemetryEventType = "lint_run" | "derive_run" | "doc_read" | "phase_event";

export interface TelemetryEvent {
  ts: string;
  type: TelemetryEventType;
  duration_ms?: number;
  payload: Record<string, unknown>;
}

export const DEFAULT_LOG_PATH = ".opencode/retrieval.log";

export function getLogPath(): string {
  return process.env.MEMORY_TELEMETRY_LOG || DEFAULT_LOG_PATH;
}

export function isDisabled(): boolean {
  return process.env.MEMORY_TELEMETRY_DISABLED === "1";
}

export function emit(type: TelemetryEventType, payload: Record<string, unknown>, durationMs?: number): void {
  if (isDisabled()) return;
  const logPath = getLogPath();
  const dir = dirname(resolve(logPath));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const event: TelemetryEvent = {
    ts: new Date().toISOString(),
    type,
    payload,
  };
  if (durationMs !== undefined) event.duration_ms = durationMs;
  try {
    appendFileSync(logPath, JSON.stringify(event) + "\n", "utf-8");
  } catch {
    // telemetria e fire-and-forget; nunca quebra a operacao
  }
}

export function readAll(logPath: string = getLogPath()): TelemetryEvent[] {
  if (!existsSync(logPath)) return [];
  const raw = readFileSync(logPath, "utf-8");
  const out: TelemetryEvent[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as TelemetryEvent);
    } catch {
      // linha corrompida: ignora
    }
  }
  return out;
}

export function logSize(logPath: string = getLogPath()): { bytes: number; events: number } {
  if (!existsSync(logPath)) return { bytes: 0, events: 0 };
  const s = statSync(logPath);
  const events = readAll(logPath).length;
  return { bytes: s.size, events };
}
