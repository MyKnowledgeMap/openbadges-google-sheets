// Register the .env variables since we need to inject them.
const result = require("dotenv").config();
if (result.error) {
  throw result.error;
}

// The plugins to transform code.
const plugins = [
  [
    // Transforms import html modules to an inline string.
    require("babel-plugin-transform-html-import-to-string")
  ],
  [
    // Transforms process.env.xxxxxxx to their actual value process.env value.
    require("babel-plugin-transform-inline-environment-variables")
  ]
];

// The presets contain sets of plugins.
const presets = [
  [
    // Transform typescript and add object rest & spread syntax.
    require("@babel/preset-typescript")
  ],
  [
    // Automatically determines the Babel plugins you need based on your supported environments.
    require("@babel/preset-env")
  ]
];

// The entry points to the addons.
const entries = ["./src/forms.ts", "./src/sheets.ts"];

module.exports = {
  presets,
  plugins,
  only: entries,
  comments: false,
  sourceType: "module"
};
