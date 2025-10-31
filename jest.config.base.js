export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  extensionsToTreatAsEsm: ['.ts'],
};
