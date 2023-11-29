<script setup lang="ts">
import { getImageURL } from '@/utils'
import { ref } from 'vue'
// import NoticeBar from '@/components/NoticeBar/index.vue'
import { onMounted } from 'vue'
import Uqrcode from '@/components/UQRCode/components/uqrcode/uqrcode.vue'
import { useAppStore } from '@/store'
import { useEmitt } from '@/hooks/useEmitt'

const appStore = useAppStore()

const menuTop = appStore.menuTop + 'px'

const keyword = ref('')

const noticeText = ref('时迦餐厅今日开业，12月01日-12月05日全场七折，欢迎您的光临！')

const qrSize = ref(uni.upx2px(350))

const buttonList = [
  {
    icon: 'people-access',
    iconSelect: 'people-access-select',
    title: '人行码'
  },
  {
    icon: 'car-access',
    iconSelect: 'car-access-select',
    title: '车行码'
  },
  {
    icon: 'payment-code',
    iconSelect: 'payment-code-select',
    title: '付款码'
  }
]
//选中的马
const buttonAction = ref(0)

const methods = ref()
const finishVal = ref(false) //倒计时是否结束

const Qrvalue = ref('shu-xiao-bao-YYDS')

const onRefresh = (index: number) => {
  const timestamp = new Date().getTime()
  Qrvalue.value = timestamp + ':shu-xiao-bao-YYDS'
  finishVal.value = false
  methods.value.reset()
  buttonAction.value = index
}

useEmitt({
  name: 'Qrcode:Change',
  callback: (val: any) => {
    onRefresh(val)
  }
})
onMounted(() => {
  onRefresh(0)
})
</script>

<template>
  <ContentWrap>
    <Header :isLeftIcon="false" title="一码通" />
    <view class="w-100% p-30rpx pb-0 box-border">
      <u-search placeholder="搜索您想要的" v-model="keyword" :showAction="false" bgColor="#FFF" />
    </view>
    <view class="m-30rpx mb-20rpx p-30rpx bg-white flex-rows justify-around rounded-20rpx">
      <view class="flex-column" v-for="(item, index) in buttonList" :key="index">
        <view class="mb-20rpx" v-show="buttonAction === index" @tap="onRefresh(index)">
          <u-image width="80rpx" height="80rpx" :src="getImageURL('Qrcode', item.iconSelect)" />
        </view>

        <view class="mb-20rpx" v-show="buttonAction !== index" @tap="onRefresh(index)">
          <u-image width="80rpx" height="80rpx" :src="getImageURL('Qrcode', item.icon)" />
        </view>

        <view class="font-600 text-30rpx" :style="buttonAction === index ? '' : 'color:#808080'">
          {{ item.title }}
        </view>

        <view v-if="buttonAction === index" class="w-24px h-2px bg-#196CFF mt-10rpx" />
        <view v-else class="h-2px w-24px mt-10rpx" />
      </view>
    </view>
    <view class="px-10rpx notice-qr">
      <u-notice-bar bgColor="#f6f7fb" color="#000" :text="noticeText" />
    </view>
    <view class="qr-bg flex-column flex justify-center items-center">
      <view class="bg-[#FFF] p-20rpx">
        <Uqrcode canvasId="canvasId" :value="Qrvalue" :size="qrSize" />
      </view>
      <view class="my-20rpx font-600">
        <u-count-down
          ref="methods"
          :time="30 * 60 * 1000"
          format="HH:mm:ss"
          @finish="finishVal = true"
          v-if="!finishVal"
        />
        <view v-else>二维码已过期</view>
      </view>
      <view class="text-#196CFF flex-rows" @click="onRefresh(buttonAction)">
        <u-icon name="reload" size="20" class="mr-10rpx" />
        刷新
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-icon__icon) {
  color: #196cff !important;
}
// :deep(.u-status-bar) {
//   background-color: #f6f7fb !important;
// }
// :deep(.u-navbar__content) {
//   background-color: #f6f7fb !important;
// }
.qr-bg {
  margin: 20rpx 20rpx 0 20rpx;
  // padding: 20rpx 0;
  background: linear-gradient(to bottom, #f7fbff, #ffffff);
  border-radius: 10rpx;
  height: calc(100vh - 71px - 32px - 30rpx - 250rpx - 250rpx - v-bind(menuTop));
}
</style>
