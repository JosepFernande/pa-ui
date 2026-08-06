/**
 * Type declarations for the @pa-ui/angular umbrella entry (index.mjs).
 *
 * The umbrella is a plain ESM re-export copied into dist/ by its build target
 * (nx:run-commands), so it never goes through ng-packagr. Runtime and types
 * must be mirrored by hand: this file re-exports exactly what index.mjs
 * re-exports, so TypeScript consumers get declarations (issue #78).
 */
export * from '@pa-ui/button';
export * from '@pa-ui/core';
export * from '@pa-ui/input';
