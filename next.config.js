/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: "build",
	reactStrictMode: true,
	// basePath: "/front",
	typescript: {
		ignoreBuildErrors: true,
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
};

module.exports = nextConfig;
