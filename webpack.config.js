const GasPlugin = require("gas-webpack-plugin");

module.exports = {
  context: __dirname,
  mode: "production",
  entry: {
    app: "./src/index.ts"
  },
  output: {
    path: __dirname,
    filename: "./dist/[name].gs"
  },
  plugins: [new GasPlugin()],
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        loaders: [
          {
            loader: "babel-loader", // babel-loader runs last, transpiling to GAS compatible JS.
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    targets: {
                      browsers: ["ie >= 11"]
                    },
                    useBuiltIns: false
                  }
                ]
              ]
            }
          },
          {
            loader: "ts-loader" // ts-loader runs first, transpiling from TS to JS.
          }
        ]
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      }
    ]
  }
};
