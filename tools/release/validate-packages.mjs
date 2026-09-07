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
export function extractStep(workflow, name) {
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

/**
 * Threat Matrix — Git repository selection / Push state (#139 S3, issue
 * threat: "five brand-new tag refs pushed with an explicit refspec").
 *
 * Pure check (no shared-state side effects) so it is independently testable:
 * the publish step must still create an annotated tag with
 * `git tag -a "${name}@${version}"` and push it with `git push origin`, in
 * the implicit checkout cwd — no `git -C`/relative-path repo selection, and
 * no `--force`/`+refs` force-push escape hatch.
 */
export function checkTagPushInvariant(step) {
  // Escape hatches checked first: an inserted -C/relative-path or
  // --force/+refs would also corrupt the exact-shape checks below, so
  // detecting them first gives a precise, non-misleading failure reason.
  if (/git\s+-C\s+\S+/.test(step) || /git\s+tag\s+-a\s+["']?\.\.\//.test(step)) {
    return {
      ok: false,
      reason: 'git repo selection escaped the implicit checkout cwd via -C or a relative path',
    };
  }
  if (/--force\b/.test(step) || /\+refs\//.test(step)) {
    return { ok: false, reason: 'publish step gained a --force or +refs escape hatch' };
  }
  if (!/git tag -a\s+"\$\{name\}@\$\{version\}"/.test(step)) {
    return { ok: false, reason: 'missing `git tag -a "${name}@${version}"`' };
  }
  if (!/git push origin\s+"\$\{name\}@\$\{version\}"/.test(step)) {
    return { ok: false, reason: 'missing `git push origin "${name}@${version}"`' };
  }
  return { ok: true };
}

/**
 * Extracts the lib directory names from an explicit
 * `for lib_dir in libs/core libs/button ...; do` loop header. Returns `[]`
 * if the step still uses a `libs/` wildcard package.json glob (or any other
 * shape), so callers can distinguish "explicit list, empty" from "not
 * explicit" via `checkPublishOrderInvariant`'s own glob detection below.
 */
export function extractPublishOrder(step) {
  const match = step.match(/for\s+lib_dir\s+in\s+([^;]+);\s*do/);
  if (!match) return [];
  return match[1]
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^libs\//, ''));
}

/**
 * Threat Matrix — Push state (#139 S4 task 4.9/4.12): the umbrella package
 * depends on core/button/input-text/select, so it must always publish AFTER
 * all four. A `for src_pkg in libs/` wildcard package.json glob sorts
 * alphabetically as button, core, halo-ui, input-text, select — publishing
 * the umbrella before input-text/select even though it depends on them,
 * leaving it briefly uninstallable. This check requires an EXPLICIT ordered list
 * (never a glob) covering exactly the publishable libs, with core first
 * and the umbrella last.
 */
export function checkPublishOrderInvariant(order, publishableLibNames) {
  if (order.length === 0) {
    return {
      ok: false,
      reason:
        'publish step has no explicit `for lib_dir in ...` list (reverted to a libs/*/package.json glob?)',
    };
  }

  const orderSet = new Set(order);
  const expectedSet = new Set(publishableLibNames);
  const missing = publishableLibNames.filter((lib) => !orderSet.has(lib));
  const extra = order.filter((lib) => !expectedSet.has(lib));
  if (missing.length > 0 || extra.length > 0) {
    return {
      ok: false,
      reason:
        `explicit list does not cover exactly the publishable libs — ` +
        `missing: [${missing.join(', ') || 'none'}], unexpected: [${extra.join(', ') || 'none'}]`,
    };
  }

  const umbrella = 'halo-ui';
  const deps = order.filter((lib) => lib !== 'core' && lib !== umbrella);
  const coreIndex = order.indexOf('core');
  for (const dep of deps) {
    if (order.indexOf(dep) < coreIndex) {
      return { ok: false, reason: `"core" must be listed before "${dep}" (dependency order)` };
    }
  }
  const umbrellaIndex = order.indexOf(umbrella);
  for (const dep of [...deps, 'core']) {
    if (umbrellaIndex < order.indexOf(dep)) {
      return {
        ok: false,
        reason: `"${umbrella}" must be listed last — it depends on "${dep}" (dependency order)`,
      };
    }
  }

  return { ok: true };
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

  const tagPush = checkTagPushInvariant(step);
  if (!tagPush.ok) {
    failures.push(`release.yml invariant: publish step git tag/push regressed — ${tagPush.reason}`);
    return;
  }
  log('  ok  release.yml — publish step still tags and pushes each published package');

  const order = extractPublishOrder(step);
  const orderCheck = checkPublishOrderInvariant(
    order,
    publishableLibs().map((entry) => entry.lib),
  );
  if (!orderCheck.ok) {
    failures.push(`release.yml invariant: publish order regressed — ${orderCheck.reason}`);
    return;
  }
  log('  ok  release.yml — publish order covers exactly the publishable libs, dependency-first');
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
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
}
