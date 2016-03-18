import webpack from 'webpack';

const path = require('path');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    __dirname + "/src/main.js"
  ],
  output: {
    path: __dirname + "/build",
    publicPath: "/build",
    filename: "bundle.js"
  },

  externals: {
    "jquery": "jQuery"
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  debug: true,
  devtool: 'eval',
  //devtool: 'inline-source-map',

  module: {
    loaders: [
       { test: /\.js$/, exclude: /node_modules/, loaders: ["react-hot", "babel?plugins[]=" + path.join(__dirname, "/src/data/babelRelayPlugin")]},
       { test: /\.css$/, loader: "style-loader!css-loader" }
//       { test: /\.css$/, loader: "style-loader!css-loader?localIdentName=[name]__[local]___[hash:base64:5]" }
    ]
  }
};
