import { resolve } from 'path';
import { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const isEnvDevelopment = process.env.NODE_ENV === 'development';

const devServer: DevServerConfiguration = {
  client: {
    overlay: {
      errors: true,
      warnings: false,
    },
  },
  compress: true,
  hot: true,
  open: true,
  port: 3000,
  static: {
    directory: resolve(__dirname, 'public'),
    publicPath: '/',
  },
};

const config: Configuration = {
  mode: isEnvDevelopment ? 'development' : 'production',
  devtool: isEnvDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  devServer,
  entry: resolve(__dirname, 'src', 'main.ts'),
  output: {
    path: resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'static/js/[name].[contenthash:8].js',
    assetModuleFilename: 'static/media/[name].[hash:8][ext]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: true,
                  dynamicImport: true,
                },
                target: 'es5',
              },
              minify: false,
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|webp|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 10KB
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
      }),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'public', 'index.html'),
      favicon: resolve(__dirname, 'public', 'favicon.svg'),
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: resolve(__dirname, 'tsconfig.json'),
      },
    }),
  ],
  optimization: {
    minimize: !isEnvDevelopment,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: {
          compress: true,
          mangle: true,
        },
      }),
    ],
  },
};

export default config;
