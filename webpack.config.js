const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  return {
    mode: argv.mode === "development" ? "development" : "production",
    devtool: argv.mode === "development" ? "cheap-module-source-map" : false,
    entry: {
      background: "./src/background/index.ts",
      content: "./src/content/index.ts",
      popup: "./src/popup/index.tsx",
      utils: "./src/utils/index.ts",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "~/": "./src",
      },
      plugins: [new TsconfigPathsPlugin()],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
  };
};
