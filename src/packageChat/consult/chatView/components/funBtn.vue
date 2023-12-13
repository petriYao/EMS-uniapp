<script setup lang="ts">
import { ref } from 'vue'
import { getImageURL } from '@/utils'
import { uploadFileApi } from '@/api/modules/common'
// import { useChatStore } from '@/store'
import { useEmitt } from '@/hooks/useEmitt'
import { ReplyAdd } from '@/api'

const props = defineProps({
  replyType: {
    type: Number,
    default: 1
  }
})
// const useStore = useChatStore()
const { emitter } = useEmitt()

//常用工具
const frequentlyList = ref([
  { name: '相册', image: getImageURL('chat', 'shopCustomization') },
  { name: '拍摄', image: getImageURL('chat', 'newAddition') }
])

const clickFrequently = (type: string) => {
  switch (type) {
    case '相册':
      //  #ifdef MP-WEIXIN
      uni.chooseMedia({
        count: 9,
        mediaType: ['image'], //, 'video'
        sourceType: ['album'],
        maxDuration: 60,
        camera: 'back',
        success: function (res) {
          for (const item of res.tempFiles) {
            if (item.fileType === 'image') {
              uploadImage(item, item.tempFilePath)
            }
          }
        }
      })
      //  #endif

      // #ifdef H5
      uni.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: ['album'],
        success: function (res: any) {
          console.log('res.tempFiles', res.tempFiles)
          for (const item of res.tempFiles) {
            uploadImage(item, item.path)
          }
        }
      })
      //  #endif
      break
    case '拍摄':
      //  #ifdef MP-WEIXIN
      uni.chooseMedia({
        count: 1, // 选择的文件数量，最多可选择1个
        mediaType: ['image'], // 可选择的文件类型，可以是'image'、'video'或'image/video'（默认）
        sourceType: ['camera'], // 文件的来源，可以是'album'、'camera'或'album,camera'（默认）
        maxDuration: 60, // 选择视频的最大时长，单位为秒，默认为60秒
        success(res) {
          // 选择文件成功的回调函数
          // 在这个示例中，我们使用日志来代替实际的处理逻辑
          for (const item of res.tempFiles) {
            if (item.fileType === 'image') {
              uploadImage(item, item.tempFilePath)
            }
          }
        },
        fail(error) {
          // 选择文件失败的回调函数
          console.error('选择文件失败', error)
        }
      })
      //  #endif

      // #ifdef H5
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: function (res: any) {
          console.log('res.tempFiles', res.tempFiles)
          for (const item of res.tempFiles) {
            uploadImage(item, item.path)
          }
        }
      })
      //  #endif
      break
    default:
      uni.showToast({
        title: '开发中!', // 标题
        icon: 'success', // 图标类型，默认success
        duration: 1500 // 提示窗停留时间，默认1500ms
      })
  }
}

//发送图片相册
const uploadImage = async (tempFiles: any, tempFilePaths?: any) => {
  uni.showLoading({ title: '上传中...' })
  const res: any = await uploadFileApi('chatImage', tempFiles, tempFilePaths)
  uni.hideLoading()
  if (!res || !res.success || !res.value) {
    uni.showToast({ title: '上传图片失败', icon: 'error' })
    return
  } else {
    const addRes = await ReplyAdd({ replyType: props.replyType, imageId: res.value.id })
    if (addRes && addRes.success) {
      emitter.emit('Messages:getNewData')
    }
  }
}
</script>
<template>
  <view class="flex flex-wrap">
    <view
      class="w-25% flex flex-col items-center justify-center mt-20rpx"
      v-for="(item, index) of frequentlyList"
      :key="index"
      @tap="clickFrequently(item.name)"
    >
      <view class="text-0">
        <u-image
          :show-error="false"
          :show-loading="false"
          width="80rpx"
          height="80rpx"
          fit="fill"
          :src="item.image"
        />
      </view>
      <view class="font-size-seven mt-20rpx">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<style lang="scss"></style>
