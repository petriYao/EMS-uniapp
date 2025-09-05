<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  scanCodeType: {
    type: String,
    default: ''
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:scanCodeType', val: String): void
}>()

const reactiveData = reactive({
  title: props.title,
  rightTitleShow: false,
  radioList: [
    {
      name: '单码双扫',
      disabled: false
    },
    {
      name: '扫单退料',
      disabled: false
    }
  ],
  scanCodeType: props.scanCodeType
})

//返回上一页
const onLeftClick = () => {
  uni.navigateBack({
    delta: 1
  })
}
//弹出选择扫码类型
const onRightClick = () => {
  reactiveData.rightTitleShow = !reactiveData.rightTitleShow
}

//选择扫码类型
const groupChange = () => {
  //将选择储存到本地缓存
  uni.setStorageSync(`scanCodeType-${reactiveData.title}`, reactiveData.scanCodeType)
  emit(`update:scanCodeType`, reactiveData.scanCodeType)
  reactiveData.rightTitleShow = !reactiveData.rightTitleShow
}

onBeforeMount(() => {
  //获取本地缓存的扫码类型
  const scanCodeType = uni.getStorageSync(`scanCodeType-${reactiveData.title}`)
  if (scanCodeType) {
    console.log('scanCodeType', scanCodeType)
    reactiveData.scanCodeType = scanCodeType || '单码双扫'
    emit('update:scanCodeType', scanCodeType)
  } else {
    reactiveData.scanCodeType = '单码双扫'
  }
})
</script>

<template>
  <view>
    <u-navbar
      :title="props.title"
      placeholder
      bgColor="#F2F2F2"
      @left-click="onLeftClick"
      height="44px"
    >
      <template #right>
        <view @click="onRightClick"><u-icon name="setting-fill" size="16" /></view>
      </template>
    </u-navbar>
    <view
      v-if="reactiveData.rightTitleShow"
      class="w-100vw h-100vh fixed bg-transparent z-999"
      @click="onRightClick"
    >
      <view
        class="w-200rpx fixed right-0rpx p-20rpx bg-#f2f2f2"
        style="border: 1px solid #f2f2f2"
        @click.stop
      >
        <view class="text-28rpx">请选择扫码类型</view>
        <view>
          <u-radio-group
            v-model="reactiveData.scanCodeType"
            placement="column"
            @change="groupChange"
          >
            <u-radio
              :customStyle="{ marginBottom: '8px' }"
              v-for="(item, index) in reactiveData.radioList"
              :key="index"
              :disabled="item.disabled"
              :label="item.name"
              :name="item.name"
            />
          </u-radio-group>
        </view>
      </view>
    </view>
  </view>
</template>
<style lang="less" scoped></style>
