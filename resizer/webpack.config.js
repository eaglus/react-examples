const path = require('path');

module.exports = {
  entry: __dirname + "/src/main.js",
  output: {
    path: __dirname + "/build",
    filename: "bundle.js"
  },

  externals: {
    "jquery": "jQuery"
  },

  debug: true,
  //devtool: 'eval',
  devtool: 'inline-source-map',

  module: {
    loaders: [
       { test: /\.js$/, exclude: /node_modules/, loader: "babel?plugins[]=" + path.join(__dirname, "babelRelayPlugin")},

       { test: /\.css$/, loader: "style-loader!css-loader?localIdentName=[name]__[local]___[hash:base64:5]" }
    ]
  }
};
