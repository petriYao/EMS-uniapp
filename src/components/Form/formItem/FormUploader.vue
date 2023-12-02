<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { uploadFileApi } from '@/api/modules/common'

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: number): void
}>()

const props = defineProps({
  modelValue: {
    type: String,
    default: '' as string
  },
  columnId: {
    type: String as any,
    default: '' as any
  },
  placeholder: {
    type: String,
    default: '' as string
  },
  category: {
    type: String,
    default: 'supplier'
  }
})

const data = ref()

// emit('update:modelValue', JSON.stringify(list))
//上传文件
const upFileClick = () => {
  uni.chooseMessageFile({
    count: 1, // 选择文件的数量
    type: 'file', // 选择文件的类型，这里设置为通用文件类型
    success: async (file: any) => {
      const res = await uploadFileApi(props.category, file.tempFiles[0], file.tempFiles[0].path)
      if (res && res.success) {
        data.value = res.value.name
        emit('update:modelValue', res.value.id)
      }
    }
  })
}

onBeforeMount(() => {
  if (props.columnId.name) {
    data.value = props.columnId.name
  }
})
</script>
<template>
  <view class="w-100%" @tap="upFileClick">
    <u-input v-model="data" border="none" readonly :placeholder="placeholder">
      <template #suffix>
        <van-icon name="arrow" size="36rpx" color="#909399" />
      </template>
    </u-input>
  </view>
</template>

<style lang="less" scoped></style>
