export default {
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**'
  ]
};