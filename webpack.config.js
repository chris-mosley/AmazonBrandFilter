const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  return {
    mode: argv.mode === "development" ? "development" : "production",
    devtool: argv.mode === "development" ? "source-map" : false,
    entry: {
      utils: "./src/utils/index.ts",
      background: "./src/background/index.ts",
      content: "./src/content/index.ts",
      popup: "./src/popup/index.tsx",
      controls: "./src/controls/index.tsx",
      toggle: "./src/toggle/index.tsx",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
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
      minimize: argv.mode === "development" ? false : true,
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
      splitChunks: {
        // remember to be careful when splitting chunks that belong to more than one group
        cacheGroups: {
          // use this chunk group for any of the iframes that make use of react
          client: {
            test: /[\\/]node_modules[\\/](react|react-dom|@mui|@emotion|i18next\/dist\/cjs|react-i18next\/dist\/es)[\\/]/,
            name: 'client',
            chunks: 'all',
          },
        },
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new DashboardPlugin(),
      new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
    ],
  };
};
