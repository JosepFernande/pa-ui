import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

function workspaceRoot(): string {
  return path.resolve(__dirname, '../../..', '..');
}

function distDir(): string {
  return path.resolve(workspaceRoot(), 'dist', 'libs', 'core');
}

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

describe('Build-output verification', () => {
  beforeAll(() => {
    const dist = distDir();
    if (fs.existsSync(dist)) {
      fs.rmSync(dist, { recursive: true, force: true });
    }
    execSync('nx build core --configuration=production', {
      stdio: 'inherit',
      cwd: workspaceRoot(),
    });
  }, 120_000);

  describe('dist shape', () => {
    it('dist/libs/core/package.json exists', () => {
      const pkgPath = path.resolve(distDir(), 'package.json');
      expect(fs.existsSync(pkgPath)).toBe(true);
    });

    it('dist package.json exports map has . and ./package.json keys', () => {
      const pkg = readJson(path.resolve(distDir(), 'package.json'));
      const exports = pkg['exports'] as Record<string, unknown> | undefined;
      expect(exports).toBeDefined();
      expect(exports!['.']).toBeDefined();
      expect(exports!['./package.json']).toBeDefined();
    });

    it('dist package.json peerDependencies includes all 4 Angular packages', () => {
      const pkg = readJson(path.resolve(distDir(), 'package.json'));
      const peers = pkg['peerDependencies'] as Record<string, string>;
      expect(peers['@angular/common']).toBeDefined();
      expect(peers['@angular/core']).toBeDefined();
      expect(peers['@angular/cdk']).toBeDefined();
      expect(peers['@angular/forms']).toBeDefined();
    });

    it('dist package.json peerDependencies does NOT include @pa-ui/button', () => {
      const pkg = readJson(path.resolve(distDir(), 'package.json'));
      const peers = pkg['peerDependencies'] as Record<string, string>;
      expect(peers['@pa-ui/button']).toBeUndefined();
    });

    it('fesm2022/pa-ui-core.mjs exists', () => {
      const mjsPath = path.resolve(distDir(), 'fesm2022', 'pa-ui-core.mjs');
      expect(fs.existsSync(mjsPath)).toBe(true);
    });

    it('index.d.ts exists at dist root (not typings/ dir)', () => {
      const dtsPath = path.resolve(distDir(), 'index.d.ts');
      expect(fs.existsSync(dtsPath)).toBe(true);
    });
  });

  describe('tree-shaking proxy', () => {
    it('fesm2022 bundle does not import @angular/cdk', () => {
      const mjsPath = path.resolve(distDir(), 'fesm2022', 'pa-ui-core.mjs');
      const content = fs.readFileSync(mjsPath, 'utf-8');
      expect(content).not.toContain("from '@angular/cdk'");
      expect(content).not.toContain('from "@angular/cdk"');
    });

    it('fesm2022 bundle does not import @angular/forms', () => {
      const mjsPath = path.resolve(distDir(), 'fesm2022', 'pa-ui-core.mjs');
      const content = fs.readFileSync(mjsPath, 'utf-8');
      expect(content).not.toContain("from '@angular/forms'");
      expect(content).not.toContain('from "@angular/forms"');
    });
  });
});
