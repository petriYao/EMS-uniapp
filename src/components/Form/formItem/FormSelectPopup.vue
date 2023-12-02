<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
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
  (e: 'update:modelValue', modelValue: string): void
}>()
const radio = ref(props.modelValue)
const show = ref(false)

const showClick = () => {
  if (!props.disabled) {
    show.value = true
  } else {
    wx.showToast({
      title: '该项不可修改!', // 标题
      icon: 'error', // 图标类型，默认success
      duration: 1500 // 提示窗停留时间，默认1500ms
    })
  }
}

const onClick = (event: any) => {
  radio.value = event.value
  emit('update:modelValue', event.value)
  show.value = false
}
watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    radio.value = val
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
        border="none"
        :placeholder="radio ? '' : placeholder"
        suffixIcon="arrow-right"
        suffixIconStyle="color: #909399"
      >
        <template #prefix>
          <view v-if="radio">
            <van-button
              plain
              round
              custom-style="width:120rpx;
                font-size:24rpx;
                  height:50rpx;
                 "
              :color="radio"
              >标签</van-button
            >
          </view>
        </template>
      </u-input>
    </view>

    <u-popup :show="show" @close="show = false">
      <view class="h-800rpx relative">
        <view>
          <van-radio-group :value="radio">
            <van-cell-group>
              <van-cell
                clickable
                data-name="1"
                v-for="(item, index) in props.options"
                :key="index"
                @click="onClick(item)"
              >
                <template #title>
                  <van-button
                    plain
                    round
                    custom-style="width:160rpx;
                font-size:28rpx;
                  height:60rpx;
                 "
                    :color="item.label"
                    >标签</van-button
                  >
                </template>
                <van-radio slot="right-icon" :name="item.value" />
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </view>
      </view>
    </u-popup>
  </view>
</template>
