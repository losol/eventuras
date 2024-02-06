import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(), 
    dts(),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'scribo',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'scribo',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        globals: {
          'react': 'React',
          'react/jsx-runtime': 'jsxRuntime'
        }
      }
    }
  }
});
