'use strict';

module.exports = {
	root: true,

	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},

	plugins: [],
	extends: ['@fkm/eslint-config'],

	env: {
		browser: true,
		commonjs: true,
		worker: true,
	},

	rules: {
		indent: 'off',
	},

	ignorePatterns: ['dist/**/*'],
};
