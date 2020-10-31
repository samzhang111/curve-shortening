const path = require('path');

module.exports = {
    mode: 'development',
    entry: ["@babel/polyfill", "./curveshortening.js"],
    plugins: [ ],
    output: {
        path: path.resolve(__dirname, "dist-shortening"),
        filename: "curve-shortening.bundle.js",
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
