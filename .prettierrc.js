module.exports = {
  printWidth: 80,
  parser: "typescript",
  trailingComma: "none",
  bracketSpacing: true,
  arrowParens: "avoid",
  semi: true,
  tabWidth: 2,
  overrides: [
    {
      files: "*.js",
      options: {
        parser: "babylon"
      }
    },
    {
      files: "*.json",
      options: {
        parser: "json"
      }
    }
  ]
};
