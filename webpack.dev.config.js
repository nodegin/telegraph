const webpack = require('webpack')
const path = require('path')

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    publicPath: '/',
    contentBase: './app',
    host: '0.0.0.0',
    port: 8081
  },
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://127.0.0.1:8081',
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
    new webpack.HotModuleReplacementPlugin()
  ],
  postcss: function(bundler) {
    return [
      require('postcss-import')({ addDependencyTo: bundler }),
      require('postcss-mixins')(),
      require('postcss-nested')(),
      require('postcss-cssnext')({ browsers: '> 1%, last 3 versions' })
    ]
  }
};
