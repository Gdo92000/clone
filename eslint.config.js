import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import sonarjs from 'eslint-plugin-sonarjs'

import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'build',
    'coverage',
    'node_modules',
    '.opencode',
    '.windsurf',
    '.roo',
    'system-contract-validator',
  ]),

  js.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],

    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    plugins: {
      sonarjs,
    },

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      /*
       * REGRAS CRÍTICAS
       * Mantidas como error para evitar bugs reais
       */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],

      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],

      'no-debugger': 'error',

      /*
       * REGRAS DE MIGRAÇÃO GRADUAL
       * Mantidas como warn para evitar explosão de erros
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      /*
       * Temporariamente desabilitada para facilitar
       * estabilização do legado.
       *
       * Reativar futuramente como:
       * 'warn' -> depois 'error'
       */
      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',

      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],

      'sonarjs/cognitive-complexity': [
        'error',
        15,
      ],

      /*
       * REGRAS DESABILITADAS TEMPORARIAMENTE
       * Alto ruído em bases legadas
       */
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-unnecessary-type-parameters': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',

      /*
       * Unsafe rules:
       * habilitar gradualmente após maturidade da tipagem
       */
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      /*
       * React Fast Refresh
       */
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['useLocationContext'] },
      ],
    },
  },

  /*
   * Diretório de código novo/reescrito
   * Regras mais rígidas apenas para novas features
   */
  {
    files: ['src/new/**/*.{ts,tsx}'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
])