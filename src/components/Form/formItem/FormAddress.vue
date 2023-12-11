<script setup lang="ts">
import { ref, watch } from 'vue'
import { getImageURL } from '@/utils'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxlength: {
    type: String,
    default: '255'
  },
  count: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
  (e: 'update:receiverAddressCity', modelValue: string): void
}>()

const { emitter } = useEmitt()

const data = ref()

const inputDataChange = () => {
  emit('update:modelValue', data.value)
}

const addressClick = () => {
  uni.chooseLocation({
    success: function (res) {
      // 用户选择位置成功后的回调函数
      if (res?.name) {
        data.value = res.name
        setTimeout(() => {
          //发送坐标信息
          emit('update:modelValue', data.value)
          emitter.emit('update:Address', res)
        }, 20)
      }
    },
    fail: function (_err) {
      // 用户取消选择位置或发生错误时的回调函数
    }
  })
}

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue == data.value) return
    data.value = props.modelValue
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<template>
  <view class="relative">
    <u-textarea
      v-model="data"
      :placeholder="placeholder"
      :showConfirmBar="false"
      :count="count"
      placeholderStyle="background-color: #f4f5f7"
      autoHeight
      @change="inputDataChange"
    />
    <view class="absolute top-20rpx right-20rpx z-99" @tap="addressClick">
      <van-image
        :show-error="false"
        :show-loading="false"
        fit="cover"
        width="40rpx"
        height="40rpx"
        :src="getImageURL('home/From', 'address')"
      />
    </view>
  </view>
</template>
<style lang="less" scoped>
::v-deep .u-textarea {
  background-color: #f4f5f7 !important;
}
//限制输入框最大高度
::v-deep .u-textarea__field {
  min-height: 140rpx;
  background: #f4f5f7 !important;
}
</style>
