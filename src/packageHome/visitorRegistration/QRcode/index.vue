<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { getImageURL } from '@/utils'
import { ref } from 'vue'
import Uqrcode from '@/components/UQRCode/components/uqrcode/uqrcode.vue'

const QRvalue = ref('shu-xiao-bao-YYDS')
const qrSize = uni.upx2px(350)

onShow(async () => {})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="访客预约二维码" leftColor="#FFF" />
    <view class="fixed top-0 w-100%">
      <u-image :src="getImageURL('visitorRegistration', 'bg')" width="100%" height="400rpx" />
    </view>
    <!-- 头部结束 -->
    <view class="bg-[#FFF] rounded-10rpx p-20rpx box relative z-11 mx-40rpx mt-60rpx">
      <view class="text-[#196cff] text-[24rpx] p-20rpx pb-0">该二维码用于来访身份证</view>
      <view class="flex justify-center py-40rpx">
        <Uqrcode canvasId="canvasId" :value="QRvalue" :size="qrSize" />
      </view>
      <view class="flex justify-center flex-col pb-20rpx text-[#808080] text-[28rpx]">
        <view class="flex justify-center">默认来访日期一天内</view>
        <view class="flex justify-center">有效超过一天后，无法正常出入大门</view>
        <view class="flex justify-center">需要重新申请</view>
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-navbar__content) {
  background-color: transparent !important;
  color: #fff !important;
}
.box {
  box-shadow: 6px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
