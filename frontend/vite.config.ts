import { UserConfig, build, defineConfig } from "vite";
import path from 'path';

export default defineConfig({
	base: '/',
	server: {
		host: "0.0.0.0",
		port: 3000,
		watch: {
			usePolling: true,
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@components': path.resolve(__dirname, './src/components'),
			'@pages': path.resolve(__dirname, './src/pages'),
			'@services': path.resolve(__dirname, './src/services'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@assets': path.resolve(__dirname, './src/assets'),
			'@styles': path.resolve(__dirname, "./src/assets/styles"),
			// '@store': path.resolve(__dirname, './src/store')
		}
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		sourcemap: true,
	},
})
