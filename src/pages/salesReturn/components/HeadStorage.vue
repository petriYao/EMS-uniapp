<script setup lang="ts">
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

//返回上一页
const onLeftClick = () => {
  uni.navigateBack({
    delta: 1
  })
}
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
