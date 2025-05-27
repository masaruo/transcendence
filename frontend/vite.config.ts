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
			'@views': path.resolve(__dirname, './src/views'),
			'@services': path.resolve(__dirname, './src/services'),
		}
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['three'],
				}
			}
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				quietDeps: true
			}
		}
	},
})
