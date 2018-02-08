const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin");
const GASWebpackPlugin = require("gas-webpack-plugin");

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
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: "babel-loader",
        options: {
          presets: [["env", { modules: false }]]
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Clean the /dist folder before adding the new files.
    new CleanWebpackPlugin(["dist"]),
    // Use the GoogleAppScript plugin to assign global functions.
    new GASWebpackPlugin()
    // Copy the UI templates.
    // new CopyWebpackPlugin([{ from: "./src/templates" }])
  ]
};
