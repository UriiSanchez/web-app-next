const nextJest = require('next/jest');

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
   // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
   dir: './',
});

const config = {
   roots: ['<rootDir>/src'],
   testMatch: ['<rootDir>/src/__tests__/**/*.test.js', '<rootDir>/src/__tests__/**/*.test.jsx'],
   testTimeout: 30000,
   // Automatically clear mock calls, instances, contexts and results before every test
   clearMocks: true,
   // Indicates whether the coverage information should be collected while executing the test
   collectCoverage: true,
   // An array of glob patterns indicating a set of files for which coverage information should be collected
   collectCoverageFrom: [
      'src/components/**/*',
      'src/helpers/**/*',
      'src/hooks/**/*',
      'src/pages/**/*',
      'src/services/**/*',
   ],
   // The directory where Jest should output its coverage files
   coverageDirectory: 'coverage',
   // An array of regexp pattern strings used to skip coverage collection
   coveragePathIgnorePatterns: [
      '/src/__tests__',
      '/node_modules/',
      '/src/context/*.js',
      '/src/components/Skeleton/.*[.]jsx',
      '/src/components/SVG/.*[.]jsx',
      '/src/pages/_app.js',
      '/src/pages/_document.js',
      '/src/pages/api/auth/*',
   ],
   // Indicates which provider should be used to instrument code for coverage
   coverageProvider: 'v8',
   // A list of reporter names that Jest uses when writing coverage reports
   coverageReporters: ['json', 'text', 'lcov', 'clover'],
   // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
   maxWorkers: '50%',
   // Use this configuration option to add custom reporters to Jest
   reporters: ['default'],
   // A list of paths to modules that run some code to configure or set up the testing framework before each test
   setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
   // The test environment that will be used for testing
   testEnvironment: './FixJSDOMEnvironment.js',
   // This option allows the use of a custom results processor
   testResultsProcessor: 'jest-sonar-reporter',
};

module.exports = createJestConfig(config);
