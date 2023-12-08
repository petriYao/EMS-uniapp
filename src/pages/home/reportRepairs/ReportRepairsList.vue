<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

import { useAppStore } from '@/store'
import router from '@/router'
import { ReportRepairsListType } from '@/types/reportRepairsModel'
import { ReportRepairsListApi } from '@/api'

import BottomButton from '@/components/BottomButton/index.vue'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')

const reactiveData = reactive({
  tabsActive: 1,
  tabsList: [
    {
      name: '未分配',
      value: 1
    },
    {
      name: '已分配',
      value: 20
    },
    {
      name: '已完成',
      value: 30
    },
    {
      name: '全部',
      value: 0
    }
  ],
  page: 1,
  size: 10,
  //下拉
  triggered: false,
  //滚动置顶
  scrollTop: 0,
  //加载状态
  loadMore: 'loadmore',
  //加载时间
  loadTime: 0
})

const listData = ref([] as ReportRepairsListType[])
const page = ref(1)
const size = ref(10)

const onAdd = () => {
  router.push({
    url: `/pages/home/reportRepairs/ReportRepairsAdd`
  })
}

const onInfo = (id: number, status: number) => {
  router.push({
    url: `/pages/home/reportRepairs/ReportRepairsAdd?id=${id}&status=${status}`
  })
}

/**标签修改 */
const onChangeTabs = (tabItem: any) => {
  reactiveData.tabsActive = tabItem.value
  page.value = 1
  setScrollTop()
  getListData()
}

/**获取列表数据 */
const getListData = async (isReset?: boolean) => {
  if (isReset) {
    page.value = 1
    reactiveData.loadMore = 'loading'
  }
  reactiveData.loadTime = Date.now()
  const loadTime = reactiveData.loadTime

  const res = await ReportRepairsListApi(reactiveData.tabsActive, page.value, size.value)
  if (loadTime != reactiveData.loadTime) return

  if (res.success && res.value) {
    if (page.value == res.value.page) {
      if (res.value.page <= 1) {
        listData.value = res.value.list ?? []
        setScrollTop()
      } else if (res.value.list) {
        listData.value.push(...res.value.list)
      }
      if (listData.value.length >= res.value.total) {
        reactiveData.loadMore = 'nomore'
      } else {
        reactiveData.loadMore = 'loadmore'
      }
    }
  }
}

//置顶
const setScrollTop = () => {
  reactiveData.scrollTop = reactiveData.scrollTop == 0 ? 0.1 : 0
}

//下拉更新
const onRefresherrefresh = () => {
  reactiveData.triggered = true
  getListData(true).finally(() => {
    reactiveData.triggered = false
  })
}

//上拉加载更多
const onScrolltolower = async () => {
  if (reactiveData.loadMore === 'loadmore') {
    reactiveData.loadMore = 'loading'
    page.value++
    await getListData()
  }
}

onShow(() => {
  getListData(true)
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="报事报修" />
    <!-- 头部结束 -->
    <view>
      <view class="bg-[#FFF]">
        <u-tabs
          :list="reactiveData.tabsList"
          :scrollable="false"
          activeStyle="color:#196CFF"
          lineColor="#196CFF"
          lineWidth="90rpx"
          @change="onChangeTabs"
        />
      </view>
      <scroll-view
        refresher-enabled
        :refresher-triggered="reactiveData.triggered"
        :scroll-top="reactiveData.scrollTop"
        scroll-y
        :style="`height: calc(100vh - 88px - ${marginHeight} - 120rpx);`"
        @scrolltolower="onScrolltolower"
        @refresherrefresh="onRefresherrefresh"
      >
        <template v-for="(item, index) in listData" :key="index">
          <view
            class="bg-#fff my-20rpx p-20rpx"
            @click="onInfo(item.reportRepairsId, item.reportRepairsStatus)"
          >
            <view class="flex flex-row items-center justify-between pb-20rpx line">
              <view class="flex flex-row items-center">
                <view
                  class="mr-20rpx text-18rpx text-#FFF rounded-full w-40rpx h-40rpx back flex flex-row items-center justify-center"
                  >{{ index + 1 > 9 ? index + 1 : '0' + (index + 1) }}</view
                >
                <view class="font-600 text-32rpx">{{ item.reportRepairsTypeTitle }}</view>
              </view>
              <view class="text-#A2A3AC text-26rpx">{{ item.createdAt }}</view>
            </view>
            <view>
              <view
                v-for="(items, indexs) in item.contentList"
                :key="indexs"
                class="flex flex-row items-center my-20rpx"
              >
                <text class="text-#A2A3AC w-[150rpx]">{{ items.label }}</text>
                <text class="text_ellipsis w-70vw">{{ items.value }}</text>
              </view>
            </view>
          </view>
        </template>
        <!-- 上拉加载 -->
        <view class="h-50rpx" v-if="listData.length > 9">
          <u-loadmore
            loadmore-text="上拉加载更多"
            loading-text="正在加载..."
            nomore-text="我是有底线的"
            :status="reactiveData.loadMore"
          />
        </view>
      </scroll-view>
    </view>
    <BottomButton>
      <view class="px-20rpx">
        <u-button text="我要报事/报修" color="#466BF3" @click="onAdd" />
      </view>
    </BottomButton>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.back {
  background: linear-gradient(to bottom, #9aaff5, #1f5be6);
}
.line {
  border-bottom: 1px solid #f1f1f1;
}
</style>
