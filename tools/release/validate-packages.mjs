#!/usr/bin/env node
/**
 * Pre-publish package validation harness (issue #78).
 *
 * Guards the exact regression from #85: two alpha cycles were published with
 * no main/module/exports/typings in the published package.json because the
 * publish step targeted the SOURCE package (libs/<lib>) instead of the real
 * ng-packagr output under dist/libs/<lib>. CI stayed green end to end.
 *
 * Two checks:
 *   1. Every publishable lib's dist/libs/<lib>/package.json must expose a
 *      runtime entry (main and/or exports["."]) and a types entry
 *      (typings/types), all non-null. The dist package itself must exist:
 *      a publishable lib with no dist build would be silently skipped by the
 *      publish loop, so it is a failure too.
 *   2. Invariant: .github/workflows/release.yml must still publish from
 *      dist/$lib_dir. If the publish step ever points back at the source
 *      (libs/<lib>) or reverts to `changeset publish`, this fails explicitly
 *      instead of passing silently on a dist/ directory nobody publishes.
 *
 * Usage: node tools/release/validate-packages.mjs  (run after `nx build`)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const workflowPath = join(repoRoot, '.github/workflows/release.yml');

const failures = [];
const log = (msg) => console.log(msg);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

/** Every package under libs/* that is meant to reach npm. */
function publishableLibs() {
  const libsDir = join(repoRoot, 'libs');
  return readdirSync(libsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const pkgPath = join(libsDir, entry.name, 'package.json');
      if (!existsSync(pkgPath)) return null;
      try {
        return { lib: entry.name, pkg: readJson(pkgPath) };
      } catch {
        return null;
      }
    })
    .filter((candidate) => candidate !== null && candidate.pkg.publishConfig?.access === 'public');
}

/** Check 1: the dist package.json that actually gets published. */
function checkDistPackage({ lib, pkg }) {
  const distPkgPath = join(repoRoot, 'dist', 'libs', lib, 'package.json');
  if (!existsSync(distPkgPath)) {
    failures.push(
      `${pkg.name}: missing dist/libs/${lib}/package.json — publishable package ` +
        'has no dist build, so the publish loop would skip it silently',
    );
    return;
  }
  const dist = readJson(distPkgPath);
  const runtimeEntry = dist.main || dist.exports?.['.'];
  const typesEntry = dist.typings || dist.types;
  if (!runtimeEntry) {
    failures.push(
      `${pkg.name}: dist/libs/${lib}/package.json has no main and no exports["."] — ` +
        'consumers get TS2307 (the #85 regression)',
    );
  }
  if (!typesEntry) {
    failures.push(
      `${pkg.name}: dist/libs/${lib}/package.json has no typings/types — ` +
        'consumers get no declaration file',
    );
  }
  if (runtimeEntry && typesEntry) {
    log(`  ok  ${pkg.name} (dist/libs/${lib}) — runtime entry + types present`);
  }
}

/** Extract one step block (by name) from the workflow YAML text. */
function extractStep(workflow, name) {
  const lines = workflow.split('\n');
  const start = lines.findIndex((line) => line.trim().startsWith(`- name: ${name}`));
  if (start === -1) return '';
  const block = [lines[start]];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\s*-\s+(name|uses|run|if):/.test(lines[i])) break;
    block.push(lines[i]);
  }
  return block.join('\n');
}

/** Check 2: the validated directory is the directory release.yml publishes. */
function checkPublishInvariant(workflow) {
  const step = extractStep(workflow, 'Publish to npm from dist');
  if (!step) {
    failures.push(
      'release.yml invariant: "Publish to npm from dist" step not found — ' +
        'the publish target can no longer be verified',
    );
    return;
  }
  const derivesDist = step.includes('dist_dir="dist/$lib_dir"');
  const publishesDist = /npm publish\s+"\$dist_dir"/.test(step);
  const publishesSource =
    /npm publish\s+"\$lib_dir"|npm publish\s+"\$src_pkg"|changeset publish/.test(step);
  if (!derivesDist || !publishesDist || publishesSource) {
    failures.push(
      'release.yml invariant: the "Publish to npm from dist" step no longer publishes ' +
        'dist/$lib_dir. Validation checks dist/libs/<lib> while publish would target ' +
        'something else (the source-lib regression from #85). Fix release.yml first.',
    );
    return;
  }
  log('  ok  release.yml — publish still targets dist/$lib_dir');
}

console.log('Validating publishable packages before publish...');
const libs = publishableLibs();
if (libs.length === 0) {
  failures.push('no publishable libs found under libs/* (publishConfig.access === "public")');
}
for (const entry of libs) checkDistPackage(entry);

let workflow = '';
try {
  workflow = readFileSync(workflowPath, 'utf8');
} catch {
  failures.push(`${workflowPath} unreadable — release.yml invariant not verified`);
}
if (workflow) checkPublishInvariant(workflow);

if (failures.length > 0) {
  console.error('\nValidation FAILED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('\nFix the issues above; the publish step will not run until validation passes.');
  process.exit(1);
}
console.log('\nAll publishable packages validated. Ready to publish.');
