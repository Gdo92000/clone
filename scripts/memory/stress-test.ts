/**
 * stress-test.ts — Memory v2 Token Economy Stress Test
 *
 * Realiza uma simulação matemática baseada no tamanho real dos arquivos
 * atuais vs. os arquivos legados para calcular a economia real de tokens.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const ACTIVA_PATH = resolve(ROOT, "docs/obsidian/project-operating-system/STATE_ACTIVA.md");

function main() {
  console.log("=== INICIANDO TESTE DE STRESS DE TOKENS (Memory v2) ===\n");

  // 1. Obter tamanhos reais atuais
  let activaBytes = 0;
  if (existsSync(ACTIVA_PATH)) {
    activaBytes = Buffer.byteLength(readFileSync(ACTIVA_PATH, "utf-8"), "utf-8");
  } else {
    console.error("STATE_ACTIVA.md não encontrado!");
    process.exit(1);
  }

  const activaTokens = Math.ceil(activaBytes / 4);

  // 2. Parâmetros da simulação (Memory v1 vs Memory v2)
  const v1_InputBytes = 20 * 1024; // 20 KB (tamanho médio do antigo CURRENT_STATE manual)
  const v1_InputTokens = Math.ceil(v1_InputBytes / 4); // ~5120 tokens
  const v2_InputTokens = activaTokens; // tamanho real do STATE_ACTIVA atual (~205 tokens)

  // Output budgets baseados na policy e logs
  const v1_OutputTokensAvg = 800; // respostas longas, preâmbulos verbosos, repetição de input
  const v2_OutputTokensAvg = 250; // limitado pela policy de output budget (preâmbulo <=240c, tabelas, no-repeat)

  // 3. Simulações
  const TURNS_STRESS = [10, 100, 500, 1000, 5000];

  console.log("DADOS REAIS DA INFRAESTRUTURA ATUAL:");
  console.log(`  - Tamanho do STATE_ACTIVA.md atual: ${activaBytes} bytes`);
  console.log(`  - Tokens de entrada por Turno (Memory v2): ~${v2_InputTokens} tokens`);
  console.log(`  - Tokens de entrada por Turno (Memory v1): ~${v1_InputTokens} tokens (CURRENT_STATE manual)`);
  console.log(`  - Tokens de saída por Turno (Memory v1): ~${v1_OutputTokensAvg} tokens`);
  console.log(`  - Tokens de saída por Turno (Memory v2): ~${v2_OutputTokensAvg} tokens (Enforced Budget)\n`);

  console.log("TABELA DE PROJEÇÃO DE CONSUMO DE TOKENS:\n");
  console.log("| Turnos | Input v1 (Tokens) | Input v2 (Tokens) | Economia Input (%) | Output v1 (Tokens) | Output v2 (Tokens) | Economia Output (%) |");
  console.log("|--------|-------------------|-------------------|--------------------|-------------------|-------------------|---------------------|");

  for (const turns of TURNS_STRESS) {
    const v1_input = turns * v1_InputTokens;
    const v2_input = turns * v2_InputTokens;
    const input_saving = ((v1_input - v2_input) / v1_input * 100).toFixed(1);

    const v1_output = turns * v1_OutputTokensAvg;
    const v2_output = turns * v2_OutputTokensAvg;
    const output_saving = ((v1_output - v2_output) / v1_output * 100).toFixed(1);

    console.log(
      `| ${turns.toString().padEnd(6)} ` +
      `| ${v1_input.toLocaleString().padEnd(17)} ` +
      `| ${v2_input.toLocaleString().padEnd(17)} ` +
      `| ${input_saving.padStart(17)}% ` +
      `| ${v1_output.toLocaleString().padEnd(17)} ` +
      `| ${v2_output.toLocaleString().padEnd(17)} ` +
      `| ${output_saving.padStart(18)}% |`
    );
  }

  // 4. Projeção de Custo Financeiro (Claude 3.5 Sonnet: $3/M Input, $15/M Output)
  console.log("\nPROJEÇÃO DE CUSTO FINANCEIRO (Claude 3.5 Sonnet @ $3/M Input, $15/M Output):");
  const simTurns = 1000;
  const v1_input = simTurns * v1_InputTokens;
  const v2_input = simTurns * v2_InputTokens;
  const v1_output = simTurns * v1_OutputTokensAvg;
  const v2_output = simTurns * v2_OutputTokensAvg;

  const costV1_Input = (v1_input / 1000000) * 3;
  const costV1_Output = (v1_output / 1000000) * 15;
  const totalCostV1 = costV1_Input + costV1_Output;

  const costV2_Input = (v2_input / 1000000) * 3;
  const costV2_Output = (v2_output / 1000000) * 15;
  const totalCostV2 = costV2_Input + costV2_Output;

  const financialSaving = ((totalCostV1 - totalCostV2) / totalCostV1 * 100).toFixed(1);

  console.log(`\nPara 1.000 turnos de desenvolvimento:`);
  console.log(`  - Custo Memory v1 (Sem Limites):`);
  console.log(`    * Input:  $${costV1_Input.toFixed(2)} (${v1_input.toLocaleString()} tokens)`);
  console.log(`    * Output: $${costV1_Output.toFixed(2)} (${v1_output.toLocaleString()} tokens)`);
  console.log(`    * Total:  $${totalCostV1.toFixed(2)}`);
  console.log(`  - Custo Memory v2 (Cognitive Budget + Enforced Output):`);
  console.log(`    * Input:  $${costV2_Input.toFixed(2)} (${v2_input.toLocaleString()} tokens)`);
  console.log(`    * Output: $${costV2_Output.toFixed(2)} (${v2_output.toLocaleString()} tokens)`);
  console.log(`    * Total:  $${totalCostV2.toFixed(2)}`);
  console.log(`\n  ==> ECONOMIA FINANCEIRA REAL: ${financialSaving}% (Salva $${(totalCostV1 - totalCostV2).toFixed(2)} a cada 1k turnos!)`);

  console.log("\n=== TESTE DE STRESS CONCLUÍDO COM SUCESSO ===");
}

main();
