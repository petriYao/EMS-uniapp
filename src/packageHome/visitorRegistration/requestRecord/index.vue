<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { getLocal, visitorRequestkey } from '@/hooks/useCache'
import { useAppStore } from '@/store'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')
// 轮播图
const reactiveData = reactive({
  editData: [] as any,
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
      label: '访问公司',
      value: 'company'
    },
    {
      label: '访问人',
      value: 'name'
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

const onFormData = () => {
  const val = getLocal(visitorRequestkey)
  if (val) {
    reactiveData.editData = JSON.parse(val)
  }
}

onBeforeMount(() => {
  onFormData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="申请记录" />

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
      :style="`height: calc(100vh - 88px - ${marginHeight});`"
    >
      <view v-for="(item, index) in reactiveData.editData" :key="index">
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
            <view
              v-else
              class="bg-[#E5F8F6] text-[#0ABDB0] px-30rpx py-10rpx rounded-40rpx text-[24rpx]"
            >
              审批中
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
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
