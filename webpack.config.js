const path = require("path");
const webpack = require("webpack");
const GASWebpackPlugin = require("gas-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = {
  entry: [path.join(__dirname, "src/main.js")],
  output: {
    filename: "OpenBadges.js",
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
          presets: [["env", { modules: false }]],
          plugins: [
            "transform-object-rest-spread",
            "transform-class-properties"
          ]
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
    new webpack.optimize.ModuleConcatenationPlugin(),

    new FileManagerPlugin({
      onStart: {
        delete: ["./dist"]
      },
      onEnd: {
        copy: [
          {
            source: "./dist/OpenBadges.js",
            destination: "./dist/OpenBadges.gs"
          }
        ]
      }
    }),

    // Use the GoogleAppScript plugin to assign global functions.
    new GASWebpackPlugin()
  ]
};
