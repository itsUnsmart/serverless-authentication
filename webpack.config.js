const path = require('path')
const nodeExternals = require('webpack-node-externals')
const slsw = require('serverless-webpack')

const entries = {}

Object.keys(slsw.lib.entries).forEach(
  key => (entries[key] = [slsw.lib.entries[key]])
)

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.mjs']
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.key(.pub)?$/,
        use: 'raw-loader',
      }
    ]
  },
  externals: [slsw.lib.webpack.isLocal ? nodeExternals() : 'aws-sdk']
}
