<template>
  <view v-if="!flag" class="hideImg">
    <uni-icons type="spinner-cycle" size="30" />
  </view>
  <image
    @tap="showImage"
    v-show="flag"
    @load="success"
    :lazy-load="true"
    mode="heightFix"
    :src="item.replyContent.image.url"
  />
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'

const props = defineProps({
  item: {
    type: Object as PropType<any>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: {}
  }
})

//是否加载完成
const flag = ref<Boolean>(false)
//图片加载完成
const success = () => {
  flag.value = true
}

const showImage = () => {
  if (!props.item?.replyContent.image.url) return
  const sources = [] as UniApp.MediaSource[]
  let current = 0
  // for (const chatitem of useStore.chatList) {
  //   if (chatitem.contentType === 102) {
  //     if (!chatitem.pictureElem?.bigPicture.url) continue
  //     if (chatitem.clientMsgID === props.item.clientMsgID) {
  //       current = sources.length
  //     }
  //     sources.push({
  //       url: chatitem.pictureElem.bigPicture.url,
  //       poster: chatitem.pictureElem.bigPicture.url,
  //       type: 'image'
  //     })
  //   }
  // }
  uni.previewMedia({
    sources,
    current
  })
}
</script>

<style lang="scss" scoped>
.hideImg {
  width: 400rpx;
  height: 400rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
image {
  max-width: 400rpx;
  max-height: 400rpx;
}
</style>
