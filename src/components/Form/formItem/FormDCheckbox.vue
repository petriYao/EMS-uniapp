<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array as any,
    default: '' as string
  },
  options: {
    type: Object as any,
    default: [] as any
  },
  placeholder: {
    type: String,
    default: '' as string
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: any): void
}>()
const showVal = ref('')
const show = ref(false)
const activeNames = ref([0])
const optionsObj = ref(props.options)
const modelData = ref()

/**折叠面板选择 */
const onCollapseChange = (event: any) => {
  activeNames.value = event.detail
}

const showClick = () => {
  show.value = true
}

const onClose = () => {
  let showValArr = [] as any[]
  let value = [] as any[]
  for (const i of optionsObj.value) {
    if (i.children && i.children.length > 0) {
      for (const j of i.children) {
        if (j.isSelect) {
          value.push(j.value)
          showValArr.push(j.label)
        }
      }
    } else {
      if (i.isSelect) {
        value.push(i.value)
        showValArr.push(i.label)
      }
    }
  }

  emit('update:modelValue', value)
  showVal.value = showValArr.length > 0 ? showValArr.join(',') : ''
  show.value = false
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    modelData.value = props.modelValue
    let showValArr = [] as any[]
    if (modelData.value && modelData.value.length > 0) {
      for (const i of optionsObj.value) {
        if (i.children && i.children.length > 0) {
          for (const j of i.children) {
            let checked = modelData.value.some((k: any) => k === j.value)
            if (checked) {
              j.isSelect = true
              showValArr.push(j.label)
            }
          }
        } else {
          let checked = modelData.value.some((k: any) => k === i.value)
          if (checked) {
            i.isSelect = true
            showValArr.push(i.label)
          }
        }
      }
      showVal.value = showValArr.length > 0 ? showValArr.join(',') : ''
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<template>
  <view>
    <view @tap.stop="showClick">
      <u-input
        readonly
        v-model="showVal"
        border="none"
        :placeholder="placeholder"
        suffixIcon="arrow-right"
        suffixIconStyle="color: #909399"
      />
    </view>

    <u-popup :show="show" closeOnClickOverlay @close="onClose">
      <view class="h-800rpx">
        <view v-for="(i, index) in optionsObj" :key="index">
          <view v-if="i.value > 0">
            <van-cell :title="i.label" clickable @click="i.isSelect = !i.isSelect">
              <van-checkbox slot="right-icon" :value="i.isSelect" @click.stop />
            </van-cell>
          </view>
          <view v-if="i.value < 0">
            <van-collapse :value="activeNames" @change="onCollapseChange" class="!p-0">
              <van-collapse-item :title="i.label" :name="index" :border="false" icon="wap-nav">
                <div v-for="j in i.children" :key="j.value">
                  <van-divider customStyle="margin: 0 32rpx;" />
                  <van-cell
                    :border="false"
                    title-class="title"
                    :title="j.label"
                    clickable
                    @click="j.isSelect = !j.isSelect"
                  >
                    <van-checkbox slot="right-icon" :value="j.isSelect" @click.stop="" />
                  </van-cell>
                </div>
              </van-collapse-item>
            </van-collapse>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<style lang="less" scoped></style>
