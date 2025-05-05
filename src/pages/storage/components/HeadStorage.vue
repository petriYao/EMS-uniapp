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

const reacticeData = reactive({
  title: props.title,
  rightTitleShow: false,
  radioList: [
    {
      name: '扫码入库',
      disabled: true
    },
    {
      name: '扫单入库',
      disabled: true
    },
    {
      name: '单码双扫',
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
  reacticeData.rightTitleShow = !reacticeData.rightTitleShow
}

//选择扫码类型
const groupChange = () => {
  //将选择储存到本地缓存
  uni.setStorageSync('scanCodeType', reacticeData.scanCodeType)
  emit('update:scanCodeType', reacticeData.scanCodeType)
  // reacticeData.rightTitleShow = !reacticeData.rightTitleShow
}

onBeforeMount(() => {
  //获取本地缓存的扫码类型
  const scanCodeType = uni.getStorageSync('scanCodeType')
  if (scanCodeType) {
    reacticeData.scanCodeType = scanCodeType
    emit('update:scanCodeType', scanCodeType)
  } else {
    reacticeData.scanCodeType = '扫码入库'
  }

  let UserAuthority = uni.getStorageSync('UserAuthority')
  console.log('生产入库1', UserAuthority)
  switch (props.title) {
    case '生产入库':
      //如果UserAuthority中有13，说明有扫码入库的权限，如果有14，说明有扫单入库的权限，如果有15，说明有单码双扫的权限
      console.log('生产入库3', UserAuthority.includes('13'))
      console.log('生产入库4', UserAuthority.includes('14'))
      console.log('生产入库5', UserAuthority.includes('15'))
      if (UserAuthority.includes('13')) {
        reacticeData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('14')) {
        reacticeData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('15')) {
        reacticeData.radioList[2].disabled = false
      }
      break
    case '简单生产入库':
      if (UserAuthority.includes('17')) {
        reacticeData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('18')) {
        reacticeData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('19')) {
        reacticeData.radioList[2].disabled = false
      }
      break
    case '采购入库':
      if (UserAuthority.includes('21')) {
        reacticeData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('22')) {
        reacticeData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('23')) {
        reacticeData.radioList[2].disabled = false
      }
      break
    case '其他入库':
      if (UserAuthority.includes('25')) {
        reacticeData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('26')) {
        reacticeData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('27')) {
        reacticeData.radioList[2].disabled = false
      }
      break
  }
  console.log('生产入库2', reacticeData.radioList)
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
      v-if="reacticeData.rightTitleShow"
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
            v-model="reacticeData.scanCodeType"
            placement="column"
            @change="groupChange"
          >
            <u-radio
              :customStyle="{ marginBottom: '8px' }"
              v-for="(item, index) in reacticeData.radioList"
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
