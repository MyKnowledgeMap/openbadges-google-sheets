module.exports = {
  parserOptions: {
    ecmaVersion: 5,
    sourceType: "module"
  },
  extends: "google",
  rules: {
    quotes: [2, "double", { allowTemplateLiterals: true }],
    "comma-dangle": ["error", "never"]
  }
};
