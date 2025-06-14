<script setup lang="ts">
import { reactive, watch } from 'vue'
import { SalesOutboundType } from '@/types/LowerCamelCaseType'

const props = defineProps({
  lowerCamelCaseList: {
    type: Array as any,
    default: () => []
  },
  packagingData: {
    type: Object as any,
    default: () => {}
  },
  packagingSig: {
    type: Array as any,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:lowerCamelCaseList', modelValue: SalesOutboundType[]): void
}>()
//数据
const reactiveData = reactive({
  loading: '', //加载中
  searchValue: '', //搜索值
  subsectionList: ['当前', '条码'],
  curNow: 1,
  packagingSig: props.packagingSig,
  packagingData: props.packagingData,
  detailsList: [] as any
})

//长按事件 删除条码明细
let startX = 0
let startY = 0
let isMoved = false

const handleTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isMoved = false
}

const handleTouchMove = (e: TouchEvent) => {
  const moveX = Math.abs(e.touches[0].clientX - startX)
  const moveY = Math.abs(e.touches[0].clientY - startY)

  // 如果移动超过5px就认为是在滑动
  if (moveX > 5 || moveY > 5) {
    isMoved = true
  }
}

const longpressDetailsClick = (item: any, index: number) => {
  if (isMoved) return // 如果有移动，不触发长按事件

  uni.showModal({
    title: '提示',
    content: '是否删除当前条码明细',
    success: (res) => {
      if (res.confirm) {
        console.log('用户点击确定')
        reactiveData.detailsList.barcodeList.splice(index, 1)
        reactiveData.detailsList.packagingData[item.F_FZNO].quantity -= item.F_UNITQTY
        reactiveData.detailsList.packagingData[item.F_FZNO].finishedQty =
          reactiveData.detailsList.packagingData[item.F_FZNO].quantity /
          reactiveData.detailsList.packagingData[item.F_FZNO].unitQty
        //判断成套更最小成品数量
        const finishedQtys = []
        for (const packItem of reactiveData.detailsList.packagingSig) {
          finishedQtys.push(reactiveData.detailsList.packagingData[packItem].finishedQty)
        }

        const isAllEqual = finishedQtys.every((qty, index, array) => qty === array[0])
        const minQty = Math.min(...finishedQtys)

        if (!isAllEqual) {
          console.log(`finishedQty 不全相等， 最小值为：${minQty}`)
          reactiveData.detailsList.FRealQty = minQty
          reactiveData.detailsList.isInteger = false
        } else {
          const isInteger = finishedQtys.every((qty) => Number.isInteger(qty))
          if (isInteger) {
            console.log(`finishedQty 全相等，且为整数`, minQty)
            reactiveData.detailsList.FRealQty = minQty
            reactiveData.detailsList.isInteger = true
          } else {
            console.log(`finishedQty 全相等，但不是整数`, minQty)
            reactiveData.detailsList.FRealQty = minQty
            reactiveData.detailsList.isInteger = false
          }
        }
        reactiveData.detailsList.currentList[9].value = minQty
        emit('update:lowerCamelCaseList', reactiveData.detailsList)
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
//计算总数

watch(
  () => props.lowerCamelCaseList,
  (val: any) => {
    reactiveData.detailsList = val
    console.log('页面数据改动', reactiveData.detailsList)
    console.log('页面数据改动2', reactiveData.packagingSig, reactiveData.packagingData)
  },
  { immediate: true, deep: true }
)
</script>
<template>
  <view v-if="reactiveData.loading" class="bg-#FFF h-300rpx flex items-center justify-center">
    <u-loading-icon text="加载中" textSize="18" />
  </view>
  <view v-else>
    <u-subsection
      :list="reactiveData.subsectionList"
      :current="reactiveData.curNow"
      @change="reactiveData.curNow = $event"
    />
    <view class="pt-6rpx">
      <!-- 当前 -->
      <view v-if="reactiveData.curNow == 0" class="flex flex-wrap">
        <view
          v-for="(item, index) of reactiveData.detailsList?.currentList || []"
          :key="index"
          class="flex items-center mb-6rpx"
          :style="item.style"
        >
          <view class="w-70px flex justify-center">
            {{ item.label }}
          </view>
          <view class="flex-1 mr-20rpx" v-if="item.type == 'input'">
            <u-input
              v-model="item.value"
              :showAction="false"
              :disabled="item.disabled"
              shape="round"
              placeholder=""
            />
          </view>
        </view>
        <view
          v-if="
            reactiveData.detailsList.length > 0 && reactiveData.detailsList.barcodeList.length > 0
          "
          class="w-100%"
        >
          <view class="flex w-100%">
            <view class="w-50% flex items-center py-4px">
              <view class="w-70px flex justify-center">本箱数</view>
              <view class="text-18px ml-9px">{{
                reactiveData.detailsList?.barcodeList[
                  reactiveData.detailsList.barcodeList.length - 1
                ]?.quantity
              }}</view>
            </view>
            <view class="w-50% flex items-center py-4px">
              <view class="w-70px flex justify-center">本次合计</view>
              <view class="text-18px ml-9px"> {{ reactiveData.detailsList?.currentTotal }}</view>
            </view>
          </view>
          <view
            class="flex px-10px items-center text-#90BBF5"
            v-if="reactiveData.detailsList?.IsSplit"
          >
            <view class="text-center">{{
              reactiveData.detailsList?.barcodeList[reactiveData.detailsList.barcodeList.length - 1]
                .subPackageNo
            }}</view>
            <view class="ml-8px text-center">{{
              reactiveData.detailsList?.barcodeList[reactiveData.detailsList.barcodeList.length - 1]
                .partNumberName
            }}</view>
          </view>
        </view>
      </view>
      <!-- 条码 -->
      <view v-if="reactiveData.curNow == 1">
        <view class="flex bg-#f2f2f2 py-10rpx">
          <view class="w-12% text-center">序号</view>
          <view class="w-52%">条码编码</view>
          <view class="w-12% text-center">数量</view>
          <view class="w-12% text-center">仓库</view>
          <view class="w-12% text-center">仓位</view>
        </view>
        <view
          v-for="(item, index) of reactiveData.detailsList?.barcodeList || []"
          :key="index"
          @longpress="longpressDetailsClick(item, index)"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
        >
          <view class="flex py-10rpx" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
            <view class="w-12% flex justify-center pt-3px">{{ index + 1 }}</view>
            <view class="w-52% pt-3px">
              <view>{{ item.F_BARCODENO }}</view>
              <view class="flex items-center" v-if="item.F_JUNITQTY > 0">
                <view class="mr-8px">分装：{{ item.F_FZNO }}</view>
                <view class="mr-8px">{{ item.F_BJNAME }}</view>
                <view class="mr-8px">用量：{{ item.F_JUNITQTY }}</view>
              </view>
            </view>
            <view class="w-12% flex justify-center pt-3px">
              {{ item.F_UNITQTY }}
            </view>
            <view class="w-12% flex justify-center">{{ reactiveData.detailsList.warehouse }}</view>
            <view class="w-12% flex justify-center pt-3px">{{
              reactiveData.detailsList.location
            }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
