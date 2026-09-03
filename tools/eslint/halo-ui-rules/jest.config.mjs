/** @type {import('jest').Config} */
export default {
  displayName: 'eslint-halo-ui-rules',
  testEnvironment: 'node',
  rootDir: '../../..',
  roots: ['<rootDir>/tools/eslint/halo-ui-rules'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tools/eslint/halo-ui-rules/tsconfig.test.json',
        diagnostics: false,
      },
    ],
  },
  testMatch: ['**/tools/eslint/halo-ui-rules/src/rules/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
