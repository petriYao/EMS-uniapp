declare module 'vue' {
  export interface GlobalComponents {
    ContentWrap: typeof import('@/components/ContentWrap/index.vue')
  }
}

export {}
