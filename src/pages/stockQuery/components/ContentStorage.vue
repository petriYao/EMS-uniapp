<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
const reactiveData = reactive({
  detailsList: []
})
</script>

<template>
  <!-- 扫描条码 -->
  <view class="bg-#FFF">
    <HeadScan v-model:detailsList="reactiveData.detailsList" />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF">
    <LowerCamelCase v-model:detailsList="reactiveData.detailsList" />
  </view>
</template>
<style lang="less" scoped>
::v-deep .uni-select__selector-scroll {
  max-height: 140px !important;
}
::v-deep .u-input__content__field-wrapper__field {
  line-height: 34px;
}
::v-deep .u-input {
  height: 28px;
  padding: 2px 9px !important;
}
.content-input {
  ::v-deep .u-input {
    height: 22px;
    padding: 2px 9px !important;
  }
}
</style>
