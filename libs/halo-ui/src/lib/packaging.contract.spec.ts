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
    it('exists at libs/halo-ui/src/public-api.ts', () => {
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

    it('name is @halo-ui/angular', () => {
      expect(pkg['name']).toBe('@halo-ui/angular');
    });

    it('sideEffects is set to false', () => {
      expect(pkg['sideEffects']).toBe(false);
    });

    it('private is NOT true (umbrella IS publishable)', () => {
      expect(pkg['private']).toBeUndefined();
    });

    it('dependencies include @halo-ui/button', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@halo-ui/button']).toBeDefined();
    });

    it('dependencies include @halo-ui/core', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@halo-ui/core']).toBeDefined();
    });

    it('dependencies include @halo-ui/input', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@halo-ui/input']).toBeDefined();
    });

    it('dependencies include @halo-ui/select', () => {
      const deps = pkg['dependencies'] as Record<string, string> | undefined;
      expect(deps).toBeDefined();
      expect(deps!['@halo-ui/select']).toBeDefined();
    });
  });

  describe('umbrella re-exports', () => {
    it('public-api.ts re-exports from @halo-ui/button', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@halo-ui/button'");
    });

    it('public-api.ts re-exports from @halo-ui/core', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@halo-ui/core'");
    });

    it('public-api.ts re-exports from @halo-ui/input', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@halo-ui/input'");
    });

    it('public-api.ts re-exports from @halo-ui/select', () => {
      const publicApiPath = path.resolve(libRoot(), 'src', 'public-api.ts');
      const content = fs.readFileSync(publicApiPath, 'utf-8');
      expect(content).toContain("export * from '@halo-ui/select'");
    });
  });

  describe('hand-maintained index.mjs / index.d.mts (nx:run-commands build, no ng-packagr)', () => {
    it('index.mjs re-exports from @halo-ui/select', () => {
      const indexMjsPath = path.resolve(libRoot(), 'src', 'index.mjs');
      const content = fs.readFileSync(indexMjsPath, 'utf-8');
      expect(content).toContain("export * from '@halo-ui/select'");
    });

    it('index.d.mts re-exports from @halo-ui/select', () => {
      const indexDMtsPath = path.resolve(libRoot(), 'src', 'index.d.mts');
      const content = fs.readFileSync(indexDMtsPath, 'utf-8');
      expect(content).toContain("export * from '@halo-ui/select'");
    });
  });

  describe('libs/select project.json target parity with libs/input (spec R7-S19)', () => {
    const selectProjectJson = readJson(path.resolve(libRoot(), '..', 'select', 'project.json'));
    const inputProjectJson = readJson(path.resolve(libRoot(), '..', 'input', 'project.json'));

    it('defines the same build/test/lint/stylelint target names as libs/input/project.json', () => {
      const selectTargets = Object.keys(selectProjectJson['targets'] as Record<string, unknown>);
      const inputTargets = Object.keys(inputProjectJson['targets'] as Record<string, unknown>);

      for (const target of ['build', 'test', 'lint', 'stylelint']) {
        expect(inputTargets).toContain(target);
        expect(selectTargets).toContain(target);
      }
    });
  });

  describe('.changeset/config.json fixed group (spec R7-S20)', () => {
    it('includes @halo-ui/select in the fixed group so it version-bumps with the rest of the umbrella', () => {
      const changesetConfigPath = path.resolve(libRoot(), '..', '..', '.changeset', 'config.json');
      const changesetConfig = readJson(changesetConfigPath);
      const fixedGroups = changesetConfig['fixed'] as string[][];

      const includesSelect = fixedGroups.some((group) => group.includes('@halo-ui/select'));
      expect(includesSelect).toBe(true);
    });
  });
});
