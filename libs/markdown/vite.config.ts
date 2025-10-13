import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import tailwindcss from '@tailwindcss/vite'
import {resolve} from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*'],
      copyDtsFiles: true,
      rollupTypes: false
    })
  ],
  resolve: {alias: {'@': resolve(__dirname, 'src')}},
  build: {
    lib: {entry: 'src/index.ts', formats: ['es'], fileName: () => 'markdown-safe-renderer.es.js'},
    rollupOptions: {
      // keep react, react-dom, markdown-to-jsx out of the bundle
      external: ['react', 'react-dom', 'react/jsx-runtime', 'markdown-to-jsx'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js'
      }
    }
  }
})
