const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  collectCoverageFrom: ['<rootDir>/src/lib/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 90,
      statements: 80,
    },
  },
};
