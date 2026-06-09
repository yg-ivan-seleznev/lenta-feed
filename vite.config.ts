import preact from '@preact/preset-vite';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    if (mode === 'mc') {
        return {
            plugins: [
                preact(),
                libAssetsPlugin({
                    publicUrl: '{MC_PUBLIC_URL}',
                    outputPath: 'assets',
                    limit: 10240,
                }),
            ],
            base: './',
            build: {
                cssCodeSplit: false,
                lib: {
                    entry: 'src/mc-entry',
                    name: '{MC_GLOBAL_NAMESPACE}.{MC_PACKAGE_KEY}',
                    fileName: () => 'index.js',
                    formats: ['iife'],
                },
                outDir: 'dist',
                emptyOutDir: true,
                minify: 'esbuild',
                rollupOptions: {
                    output: {
                        inlineDynamicImports: true,
                    },
                },
            },
        };
    }

    if (mode === 'site') {
        return {
            plugins: [preact()],
            root: 'dev',
            publicDir: 'public',
            base: './',
            build: {
                outDir: '../dist',
                emptyOutDir: true,
            },
        };
    }

    return {
        plugins: [preact()],
        root: 'dev',
        publicDir: 'public',
        server: {
            port: 5173,
            host: '127.0.0.1',
            open: false,
        },
    };
});
