module.exports = {
  printWidth: 80,
  parser: "typescript",
  trailingComma: "none",
  bracketSpacing: true,
  arrowParens: "always",
  semi: true,
  tabWidth: 2,
  overrides: [
    {
      files: "*.js",
      options: {
        parser: "bablyon"
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
