<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getBaseUrl } from '@/config/config'
import { useAppStore } from '@/store'

const id = ref('')
const title = ref('')
const appStore = useAppStore()

onLoad(async (val: any) => {
  title.value = val.title
  id.value = val.id
})
</script>

<template>
  <ContentWrap>
    <!-- 在H5的时候显示 -->
    <!-- #ifdef H5 -->
    <XWAHeader :title="title" />
    <!-- #endif -->
    <view>
      <web-view
        :style="`margin-top:${appStore.menuTop + 44}px`"
        :src="getBaseUrl() + '/app/app-jump-content?id=' + id"
      />
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
