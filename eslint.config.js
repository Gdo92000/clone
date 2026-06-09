import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import { fixupConfigRules } from '@eslint/compat';

export default tseslint.config(
  {
  ignores: [
  'dist/',
  'node_modules/',
  'drizzle/',
  '*.config.*',
  'scripts/',
  '.opencode/',
  '.roo/',
  '.windsurf/',
  'coverage/',
  '*.d.ts',
  '.eslintcache',
  '.kilo/',
],
  },

  // FRONTEND
  {
    files: ['src/**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,

      ...tseslint.configs.strictTypeChecked,

      ...fixupConfigRules(reactPlugin.configs.flat.recommended),

      ...fixupConfigRules(reactPlugin.configs.flat['jsx-runtime']),
    ],

  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },

    plugins: {
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      'unused-imports': unusedImportsPlugin,
      import: importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
    },

    rules: {
      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // React Refresh
      'react-refresh/only-export-components': 'warn',

      // Imports mortos
      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Segurança de tipos
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // Console
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      // Imports — maxDepth evita percorrer o grafo inteiro
      'import/no-cycle': ['error', { maxDepth: 10 }],
      'import/no-duplicates': 'error',

      // Arquitetura
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../api/httpClient', '@/api/httpClient'],
              message:
                'Use API modules. Não importe httpClient diretamente em pages/hooks/components.',
            },
          ],
        },
      ],
    },
  },

  // BACKEND
  {
    files: ['server/src/**/*.ts'],

    extends: [
      js.configs.recommended,

      ...tseslint.configs.strictTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      'unused-imports': unusedImportsPlugin,
      import: importPlugin,
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './server/tsconfig.json',
          ],
        },
      },
    },

    rules: {
      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      'import/no-cycle': ['error', { maxDepth: 10 }],
      'import/no-duplicates': 'error',

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  }
);
