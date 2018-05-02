const GasPlugin = require("gas-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  context: __dirname,
  mode: "production",
  entry: {
    sheets: "./src/index.ts"
  },
  output: {
    path: __dirname,
    filename: "./dist/[name].js"
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
                ["@babel/preset-typescript"],
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["ie >= 9"]
                    },
                    useBuiltIns: "usage",
                    debug: true
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      }
    ]
  },
  optimization: {
    // Production mode uses UglifyJSPlugin by default but we need to modify it to work with GAS.
    minimizer: [
      // Modifying this configuration will very likely break the script in GAS. Make sure to test!
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: false,
          mangle: false,
          toplevel: false,
          keep_classnames: true,
          keep_fnames: true,
          ie8: true,
          ecma: 5,
          output: {
            comments: false,
            beautify: true
          }
        }
      })
    ]
  }
};
