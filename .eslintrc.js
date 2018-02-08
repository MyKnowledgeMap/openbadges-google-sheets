module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  extends: "google",
  rules: {
    quotes: [2, "double", { allowTemplateLiterals: true }],
    "comma-dangle": ["error", "never"],
    "object-curly-spacing": ["error", "always"]
  }
};
