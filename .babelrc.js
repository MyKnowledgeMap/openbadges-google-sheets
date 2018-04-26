// Register the .env variables which can be injected.
require("dotenv-safe").config();

// The plugins to transform code.
const plugins = [
  // Replace ES2015 spread / rest to ES5.
  ["@babel/plugin-transform-spread"],
  // Replace Object.assign with an inline helper "_extends.
  ["babel-plugin-transform-object-assign"],
  // Remove export statements since they throw erorrs in GAS.
  ["babel-plugin-transform-remove-export"],
  // Transforms import html modules to an inline string.
  ["babel-plugin-transform-html-import-to-string"],
  // Transforms process.env.xxxxxxx to their actual value on build.
  ["babel-plugin-transform-inline-environment-variables"]
];

// The presets contain sets of plugins.
const presets = [
  // Transform typescript and add object rest & spread syntax.
  ["@babel/preset-typescript"],
  // Automatically determines the Babel plugins you need based on your supported environments. Default to ES5.
  ["@babel/preset-env"]
];

// The entry points to the addons.
const only = ["./src/sheets.ts"];

module.exports = {
  presets,
  plugins,
  only,
  comments: true,
  sourceType: "module"
};
