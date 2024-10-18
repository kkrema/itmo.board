const js = require('@eslint/js');
const node = require('eslint-plugin-node');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,  // глобальные переменные Jest
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      node,
      jest: require('eslint-plugin-jest'),  // Подключаем плагин для Jest
      'no-only-tests': require('eslint-plugin-no-only-tests'),  // Плагин для запрета использования only в тестах
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-async-promise-executor': 'warn',
      'node/no-unpublished-require': 'off',
      'jest/no-disabled-tests': 'warn',  // Рекомендации Jest
      'jest/no-focused-tests': 'error',  // Рекомендации Jest
      'jest/no-identical-title': 'error',  // Рекомендации Jest
    },
  },
  js.configs.recommended,
];
