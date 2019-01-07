/* eslint-env node */

const
    path = require("path"),
    TerserPlugin = require("terser-webpack-plugin"),
    ProgressBarPlugin = require("progress-bar-webpack-plugin"),
    LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {

    mode: "development",

    context: path.resolve(__dirname, "./src"),

    entry: {
        "ccpwgl2_int": "./index.js",
        "ccpwgl2_int.min": "./index.js"
    },

    performance: {
        maxEntrypointSize: 2000000,
        maxAssetSize: 2000000
    },

    devtool: "none",

    optimization: {
        minimize: false,
    },

    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        library: "ccpwgl_int",
        libraryTarget: "umd"
    },

    plugins: [
        new LodashModuleReplacementPlugin(),
        new ProgressBarPlugin(),
        new TerserPlugin({
            include: /\.min\.js$/,
            terserOptions: {
                output: {
                    comments: false
                }
            }
        })
    ],

    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader",
                options: {
                    "fix": true
                }
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                loader: "babel-loader"
            }
        ]
    }
};

