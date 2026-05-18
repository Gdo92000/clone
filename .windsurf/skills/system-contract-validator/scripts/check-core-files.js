#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CORE_FILES = [
  '.agent/core/system-contract.md',
  '.agent/core/bootstrap.md',
  '.agent/agents/orchestrator.md',
  '.agent/ARCHITECTURE.md',
  '.agent/core/sec-action-table.md',
  '.agent/core/rule-evaluation-engine.md',
  'ARQUITETURA.md',
  '.agent/core/execution-state-machine.md',
  '.agent/core/execution-gate.md',
  '.agent/core/agent-runtime.md',
  '.agent/core/response-interceptor.md',
  'AGENTS.md'
];

/**
 * Função para verificar a integridade dos arquivos core.
 * @returns {{timestamp: string, total_files: number, present_files: Array<{file: string, size: number, modified: string}>, missing_files: string[], invalid_files: Array<{file: string, error: string}>, integrity_status: string, rt_violations: string[], severity: string, recommendations: string[]}}
 */
function checkCoreFiles() {
  /**
   * Objeto para armazenar os resultados da verificação.
   * @type {{timestamp: string, total_files: number, present_files: Array<{file: string, size: number, modified: string}>, missing_files: string[], invalid_files: Array<{file: string, error: string}>, integrity_status: string, rt_violations: string[], severity: string, recommendations: string[]}}
   */
  const results = {
    timestamp: new Date().toISOString(),
    total_files: CORE_FILES.length,
    present_files: [],
    missing_files: [],
    invalid_files: [],
    integrity_status: 'OK',
    rt_violations: [],
    severity: '',
    recommendations: []
  };

  CORE_FILES.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        results.present_files.push({
          file,
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else {
        results.missing_files.push(file);
        results.integrity_status = 'VIOLATION';
      }
    } catch (error) {
      results.invalid_files.push({
        file,
        error: error instanceof Error ? error.message : String(error)
      });
      results.integrity_status = 'VIOLATION';
    }
  });

  // RT-PIPE violation se arquivos faltam
  if (results.missing_files.length > 0) {
    results.rt_violations = ['RT-PIPE'];
    results.severity = 'CRITICAL';
    results.recommendations = [
      'Criar arquivos core faltantes imediatamente',
      'Executar STOP-WORK até que todos os arquivos estejam presentes'
    ];
  }

  return results;
}

if (require.main === module) {
  const result = checkCoreFiles();
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { checkCoreFiles };
