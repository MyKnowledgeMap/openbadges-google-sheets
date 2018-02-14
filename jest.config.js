module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/*.{js,jsx,tsx,ts}",
    "!**/*.spec.*",
    "!**/*.mock.*",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  coverageReporters: ["json", "lcov"],
  moduleFileExtensions: ["js", "json"],
  moduleNameMapper: {
    "^.+\\.html$": "<rootDir>/src/templates/html.mock.js"
  },
  resetModules: true,
  restoreMocks: true,
  testRegex: "/src/.*\\.(spec).(ts|tsx|js)$"
};
