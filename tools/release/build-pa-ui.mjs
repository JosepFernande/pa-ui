#!/usr/bin/env node
/**
 * Assembles dist/libs/pa-ui without shelling out to POSIX-only `mkdir -p`/`cp`,
 * which fail under cmd.exe on Windows (nx:run-commands has no shell option here).
 *
 * Usage: node tools/release/build-pa-ui.mjs
 */
import { mkdirSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const outDir = join(repoRoot, 'dist/libs/pa-ui');

mkdirSync(outDir, { recursive: true });

for (const [from, to] of [
  ['libs/pa-ui/package.json', 'package.json'],
  ['libs/pa-ui/src/index.mjs', 'index.mjs'],
  ['libs/pa-ui/src/index.d.mts', 'index.d.mts'],
  ['README.md', 'README.md'],
]) {
  copyFileSync(join(repoRoot, from), join(outDir, to));
}
