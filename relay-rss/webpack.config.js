import webpack from 'webpack';
import path from 'path';

const isDevelopmentEnv = process.env.NODE_ENV === 'development';
const isDebugEnv = !!process.env.DEBUG || isDevelopmentEnv;

const entry = isDevelopmentEnv ?
    [
      'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
      'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
      __dirname + "/src/main.js"
    ]  :
    __dirname + "/src/main.js";

const plugins = isDevelopmentEnv ?
    [
      new webpack.HotModuleReplacementPlugin()
    ] :
    [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin()
    ];

const cssLoaderConfig = isDevelopmentEnv ? '?localIdentName=[name]__[local]___[hash:base64:5]' : '';

const jsLoaders = isDevelopmentEnv ? ["react-hot", "babel"] : ["babel"];

module.exports = {
  entry: entry,
  output: {
    path: __dirname + "/build",
    publicPath: "/build",
    filename: "bundle.js"
  },

  plugins: plugins,

  debug: isDebugEnv,
  devtool: isDebugEnv ? 'eval' : 'cheap-module-source-map',

  module: {
    loaders: [
       { test: /\.js$/, exclude: /node_modules/, loaders: jsLoaders},
       { test: /\.css$/, loader: "style-loader!css-loader" + cssLoaderConfig }
    ]
  }
};
