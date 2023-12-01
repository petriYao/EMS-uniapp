<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import UploadPicture from '@/components/upload/UploadPicture.vue'
import { addReportRepairs } from '@/api'
import { debounceSave } from '@/utils'
import { useAppStore } from '@/store'

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
  columns: [
    [
      { label: '报事', value: 0 },
      { label: '报修', value: 20 }
    ]
  ],
  columnsAction: '',
  datetimeShow: false, //选择时间
  datetimeAction: new Date() //选择时间
})
const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')
// 图片实例
const uploadRef = ref()

//保存所选分类
const pickerConfirm = async (val: any) => {
  console.log('val', val)
  setData.reportRepairsType = val.value[0].value
  reactiveData.columnsAction = val.value[0].label
  reactiveData.pickerShow = false
}
//保存预约时间
const datetimeConfirm = (val: any) => {
  console.log('时间', new Date(val.value))
}

//提交
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
    <scroll-view scroll-y :style="`height:calc(100vh - 100rpx - 44px - ${marginHeight})`">
      <view class="mt-20rpx p-20rpx bg-[#FFF]">
        <view class="pb-20rpx title-color">位置</view>
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
        <view class="pb-20rpx title-color">问题描述</view>
        <view class="bg-[#F6F6F6] rounded-10rpx">
          <u-input v-model="setData.content" placeholder="请输入内容" border="surround" clearable />
        </view>
      </view>

      <view class="mt-20rpx p-20rpx bg-[#FFF]">
        <view class="pb-20rpx title-color">上传图片</view>
        <view>
          <UploadPicture ref="uploadRef" />
        </view>
      </view>

      <view class="mt-20rpx p-20rpx bg-[#FFF]">
        <u-picker
          :show="reactiveData.pickerShow"
          keyName="label"
          closeOnClickOverlay
          :columns="reactiveData.columns"
          @cancel="reactiveData.pickerShow = false"
          @confirm="pickerConfirm"
        />
        <view class="flex justify-between" @click="reactiveData.pickerShow = true">
          <view class="title-color">问题所属分类</view>
          <view class="content-color flex">
            <text class="mr-10rpx">{{ reactiveData.columnsAction || '请选择分类' }}</text>
            <u-icon name="arrow-right" color="#C0C0C0" size="28rpx" />
          </view>
        </view>
        <u-datetime-picker
          :show="reactiveData.datetimeShow"
          mode="datetime"
          closeOnClickOverlay
          v-model="reactiveData.datetimeAction"
          @cancel="reactiveData.datetimeShow = false"
          @confirm="datetimeConfirm"
        />
        <view class="flex justify-between mt-20rpx" @click="reactiveData.datetimeShow = true">
          <view class="title-color">期望服务时间</view>
          <view class="content-color flex">
            <text class="mr-10rpx">{{ setData.reservationAt || '请选择时间' }}</text>
            <u-icon name="arrow-right" color="#C0C0C0" size="28rpx" />
          </view>
        </view>
      </view>
      <view class="mt-20rpx p-20rpx bg-[#FFF]">
        <view class="flex justify-between">
          <view class="title-color">查看收费说明</view>
          <view> <u-icon name="arrow-right" color="#C0C0C0" size="28rpx" /></view>
        </view>
      </view>
      <view class="mt-20rpx p-20rpx bg-[#FFF]">
        <view class="title-color mb-20rpx">提交人信息</view>
        <view class="flex items-center">
          <view class="content-color">联系人</view>
          <view class="rounded-10rpx flex-1">
            <u-input
              v-model="setData.contactName"
              placeholder="输入联系人·"
              border="surround"
              inputAlign="right"
            />
          </view>
        </view>
        <view class="flex items-center">
          <view class="content-color">联系电话</view>
          <view class="rounded-10rpx flex-1">
            <u-input
              v-model="setData.contactPhone"
              placeholder="输入联系电话"
              border="surround"
              inputAlign="right"
              type="number"
            />
          </view>
        </view>
      </view>
      <view class="h-20rpx" />
    </scroll-view>

    <view class="fixed bottom-20rpx w-[100%] box-border h-80rpx" @click="saveClick">
      <view
        class="bg-[#466BF3] flex items-center justify-center text-[#FFF] rounded-10rpx mx-20rpx h-[inherit]"
        >立即提交</view
      >
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.title-color {
  color: #282828;
  font-size: 28rpx;
  font-weight: 600;
}
.content-color {
  color: #c0c0c0;
}
</style>
