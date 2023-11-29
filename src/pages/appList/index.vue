<script setup lang="ts">
import { AppSetListApi } from '@/api'
import { onMounted, ref, reactive } from 'vue'
import noData from '@components/noData/NoData.vue'
import ImgTexe from '@components/List/ImgTexe.vue'
import { AppSetInfoType } from '@/types/commonModel'

const props = defineProps({
  title: {
    type: String,
    default: 'dataIsEmpty'
  },
  name: {
    type: String,
    default: 'parkENews'
  }
})
const reactiveData = reactive({
  //下拉
  triggered: false,
  //滚动置顶
  scrollTop: 0,
  //加载状态
  loadMore: 'loadmore',
  //加载时间
  loadTime: 0
})

const listData = ref([] as AppSetInfoType[])
const page = ref(1)
const size = ref(10)

const getAppSetList = async (isReset?: boolean) => {
  if (isReset) {
    page.value = 1
    reactiveData.loadMore = 'loading'
  }
  reactiveData.loadTime = Date.now()
  const loadTime = reactiveData.loadTime

  const res = await AppSetListApi(props.name, page.value, size.value)
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
  getAppSetList(true).finally(() => {
    reactiveData.triggered = false
  })
}

//上拉加载更多
const onScrolltolower = async () => {
  if (reactiveData.loadMore === 'loadmore') {
    reactiveData.loadMore = 'loading'
    page.value++
    await getAppSetList()
  }
}

onMounted(() => {
  getAppSetList(true)
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header :title="props.title" />
    <!-- 头部结束 -->

    <view v-if="listData.length > 0">
      <scroll-view
        refresher-enabled
        :refresher-triggered="reactiveData.triggered"
        :scroll-top="reactiveData.scrollTop"
        scroll-y
        style="height: calc(100vh - 74px)"
        @scrolltolower="onScrolltolower"
        @refresherrefresh="onRefresherrefresh"
      >
        <view class="u-page">
          <view class="h-12rpx" />
          <view v-for="(item, index) in listData" :key="index">
            <ImgTexe :item="item" :title="props.title" />
          </view>
        </view>

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
    <noData v-else />
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
