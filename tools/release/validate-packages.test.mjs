// Node built-in test runner: `node --test tools/release/validate-packages.test.mjs`
//
// Covers the S3 Threat Matrix item (Git repository selection / Push state):
// the "Publish to npm from dist" step in release.yml must keep creating an
// annotated tag with `git tag -a "${name}@${version}"` and pushing it with
// `git push origin`, in the implicit checkout cwd (no `-C`/relative-path
// selection, no `--force`/`+refs`). Extracted as a pure function so it is
// testable without importing (and running) the whole CLI script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractStep,
  checkTagPushInvariant,
  extractPublishOrder,
  checkPublishOrderInvariant,
} from './validate-packages.mjs';

const PUBLISH_STEP_OK = `- name: Publish to npm from dist
  id: publish
  if: steps.changesets.outputs.has_changesets == 'false'
  run: |
    for src_pkg in libs/*/package.json; do
      lib_dir="$(dirname "$src_pkg")"
      dist_dir="dist/$lib_dir"
      [ -f "$dist_dir/package.json" ] || continue
      name="$(node -p "require('./$src_pkg').name")"
      version="$(node -p "require('./$src_pkg').version")"
      npm publish "$dist_dir" --access public
      git tag -a "\${name}@\${version}" -m "\${name}@\${version}"
      git push origin "\${name}@\${version}"
    done
- name: Next step
  run: echo done
`;

test('extractStep pulls exactly the named step block', () => {
  const step = extractStep(PUBLISH_STEP_OK, 'Publish to npm from dist');
  assert.match(step, /npm publish "\$dist_dir"/);
  assert.doesNotMatch(step, /Next step/);
});

test('checkTagPushInvariant passes when the step still tags and pushes each published package', () => {
  const step = extractStep(PUBLISH_STEP_OK, 'Publish to npm from dist');
  const result = checkTagPushInvariant(step);
  assert.equal(result.ok, true);
});

test('checkTagPushInvariant fails when the annotated git tag step is missing', () => {
  const stepWithoutTag = PUBLISH_STEP_OK.replace(/git tag -a[^\n]*\n/, '');
  const result = checkTagPushInvariant(stepWithoutTag);
  assert.equal(result.ok, false);
  assert.match(result.reason, /git tag -a/);
});

test('checkTagPushInvariant fails when git push origin is missing', () => {
  const stepWithoutPush = PUBLISH_STEP_OK.replace(/git push origin[^\n]*\n/, '');
  const result = checkTagPushInvariant(stepWithoutPush);
  assert.equal(result.ok, false);
  assert.match(result.reason, /git push origin/);
});

test('checkTagPushInvariant fails on a repo-selection escape hatch (git -C or a relative path)', () => {
  const stepWithDashC = PUBLISH_STEP_OK.replace('git tag -a', 'git -C ../other tag -a');
  const result = checkTagPushInvariant(stepWithDashC);
  assert.equal(result.ok, false);
  assert.match(result.reason, /-C|relative path/);
});

test('checkTagPushInvariant fails on a force-push or refspec escape hatch', () => {
  const stepWithForce = PUBLISH_STEP_OK.replace(
    'git push origin "${name}@${version}"',
    'git push --force origin "${name}@${version}"',
  );
  const result = checkTagPushInvariant(stepWithForce);
  assert.equal(result.ok, false);
  assert.match(result.reason, /--force|\+refs/);
});

// ----------------------------------------------------------------------
// Publish-order invariant (#139 S4 task 4.9/4.12 — the umbrella-publishes-
// before-its-deps risk: a `libs/*/package.json` glob sorts alphabetically
// as button, core, halo-ui, input-text, select, publishing the umbrella
// before input-text/select even though it depends on them).
// ----------------------------------------------------------------------

const FIVE_LIBS = ['core', 'button', 'input-text', 'select', 'halo-ui'];

test('extractPublishOrder reads the explicit `for lib_dir in ...` list in dependency order', () => {
  const order = extractPublishOrder(
    PUBLISH_STEP_OK.replace(
      'for src_pkg in libs/*/package.json; do\n      lib_dir="$(dirname "$src_pkg")"',
      'for lib_dir in libs/core libs/button libs/input-text libs/select libs/halo-ui; do\n      src_pkg="$lib_dir/package.json"',
    ),
  );
  assert.deepEqual(order, ['core', 'button', 'input-text', 'select', 'halo-ui']);
});

test('checkPublishOrderInvariant passes for the explicit dependency-ordered list covering exactly the 5 publishable libs', () => {
  const result = checkPublishOrderInvariant(
    ['core', 'button', 'input-text', 'select', 'halo-ui'],
    FIVE_LIBS,
  );
  assert.equal(result.ok, true);
});

test('checkPublishOrderInvariant fails when the step reverts to a libs/*/package.json glob', () => {
  const result = checkPublishOrderInvariant([], FIVE_LIBS);
  assert.equal(result.ok, false);
  assert.match(result.reason, /explicit|glob/);
});

test('checkPublishOrderInvariant fails when a publishable lib is missing from the list', () => {
  const result = checkPublishOrderInvariant(['core', 'button', 'input-text', 'halo-ui'], FIVE_LIBS);
  assert.equal(result.ok, false);
  assert.match(result.reason, /select/);
});

test('checkPublishOrderInvariant fails when the umbrella is listed before one of its dependencies', () => {
  const result = checkPublishOrderInvariant(
    ['core', 'button', 'halo-ui', 'input-text', 'select'],
    FIVE_LIBS,
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /halo-ui|order/);
});

test('checkPublishOrderInvariant fails when core is listed after a dependent', () => {
  const result = checkPublishOrderInvariant(
    ['button', 'core', 'input-text', 'select', 'halo-ui'],
    FIVE_LIBS,
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /core|order/);
});
