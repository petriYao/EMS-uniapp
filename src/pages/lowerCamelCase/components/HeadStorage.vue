<script setup lang="ts">
import { onBeforeMount } from 'vue'

const props = defineProps({
  title: {
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

onBeforeMount(() => {})
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
