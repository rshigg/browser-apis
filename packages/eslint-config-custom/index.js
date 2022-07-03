/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	rules: {
		'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
		'prettier/prettier': 'off',
	},
};
