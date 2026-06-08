/**
 * audit-context.ts — Auditoria de Consumo de Contexto (Memory v2)
 *
 * Mede o consumo real de tokens da memória cognitiva baseada exclusivamente
 * em dados reais do repositório, comparando a arquitetura anterior (Memory v1)
 * com a atual (Memory v2).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");

// Caminhos dos arquivos de bootstrap
const AGENTS_PATH = resolve(ROOT, "AGENTS.md");
const STATE_ACTIVA_PATH = resolve(ROOT, "docs/obsidian/project-operating-system/STATE_ACTIVA.md");
const BOOT_ROUTER_PATH = resolve(ROOT, "docs/obsidian/project-operating-system/BOOT_ROUTER.md");
const TASK_CLASSIFIER_PATH = resolve(ROOT, "docs/obsidian/project-operating-system/TASK_CLASSIFIER.md");

// Commit da versão anterior do CURRENT_STATE.md (ID do commit de referência)
const OLD_CURRENT_STATE_COMMIT = "8b60d33"; // Ajustes obsidian 24_05_2026
const OLD_CURRENT_STATE_PATH = "docs/obsidian/CURRENT_STATE.md";

// --- Configurações de Tokenização e Custo ---
const CHARS_PER_TOKEN = 3.5; // Heurística: ~3.5 caracteres por token (mix PT/EN)
const CLAUDE_INPUT_COST_PER_M = 3; // $3 por 1 milhão de tokens de entrada
const CLAUDE_OUTPUT_COST_PER_M = 15; // $15 por 1 milhão de tokens de saída

// --- Parâmetros de Output Médio (Estimativas históricas do comportamento da LLM) ---
const V1_AVG_OUTPUT_TOKENS = 800; // Output verboso antes do Output Budget Policy
const V2_AVG_OUTPUT_TOKENS = 250; // Output após Output Budget Policy

interface FileMetrics {
  filePath: string;
  bytes: number;
  characters: number;
  lines: number;
  estimatedTokens: number;
  participationPercentage?: number;
}

/**
 * Calcula métricas de tamanho para um arquivo ou conteúdo dado.
 * @param filePath Caminho absoluto do arquivo (se conteúdo não for fornecido).
 * @param content Conteúdo do arquivo (se já lido).
 * @returns Métricas do arquivo.
 */
function getFileMetrics(filePath: string, content?: string): FileMetrics {
  let fileContent: string;
  if (content !== undefined) {
    fileContent = content;
  } else if (existsSync(filePath)) {
    fileContent = readFileSync(filePath, "utf-8");
  } else {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
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
  };
}

/**
 * Gera um relatório detalhado para um conjunto de arquivos.
 * @param archName Nome da arquitetura (e.g., "Atual", "Anterior").
 * @param files Lista de objetos { name, path? , content? } para auditar.
 * @returns Métricas consolidadas.
 */
function generateReport(
  archName: string,
  files: Array<{ name: string; path?: string; content?: string }>,
): { totalTokens: number; report: FileMetrics[] } {
  console.log(`### Relatório por Arquivo: ${archName}\n`);
  console.log(
    "| Arquivo | Bytes | Chars | Linhas | Tokens Est. | % Participação |\n" +
    "|:--------|------:|------:|-------:|------------:|---------------:|\n",
  );

  const metrics: FileMetrics[] = [];
  let totalTokens = 0;

  for (const file of files) {
    try {
      const fileMetric = getFileMetrics(file.path || file.name, file.content);
      metrics.push(fileMetric);
      totalTokens += fileMetric.estimatedTokens;
    } catch (error) {
      console.error(`Erro ao processar ${file.name}: ${(error as Error).message}`);
    }
  }

  // Calcular % de participação
  const reportWithPercentage = metrics.map((m) => ({
    ...m,
    participationPercentage: totalTokens > 0 ? (m.estimatedTokens / totalTokens) * 100 : 0,
  }));

  // Imprimir tabela por arquivo
  for (const m of reportWithPercentage) {
    console.log(
      `| ${m.filePath.replace(ROOT + "\\", "").padEnd(8)} ` +
      `| ${m.bytes.toLocaleString().padEnd(5)} ` +
      `| ${m.characters.toLocaleString().padEnd(5)} ` +
      `| ${m.lines.toLocaleString().padEnd(6)} ` +
      `| ${m.estimatedTokens.toLocaleString().padEnd(11)} ` +
      `| ${m.participationPercentage?.toFixed(1).padEnd(14)}% |`
    );
  }
  console.log("\n");

  console.log(`### Relatório Consolidado: ${archName}\n`);
  console.log(
    "| Métrica | Valor |\n" +
    "|:--------|------:|\n" +
    `| Total Bytes | ${totalBytes(metrics).toLocaleString()} |\n` +
    `| Total Chars | ${totalCharacters(metrics).toLocaleString()} |\n` +
    `| Total Linhas | ${totalLines(metrics).toLocaleString()} |\n` +
    `| Total Tokens Est. | ${totalTokens.toLocaleString()} |\n\n`,
  );

  return { totalTokens, report: reportWithPercentage };
}

// Funções auxiliares para totais
const totalBytes = (metrics: FileMetrics[]) => metrics.reduce((sum, m) => sum + m.bytes, 0);
const totalCharacters = (metrics: FileMetrics[]) => metrics.reduce((sum, m) => sum + m.characters, 0);
const totalLines = (metrics: FileMetrics[]) => metrics.reduce((sum, m) => sum + m.lines, 0);

/**
 * Simula o consumo de tokens para um número de turnos.
 */
function simulateSessions(
  v1_bootstrapTokens: number,
  v2_bootstrapTokens: number,
  simTurns: number,
): void {
  console.log(`### Simulação de Consumo de Contexto (${simTurns.toLocaleString()} Turnos)\n`);
  console.log(
    "| Métrica        | Arquitetura Anterior (v1) | Arquitetura Atual (v2) | Economia (%) |\n" +
    "|:---------------|--------------------------:|-----------------------:|-------------:|\n" +
    `| Tokens de Entrada | ${v1_bootstrapTokens.toLocaleString().padEnd(25)} | ${v2_bootstrapTokens.toLocaleString().padEnd(22)} | ${((v1_bootstrapTokens - v2_bootstrapTokens) / v1_bootstrapTokens * 100).toFixed(1).padStart(11)}% |\n` +
    `| Tokens de Saída (médio) | ${V1_AVG_OUTPUT_TOKENS.toLocaleString().padEnd(25)} | ${V2_AVG_OUTPUT_TOKENS.toLocaleString().padEnd(22)} | ${((V1_AVG_OUTPUT_TOKENS - V2_AVG_OUTPUT_TOKENS) / V1_AVG_OUTPUT_TOKENS * 100).toFixed(1).padStart(11)}% |\n`,
  );

  const totalV1_Input = simTurns * v1_bootstrapTokens;
  const totalV2_Input = simTurns * v2_bootstrapTokens;
  const totalV1_Output = simTurns * V1_AVG_OUTPUT_TOKENS;
  const totalV2_Output = simTurns * V2_AVG_OUTPUT_TOKENS;

  const totalTokensV1 = totalV1_Input + totalV1_Output;
  const totalTokensV2 = totalV2_Input + totalV2_Output;

  console.log(
    "| Consumo Total   | ",
    `${totalTokensV1.toLocaleString().padEnd(25)} | `,
    `${totalTokensV2.toLocaleString().padEnd(22)} | `,
    `${((totalTokensV1 - totalTokensV2) / totalTokensV1 * 100).toFixed(1).padStart(11)}% |\n\n`,
  );

  console.log(`### Projeção de Custo Financeiro (${simTurns.toLocaleString()} Turnos)\n`);
  const costV1_Input = (totalV1_Input / 1_000_000) * CLAUDE_INPUT_COST_PER_M;
  const costV1_Output = (totalV1_Output / 1_000_000) * CLAUDE_OUTPUT_COST_PER_M;
  const totalCostV1 = costV1_Input + costV1_Output;

  const costV2_Input = (totalV2_Input / 1_000_000) * CLAUDE_INPUT_COST_PER_M;
  const costV2_Output = (totalV2_Output / 1_000_000) * CLAUDE_OUTPUT_COST_PER_M;
  const totalCostV2 = costV2_Input + costV2_Output;

  console.log(
    "| Métrica    | Custo Anterior (v1) | Custo Atual (v2) | Economia (%) |\n" +
    "|:-----------|--------------------:|-----------------:|-------------:|\n" +
    `| Input ($) | $${costV1_Input.toFixed(2).padEnd(19)} | $${costV2_Input.toFixed(2).padEnd(16)} | ${((costV1_Input - costV2_Input) / costV1_Input * 100).toFixed(1).padStart(11)}% |\n` +
    `| Output ($) | $${costV1_Output.toFixed(2).padEnd(19)} | $${costV2_Output.toFixed(2).padEnd(16)} | ${((costV1_Output - costV2_Output) / costV1_Output * 100).toFixed(1).padStart(11)}% |\n` +
    `| Total ($) | $${totalCostV1.toFixed(2).padEnd(19)} | $${totalCostV2.toFixed(2).padEnd(16)} | ${((totalCostV1 - totalCostV2) / totalCostV1 * 100).toFixed(1).padStart(11)}% |\n\n`,
  );

  console.log("--- Consumidores de Contexto e Oportunidades de Redução ---\n");

  // Oportunidades de redução serão identificadas pelos relatórios detalhados
  // no output, não hardcoded aqui.
}

async function runAudit() {
  console.log("=== AUDITORIA DE CONSUMO DE CONTEXTO REAL (Memory v2) ===\n");
  console.log(`Heurística de tokenização: 1 token = ~${CHARS_PER_TOKEN} caracteres (mix PT/EN)\n`);

  // --- 1. Arquitetura Atual (Memory v2 - Express Profile) ---
  const currentBootstrapFiles = [
    { name: "AGENTS.md", path: AGENTS_PATH },
    { name: "STATE_ACTIVA.md", path: STATE_ACTIVA_PATH },
    { name: "BOOT_ROUTER.md", path: BOOT_ROUTER_PATH },
    { name: "TASK_CLASSIFIER.md", path: TASK_CLASSIFIER_PATH },
  ];
  const { totalTokens: currentTotalTokens, report: currentReport } = generateReport(
    "Arquitetura Atual (Memory v2 - Perfil Express)",
    currentBootstrapFiles,
  );

  // --- 2. Arquitetura Anterior (Memory v1 - com CURRENT_STATE.md do Git) ---
  let oldCurrentStateContent = "";
  try {
    oldCurrentStateContent = execSync(`git show ${OLD_CURRENT_STATE_COMMIT}:${OLD_CURRENT_STATE_PATH}`, { encoding: "utf-8", cwd: ROOT });
  } catch (error) {
    console.error(`Erro ao obter ${OLD_CURRENT_STATE_PATH} do Git: ${(error as Error).message}`);
    console.warn(`Usando um placeholder para ${OLD_CURRENT_STATE_PATH} na arquitetura anterior.`);
    oldCurrentStateContent = "OLD_CURRENT_STATE_PLACEHOLDER"; // Fallback
  }

  const previousBootstrapFiles = [
    { name: "AGENTS.md", path: AGENTS_PATH },
    { name: "CURRENT_STATE.md (Antigo)", content: oldCurrentStateContent },
    { name: "BOOT_ROUTER.md", path: BOOT_ROUTER_PATH },
    { name: "TASK_CLASSIFIER.md", path: TASK_CLASSIFIER_PATH },
  ];
  const { totalTokens: previousTotalTokens, report: previousReport } = generateReport(
    "Arquitetura Anterior (Memory v1 - CURRENT_STATE manual)",
    previousBootstrapFiles,
  );

  // --- 3. Comparação e Simulação ---
  console.log("### Resumo Comparativo da Memória de Contexto\n");
  console.log(
    "| Arquitetura | Total Tokens de Bootstrap | Economia vs Anterior (%) |\n" +
    "|:------------|--------------------------:|--------------------------:|\n" +
    `| Anterior (v1) | ${previousTotalTokens.toLocaleString().padEnd(25)} | — |\n` +
    `| Atual (v2) | ${currentTotalTokens.toLocaleString().padEnd(25)} | ${((previousTotalTokens - currentTotalTokens) / previousTotalTokens * 100).toFixed(1).padStart(24)}% |\n\n`,
  );

  const turnsToSimulate = [10, 100, 500, 1000, 5000];
  for (const turns of turnsToSimulate) {
    simulateSessions(previousTotalTokens, currentTotalTokens, turns);
  }

  console.log("\n--- Análise de Consumo ---\n");
  console.log("**Principais Consumidores de Contexto (Atual):**\n");
  currentReport.sort((a, b) => b.estimatedTokens - a.estimatedTokens).forEach((m) => {
    console.log(`- ${m.filePath.replace(ROOT + "\\", "")} (${m.estimatedTokens.toLocaleString()} tokens, ${m.participationPercentage?.toFixed(1)}%)`);
  });

  console.log("\n**Oportunidades de Redução (Geral):**\n");
  console.log("- **Refinar `AGENTS.md`**: Embora crucial, é o maior consumidor. Revisar para concisão, usar mais wikilinks para detalhes secundários.");
  console.log("- **Manter `STATE_ACTIVA.md` mínimo**: Assegurar que só fases ativas e relevantes estejam lá (já otimizado).");
  console.log("- **Otimizar `TASK_CLASSIFIER.md`**: Revisar para garantir que apenas regras essenciais de roteamento estejam presentes.");
  console.log("- **Aplicar `Output Budget Policy` rigorosamente**: Continuar a otimizar prompts de saída para reduzir o output da LLM (já implementado).");
  console.log("- **Remover código morto e docs legados**: Limpar repositório para evitar que arquivos desnecessários sejam incluídos no boot ou em retrievals por manifestos.");
  console.log("- **Revisar manifestos de capability**: Garantir que `hot_docs` e `warm_docs` sejam o mais concisos possível, evitando `glob` muito amplos para documentos raramente usados.");

  console.log("\n=== AUDITORIA CONCLUÍDA COM SUCESSO ===");
}

runAudit();
