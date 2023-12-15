<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
// import { getLocal, visitorRequestkey } from '@/hooks/useCache'
import { useAppStore } from '@/store'
import router from '@/router'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')
// 轮播图
const reactiveData = reactive({
  editData: [
    {
      name: '张峰',
      phone: '18689895552',
      time: '2021-11-11 10:00',
      reason: '申请理由就是我过来看看',
      company: '福建有限公司',
      type: 20
    },
    {
      name: '段胜阳',
      phone: '18689895552',
      time: '2021-11-11 10:00',
      reason: '申请理由就是我过来看看',
      company: '福建有限公司',
      type: 20
    },
    {
      name: '周雪峰',
      phone: '18689895552',
      time: '2021-11-11 10:00',
      reason: '申请理由就是我过来看看',
      company: '福建有限公司',
      type: 30
    },
    {
      name: '彭小年',
      phone: '18689895552',
      time: '2021-11-11 10:00',
      reason: '申请理由就是我过来看看',
      company: '福建有限公司',
      type: 40
    }
  ] as any,
  tabActive: 0, //0全部 20审批中 30已完成
  tabsList: [
    {
      name: '全部',
      value: 0
    },
    {
      name: '审批中',
      value: 20
    },
    {
      name: '已完成',
      value: 30
    }
  ],
  infoList: [
    {
      label: '访客姓名',
      value: 'name'
    },
    {
      label: '访客号码',
      value: 'phone'
    },
    {
      label: '预约时间',
      value: 'time'
    },
    {
      label: '访问原因',
      value: 'reason'
    }
  ]
})

/**标签修改 */
const onChangeTabs = (tabItem: any) => {
  console.log('tabItem', tabItem)
  reactiveData.tabActive = tabItem.value
}

const onFormData = () => {}

const editClick = (item?: any) => {
  console.log('item', item)
  router.push({
    url: `/packageHome/visitorRegistration/myVisitor/info?item=${item ? JSON.stringify(item) : ''}`
  })
}

onBeforeMount(() => {
  onFormData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="我的访客" />

    <!-- 头部结束 -->
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
      scroll-y
      :style="`height: calc(100vh - 88px - ${marginHeight} - 140rpx);`"
    >
      <view v-for="(item, index) in reactiveData.editData" :key="index" @click="editClick(item)">
        <view
          class="bg-[#FFF] mx-20rpx mt-20rpx rounded-10rpx px-20rpx"
          v-if="Number(item.type) === reactiveData.tabActive || reactiveData.tabActive === 0"
        >
          <view
            class="py-20rpx flex justify-between items-center"
            style="border-bottom: 1px solid #f5f5f6"
          >
            <view class="text-[#B3B3B3]">{{ item.time }}</view>
            <view
              v-if="Number(item.type) === 30"
              class="bg-[#E8EEFC] text-[#235EE7] px-30rpx py-10rpx rounded-40rpx text-[24rpx]"
            >
              已完成
            </view>
            <view
              v-else-if="Number(item.type) === 40"
              class="bg-[#FDEBEB] text-[#ED4040] px-30rpx py-10rpx rounded-40rpx text-[24rpx]"
            >
              已拒绝
            </view>
            <view v-else class="flex">
              <view
                class="bg-[#ED3B3B] text-[#FFF] px-30rpx py-10rpx rounded-40rpx text-[24rpx] mr-20rpx"
                @click="item.type = 40"
              >
                拒绝
              </view>
              <view
                class="bg-[#1957E6] text-[#FFF] px-30rpx py-10rpx rounded-40rpx text-[24rpx]"
                @click="item.type = 30"
              >
                同意
              </view>
            </view>
          </view>

          <view class="pt-20rpx">
            <view
              v-for="(info, infoIndex) in reactiveData.infoList"
              :key="infoIndex"
              class="flex pb-20rpx text-[28rpx]"
            >
              <view class="min-w-160rpx text-[#8B8B8B]">{{ info.label }}</view>
              <view>{{ item[info.value] }}</view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="w-100% box-border bg-[#F6F7FB] p-20rpx z-999">
      <view
        class="w-[100%] bg-[#466BF3] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center"
        hover-class="button-spread"
        @click="editClick('')"
      >
        临时访客
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
