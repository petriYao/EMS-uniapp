<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import UploadPicture from '@/components/upload/UploadPicture.vue'
import { addReportRepairs } from '@/api'
import { debounceSave } from '@/utils'

const setData = reactive({
  position: 'C5', //所在位置
  content: '玻璃碎了', //问题描述
  imageIdArray: [], //图片
  reportRepairsType: 1, //所属分类
  contactName: 'yzp', //联系人
  contactPhone: '15083778699', //联系号码
  reservationAt: '' //预约时间
})

const reactiveData = reactive({
  pickerShow: false, //选择分类弹窗
  columns: ['报事', '保障']
})

// tabs
const uploadRef = ref()

const saveClick = debounceSave(async () => {
  const image = await uploadRef.value.uploadClick()
  if (image) {
    setData.imageIdArray = image.map((item: any) => item.id)
  }

  const res = await addReportRepairs(setData)
  console.log('保存', res)
})

onLoad((val: any) => {
  console.log('onLoad', val)
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="报事报修" />
    <!-- 头部结束 -->
    <view class="mt-20rpx p-20rpx bg-[#FFF]">
      <view class="pb-20rpx">位置</view>
      <view class="bg-[#F6F6F6] rounded-10rpx">
        <u-input
          v-model="setData.position"
          placeholder="输入您的位置···"
          border="surround"
          clearable
        />
      </view>
    </view>

    <view class="mt-20rpx p-20rpx bg-[#FFF]">
      <view class="pb-20rpx">问题描述</view>
      <view class="bg-[#F6F6F6] rounded-10rpx">
        <u-input v-model="setData.content" placeholder="请输入内容" border="surround" clearable />
      </view>
    </view>

    <view class="mt-20rpx p-20rpx bg-[#FFF]">
      <view class="pb-20rpx">上传图片</view>
      <view>
        <UploadPicture ref="uploadRef" />
      </view>
    </view>

    <view class="mt-20rpx p-20rpx bg-[#FFF]">
      <u-picker :show="reactiveData.pickerShow" :columns="reactiveData.columns" />
      <view class="flex justify-between">
        <view>问题所属分类</view>
        <view>请选择分类</view>
      </view>
    </view>
    <view class="mt-20rpx p-20rpx bg-[#FFF]">
      <view class="flex justify-between">
        <view>查看收费说明</view>
        <view>请选择分类</view>
      </view>
    </view>
    <view class="mt-20rpx p-20rpx bg-[#FFF]">
      <view>提交人信息</view>
      <view>
        <view>联系人</view>
        <view>联系人</view>
      </view>
      <view>
        <view>联系电话</view>
        <view>联系电话</view>
      </view>
    </view>

    <view class="fixed bottom-20rpx w-[100%] box-border h-80rpx" @click="saveClick">
      <view
        class="bg-[#466BF3] flex items-center justify-center text-[#FFF] rounded-10rpx mx-20rpx h-[inherit]"
        >立即提交</view
      >
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
