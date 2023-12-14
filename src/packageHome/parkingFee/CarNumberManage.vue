<script setup lang="ts">
// import { getSvgURL } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import CarNumberInput from './components/CarNumberInput.vue'
import { getLocal, setLocal } from '@/hooks/useCache'
import { getSvgURL } from '@/utils'

const reactiveData = reactive({
  infoData: [] as any[],
  show: false
})

const plateNumber = ref(['', '', '', '', '', '', ''])

const popupSaveClick = () => {
  let plate = {
    str: '',
    type: ''
  }

  for (let i = 0; i < plateNumber.value.length; i++) {
    if (i === 7) {
      plate.type = plateNumber.value[i]
    } else {
      plate.str += plateNumber.value[i]
      if (i === 1) {
        plate.str += ' · '
      }
    }
  }

  reactiveData.infoData.push(plate)
  plateNumber.value = ['', '', '', '', '', '', '']
  reactiveData.show = false
  setLocal('carNumberList', JSON.stringify(reactiveData.infoData))
}

const delClick = (index: number) => {
  // 提示你确定要删除吗
  uni.showModal({
    title: '提示',
    content: '确定要删除吗',
    success: function (res) {
      if (res.confirm) {
        // 删除
        reactiveData.infoData.splice(index, 1)
        setLocal('carNumberList', JSON.stringify(reactiveData.infoData))
      }
    }
  })
}

onLoad(async () => {
  let val = getLocal('carNumberList')
  if (val) {
    reactiveData.infoData = JSON.parse(val)
  }
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="车牌管理" />
    <!-- 头部结束 -->
    <view class="p-20rpx text-[#808080]"> 最多可添加十辆 </view>

    <view class="mx-20rpx">
      <view
        v-for="(item, index) in reactiveData.infoData"
        :key="index"
        class="mb-20rpx bg-[#FFF] rounded-10rpx p-20rpx flex items-center w-100% box-border"
      >
        <view><u-icon :name="getSvgURL('parkingFee', 'car-phone')" size="40" /></view>
        <view class="ml-20rpx text-[32rpx]">{{ item.str }}</view>
        <view class="flex-1 flex justify-end"
          ><u-icon name="trash" size="26" @click="delClick"
        /></view>
      </view>
    </view>

    <view class="fixed bottom-0 w-100% box-border pb-20rpx flex">
      <view
        class="bg-[#00BAAD] w-[50%] rounded-20rpx mx-20rpx text-[#FFF] flex justify-center items-center h-80rpx"
      >
        <text class="">申请中</text>
      </view>
      <view
        class="bg-[#1957E6] w-[50%] rounded-20rpx mx-20rpx text-[#FFF] flex justify-center items-center h-80rpx"
      >
        <text class="" @click="reactiveData.show = true">添加车牌</text>
      </view>
    </view>

    <u-popup :show="reactiveData.show" @close="reactiveData.show = false" round="60rpx">
      <view class="h-800rpx relative">
        <view class="mt-80rpx mx-20rpx">
          <CarNumberInput :plateNumber="plateNumber" />
        </view>
        <view class="flex absolute bottom-20rpx w-100%">
          <view
            class="bg-[#E8EEFC] w-[50%] rounded-20rpx mx-20rpx text-[#196CFF] flex justify-center items-center h-80rpx"
            @click="reactiveData.show = false"
          >
            <text class="">关闭</text>
          </view>
          <view
            class="bg-[#1957E6] w-[50%] rounded-20rpx mx-20rpx text-[#FFF] flex justify-center items-center h-80rpx"
          >
            <text class="" @click="popupSaveClick">保存</text>
          </view>
        </view>
      </view>
    </u-popup>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.box {
  box-shadow: 6px 0px 10px rgba(0, 0, 0, 0.2);
}
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
