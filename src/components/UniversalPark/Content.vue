<script setup lang="ts">
import { AppSetListApi, ProductListApi } from '@/api'
import { ref, watch } from 'vue'

const props = defineProps({
  select: {
    type: String,
    default: ''
  }
})

const infoData = ref()

const getData = async () => {
  if (props.select === 'xiaobaoWelfare') {
    const res = await AppSetListApi(props.select)
    console.log(res)
    if (res.success) {
      infoData.value = res.value!.list
    }
  } else {
    const res = await ProductListApi({ productTypeId: props.select })
    console.log('产品优惠劵预约', res)
    if (res.success) {
      infoData.value = res.value!.list
    }
  }
}
watch(
  () => props.select,
  () => {
    getData()
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<template>
  <view v-if="props.select === 'xiaobaoWelfare'">
    <view v-for="(item, index) of infoData" :key="index" class="mt-20rpx">
      <view class="relative" v-if="item.imageArray && item.imageArray.length > 0">
        <u-image width="100%" height="300rpx" :radius="8" :src="item.imageArray[0].listUrl" />
        <view
          class="absolute left-0 top-0 text-[#FFF] text-center text-[24rpx] py-16rpx px-10rpx w-160rpx"
          style="border-radius: 8px 0 8px 0; background: rgba(0, 0, 0, 0.4)"
          >{{ item.publishOrigin }}</view
        >
      </view>

      <view v-if="item.title" class="text-[28rpx] mt-20rpx font-600">{{ item.title }}</view>
      <scroll-view class="max-h-[150rpx] mt-20rpx" v-if="item.content">
        <view v-html="item.content" />
      </scroll-view>
    </view>
  </view>
  <view v-else>
    <view
      v-for="(item, index) of infoData"
      :key="index"
      class="mt-20rpx w-100% h-300rpx p-20rpx bg-[#FFF] rounded-8px flex box-border"
    >
      <view class="w-260rpx h-260rpx rounded-8px">
        <u-image
          v-if="item.productImage"
          width="260rpx"
          height="260rpx"
          :radius="8"
          :src="item.productImage.listUrl"
        />
      </view>
      <view class="ml-20rpx flex-1 flex flex-col justify-between">
        <view class="text-[30rpx]">{{ item.productDes }}</view>
        <view class="flex items-end">
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
                :activeColor="props.select === '1' ? '#FB4143' : '#1BB8CE'"
              />
            </view>
            <view class="w-100% text-end text-[#cbc8c8] text-[22rpx]"
              >已抢{{ item.productSoldQuantity }} {{ props.select === '1' ? '件' : '间' }}</view
            >
          </view>
          <view class="selcet-click" :class="props.select === '1' ? 'rob' : 'appointment'">
            {{ props.select === '1' ? '立即抢卷' : '一键预约' }}</view
          >
        </view>
      </view>
    </view>
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
