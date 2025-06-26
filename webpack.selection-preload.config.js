const path = require('path');

module.exports = {
  target: 'electron-preload',
  entry: './src/main/selection-preload.js',
  mode: 'production',
  output: {
    filename: 'selection-preload.js',
    path: path.resolve(__dirname, 'dist/main'),
  },
  externals: {
    electron: 'commonjs2 electron',
  },
};