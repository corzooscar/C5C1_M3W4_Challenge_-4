import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 8080,
        hot: true
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'mixed-decls', 'color-functions', 'global-builtin']
            }
        }
    }
})
