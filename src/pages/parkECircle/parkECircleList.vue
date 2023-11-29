<script setup lang="ts">
import { AppSetListApi } from '@/api'
import { onMounted, ref } from 'vue'
import noData from '@components/noData/NoData.vue'
import ImgTexe from '@components/List/ImgTexe.vue'
import { AppSetInfoType } from '@/types/commonModel'

const listData = ref([] as AppSetInfoType[])

const getAppSetList = async () => {
  const res = await AppSetListApi('parkECircle')
  if (res.success && res.value) {
    if (res.value.list) {
      listData.value = res.value.list
    } else {
      listData.value = []
    }
  }
}
const scrolltolower = () => {
  console.log('到底')
  getAppSetList()
}

onMounted(() => {
  getAppSetList()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="园区E圈" />
    <!-- 头部结束 -->

    <view v-if="listData.length > 0">
      <scroll-view scroll-y height="200px" @scrolltolower="scrolltolower">
        <view class="u-page" style="height: calc(100vh - 44px)">
          <view class="h-12rpx" />
          <view v-for="(item, index) in listData" :key="index">
            <ImgTexe :item="item" title="园区E闻" />
          </view>
        </view>
      </scroll-view>
    </view>
    <noData v-else />
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
