const baseConfig = require('./webpack.config.js');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  return {
    ...baseConfig(env, argv),
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: "engines/chromium/manifest.json", to: "./" },
          { from: "src/assets/css", to: "./" },
          { from: "src/assets/html", to: "./" },
          { from: "src/assets/icons", to: "icons" },
          { from: "src/_locales", to: "_locales" },
        ],
      }),
    ],
  };
};
