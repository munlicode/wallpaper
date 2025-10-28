export default {
  displayName: 'core',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // Find test files that end in .test.ts
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};