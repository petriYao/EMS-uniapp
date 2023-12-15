<script setup lang="ts">
import FormPartItem from './FormPartItem.vue'
import PartTitle from './formTitle/PartTitle.vue'
import { PropType, ref } from 'vue'

const props = defineProps({
  formData: {
    type: Array as PropType<any>,
    default: Array as any
  },
  editData: {
    type: Array as PropType<any>,
    default: Array as any
  },
  rules: {
    type: Object as PropType<any>,
    default: Object as any
  },
  labelPosition: {
    type: String as PropType<any>,
    default: 'left' as String
  }, //对齐方向
  borderBottom: {
    type: Boolean as PropType<any>,
    default: true
  }, //是否显示表单域的下划线边框
  labelWidth: {
    type: String as PropType<any>,
    default: '200rpx' as String
  }, //label长度
  labelAlign: {
    type: String as PropType<any>,
    default: 'center' as String
  }, //label字体对齐方式
  labelStyle: {
    type: Object as PropType<any>,
    default: { paddingLeft: '20rpx', color: '#9B9B9B' } as any
  }, //label字体对齐方式
  category: {
    type: String as PropType<any>,
    default: '' as String
  },
  formStyle: {
    type: Object as PropType<any>,
    default: {} as any
  }
})

const formPartItemRef = ref()
const saveClick = () => {
  return formPartItemRef.value.saveClick()
}

const validate = async () => {
  return await formPartItemRef.value.validate()
}

defineExpose({ saveClick, validate })
</script>
<template>
  <div>
    <PartTitle v-if="props.category" :processTitle="props.category" />
    <view class="bg-#f4f5f7">
      <view class="bg-#FFF" :class="props.formStyle">
        <FormPartItem
          ref="formPartItemRef"
          :formData="formData"
          :rules="rules"
          :editData="editData"
          :labelPosition="labelPosition"
          :borderBottom="false"
        />
      </view>
    </view>
  </div>
</template>
<style lang="less" scoped>
::v-deep .u-form-item__body__right__message {
  padding-left: 20rpx !important;
}
</style>
