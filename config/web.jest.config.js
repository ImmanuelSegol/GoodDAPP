/* eslint-disable quote-props, quotes */

module.exports = {
	collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
	],
	resolver: "jest-pnp-resolver",
  preset: "react-native-web",
	rootDir: '../',
	setupFiles: [
		'react-app-polyfill/jsdom',
		'<rootDir>/config/initTest.js',
	],
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
		'<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}'
	],
	testEnvironment: 'jsdom',
	browser: true,
	testURL: 'http://localhost',
	transform: {
		'^.+\\.(js|jsx)$': 'babel-jest',
		'^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
		'^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
	},
	transformIgnorePatterns: [
		'node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-redux-helpers|react-phone-number-input|webrtc-adapter)'
	],
	moduleFileExtensions: [
		'web.js',
		'js',
		'json',
		'web.jsx',
		'jsx',
		'node'
	],
	testPathIgnorePatterns: [
		"/__tests__/__util__"
	],
	globals: {
		"TZ" : "UTC"
	}
};
