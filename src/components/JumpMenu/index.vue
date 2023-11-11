<script setup lang="ts">
import { ref } from 'vue'
import { getSvgURL } from '@/utils'
import router from '@/router'
import { useAppStore } from '@/store'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  top: {
    type: Number,
    default: 0
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: Boolean): void
}>()

const useStore = useAppStore()

const iconList = ref([
  { icon: getSvgURL('goods', 'homePage'), text: '首页' },
  { icon: getSvgURL('goods', 'shoppingCart'), text: '购物车' },
  { icon: getSvgURL('goods', 'personalCenter'), text: '个人中心' },
  { icon: getSvgURL('goods', 'myCollect'), text: '我的收藏' },
  { icon: getSvgURL('goods', 'history'), text: '我的足迹' }
])

const selectClick = (item: any) => {
  switch (item.text) {
    case '首页':
      useStore.goToStrollAround()
      break
    case '购物车':
      router.push({
        url: `/packageStaff/goods/ShoppingCart?productType=goodsInfo`
      })
      break
    case '个人中心':
      useStore.goToMy()
      break
    case '我的收藏':
      router.push({
        url: `/packageStaff/myAttention/MyAttention?label=0`
      })
      break
    case '我的足迹':
      router.push({
        url: '/packageStaff/myAttention/BrowsingHistory'
      })
      break
  }
  closeClick()
}

const closeClick = () => {
  emit('update:modelValue', false)
}
</script>
<template>
  <view
    v-if="props.modelValue"
    class="fixed h-100vh w-100vw top-0 right-0 z-999"
    @click="closeClick"
  >
    <view
      class="bg-#FFF rounded-20rpx fixed font-size-seven text-#323233 z-999 w-200rpx px-20rpx"
      :style="`left: 20rpx;top: ${props.top}px;box-shadow: 0 0.533vw 3.2vw rgba(50,50,51,.12);`"
    >
      <view
        v-for="(item, index) of iconList"
        :key="index"
        class="flex items-center py-20rpx"
        style="border-bottom: 1rpx solid #e9e9e9"
        @click.stop="selectClick(item)"
      >
        <view class="text-0 mr-10rpx"><van-icon :name="item.icon" size="30rpx" /></view>
        <view>{{ item.text }}</view>
      </view>
    </view>
  </view>
</template>
