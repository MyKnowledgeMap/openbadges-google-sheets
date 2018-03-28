// Register the .env variables since we need to inject them.
require("dotenv-safe").config();

// The plugins to transform code.
const plugins = [
  [require("babel-plugin-transform-object-assign")],
  [
    // Remove export statements since they throw erorrs in GAS.
    require("babel-plugin-transform-remove-export")
  ],
  [
    // Transforms import html modules to an inline string.
    require("babel-plugin-transform-html-import-to-string")
  ],
  [
    // Transforms process.env.xxxxxxx to their actual value on build.
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
    // Automatically determines the Babel plugins you need based on your supported environments. Default to ES5.
    require("@babel/preset-env")
  ]
];

// The entry points to the addons.
const only = ["./src/forms.ts", "./src/sheets.ts"];

module.exports = {
  presets,
  plugins,
  only,
  comments: false,
  sourceType: "module"
};
