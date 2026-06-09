import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import { fixupConfigRules } from '@eslint/compat';

const sharedRules = {
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

  'no-console': [
    'warn',
    {
      allow: ['warn', 'error'],
    },
  ],

  'import/no-cycle': ['error', { maxDepth: 10 }],
  'import/no-duplicates': 'error',
};

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

  // FRONTEND — app source (exclui testes)
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/test/**/*', 'src/__tests__/**/*'],

    extends: [
      js.configs.recommended,

      ...tseslint.configs.strictTypeChecked,

      ...fixupConfigRules(reactPlugin.configs.flat.recommended),

      ...fixupConfigRules(reactPlugin.configs.flat['jsx-runtime']),
    ],

    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json'],
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
      ...sharedRules,

      ...reactHooksPlugin.configs.recommended.rules,

      'react-refresh/only-export-components': 'warn',

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

  // FRONTEND — test files
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*', 'src/__tests__/**/*'],

    extends: [
      js.configs.recommended,

      ...tseslint.configs.strictTypeChecked,

      ...fixupConfigRules(reactPlugin.configs.flat.recommended),

      ...fixupConfigRules(reactPlugin.configs.flat['jsx-runtime']),
    ],

    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.test.json'],
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
      ...sharedRules,

      ...reactHooksPlugin.configs.recommended.rules,

      'react-refresh/only-export-components': 'off',
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
      ...sharedRules,
    },
  },
);
