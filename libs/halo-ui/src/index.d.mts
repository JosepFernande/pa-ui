/**
 * Type declarations for the @halolib-ui/angular umbrella entry (index.mjs).
 *
 * The umbrella is a plain ESM re-export copied into dist/ by its build target
 * (nx:run-commands), so it never goes through ng-packagr. Runtime and types
 * must be mirrored by hand: this file re-exports exactly what index.mjs
 * re-exports, so TypeScript consumers get declarations (issue #78).
 */
export * from '@halolib-ui/button';
export * from '@halolib-ui/core';
export * from '@halolib-ui/input-text';
export * from '@halolib-ui/select';
