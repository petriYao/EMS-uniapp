<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const jumpUrl = ref('')
const title = ref('')

onLoad(async (val: any) => {
  console.log('onLoad', val)
  jumpUrl.value = decodeURIComponent(val.jumpUrl)
  title.value = val.title
})
</script>

<template>
  <ContentWrap>
    <!-- 在H5的时候显示 -->
    <!-- #ifdef H5 -->
    <Header :title="title" />
    <!-- #endif -->
    <web-view :src="jumpUrl" />
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
