module.exports = {
    context: __dirname + "/src",
    entry: "./app.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },

    devtool: "eval",

    module: {
        loaders: [
            {
                test: __dirname + "/src",
                loader: 'babel-loader'
            }
        ]
    }
};
