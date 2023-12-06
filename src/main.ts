import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import uviewPlus from 'uview-plus'
import App from './App.vue'

//#ifdef H5
import 'default-passive-events'
//#endif

// unocss cs
import 'uno.css'
// 引入全局样式
import '@/styles/index.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  app.use(uviewPlus)
  return {
    app
  }
}
