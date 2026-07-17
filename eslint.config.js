// Root ESLint flat config for pa-ui
// Extends typescript-eslint + @nx/eslint-plugin + angular-eslint + pa-ui custom rules
// eslint-config-prettier applied as last override to disable conflicting formatting rules.

import tseslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';
import angularEslint from 'angular-eslint';
import paUi from './tools/eslint/pa-ui-rules/dist/index.js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.nx/**',
      '**/.angular/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/out-tsc/**',
      '**/chrome/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@nx': nx,
      'pa-ui': paUi,
    },
    rules: {
      // Nx module boundaries — the architecture contract is enforced here.
      // Tags are declared per-project in their `project.json`.
      // Current tag scheme: type:app, type:ui, type:core, type:utils, scope:forms, scope:overlays
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: false,
          banTransitiveDependencies: true,
          checkDynamicDependenciesExceptions: ['^@angular/.*', '^@pa-ui/.*'],
          allow: [],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:ui', 'type:core', 'type:utils'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:core', 'type:utils'],
            },
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:core', 'type:utils'],
            },
            {
              sourceTag: 'type:utils',
              onlyDependOnLibsWithTags: ['type:utils'],
            },
            {
              sourceTag: 'type:umbrella',
              onlyDependOnLibsWithTags: ['type:ui', 'type:core', 'type:utils'],
            },
          ],
        },
      ],

      // pa-ui custom ESLint rules — architecture enforcement
      'pa-ui/require-view-encapsulation-none': 'error',
      'pa-ui/no-color-literal-union': 'error',
      'pa-ui/max-component-lines': 'error',
    },
  },
  // Base TypeScript rules — applied to all TS files except generated/config.
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow empty interfaces in some contexts (e.g., component config types).
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
  // Angular ESLint integration — use the angular-eslint TS plugin
  {
    plugins: {
      '@angular-eslint': angularEslint.tsPlugin,
    },
    rules: {
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/use-lifecycle-interface': 'warn',
    },
  },
  // eslint-config-prettier — MUST be last to disable conflicting ESLint formatting rules
  eslintConfigPrettier,
);
