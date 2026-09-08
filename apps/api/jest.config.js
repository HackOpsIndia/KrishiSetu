/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 35000,
  moduleNameMapper: {
    '^@krishisetu/shared$': '<rootDir>/../../packages/shared/src',
    '^@krishisetu/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
};
