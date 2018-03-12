// Register the .env variables since we need to injec them.
require("dotenv").config();

// The additional plugins to use to transform the code.
const plugins = [
  "transform-html-import-to-string",
  "transform-inline-environment-variables"
];

// The presets contain a set of plugins.
const presets = ["@babel/typescript", "@babel/preset-env"];

// The entry points to the addons.
const entries = ["./src/forms.ts", "./src/sheets.ts"];

module.exports = {
  presets,
  plugins,
  only: entries,
  comments: false,
  sourceType: "module"
};
