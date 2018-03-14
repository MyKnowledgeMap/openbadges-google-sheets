module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      useBabelrc: true
    }
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^.+\\.html$": "<rootDir>/src/helpers/html.mock.js"
  }
};
