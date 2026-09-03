/** @type {import('jest').Config} */
export default {
  displayName: 'audit',
  testEnvironment: 'node',
  rootDir: '../..',
  roots: ['<rootDir>/tools/audit'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tools/audit/tsconfig.test.json',
        diagnostics: false,
      },
    ],
  },
  testMatch: ['**/tools/audit/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
