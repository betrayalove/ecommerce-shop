const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
  mode: isProd ? 'production' : 'development',
  entry: path.resolve(__dirname, 'src', 'main.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
    chunkFilename: isProd ? 'assets/[name].[contenthash:8].chunk.js' : 'assets/[name].chunk.js',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|sass|css)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: { silenceDeprecations: ['legacy-js-api'] },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[hash:8][ext]',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL || 'http://localhost:3080/api'
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      inject: 'body',
    }),
    ...(isProd
      ? [
          new MiniCssExtractPlugin({
            filename: 'assets/[name].[contenthash:8].css',
            chunkFilename: 'assets/[name].[contenthash:8].chunk.css',
          }),
        ]
      : []),
  ].filter(Boolean),
  devServer: {
    static: { directory: path.join(__dirname, 'public') },
    port: 4173,
    hot: true,
    historyApiFallback: true,
    open: false,
  },
  optimization: isProd
    ? {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
            },
          },
        },
      }
    : undefined,
  performance: { hints: false },
};
};
