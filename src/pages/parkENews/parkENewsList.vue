<script setup lang="ts">
import { AppSetListApi } from '@/api'
import { onMounted, ref } from 'vue'
import noData from '@components/noData/NoData.vue'
import ImgTexe from '@components/List/ImgTexe.vue'
import { AppSetInfoType } from '@/types/commonModel'

const listData = ref([] as AppSetInfoType[])
const page = ref(1)
const size = ref(10)

const getAppSetList = async () => {
  const res = await AppSetListApi('parkENews', page.value, size.value)
  if (res.success && res.value) {
    if (res.value.list) {
      listData.value = res.value.list
    } else {
      listData.value = []
    }
  }
}

const scrolltolower = () => {
  getAppSetList()
}

onMounted(() => {
  getAppSetList()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="园区E闻" />
    <!-- 头部结束 -->
    <view class="u-page pt-1.5" v-if="listData.length > 0">
      <u-list @scrolltolower="scrolltolower">
        <u-list-item v-for="(item, index) in listData" :key="index">
          <ImgTexe :item="item" title="园区E闻" />
        </u-list-item>
      </u-list>
    </view>
    <noData v-else />
    <div class="w-full h-[200px]"></div>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
