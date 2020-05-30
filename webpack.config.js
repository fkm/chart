'use strict';

// Node Dependencies
const path = require('path');

// NPM Dependencies
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const PATH_SRC = path.join(__dirname, 'lib');
const PATH_DIST = path.join(__dirname, 'dist');
const PATH_NODEMODULES = path.join(__dirname, 'node_modules');

module.exports = {
	// https://webpack.js.org/concepts/mode/
	mode: 'none',
	// https://webpack.js.org/configuration/target/
	target: 'web',
	// https://webpack.js.org/configuration/devtool/
	devtool: false,
	// https://webpack.js.org/configuration/entry-context
	context: PATH_SRC,
	entry: {
		'bundle': './index.js',
		'bundle.min': './index.js',
	},
	// https://webpack.js.org/configuration/output/
	output: {
		library: 'chart',
		libraryTarget: 'umd',
		filename: '[name].js',
		globalObject: 'this',
		path: PATH_DIST,
	},
	resolve: {
		modules: [
			PATH_NODEMODULES,
			PATH_SRC,
		],
		// https://webpack.js.org/configuration/resolve/#resolve-extensions
		extensions: ['*', '.js'],
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
		}],
	},
	plugins: [
		// https://webpack.js.org/guides/output-management/#cleaning-up-the-dist-folder
		new CleanWebpackPlugin(),
	],
	// https://webpack.js.org/plugins/terser-webpack-plugin/
	// https://webpack.js.org/plugins/terser-webpack-plugin/#remove-comments
	// https://stackoverflow.com/a/34018909
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({
			include: /\.min\.js$/,
			terserOptions: {
				output: {
					comments: false,
				},
			},
			extractComments: false,
		})],
	},
};
