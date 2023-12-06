<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { useAppStore } from '@/store'
import { AppSetListApi, ProductListApi } from '@/api'
import NoData from '@components/noData/NoData.vue'

const props = defineProps({
  select: {
    type: String,
    default: ''
  }
})
const appStore = useAppStore()
const inSelect = ref('')
const marginHeight = ref(appStore.notchHeight + 44 + 'px')
const reactiveData = reactive({
  loadMore: 'loading',
  infoData: [] as any,
  screenData: {
    page: 1
  }
})

const getData = async () => {
  let res = {} as any
  if (inSelect.value === 'xiaobaoWelfare') {
    res = await AppSetListApi(inSelect.value, reactiveData.screenData.page, 10)
  } else {
    res = await ProductListApi({
      productTypeId: Number(inSelect.value),
      page: reactiveData.screenData.page,
      size: 10
    })
  }
  if (res && res.success && res.value?.page == reactiveData.screenData.page) {
    if (res.value?.page == 1) {
      reactiveData.infoData = res.value.list ?? []
    } else if (res.value.list && res.value.list.length > 0) {
      reactiveData.infoData.push(...res.value.list)
    }
    if (reactiveData.infoData.length >= res.value.total) {
      reactiveData.loadMore = 'nomore'
    } else {
      reactiveData.loadMore = 'loadmore'
    }
  }
}

watch(
  () => props.select,
  () => {
    inSelect.value = props.select
    reactiveData.infoData = []
    reactiveData.screenData.page = 1
    reactiveData.loadMore = 'loading'
    getData()
  },
  {
    deep: true,
    immediate: true
  }
)
onReachBottom(() => {
  if (reactiveData.loadMore === 'loadmore') {
    reactiveData.loadMore = 'loading'
    reactiveData.screenData.page++
    getData()
  }
})
</script>

<template>
  <view v-if="reactiveData.infoData && reactiveData.infoData.length > 0">
    <view v-if="inSelect === 'xiaobaoWelfare'">
      <view v-for="(item, index) of reactiveData.infoData" :key="index" class="mt-20rpx">
        <view class="relative" v-if="item.imageArray && item.imageArray.length > 0">
          <u-image width="100%" height="300rpx" :radius="8" :src="item.imageArray[0].previewUrl" />
          <view
            class="absolute left-0 top-0 text-[#FFF] text-center text-[24rpx] py-16rpx px-10rpx w-160rpx"
            style="border-radius: 8px 0 8px 0; background: rgba(0, 0, 0, 0.4)"
            >{{ item.publishOrigin }}</view
          >
        </view>

        <view v-if="item.title" class="text-[32rpx] mt-20rpx font-700">{{ item.title }}</view>
        <scroll-view class="max-h-[150rpx] mt-20rpx" v-if="item.content">
          <!-- eslint-disable-next-line vue/no-v-html, vue/no-v-text-v-html-on-component -->
          <view v-html="item.content" />
        </scroll-view>
      </view>
    </view>
    <view v-else>
      <view
        v-for="(item, index) of reactiveData.infoData"
        :key="index"
        class="mt-20rpx w-100% h-300rpx p-20rpx bg-[#FFF] rounded-8px flex box-border"
      >
        <view class="w-260rpx h-260rpx rounded-8px">
          <u-image
            v-if="item.productImage"
            width="260rpx"
            height="260rpx"
            :radius="8"
            :src="item.productImage.previewUrl"
          />
        </view>
        <view class="ml-20rpx flex-1 flex flex-col justify-between">
          <view class="text-[30rpx]" v-if="inSelect === '2'">{{ item.shopName }}</view>
          <view
            :style="
              inSelect === '2'
                ? 'font-size: 26rpx; color:#8c8383; margin-top:20rpx'
                : 'font-size: 30rpx;'
            "
            >{{ item.productDes }}</view
          >
          <view class="flex items-end" :style="inSelect === '2' ? '  flex: 1 1 0%;' : ''">
            <view class="mr-20rpx">
              ￥<text class="text-[38rpx] text-[red]">{{ item.productDiscountPrice }}</text>
            </view>
            <view class="amount">
              ￥<text class="text-[30rpx]">{{ item.productPrice }}</text>
            </view>
          </view>
          <view class="flex">
            <view class="flex-1 flex flex-col justify-between">
              <view class="h-22rpx" />
              <view>
                <u-line-progress
                  :showText="false"
                  :height="8"
                  :percentage="(item.productSoldQuantity / item.productInventoryQuantity) * 100"
                  :activeColor="inSelect === '1' ? '#FB4143' : '#1BB8CE'"
                />
              </view>
              <view class="w-100% text-end text-[#cbc8c8] text-[22rpx]"
                >已抢{{ item.productSoldQuantity }} {{ inSelect === '1' ? '件' : '间' }}</view
              >
            </view>
            <view class="selcet-click" :class="inSelect === '1' ? 'rob' : 'appointment'">
              {{ inSelect === '1' ? '立即抢卷' : '一键预约' }}</view
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 上拉加载 -->
    <view class="h-50rpx flex items-center" v-if="reactiveData.infoData.length > 9">
      <u-loadmore
        loadmore-text="上拉加载更多"
        loading-text="正在加载..."
        nomore-text="我是有底线的"
        :status="reactiveData.loadMore"
      />
    </view>
  </view>
  <view v-else>
    <NoData
      text="抱歉，暂无数据哦！"
      :height="`calc(100vh - 200px - 90rpx - 180rpx - ${marginHeight})`"
      textTop="80rpx"
    />
  </view>
</template>

<style lang="scss" scoped>
.amount {
  text-decoration: line-through;
  color: #cbc8c8;
}
.selcet-click {
  margin-left: 20rpx;
  width: 180rpx;
  height: 80rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
}

.rob {
  background: linear-gradient(to right, #f90305, #f82d59);
}
.appointment {
  background: linear-gradient(to right, #1bb8ce, #45ead0);
}
</style>
