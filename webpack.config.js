// webpack.config.js
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin'); // Require the plugin

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/dist'),
  },
  plugins: [
    new NodemonPlugin(), // Add the plugin
  ],
};
