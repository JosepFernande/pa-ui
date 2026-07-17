import * as fs from 'node:fs';
import * as path from 'node:path';

function libRoot(): string {
  return path.resolve(__dirname, '../..');
}

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

describe('Umbrella packaging contract — source-level', () => {
  describe('public-api.ts barrel', () => {
    it('exists at libs/pa-ui/src/public-api.ts', () => {
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

    it('name is @pa-ui', () => {
      expect(pkg['name']).toBe('@pa-ui');
    });

    it('sideEffects is set to false', () => {
      expect(pkg['sideEffects']).toBe(false);
    });

    it('private is NOT true (umbrella IS publishable)', () => {
      expect(pkg['private']).toBeUndefined();
    });

    it('dependencies include @pa-ui/button', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@pa-ui/button']).toBeDefined();
    });

    it('dependencies include @pa-ui/core', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@pa-ui/core']).toBeDefined();
    });

    it('dependencies include @pa-ui/input', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@pa-ui/input']).toBeDefined();
    });
  });

  describe('umbrella re-exports', () => {
    it('public-api.ts re-exports from @pa-ui/button', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@pa-ui/button'");
    });

    it('public-api.ts re-exports from @pa-ui/core', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@pa-ui/core'");
    });

    it('public-api.ts re-exports from @pa-ui/input', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@pa-ui/input'");
    });
  });
});
