const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  devtool: 'hidden-source-map',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'app/main.jsx'),
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist',
    filename: 'app.js'
  },
  module: {
    loaders:[
      {
        test: /\.css$/,
        include: path.resolve(__dirname, './app'),
        loaders: [
          'style-loader',
          'css-loader?modules&localIdentName=[hash:base64:8]',
          'postcss-loader'
        ]
      },
      {
        test: /\.js[x]?$/,
        include: path.resolve(__dirname, './app'),
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css'],
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/main.css', to: 'main.css' }
    ]),
  ],
  postcss: function(bundler) {
    return [
      require('postcss-import')({ addDependencyTo: bundler }),
      require('postcss-mixins')(),
      require('postcss-nested')(),
      require('postcss-cssnext')({ browsers: '> 1%, last 3 versions' }),
      require('cssnano')({
        autoprefixer: false
      })
    ]
  }
};
