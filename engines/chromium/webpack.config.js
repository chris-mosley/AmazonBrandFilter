const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const rootPath = path.resolve('./');
const baseConfig = require(`${rootPath}/webpack.config.js`);
const defaultCopyPluginPatterns = require(`${rootPath}/engines/default-copy-plugin-patterns.json`);

module.exports = (env, argv) => {
  return {
    ...baseConfig(env, argv),
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          ...defaultCopyPluginPatterns,
          { from: "engines/chromium/manifest.json", to: "./" },
        ],
      }),
    ],
  };
};
