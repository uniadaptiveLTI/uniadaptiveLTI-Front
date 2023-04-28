/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		//URL that points to the Uniadaptive LTI Backend
		BACK_URL: "",
		//Relative path or URL to the image (rectangular) it will be rendered in the Aside component
		LOGO_PATH: "images/branding/logo.png",
		//Relative path or URL to the image (square) it will be rendered in the Header component
		SMALL_LOGO_PATH: "images/branding/small_logo.png",
		// Displays additional information on the interface for debugging purposes
		DEV_MODE: false,
	},
};

module.exports = nextConfig;
