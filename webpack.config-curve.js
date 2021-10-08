const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: ["@babel/polyfill", "./curveshortening.js"],
    plugins: [
        new HtmlWebpackPlugin({
          template: "curve-shortening.html",
        }),
    ],
    output: {
        path: path.resolve(__dirname, "dist-shortening"),
        filename: "curve-shortening.bundle.js",
    },
      devServer: {
        open: true,
        host: "localhost",
      },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
}
