// eslint-disable-next-line strict
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  coverageDirectory: 'tests/coverage',
  transformIgnorePatterns: ['node_modules/(?!@pega)'],
  moduleNameMapper: { '\\.scss$': '<rootDir>/empty-module.js' }
};
