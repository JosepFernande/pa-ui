/** @type {import('jest').Config} */
export default {
  displayName: 'stylelint-halo-ui-rules',
  testEnvironment: 'node',
  rootDir: '../../..',
  roots: ['<rootDir>/tools/stylelint/halo-ui-rules'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tools/stylelint/halo-ui-rules/tsconfig.test.json',
        diagnostics: false,
      },
    ],
  },
  testMatch: ['**/tools/stylelint/halo-ui-rules/src/rules/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
