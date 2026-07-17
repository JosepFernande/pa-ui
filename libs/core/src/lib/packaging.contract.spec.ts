import * as fs from 'node:fs';
import * as path from 'node:path';

function libRoot(): string {
  return path.resolve(__dirname, '../..');
}

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

describe('Packaging contract — source-level', () => {
  describe('public-api.ts barrel', () => {
    it('exists at libs/core/src/public-api.ts', () => {
      const publicApi = path.resolve(libRoot(), 'src', 'public-api.ts');
      expect(fs.existsSync(publicApi)).toBe(true);
    });
  });

  describe('index.ts entry point', () => {
    it("re-exports from './public-api'", () => {
      const indexPath = path.resolve(libRoot(), 'src', 'index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain("export * from './public-api'");
    });
  });

  describe('package.json', () => {
    const pkg = readJson(path.resolve(libRoot(), 'package.json'));

    it('sideEffects is set to false', () => {
      expect(pkg['sideEffects']).toBe(false);
    });

    it('peerDependencies includes @angular/cdk', () => {
      const peers = pkg['peerDependencies'] as Record<string, string> | undefined;
      expect(peers).toBeDefined();
      expect(peers!['@angular/cdk']).toBeDefined();
    });

    it('peerDependencies includes @angular/forms', () => {
      const peers = pkg['peerDependencies'] as Record<string, string> | undefined;
      expect(peers).toBeDefined();
      expect(peers!['@angular/forms']).toBeDefined();
    });

    it('name is @pa-ui/core (public package)', () => {
      expect(pkg['name']).toBe('@pa-ui/core');
    });

    it('does NOT include @pa-ui/button in peerDependencies', () => {
      const peers = pkg['peerDependencies'] as Record<string, string> | undefined;
      expect(peers).toBeDefined();
      expect(peers!['@pa-ui/button']).toBeUndefined();
    });
  });

  describe('public-api exports', () => {
    it('public-api.ts does NOT re-export from @pa-ui/button', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).not.toContain("export * from '@pa-ui/button'");
    });

    it('public-api.ts exports PaUiComponent', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain('PaUiComponent');
    });
  });
});
