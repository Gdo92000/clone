#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Invariant
 * @property {string} name
 * @property {string} description
 * @property {function(string): string[]} check
 */

const INVARIANTS = {
  OMEGA: {
    name: 'Exclusividade de Domínio',
    description: 'Um arquivo = uma responsabilidade clara',
    /**
     * @param {string} projectPath
     * @returns {string[]}
     */
    check: (projectPath) => {
      /** @type {string[]} */
      const violations = [];
      const srcPath = path.join(projectPath, 'src');

      if (fs.existsSync(srcPath)) {
        const files = fs.readdirSync(srcPath, { withFileTypes: true });
        files.forEach(file => {
          if (file.isFile() && file.name.length > 500) {
            violations.push(`${file.name}: arquivo com mais de 500 linhas`);
          }
          if (file.isFile() && file.name.includes('.test.') && file.name.includes('.spec.')) {
            violations.push(`${file.name}: múltiplas responsabilidades no mesmo arquivo`);
          }
        });
      }

      return violations;
    }
  },

  PSI: {
    name: 'Pureza Epistemológica',
    description: 'Não misturar lógica de domínio com UI',
    /**
     * @param {string} projectPath
     * @returns {string[]}
     */
    check: (projectPath) => {
      /** @type {string[]} */
      const violations = [];
      const componentsPath = path.join(projectPath, 'src', 'components');
      const servicesPath = path.join(projectPath, 'src', 'services');

      if (fs.existsSync(componentsPath) && fs.existsSync(servicesPath)) {
        const componentFiles = fs.readdirSync(componentsPath);
        const serviceFiles = fs.readdirSync(servicesPath);

        componentFiles.forEach(comp => {
          const content = fs.readFileSync(path.join(componentsPath, comp), 'utf8');
          if (content.includes('fetch(') || content.includes('axios.')) {
            violations.push(`Component ${comp}: contém lógica de negócio/dados`);
          }
        });
      }

      return violations;
    }
  },

  LAMBDA: {
    name: 'Modularidade Estrutural',
    description: 'Máx 300 linhas, 5 exports, 20 funções',
    /**
     * @param {string} projectPath
     * @returns {string[]}
     */
    check: (projectPath) => {
      /** @type {string[]} */
      const violations = [];
      /**
       * @param {string} filePath
       */
      const checkFile = (filePath) => {
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        const exports = (content.match(/export\s+/g) || []).length;
        const functions = (content.match(/function\s+\w+|const\s+\w+\s*=|class\s+\w+/g) || []).length;

        if (lines > 300) violations.push(`${path.basename(filePath)}: ${lines} linhas (>300)`);
        if (exports > 5) violations.push(`${path.basename(filePath)}: ${exports} exports (>5)`);
        if (functions > 20) violations.push(`${path.basename(filePath)}: ${functions} funções (>20)`);
      };

      const srcPath = path.join(projectPath, 'src');
      if (fs.existsSync(srcPath)) {
        /** @param {string} dir */
        const walkDir = (dir) => {
          const items = fs.readdirSync(dir);
          items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
              walkDir(fullPath);
            } else if (item.endsWith('.js') || item.endsWith('.ts')) {
              checkFile(fullPath);
            }
          });
        };
        walkDir(srcPath);
      }

      return violations;
    }
  },

  GAMMA: {
    name: 'Artifact Granularity',
    description: '1 artefato por arquivo',
    /**
     * @param {string} projectPath
     * @returns {string[]}
     */
    check: (projectPath) => {
      /** @type {string[]} */
      const violations = [];
      /**
       * @param {string} filePath
       */
      const checkMultipleArtifacts = (filePath) => {
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, 'utf8');
        const classCount = (content.match(/class\s+\w+/g) || []).length;
        const interfaceCount = (content.match(/interface\s+\w+/g) || []).length;
        const typeCount = (content.match(/type\s+\w+/g) || []).length;

        if (classCount + interfaceCount + typeCount > 1) {
          violations.push(`${path.basename(filePath)}: múltiplos artefatos no mesmo arquivo`);
        }
      };

      const srcPath = path.join(projectPath, 'src');
      if (fs.existsSync(srcPath)) {
        /** @param {string} dir */
        const walkDir = (dir) => {
          const items = fs.readdirSync(dir);
          items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
              walkDir(fullPath);
            } else if (item.endsWith('.js') || item.endsWith('.ts')) {
              checkMultipleArtifacts(fullPath);
            }
          });
        };
        walkDir(srcPath);
      }

      return violations;
    }
  }
};

/**
 * @param {string} [projectPath='.']
 * @returns {{timestamp: string, integrity_status: string, invariants_violated: string[], invariantes_status: {[key: string]: string}, rt_violations: string[], severity: string, recommendations: string[]}}
 */
function validateInvariants(projectPath = '.') {
  /** @type {{timestamp: string, integrity_status: string, invariants_violated: string[], invariantes_status: {[key: string]: string}, rt_violations: string[], severity: string, recommendations: string[]}} */
  const results = {
    timestamp: new Date().toISOString(),
    integrity_status: 'OK',
    invariants_violated: [],
    invariantes_status: {},
    rt_violations: [],
    severity: 'OK',
    recommendations: []
  };

  Object.entries(INVARIANTS).forEach(([key, invariant]) => {
    try {
      const violations = invariant.check(projectPath);
      if (violations.length > 0) {
        results.invariantes_status[key] = 'VIOLATED';
        results.invariants_violated.push(key);
        results.integrity_status = 'VIOLATION';
        results.rt_violations.push(`RT-ARCH`);
        results.severity = 'HIGH';
        results.recommendations.push(`Corrigir violações do invariante ${invariant.name}: ${violations.join(', ')}`);
      } else {
        results.invariantes_status[key] = 'OK';
      }
    } catch (error) {
      results.invariantes_status[key] = 'ERROR';
      results.invariants_violated.push(key);
      results.integrity_status = 'VIOLATION';
      results.rt_violations.push('RT-ARCH');
      results.severity = 'HIGH';
      results.recommendations.push(`Erro na validação do invariante ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return results;
}

if (require.main === module) {
  const projectPath = process.argv[2] || '.';
  const result = validateInvariants(projectPath);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { validateInvariants, INVARIANTS };
