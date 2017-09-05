const autoprefixer = require('autoprefixer');
const path = require('path');
const env = require('var');
const { define } = require('var/webpack');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NullPlugin = require('webpack-null-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const BUILD_DIR = './build';

const dependencies = require('./package.json').dependencies;
const vendor = Object.keys(dependencies).filter((dependency) => dependency.indexOf('@types/') === -1);

module.exports = ({ production } = {}) => ({
  devtool: production ? false : 'inline-source-map',
  context: process.cwd(),
  entry: {
    app: './src/app.ts',
    vendor
  },
  output: {
    publicPath: '/',
    path: path.resolve(BUILD_DIR),
    filename: '[name].[chunkhash].js',
    sourceMapFilename: '[name].js.map'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.scss']
  },
  module: {
    rules: [
      // Scripts
      { test: /\.tsx?$/, loader: 'ts-loader' },

      // Styles
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      },

      // Assets
      {
        test: /\.(jpe?g|ico|gif|png|svg|wav|mp3|json)$/,
        loader: 'file-loader?name=[name].[ext]'
      }
    ]
  },
  plugins: [
    production ? new CleanWebpackPlugin([`${BUILD_DIR}/*`]) : new NullPlugin(),

    new webpack.optimize.CommonsChunkPlugin('vendor'),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin(define(env, (envJsonKeys) => ['NODE_ENV', ...envJsonKeys])),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: () => [
          autoprefixer({ browsers: ['last 3 versions', '> 1%'] })
        ]
      }
    }),

    // `contenthash` is specific to this plugin, we would typically use `chunkhash`
    new ExtractTextPlugin('styles.[contenthash].css'),
    new HtmlWebpackPlugin({ template: './src/index.ejs' }),
    new WorkboxPlugin({
      globDirectory: BUILD_DIR,
      globPatterns: ['**/*.{html,js,css}'],
      swDest: path.resolve(BUILD_DIR, 'service-worker.js')
    })
  ]
});
