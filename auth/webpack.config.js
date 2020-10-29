const path = require('path')

const nodeExternals = require('webpack-node-externals')
// const WebpackShellPlugin = require('webpack-shell-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const {
  NODE_ENV = 'production'
} = process.env

const isDevelopment = NODE_ENV === 'development'

module.exports = {
  entry: {
    'login/oauth/index': './src/login/oauth/index.ts',
    'login/oauth/redirect': './src/login/oauth/redirect.ts'
  },
  mode: NODE_ENV,
  watch: isDevelopment,
  target: 'node',
  output: {
    path: path.resolve(__dirname, isDevelopment ? 'dev-build' : 'build'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader'
        ]
      },
      {
        test: /\.key(.pub)?$/,
        use: 'raw-loader',
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: 'all',
        sourceMap: false
      }),
    ],
  },
  node: {
    __dirname: false,
    global: false
  },
  externals: [isDevelopment ? nodeExternals() : 'aws-sdk']
}
