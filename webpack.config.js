const path = require("path")

module.exports = {
	entry: {
		main: "./javascript/main.js",
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
}
