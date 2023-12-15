<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { getImageURL, getSvgURL } from '@/utils'
import { reactive } from 'vue'
import router from '@/router'
import { getLocal, visitorApplicatKey } from '@/hooks/useCache'

// 轮播图
const reactiveData = reactive({
  editData: {} as any
})
//添加
const pathClick = (type: string) => {
  switch (type) {
    case '访客申请':
      router.push({
        url: `/packageHome/visitorRegistration/visitorRequest/index`
      })
      break
    case '申请记录':
      router.push({
        url: `/packageHome/visitorRegistration/requestRecord/index`
      })
      break
    case '联系人':
      router.push({
        url: `/packageHome/visitorRegistration/addVisitor/index`
      })
      break
    case '二维码':
      router.push({
        url: `/packageHome/visitorRegistration/QRcode/index`
      })
      break
  }
}
onShow(async () => {
  const val = getLocal(visitorApplicatKey)
  if (val) {
    reactiveData.editData = JSON.parse(val)
  }
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="访客登记" leftColor="#FFF" />
    <view class="fixed top-0 w-100%">
      <u-image :src="getImageURL('visitorRegistration', 'bg')" width="100%" height="400rpx" />
    </view>
    <!-- 头部结束 -->
    <view
      class="relative mt-60rpx z-11 rounded-t-lg p-20rpx text-[#555555]"
      style="background: linear-gradient(to bottom, #f0f7fc, #f4f7f9)"
      v-if="reactiveData.editData && reactiveData.editData.name"
    >
      <!-- 个人资料 -->
      <view class="bg-[#FFF] rounded-10rpx p-20rpx box">
        <view class="text-[34rpx] font-bold flex items-center">
          <view>{{ reactiveData.editData.name }}</view>
          <view class="ml-10rpx">
            <u-icon :name="getSvgURL('visitorRegistration', 'edit')" size="30rpx" />
          </view>
        </view>
        <view class="flex justify-between">
          <view>
            <view class="mt-20rpx">电话： {{ reactiveData.editData.phone }}</view>
            <view class="mt-20rpx">公司： {{ reactiveData.editData.company }}</view>
          </view>
          <view class="flex items-end">
            <view
              class="bg-[#1957E6] text-[#FFF] py-10rpx px-30rpx text-[26rpx] rounded-40rpx"
              @click="pathClick('二维码')"
            >
              二维码
            </view>
          </view>
        </view>
      </view>

      <!-- 操作 -->
      <view class="flex mt-20rpx h-200rpx">
        <view
          class="w-[50%] box bg-[#FFF] rounded-10rpx flex items-center justify-center mr-10rpx"
          @click="pathClick('访客申请')"
        >
          <view>
            <u-icon :name="getSvgURL('visitorRegistration', 'apply')" size="80rpx" />
          </view>
          <view class="ml-10rpx">访客申请</view>
        </view>
        <view
          class="w-[50%] box bg-[#FFF] rounded-10rpx flex items-center justify-center ml-10rpx"
          @click="pathClick('申请记录')"
        >
          <view>
            <u-icon :name="getSvgURL('visitorRegistration', 'record')" size="80rpx" />
          </view>
          <view class="ml-10rpx">申请记录</view>
        </view>
      </view>
    </view>
    <view
      v-else
      class="bg-[#FFF] rounded-10rpx mt-80rpx box flex justify-center items-center flex-col h-360rpx mx-20rpx relative z-11"
      @click="pathClick('联系人')"
    >
      <view
        class="flex justify-center items-center bg-[#1957E6] rounded-80rpx min-w-100rpx min-h-100rpx mb-10rpx"
      >
        <u-icon name="plus" color="#FFF" size="40rpx" />
      </view>
      <view class="mt-10rpx text-[28rpx] text-[#646464]">点击添加联系人</view>
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
