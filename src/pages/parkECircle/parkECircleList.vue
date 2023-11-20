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

onMounted(() => {
  getAppSetList()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="园区E圈" />
    <!-- 头部结束 -->
    <view class="u-page" v-if="listData.length > 0">
      <template v-for="(item, index) in listData" :key="index">
        <ImgTexe :item="item" />
      </template>
    </view>
    <noData v-else />
    <div class="w-full h-[200px]"></div>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
