<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { getImageURL } from '@/utils'
import router from '@/router'

// 预定会议室
const addMeetingClick = () => {
  //跳转
  router.push({
    url: `/pages/meeting/Reservation`
  })
}

const myMeetingClick = () => {
  //跳转
  router.push({
    url: `/pages/meeting/MyMeeting`
  })
}

onLoad(async () => {})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="会议室预定" />
    <view class="h-50% flex items-center justify-center">
      <u-image
        width="400rpx"
        height="400rpx"
        mode="heightFix"
        :src="getImageURL('home', 'meeting-booking-bg')"
      />
    </view>
    <view class="mx-20rpx">
      <view>
        <u-button
          iconColor="#196CFF"
          :customStyle="{
            border: '0',
            backgroundColor: '#196CFF'
          }"
          type="primary"
          text="预定会议室"
          @click="addMeetingClick"
        />
      </view>
      <view class="mt-20rpx">
        <u-button
          :customStyle="{
            border: '0',
            color: '#196CFF'
          }"
          :plain="true"
          text="我的会议"
          @click="myMeetingClick"
        />
      </view>
    </view>
    <!-- 头部结束 -->
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
