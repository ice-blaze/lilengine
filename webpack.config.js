const path = require("path")
const webpack = require("webpack")

module.exports = {
	entry: {
		main: "./javascript/main.js",
		style: "./css/menus.scss",
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].js",
	},
	resolve: {
		alias: {
			"jquery-ui": "jquery-ui-dist/jquery-ui.js",
		},
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
		}),
	],
	module: {
		rules: [{
			test: /\.scss$/,
			use: [{
				loader: "style-loader",
			}, {
				loader: "css-loader",
			}, {
				loader: "sass-loader",
				options: {
					includePaths: ["node_modules/foundation-sites/scss"],
				},
			}],
		}],
	},
}
