<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  scrollHeight: {
    type: Number,
    default: 0
  },
  backTopAttrs: {
    type: Object,
    default: () => ({ right: 0, bottom: 0, isScrollView: true })
  },
  showHeight: {
    type: Number,
    default: 400
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'setScrollTop'): void
}>()

const scrollHeight = computed(() => {
  return props.scrollHeight
})

const backTopClick = () => {
  emit('setScrollTop')
}
</script>
<template>
  <view
    class="fixed flex justify-end z-999 slow-display"
    :class="scrollHeight > props.showHeight ? 'show' : ''"
    :style="`bottom:${
      typeof props.backTopAttrs.bottom === 'string'
        ? props.backTopAttrs.bottom
        : props.backTopAttrs.bottom + 'px'
    };right:${props.backTopAttrs.right}rpx`"
  >
    <view
      class="bg-#FFF w-80rpx h-80rpx flex justify-center items-center rounded-50"
      style="box-shadow: -6rpx 7px 13rpx 1px rgba(43, 42, 42, 0.196)"
      @click.stop="backTopClick"
    >
      <van-icon name="back-top" size="50rpx" color="#196CFF" />
    </view>
  </view>
</template>
<style lang="less" scoped>
.slow-display {
  transition: opacity 0.5s;
  opacity: 0;
}

.show {
  opacity: 1;
}
</style>
