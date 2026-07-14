/** @type {import('jest').Config} */
export default {
  displayName: 'eslint-pa-ui-rules',
  testEnvironment: 'node',
  rootDir: '../../..',
  roots: ['<rootDir>/tools/eslint/pa-ui-rules'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tools/eslint/pa-ui-rules/tsconfig.test.json',
        diagnostics: false,
      },
    ],
  },
  testMatch: [
    '**/tools/eslint/pa-ui-rules/src/rules/__tests__/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
