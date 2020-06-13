const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../wwwroot/assets/js')
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: '../css/[name].css',
      chunkFilename: '../css/[id].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
  ],
  module: {
    rules: [
        {
        test: /\.(scss)$/,
        use: [{
            loader: 'style-loader', // inject CSS to page
        }, 
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development',
            },
          },
        
        {
            loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
            loader: 'postcss-loader', // Run postcss actions
            options: {
            plugins: function () { // postcss plugins, can be exported to postcss.config.js
                return [
                require('autoprefixer')
                ];
            }
            }
        }, {
            loader: 'sass-loader' // compiles Sass to CSS
        }]
        },
    ]
  }
};