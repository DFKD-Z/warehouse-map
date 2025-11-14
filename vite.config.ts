import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WarehouseMap',
      fileName: (format) => `warehouse-map.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        },
        // 提供 sourcemap
        sourcemap: true
      }
    },
    // 生成类型声明文件
    outDir: 'dist',
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'esbuild',
    // 确保构建时不报错
    emptyOutDir: true
  }
})
