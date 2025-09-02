<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '生产入库'
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
  reactiveData.rightTitleShow = !reactiveData.rightTitleShow
}

//选择扫码类型
const groupChange = () => {
  //将选择储存到本地缓存
  uni.setStorageSync(`scanCodeType-${reactiveData.title}`, reactiveData.scanCodeType)
  emit('update:scanCodeType', reactiveData.scanCodeType)
  reactiveData.rightTitleShow = !reactiveData.rightTitleShow
}

onBeforeMount(() => {
  //获取本地缓存的扫码类型
  const scanCodeType = uni.getStorageSync(`scanCodeType-${reactiveData.title}`)
  if (scanCodeType) {
    reactiveData.scanCodeType = scanCodeType
    emit('update:scanCodeType', scanCodeType)
  } else {
    reactiveData.scanCodeType = '扫码入库'
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
        reactiveData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('14')) {
        reactiveData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('15')) {
        reactiveData.radioList[2].disabled = false
      }
      break
    case '简单生产入库':
      if (UserAuthority.includes('17')) {
        reactiveData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('18')) {
        reactiveData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('19')) {
        reactiveData.radioList[2].disabled = false
      }
      break
    case '采购入库':
      if (UserAuthority.includes('21')) {
        reactiveData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('22')) {
        reactiveData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('23')) {
        reactiveData.radioList[2].disabled = false
      }
      break
    case '其他入库':
      if (UserAuthority.includes('25')) {
        reactiveData.radioList[0].disabled = false
      }
      if (UserAuthority.includes('26')) {
        reactiveData.radioList[1].disabled = false
      }
      if (UserAuthority.includes('27')) {
        reactiveData.radioList[2].disabled = false
      }
      break
  }
  console.log('生产入库2', reactiveData.radioList)
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
