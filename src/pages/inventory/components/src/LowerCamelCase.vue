<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  detailsList: {
    type: Array as any,
    default: () => [] as any
  },
  locationList: {
    type: Array as any,
    default: () => []
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
}>()
const { emitter } = useEmitt()

const reactiveData = reactive({
  detailsList: [] as any,
  barcodeIndex: 0
})

const clearTimer = () => {
  // 清除定时器
  emitter.emit('update:clearTimer')
}

const quantChange = (val: any, item: any) => {
  console.log('val', val)
  console.log('item', item)
  reactiveData.detailsList[reactiveData.barcodeIndex].currentList[item.index].value = val
  emit('update:detailsList', reactiveData.detailsList)
}

watch(
  () => props.detailsList,
  (val: any) => {
    console.log('val dataList', val)
    reactiveData.detailsList = val
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <view class="flex flex-wrap content-input">
    <view
      v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.currentList ||
      []"
      :key="index"
      class="flex items-center mb-6rpx"
      :style="item.style"
    >
      <view class="w-50px flex justify-center">
        {{ item.label }}
      </view>
      <view class="flex-1 mr-20rpx" v-if="item.type == 'input'" @click="clearTimer">
        <u-input
          v-model="item.value"
          :showAction="false"
          :disabled="item.disabled"
          shape="round"
          placeholder=""
          @cheange="quantChange($event, item)"
        />
      </view>
    </view>
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
