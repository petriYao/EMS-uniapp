<template>
  <view @tap="openItem" class="videoImage">
    <image :src="msg[1]" mode="heightFix" />
    <view>
      <uni-icons color="#ffffff" type="videocam" :size="iconSize" />
    </view>
  </view>
  <uni-popup @change="change" ref="popup" type="center" :animation="true">
    <video v-if="myFlag" style="width: 600rpx" id="myVideo" :src="msg[0]"></video>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  }
})
const popup = ref()
const myFlag = ref(false)

const change = (e: { show: boolean }) => {
  myFlag.value = e.show
}

const msg = props.message?.split(',')
const iconSize = ref<number>(60)
const openItem = () => {
  popup.value.open('')
}
</script>

<style lang="scss" scoped>
.videoImage {
  position: relative;

  image {
    max-width: 480rpx;
  }

  & > view {
    background: rgba(3, 3, 3, 0.4);

    z-index: 10;
    position: absolute;
    width: 120rpx;
    height: 120rpx;
    left: calc(50% - 60rpx);
    top: calc(50% - 60rpx);
    border-radius: 100rpx;
    uni-icons {
      position: relative;
      top: 45rpx;
    }
  }
}
</style>
