/**
 * Type declarations for the @halo-ui/angular umbrella entry (index.mjs).
 *
 * The umbrella is a plain ESM re-export copied into dist/ by its build target
 * (nx:run-commands), so it never goes through ng-packagr. Runtime and types
 * must be mirrored by hand: this file re-exports exactly what index.mjs
 * re-exports, so TypeScript consumers get declarations (issue #78).
 */
export * from '@halo-ui/button';
export * from '@halo-ui/core';
export * from '@halo-ui/input';
export * from '@halo-ui/select';
