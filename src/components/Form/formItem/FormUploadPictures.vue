<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { uploadFileApi } from '@/api/modules/common'

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
  (e: 'update:columnId', modelValue: string): void
}>()

const props = defineProps({
  modelValue: {
    type: Object,
    default: {} as any
  },
  columnId: {
    type: String,
    default: '' as string
  },
  count: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    default: 'company' as string
  }
})

const fileList = ref([] as any)

const computedFileList = computed(() => {
  return fileList.value
})

const afterRead = (event: any) => {
  const list = event.file
  for (const item of list) {
    upload(undefined, item.url)
  }
}

const deleteFileList = (event: any) => {
  const list = JSON.parse(JSON.stringify(fileList.value))
  list.splice(event.detail.index, 1)
  fileList.value = list
  emit('update:modelValue', '')
  emit('update:columnId', '')
}

//上传图片
const upload = async (tempFile: any, tempFilePath: string) => {
  const res = await uploadFileApi(props.category, tempFile, tempFilePath)
  if (res && res.success) {
    if (props.count > 1 && fileList.value.length < props.count) {
      fileList.value = fileList.value.concat({
        url: res.value.url,
        isImage: true,
        id: res.value.id
      })

      let idList = []
      for (const item of fileList.value) {
        idList.push(item.id)
      }
      emit('update:columnId', JSON.stringify(idList))
    } else {
      fileList.value = [{ url: res.value.url, isImage: true, id: res.value.id }]
      emit('update:modelValue', res.value.url)
      emit('update:columnId', res.value.id)
    }
  }
}

onBeforeMount(() => {
  const val = props.modelValue
  if (val) {
    if (Array.isArray(val)) {
      let list = []
      let idList = []
      for (const item of val) {
        list.push({
          url: item.url,
          id: item.id,
          isImage: true
        })

        idList.push(item.id)
      }

      fileList.value = list

      emit('update:columnId', JSON.stringify(idList))
    } else {
      if (val.listUrl) {
        fileList.value = [{ url: val.listUrl, id: val.id, isImage: true }]
      }
    }
  }
})
</script>
<template>
  <view>
    <u-upload
      multiple
      :maxCount="props.count"
      accept="image"
      imageMode="aspectFill"
      :fileList="computedFileList"
      @after-read="afterRead"
      @delete="deleteFileList"
    />
  </view>
</template>

<style></style>
