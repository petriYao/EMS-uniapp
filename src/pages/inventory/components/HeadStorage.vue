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
      name: '初盘',
      disabled: true
    },
    {
      name: '复盘',
      disabled: true
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
  let UserAuthority = uni.getStorageSync('UserAuthority')
  // 判断权限
  if (UserAuthority) {
    if (UserAuthority.includes('41-1')) {
      //初盘
      reactiveData.radioList[0].disabled = false
    }

    if (UserAuthority.includes('41-2')) {
      //复盘
      reactiveData.radioList[1].disabled = false
    }
  }

  //获取本地缓存的扫码类型
  const scanCodeType = uni.getStorageSync(`scanCodeType-${reactiveData.title}`)
  // 如果两个选项都不被禁用，则默认不选择任何选项
  if (reactiveData.radioList[0].disabled && reactiveData.radioList[1].disabled) {
    reactiveData.scanCodeType = scanCodeType // 默认空值
  } else if (
    scanCodeType &&
    !reactiveData.radioList.find((item) => item.name === scanCodeType)?.disabled
  ) {
    // 如果缓存的类型存在且未被禁用，则使用缓存值
    reactiveData.scanCodeType = scanCodeType
  } else {
    // 否则选择第一个未被禁用的选项
    const firstEnabled = reactiveData.radioList.find((item) => !item.disabled)
    reactiveData.scanCodeType = firstEnabled ? firstEnabled.name : ''
  }
  emit(`update:scanCodeType`, reactiveData.scanCodeType)
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
