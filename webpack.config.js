const path = require("path");
const cleanWebpackPlugin = require("clean-webpack-plugin");
const copyWebpackPlugin = require("copy-webpack-plugin");
const gasWebpackPlugin = require("gas-webpack-plugin");

module.exports = {
  entry: [path.join(__dirname, "src/index.js")],
  output: {
    filename: "OpenBadges.gs",
    libraryTarget: "this",
    path: path.join(__dirname, "dist")
  },
  resolve: {
    extensions: [".js"],
    modules: [path.join(__dirname, "src"), path.join(__dirname, "node_modules")]
  },
  module: {
    rules: [{
      test: /\.html$/,
      use: [ {
        loader: 'html-loader',
        options: {
          minimize: false
        }
      }],
    }]
  },
  plugins: [
    // Clean the /dist folder before adding the new files.
    new cleanWebpackPlugin(["dist"]),
    // Use the GoogleAppScript plugin to assign global functions.
    new gasWebpackPlugin(),
    // Copy the UI templates.
    //new copyWebpackPlugin([{ from: "./src/templates" }])
  ]
};
