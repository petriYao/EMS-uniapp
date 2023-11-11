import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import uView from 'uview-plus'
import App from './App.vue'

// unocss cs
import 'uno.css'
// 引入全局样式
import '@/styles/index.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  app.use(uView)
  return {
    app
  }
}
