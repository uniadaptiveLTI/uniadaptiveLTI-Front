/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: "build",
	reactStrictMode: true,
	// basePath: "/front",
	typescript: {
		ignoreBuildErrors: true,
	},
};

module.exports = nextConfig;
