module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts', '@testing-library/jest-dom'],
  coverageDirectory: 'tests/coverage',
  // transformIgnorePatterns: ['node_modules/(?!(gds-react-component-library)/)'],
  transformIgnorePatterns: ['node_modules/(?!@pega|gds-react-component-library)'],
  moduleNameMapper: { '\\.scss$': '<rootDir>/tests/mocks/scss-mock.js' }
};
