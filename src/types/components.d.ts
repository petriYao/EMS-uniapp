declare module 'vue' {
  export interface GlobalComponents {
    ContentWrap: typeof import('@/components/ContentWrap/index.vue')
    Header: typeof import('@/components/Header/index.vue')
  }
}

export {}
