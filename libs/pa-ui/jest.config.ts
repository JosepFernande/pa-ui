export default {
  displayName: 'pa-ui',
  preset: '../../jest.preset.cjs',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/pa-ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  collectCoverageFrom: ['<rootDir>/src/lib/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 90,
      statements: 80,
    },
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
