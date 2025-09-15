<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeadStorage from './components/HeadStorage.vue'
import ContentStorage from './components/ContentStorage.vue'
import { debounceSave } from '@/utils'

//条码储位
const reactiveData = reactive({
  isShow: true, //是否选择
  loading: false, //是否保存
  title: '储位',
  FEntity: [] as any //单据提交
})

const contentStorageRef = ref() //标题组件引用

const saveClick = debounceSave(async () => {
  contentStorageRef.value?.saveClick()
})
</script>
<template>
  <view>
    <HeadStorage :title="reactiveData.title" />
  </view>
  <view>
    <ContentStorage ref="contentStorageRef" />
  </view>
  <view
    class="bg-#56a8fe fixed bottom-0 text-#FFF w-100% h-40px flex justify-center items-center"
    @click="saveClick"
  >
    提交
  </view>
</template>
<style lang="less" scoped></style>
