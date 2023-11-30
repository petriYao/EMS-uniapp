<script setup lang="ts">
import router from '@/router'
import { useAppStore } from '@/store'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')

const reactiveData = reactive({
  tabsActive: '',
  tabsList: [
    {
      name: '未分配'
    },
    {
      name: '已分配'
    },
    {
      name: '已解决'
    },
    {
      name: '全部'
    }
  ]
})
// tabs

const addClick = () => {
  router.push({
    url: `/pages/home/reportRepairs/AddReportRepairs?title=新增报事报修`
  })
}

onLoad(async () => {
  console.log('onLoad', appStore.notchHeight)
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="报事报修" />
    <!-- 头部结束 -->
    <view>
      <view class="bg-[#FFF]">
        <u-tabs
          :list="reactiveData.tabsList"
          :scrollable="false"
          activeStyle="color:#196CFF"
          lineColor="#196CFF"
          lineWidth="90rpx"
          @click=""
        />
      </view>
      <scroll-view scroll-y :style="`height: calc(100vh - 88px - ${marginHeight} - 100rpx);`">
        <view> 123 </view>
      </scroll-view>
      <view
        class="h-80rpx mb-20rpx bg-[#466BF3] flex items-center justify-center text-[#FFF] rounded-10rpx mx-20rpx"
        @click="addClick"
      >
        我要报事/报修
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
