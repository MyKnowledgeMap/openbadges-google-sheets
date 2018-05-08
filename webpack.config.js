const GasPlugin = require("gas-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const path = require("path");
const basePath = __dirname;

const presets = [
  ["@babel/preset-typescript"],
  [
    "@babel/preset-env",
    {
      targets: {
        browsers: ["ie >= 9"]
      },
      useBuiltIns: "usage",
      modules: "commonjs",
      debug: false
    }
  ]
];

const uglify = new UglifyJSPlugin({
  uglifyOptions: {
    compress: {
      unused: false // TypeError: redeclaration of const undefined if true
    },
    mangle: false,
    toplevel: false,
    keep_classnames: true,
    keep_fnames: true,
    ie8: true,
    ecma: 5,
    output: {
      comments: true,
      beautify: true
    }
  }
});

const config = {
  context: basePath,
  mode: "production",
  entry: {
    sheets: path.join(basePath, "src", "index.ts")
  },
  output: {
    path: path.join(basePath, "dist"),
    filename: "[name].js"
  },
  plugins: [new GasPlugin()],
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loaders: [
          {
            loader: "babel-loader",
            options: { presets }
          }
        ]
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: "html-loader"
      }
    ]
  },
  optimization: {
    minimizer: [uglify],
    runtimeChunk: false,
    noEmitOnErrors: true,
    concatenateModules: true
  }
};

module.exports = config;
