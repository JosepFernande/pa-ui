// Root ESLint flat config for pa-ui
// Extends typescript-eslint + @nx/eslint-plugin, adds pa-ui module boundary rules
// and the pa-ui custom rules (placeholder for now — to be implemented).

import tseslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';

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
          ],
        },
      ],
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
);
