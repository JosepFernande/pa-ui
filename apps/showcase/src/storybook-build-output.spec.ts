import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

function workspaceRoot(): string {
  return path.resolve(__dirname, '..', '..', '..');
}

function storybookOutputDir(): string {
  return path.resolve(workspaceRoot(), 'dist', 'storybook', 'showcase');
}

function collectFileContents(dir: string, predicate: (fileName: string) => boolean): string[] {
  const contents: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      contents.push(...collectFileContents(fullPath, predicate));
    } else if (predicate(entry.name)) {
      contents.push(fs.readFileSync(fullPath, 'utf-8'));
    }
  }
  return contents;
}

/**
 * Regression test for the CRITICAL-1 finding from sdd-verify: a real
 * `nx build-storybook showcase` succeeded (exit 0) while the built bundle
 * silently contained ZERO Foundation CSS (`libs/core/src/lib/foundation/theme.css`)
 * declarations, because the side-effect `import '@pa-ui/core/theme.css'` in
 * `preview.ts` was resolved via a `tsconfig.base.json` path mapping to a
 * non-TS module and elided at emit time — so webpack never saw the request.
 *
 * This spec runs the REAL build (no mocks) and asserts the emitted assets
 * actually contain a Foundation declaration, so this failure mode cannot
 * silently recur and be reported as "verified" without being true.
 */
describe('Storybook build output — Foundation CSS reaches the bundle', () => {
  beforeAll(() => {
    const dist = storybookOutputDir();
    if (fs.existsSync(dist)) {
      fs.rmSync(dist, { recursive: true, force: true });
    }
    execSync('npx nx build-storybook showcase --skip-nx-cache', {
      stdio: 'inherit',
      cwd: workspaceRoot(),
    });
  }, 300_000);

  it('produces a build output directory', () => {
    expect(fs.existsSync(storybookOutputDir())).toBe(true);
  });

  it('the built assets (JS or CSS) contain the real Foundation declaration --pa-button-min-width-md: 224px', () => {
    const dist = storybookOutputDir();
    const assetContents = collectFileContents(
      dist,
      (fileName) => fileName.endsWith('.js') || fileName.endsWith('.css'),
    );
    const hasFoundationDeclaration = assetContents.some(
      (content) => content.includes('--pa-button-min-width-md') && content.includes('224px'),
    );
    expect(hasFoundationDeclaration).toBe(true);
  });

  it('the built assets contain other unambiguous Foundation-only tokens (dark-blue-25, Montserrat)', () => {
    const dist = storybookOutputDir();
    const assetContents = collectFileContents(
      dist,
      (fileName) => fileName.endsWith('.js') || fileName.endsWith('.css'),
    );
    const combined = assetContents.join('\n');
    expect(combined).toContain('dark-blue-25');
    expect(combined).toContain('Montserrat');
  });
});
