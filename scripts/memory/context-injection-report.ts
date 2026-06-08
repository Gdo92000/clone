/**
 * context-injection-report.ts — Relatório de Injeção de Contexto (Perfil Express)
 *
 * Lista os arquivos enviados ao modelo em cada sessão (bootstrap), calcula
 * suas métricas e projeta os custos.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");

// Caminhos dos arquivos de bootstrap (Perfil Express, conforme profile.json)
const BOOTSTRAP_FILES_PATHS = [
  resolve(ROOT, "AGENTS.md"),
  resolve(ROOT, "docs/obsidian/project-operating-system/STATE_ACTIVA.md"),
  resolve(ROOT, "docs/obsidian/project-operating-system/BOOT_ROUTER.md"),
  resolve(ROOT, "docs/obsidian/project-operating-system/TASK_CLASSIFIER.md"),
];

// Heurística de tokenização (para mix PT/EN)
const CHARS_PER_TOKEN = 3.5; 

// Custo Claude 3.5 Sonnet (valores de referência)
const CLAUDE_INPUT_COST_PER_M = 3; 
const CLAUDE_OUTPUT_COST_PER_M = 15; 
const V2_AVG_OUTPUT_TOKENS = 250; // Output médio após Output Budget Policy

interface FileMetrics {
  filePath: string;
  bytes: number;
  characters: number;
  lines: number;
  estimatedTokens: number;
  loadingStatus: "Sempre carregado (bootstrap)" | "Carregado sob demanda (retrieval)" | "Nunca carregado automaticamente";
}

function getFileMetrics(filePath: string, loadingStatus: FileMetrics['loadingStatus']): FileMetrics {
  let fileContent: string;
  if (existsSync(filePath)) {
    fileContent = readFileSync(filePath, "utf-8");
  } else {
    if (loadingStatus === "Sempre carregado (bootstrap)") {
      throw new Error(`Arquivo de bootstrap não encontrado: ${filePath}`);
    }
    return { // Retorna métricas zero para arquivos não encontrados (e não críticos)
      filePath,
      bytes: 0,
      characters: 0,
      lines: 0,
      estimatedTokens: 0,
      loadingStatus,
    };
  }

  const bytes = Buffer.byteLength(fileContent, "utf-8");
  const characters = fileContent.length;
  const lines = fileContent.split(/\r?\n/).length;
  const estimatedTokens = Math.ceil(characters / CHARS_PER_TOKEN);

  return {
    filePath,
    bytes,
    characters,
    lines,
    estimatedTokens,
    loadingStatus,
  };
}

function main() {
  console.log("=== RELATÓRIO DE INJEÇÃO DE CONTEXTO (Perfil Express) ===\n");
  console.log(`Heurística de tokenização: 1 token = ~${CHARS_PER_TOKEN} caracteres (mix PT/EN)\n`);

  const injectedFilesMetrics: FileMetrics[] = [];
  let totalBootstrapTokens = 0;

  // --- Processar arquivos de Bootstrap ---
  for (const path of BOOTSTRAP_FILES_PATHS) {
    const metrics = getFileMetrics(path, "Sempre carregado (bootstrap)");
    injectedFilesMetrics.push(metrics);
    totalBootstrapTokens += metrics.estimatedTokens;
  }

  // --- Relatório por Arquivo (Injetados) ---
  console.log("### Arquivos Injetados no Contexto por Sessão (Perfil Express)\n");
  console.log(
    "| Status de Carregamento | Arquivo | Bytes | Chars | Linhas | Tokens Est. |\n" +
    "|:-----------------------|:--------|------:|------:|-------:|------------:|\n",
  );

  for (const m of injectedFilesMetrics) {
    console.log(
      `| ${m.loadingStatus.padEnd(23)} ` +
      `| ${m.filePath.replace(ROOT + "\\", "").padEnd(8)} ` +
      `| ${m.bytes.toLocaleString().padEnd(5)} ` +
      `| ${m.characters.toLocaleString().padEnd(5)} ` +
      `| ${m.lines.toLocaleString().padEnd(6)} ` +
      `| ${m.estimatedTokens.toLocaleString().padEnd(11)} |`,
    );
  }
  console.log("\n");

  // --- Relatório Consolidado (Injetados) ---
  console.log("### Consolidado dos Arquivos Injetados por Sessão\n");
  console.log(`| Métrica              | Valor |
|:---------------------|------:|
| Total Bytes Injetados | ${injectedFilesMetrics.reduce((sum, m) => sum + m.bytes, 0).toLocaleString()} |
| Total Chars Injetados | ${injectedFilesMetrics.reduce((sum, m) => sum + m.characters, 0).toLocaleString()} |
| Total Linhas Injetadas | ${injectedFilesMetrics.reduce((sum, m) => sum + m.lines, 0).toLocaleString()} |
| Total Tokens Injetados | ${totalBootstrapTokens.toLocaleString()} |

`);

  // --- Projeção de Custo Financeiro por Sessão ---
  console.log("### Projeção de Custo Financeiro por Sessão (Claude 3.5 Sonnet)\n");

  const costPerSessionInput = (totalBootstrapTokens / 1_000_000) * CLAUDE_INPUT_COST_PER_M;
  const costPerSessionOutputEstimate = (V2_AVG_OUTPUT_TOKENS / 1_000_000) * CLAUDE_OUTPUT_COST_PER_M; 
  const totalCostPerSession = costPerSessionInput + costPerSessionOutputEstimate;

  console.log(`| Métrica    | Custo por Sessão |
|:-----------|-----------------:|
| Input ($) | $${costPerSessionInput.toFixed(4)} |
| Output ($) (Est.) | $${costPerSessionOutputEstimate.toFixed(4)} |
| **Total ($)** | **$${totalCostPerSession.toFixed(4)}** |

`);

  // --- Simulação para Múltiplos Turnos ---
  console.log("### Simulação Acumulada de Custo para Múltiplos Turnos\n");
  const turnsToSimulate = [10, 100, 500, 1000, 5000];

  console.log(`| Turnos | Custo Input Acumulado ($) | Custo Output Acumulado ($) | Custo Total Acumulado ($) |
|:-------|--------------------------:|---------------------------:|--------------------------:|`);

  for (const turns of turnsToSimulate) {
    const totalInputCost = (totalBootstrapTokens * turns / 1_000_000) * CLAUDE_INPUT_COST_PER_M;
    const totalOutputCost = (V2_AVG_OUTPUT_TOKENS * turns / 1_000_000) * CLAUDE_OUTPUT_COST_PER_M;
    const totalAccumulatedCost = totalInputCost + totalOutputCost;

    console.log(
      `| ${turns.toLocaleString().padEnd(6)} ` +
      `| $${totalInputCost.toFixed(2).padEnd(25)} ` +
      `| $${totalOutputCost.toFixed(2).padEnd(26)} ` +
      `| $${totalAccumulatedCost.toFixed(2).padEnd(25)} |`,
    );
  }
  console.log("\n");

  // --- Informações sobre On-Demand e Nunca Carregados ---
  console.log("### Carregamento Sob Demanda e Arquivos Não Carregados Automaticamente\n");
  console.log("- **Carregado sob demanda (retrieval)**: Nesta sessão, nenhum arquivo foi carregado sob demanda além do bootstrap inicial. Arquivos são carregados via *capability manifests* (`.opencode/capabilities/*.manifest.json`) APENAS se a tarefa exigir conhecimento específico além do contexto bootstrap. Exemplos: documentação de arquitetura, padrões de segurança, logs de auditoria.\n");
  console.log("- **Nunca carregado automaticamente**: Todos os demais arquivos no repositório que não fazem parte do conjunto de bootstrap ou que não são explicitamente solicitados via `retrieval` (`capability manifests`) para a tarefa atual. O sistema de memória cognitiva foi projetado para carregar o mínimo necessário.\n");

  console.log("=== RELATÓRIO CONCLUÍDO COM SUCESSO ===");
}

main();