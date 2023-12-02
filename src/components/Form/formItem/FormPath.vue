<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import router from '@/router'

const props = defineProps({
  modelValue: {
    type: Array as any,
    default: '' as string
  },
  departmentId: {
    type: String as any,
    default: '' as any
  },
  field: {
    type: String as any,
    default: '' as any
  },
  multiple: {
    type: Boolean as any,
    default: false as any
  },
  placeholder: {
    type: String,
    default: '' as string
  },
  type: {
    type: [String, Number],
    default: 1
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: any): void
  (e: 'update:departmentId', departmentId: any): void
}>()
const data = ref({ label: '', value: '' as any, icon: '' })

//管理跳转
const managementClick = () => {
  router.push({
    url: `/packageSelect/pathSelect/select?field=${props.field}&type=${
      props.type
    }&data=${JSON.stringify(data.value)}`
  })
}

onShow(() => {
  var pages = getCurrentPages()
  var currPage = pages[pages.length - 1] as any
  if (!currPage.__data__.inputData) return
  if (props.field !== currPage.__data__.field) return
  const val = currPage.__data__.inputData
  switch (currPage.__data__.field) {
    case 'departmentId':
      data.value.label = val.departmentName
      data.value.value = val.departmentId
      break
    case 'groupName':
    case 'tagGroup':
      data.value.label = val.groupName
      data.value.value = val.groupId
      break
    case 'tagImage':
      data.value.icon = val.url
      data.value.value = val.id
      break
    case 'employeeId':
      data.value.label = val.employeeName
      data.value.value = val.employeeId
      break
    case 'supplierEmployeeName':
      // 选择对象
      const saveData = { label: '', value: [] as string[] }
      if (val && val.length > 0) {
        val.forEach((element: any, index: number) => {
          saveData.value.push(element.id)
          saveData.label += element.name
          if (val.length - 1 > index) {
            saveData.label += ','
          }
        })
      }

      data.value.label = saveData.label
      data.value.value = saveData.value
      break
    case 'tagList':
      // 选择对象
      const saveDataTag = { label: '', value: [] as string[] }
      if (val && val.length > 0) {
        val.forEach((element: any, index: number) => {
          saveDataTag.value.push(element.tagId)
          saveDataTag.label += element.tagName
          if (val.length - 1 > index) {
            saveDataTag.label += ','
          }
        })
      }
      data.value.label = saveDataTag.label
      data.value.value = saveDataTag.value
      break
    default:
      data.value.label = val.departmentName
      data.value.value = val.departmentId
      break
  }

  emit('update:modelValue', data.value.label)
  emit('update:departmentId', data.value.value)
})

onBeforeMount(() => {
  if (props.modelValue) {
    switch (props.field) {
      case 'tagList':
        props.modelValue.forEach((element: any, index: number) => {
          data.value.label += element.tagName
          if (props.modelValue.length - 1 > index) {
            data.value.label += ','
          }
        })
        break
      case 'tagImage':
        data.value.icon = props.modelValue.listUrl
        data.value.value = props.modelValue.id
        break
      default:
        data.value.label = props.modelValue
        break
    }
    data.value.value = props.departmentId
  }
})
</script>
<template>
  <view @tap="managementClick">
    <u-input
      v-model="data.label"
      border="none"
      readonly
      :placeholder="data.icon ? '' : placeholder"
    >
      <template #prefix>
        <view class="text-0" v-if="props.field === 'tagImage' && data.icon">
          <van-image width="60rpx" height="60rpx" round :src="data.icon" />
        </view>
      </template>
      <template #suffix>
        <van-icon name="arrow" size="36rpx" color="#909399" />
      </template>
    </u-input>
  </view>
</template>
