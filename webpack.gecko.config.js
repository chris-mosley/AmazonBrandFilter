const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const baseConfig = require('./webpack.config.js');
const defaultCopyPluginPatterns = require('./engines/default-copy-plugin-patterns.json');

module.exports = (env, argv) => {
  return {
    ...baseConfig(env, argv),
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          ...defaultCopyPluginPatterns,
          { from: "engines/gecko/manifest.json", to: "./" },
        ],
      }),
    ],
  };
};
