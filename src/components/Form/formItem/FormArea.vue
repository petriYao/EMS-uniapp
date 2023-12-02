<script setup lang="ts">
import { ref, reactive, watch, onBeforeMount } from 'vue'
import { setAreaDataCache, getAreaDataCache } from '@/hooks/useCache'
// import { areaList } from '@vant/area-data'

const props = defineProps({
  modelValue: {
    type: String,
    default: '' as string
  },
  companyAddressCityText: {
    type: String,
    default: '' as string
  },
  placeholder: {
    type: String,
    default: '' as string
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
  (e: 'update:companyAddressCityText', companyAddressCityText: string): void
}>()

const selectComponent = ref()

const areaData = ref()

const data = reactive({
  inputData: '',
  areaData: '110101'
})

const getAreaData = async () => {
  const temp = getAreaDataCache()
  if (temp) {
    areaData.value = temp
    return
  }
}

const changeAddress = (event: any) => {
  data.inputData = ''
  data.areaData = event.detail.values[2].code
  let val = ''
  event.detail.values.forEach((item: any, index: number) => {
    val = item.code
    data.inputData += item.name
    if (index !== 2) {
      data.inputData += ','
    }
  })
  emit('update:modelValue', val)
  emit('update:companyAddressCityText', data.inputData)
  sheetShow.value = false
}

const sheetShow = ref(false)

const sheetOnClose = () => {
  sheetShow.value = false
}

watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) return
    data.areaData = props.modelValue
    data.inputData = props.companyAddressCityText
  },
  {
    immediate: true,
    deep: true
  }
)

onBeforeMount(() => {
  getAreaData()
})
</script>

<template>
  <view @tap.stop="sheetShow = true">
    <u-input readonly v-model="data.inputData" :placeholder="placeholder" border="none" />
  </view>
  <van-action-sheet :show="sheetShow" @close="sheetOnClose" @cancel="sheetShow = false">
    <view>
      <van-area
        ref="selectComponent"
        title="请选择地址"
        :value="data.areaData"
        @confirm="changeAddress"
        :area-list="areaData"
      />
    </view>
  </van-action-sheet>
</template>
