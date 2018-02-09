module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true
    }
  },
  extends: "google",
  rules: {
    quotes: [2, "double", { allowTemplateLiterals: true }],
    "comma-dangle": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "arrow-parens": ["error", "as-needed"]
  }
};
