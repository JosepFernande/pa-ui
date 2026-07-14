/** @type {import('jest').Config} */
export default {
  displayName: 'stylelint-pa-ui-rules',
  testEnvironment: 'node',
  rootDir: '../../..',
  roots: ['<rootDir>/tools/stylelint/pa-ui-rules'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tools/stylelint/pa-ui-rules/tsconfig.test.json',
        diagnostics: false,
      },
    ],
  },
  testMatch: [
    '**/tools/stylelint/pa-ui-rules/src/rules/__tests__/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
