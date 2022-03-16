const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");

module.exports = {
  devtool: 'inline-source-map',
  devServer: {
    port: 8000,
  },
  entry: "./src/",
  output: {
    // filename: 'main.js',
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      "mapbox-gl": "maplibre-gl",
    },
  },
  devtool: "source-map",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(csv|tsv)$/,
        loader: "csv-loader",
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      // {
      //   test: /\.svg$/,
      //   loader: 'svg-inline-loader'
      // }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
    }),
    new DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL),
    }),
  ],
};
