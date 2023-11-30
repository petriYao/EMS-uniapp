<script setup lang="ts">
import { reactive } from 'vue'
import { uploadFileApi } from '@/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const reactiveData = reactive({
  fileList: [] as any //显示
})

const deletePic = (event: any) => {
  reactiveData.fileList.splice(event.index, 1)
}

const afterRead = (event: any) => {
  console.log('上传', event)
  for (const item of event.file) {
    reactiveData.fileList.push({ url: item.url })
  }
}

const uploadClick = () => {
  return new Promise<void>(async (resolve, reject) => {
    if (reactiveData.fileList.length > 0) {
      for (const item of reactiveData.fileList) {
        if (!item.id) {
          const res = await uploadFileApi('reportRepairs', undefined, item.url)
          if (res && res.success) {
            item.id = res.value.id
          }
        }
      }
    }
    resolve(reactiveData.fileList)
  })
}

//暴露方法给父组件
defineExpose({
  uploadClick
})
</script>

<template>
  <view>
    <u-upload
      :fileList="reactiveData.fileList"
      @afterRead="afterRead"
      @delete="deletePic"
      multiple
      :maxCount="8"
    />
  </view>
</template>
