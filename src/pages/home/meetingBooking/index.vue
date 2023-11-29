<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { getImageURL } from '@/utils'

// 轮播图

onLoad(async () => {})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="会议室预定" />
    <view class="h-50vh flex items-center justify-center">
      <u-image
        width="100%"
        height="26vh"
        mode="heightFix"
        :src="getImageURL('home', 'meeting-booking-bg')"
      />
    </view>
    <view class="mx-20rpx">
      <view
        ><u-button
          iconColor="#196CFF"
          :customStyle="{
            border: '0',
            backgroundColor: '#196CFF'
          }"
          type="primary"
          text="预定会议室"
      /></view>
      <view class="mt-20rpx"
        ><u-button
          :customStyle="{
            border: '0',
            color: '#196CFF'
          }"
          :plain="true"
          text="我的会议"
      /></view>
    </view>
    <!-- 头部结束 -->
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
