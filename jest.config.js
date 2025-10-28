export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // This tells Jest to find tests in all your packages
  projects: ['<rootDir>/packages/*'],
};