<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  scanCodeType: {
    type: String,
    default: ''
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:scanCodeType', val: String): void
}>()

const reactiveData = reactive({
  title: props.title,
  rightTitleShow: false,
  scanCodeType: props.scanCodeType
})

//返回上一页
const onLeftClick = () => {
  uni.navigateBack({
    delta: 1
  })
}

onBeforeMount(() => {
  //获取本地缓存的扫码类型
  const scanCodeType = uni.getStorageSync('scanCodeType')
  if (scanCodeType) {
    reactiveData.scanCodeType = scanCodeType
    emit('update:scanCodeType', scanCodeType)
  } else {
    reactiveData.scanCodeType = '扫码入库'
  }
})
</script>

<template>
  <view>
    <u-navbar
      :title="props.title"
      placeholder
      bgColor="#F2F2F2"
      @left-click="onLeftClick"
      height="44px"
    />
  </view>
</template>
<style lang="less" scoped></style>
