import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'
import Unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base:'./',
  plugins: [
    uni(),
    // https://github.com/antfu/unocss
    Unocss()
  ],
  server: {
    // port: 8080,
    host: '0.0.0.0',
    proxy: {}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      'uview-plus': path.resolve(__dirname, './node_modules/uview-plus')
    }
  },
  css: {
    // 配置`scss`和`less`全局变量
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/vars/_base.scss";'
      },
      less: {
        additionalData: '@import "@/styles/vars/_base.less";'
      }
    }
  },
    // ...其他配置
    build: {
      rollupOptions: {
        external: ['html-to-text']
      }
    }
})
