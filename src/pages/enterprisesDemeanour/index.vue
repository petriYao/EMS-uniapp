<script setup lang="ts">
import { AppSetInfoApi } from '@/api'
import { AppSetInfoType } from '@/types/commonModel'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import UniversalPark from '@components/UniversalPark/index.vue'

// 轮播图
const dataObj = ref({} as AppSetInfoType)

const getParkProfile = async () => {
  const res = await AppSetInfoApi('enterprisesDemeanour')
  if (res.success && res.value) {
    dataObj.value = res.value
  }
}

onLoad(async () => {
  getParkProfile()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <Header title="企业风采" />
    <!-- 头部结束 -->
    <UniversalPark :data="dataObj" />
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-swiper) {
  padding-bottom: 40rpx;
  background: #f6f7fb !important;
}

.indicator {
  @include flex(row);
  justify-content: center;

  &__dot {
    height: 8rpx;
    width: 8rpx;
    border-radius: 100px;
    background-color: #cacaca;
    margin: 0 8rpx;
    transition: background-color 0.3s;

    &--active {
      width: 40rpx;
      height: 8rpx;
      background-color: #9d9d9d;
    }
  }
}
.indicator-num {
  padding: 4rpx 0;
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: 200rpx;
  width: 70rpx;
  @include flex;
  justify-content: center;

  &__text {
    color: #ffffff;
    font-size: 24rpx;
  }
}
</style>
