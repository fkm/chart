'use strict';

// Node Dependencies
const path = require('path');

// NPM Dependencies
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({
	pattern: ['del', 'webpack*'],
	overridePattern: false,
	scope: ['devDependencies'],
});

const PATH_SRC = path.join(__dirname, 'lib');
const PATH_DIST = path.join(__dirname, 'dist');
const PATH_NODEMODULES = path.join(__dirname, 'node_modules');

//  _____                     __
// |_   _| __ __ _ _ __  ___ / _| ___  _ __ _ __ ___
//   | || '__/ _` | '_ \/ __| |_ / _ \| '__| '_ ` _ \
//   | || | | (_| | | | \__ \  _| (_) | |  | | | | | |
//   |_||_|  \__,_|_| |_|___/_|  \___/|_|  |_| |_| |_|
//

function preProcessScripts() {
	let path_entrypoints = `${PATH_SRC}/*.js`;
	let path_destination = PATH_DIST;

	let options_webpack = {
		// https://webpack.js.org/concepts/mode/
		mode: 'none',
		// https://webpack.js.org/configuration/target/
		target: 'web',
		// https://webpack.js.org/configuration/devtool/
		devtool: false,
		// https://webpack.js.org/configuration/entry-context
		context: PATH_SRC,
		entry: './index.js',
		// https://webpack.js.org/configuration/output/
		output: {
			library: 'array',
			libraryTarget: 'umd',
			filename: 'bundle.js',
			globalObject: 'this',
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
	};

	return gulp.src(path_entrypoints)
		.pipe(plugins.plumber())
		.pipe(plugins.webpackStream(options_webpack))
		.pipe(gulp.dest(path_destination));
}

//  ____        _ _     _
// | __ ) _   _(_) | __| |
// |  _ \| | | | | |/ _` |
// | |_) | |_| | | | (_| |
// |____/ \__,_|_|_|\__,_|
//

function deleteGeneratedAssets() {
	return plugins.del(PATH_DIST);
}

function postProcessScripts() {
	let path_sources = [
		`${PATH_DIST}/*.js`,
		`!${PATH_DIST}/*.min.js`,
	];
	let path_destination = PATH_DIST;

	let options_terser = { output: { comments: false } };
	let options_rename = { suffix: '.min' };

	function logError(error) { console.log(error); }

	return gulp.src(path_sources)
		.pipe(plugins.terser(options_terser).on('error', logError))
		.pipe(plugins.rename(options_rename))
		.pipe(gulp.dest(path_destination));
}

gulp.task('default', gulp.series(
	deleteGeneratedAssets,
	preProcessScripts,
	postProcessScripts,
));
