/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		/**
		 * Configuration
		 */

		//URL that points to the UNIAdaptive LTI Backend
		BACK_URL: "127.0.0.1:8000",

		/**
		 * Branding
		 */

		//Favicon.ico is stored in /public/ as is needed for compatibility with older browsers

		//Relative path or URL to the favicon 16x16
		FAVICONx16_PATH: "icons/branding/favicon-16x16.png",
		//Relative path or URL to the favicon 32x32
		FAVICONx32_PATH: "icons/branding/favicon-32x32.png",
		//Relative path or URL to the favicon 180x180
		FAVICONx180_PATH: "icons/branding/apple-touch-icon.png",
		//Relative path or URL to the image (rectangular) it will be rendered in the Aside component
		LOGO_PATH: "images/branding/logo.png",
		//Relative path or URL to the image (square) it will be rendered in the Header component
		SMALL_LOGO_PATH: "images/branding/small_logo.png",

		/**
		 * Debugging
		 */

		// Displays additional information on the interface for debugging purposes
		DEV_MODE: false,
		// Uses local files instead of communicate with the back for testing purposes
		DEV_FILES: true,
	},
};

module.exports = nextConfig;
