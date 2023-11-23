<script setup lang="ts">
import { getImageURL, getSvgURL } from '@/utils'
import { ref } from 'vue'
import NoticeBar from '@/components/NoticeBar/index.vue'
import { onMounted } from 'vue'
import Uqrcode from '@/components/UQRCode/components/uqrcode/uqrcode.vue'
import { useAppStore } from '@/store'

const appStore = useAppStore()

const keyword = ref('')
const buttonList = [
  {
    icon: 'Qrcode-people-access',
    title: '人通行'
  },
  {
    icon: 'Qrcode-car-access',
    title: '车通行'
  },
  {
    icon: 'Qrcode-payment-code',
    title: '付款码'
  }
]
const methods = ref()
const finishVal = ref(false) //倒计时是否结束

const Qrvalue = ref('shu-xiao-bao-YYDS')

const onRefresh = () => {
  const timestamp = new Date().getTime()
  Qrvalue.value = timestamp + ':shu-xiao-bao-YYDS'
  finishVal.value = false
  methods.value.reset()
}

onMounted(() => {
  onRefresh()
})
</script>

<template>
  <ContentWrap>
    <Header :isLeftIcon="false" bgColor="#f6f7fb">
      <template #center>
        <view :style="`padding-top:${appStore.menuTop + 'px'}`" class="items-center text-center">
          <view class="w-93vw p-30rpx">
            <u-search
              placeholder="搜索您想要的"
              v-model="keyword"
              :showAction="false"
              bgColor="#FFF"
            />
          </view>
        </view>
      </template>
    </Header>
    <view class="m-30rpx p-30rpx bg-white flex-rows justify-around rounded-20rpx">
      <view class="flex-column" v-for="(item, index) in buttonList" :key="index">
        <view class="mb-20rpx" @tap="onRefresh">
          <u-icon :name="getSvgURL('Qrcode', `${item.icon}`)" :size="50" />
        </view>
        <view class="font-600 text-30rpx">{{ item.title }}</view>
      </view>
    </view>
    <view class="px-30rpx">
      <NoticeBar :interval="3000" />
    </view>
    <view class="qr-bg pt-20rpx px-30rpx position-relative">
      <img class="qr-bg-img" :src="getImageURL('home', 'qr-bg')" mode="widthFix" />
      <view class="qr-img">
        <view class="flex-column">
          <Uqrcode canvasId="canvasId" :value="Qrvalue" />
          <view class="my-30rpx font-600">
            <u-count-down
              ref="methods"
              :time="30 * 60 * 1000"
              format="HH:mm:ss"
              @finish="finishVal = true"
              v-if="!finishVal"
            />
            <view v-else>二维码已过期</view>
          </view>
          <view class="text-#196CFF flex-rows" @click="onRefresh">
            <u-icon name="reload" size="20" class="mr-10rpx mt-10rpx" />
            刷新
          </view>
        </view>
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-icon__icon) {
  color: #196cff !important;
}
:deep(.u-status-bar) {
  background-color: #f6f7fb !important;
}
:deep(.u-navbar__content) {
  background-color: #f6f7fb !important;
}
.qr-bg {
  .qr-bg-img {
    width: 100%;
  }
  .qr-img {
    position: absolute;
    left: 50%;
    top: 12%;
    transform: translate(-50%, 0);
  }
}
</style>
