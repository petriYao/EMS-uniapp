<script setup lang="ts">
import { reactive, watch } from 'vue'
import { SalesOutboundType } from '@/types/LowerCamelCaseType'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  lowerCamelCaseList: {
    //类别
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
  subsectionList: ['当前', '明细', '条码'],
  curNow: 1,
  detailsList: [] as SalesOutboundType[],
  datailsIndex: 0
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

//长按事件 删除明细
const longpressClick = (item: any, index: number) => {
  if (isMoved) return // 如果有移动，不触发长按事件

  console.log('长按事件', item, index)
  //弹出删除提示框
  uni.showModal({
    title: '提示',
    content: '是否删除当前明细',
    success: (res) => {
      if (res.confirm) {
        console.log('用户点击确定')
        //删除当前明细
        reactiveData.detailsList.splice(index, 1)
        if (reactiveData.detailsList.length === 0) {
          reactiveData.datailsIndex = 0
        } else if (reactiveData.datailsIndex > index) {
          if (reactiveData.datailsIndex > 0) {
            reactiveData.datailsIndex--
          }
        }
        emit('update:lowerCamelCaseList', reactiveData.detailsList)
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
const longpressDetailsClick = (item: any, index: number, content = '是否删除当前条码明细') => {
  if (isMoved) return // 如果有移动，不触发长按事件

  uni.showModal({
    title: '提示',
    content: content,
    success: (res) => {
      if (res.confirm) {
        deleteBarcode(item, index)
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

const deleteBarcode = (item: any, index: number) => {
  //删除当前明细
  reactiveData.detailsList[reactiveData.datailsIndex].barcodeList.splice(index, 1)
  console.log('用户点击确定2', item, index)
  console.log('用户点击确定4', reactiveData.detailsList[reactiveData.datailsIndex])
  reactiveData.detailsList[reactiveData.datailsIndex].currentList[10].value =
    reactiveData.detailsList[reactiveData.datailsIndex].barcodeList.length
  //分装情况下
  if (reactiveData.detailsList[reactiveData.datailsIndex].IsSplit) {
    //减去数量
    reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
      item.FZLOT
    ].packagingData[item.subPackageNo]['quantity'] -= item.quantity //数量
    //重新计算最小值
    reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
      item.FZLOT
    ].packagingData[item.subPackageNo]['finishedQty'] =
      reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT]
        .packagingData[item.subPackageNo]['quantity'] /
      reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT]
        .packagingData[item.subPackageNo]['unitQty']

    //判断是否有成品
    // productsQuantity保留最小值
    const packagingSig =
      reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT]
        .packagingSig

    let hasZero = false
    let minNonZero = Infinity

    packagingSig.forEach((items: any) => {
      const sum = Number(
        reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT]
          .packagingData[items].finishedQty
      )

      if (isNaN(sum)) {
        // 如果转换失败，根据需求决定如何处理，这里假设视为 0
        hasZero = true
      } else {
        if (sum === 0) {
          hasZero = true
        } else if (sum < minNonZero) {
          minNonZero = sum
        }
      }
    })
    // 如果存在任何一个 0，或者所有值都是无效的，则设为 0
    const productsQuantity = hasZero || minNonZero === Infinity ? 0 : minNonZero

    reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT].FZquantity =
      Math.floor(productsQuantity) // 数量取整
    //判断productsQuantity是否为整数
    reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT].isInteger =
      productsQuantity % 1 === 0 && productsQuantity !== 0

    reactiveData.detailsList[reactiveData.datailsIndex].isInteger =
      productsQuantity % 1 === 0 && productsQuantity !== 0

    if (
      reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT].isInteger
    ) {
      reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
        item.FZLOT
      ].packagingSig.forEach((element: any) => {
        if (
          reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[item.FZLOT]
            .packagingData[element].finishedQty !== productsQuantity
        ) {
          reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
            item.FZLOT
          ].isInteger = false
          reactiveData.detailsList[reactiveData.datailsIndex].isInteger = false
          return
        }
      })
    }

    //重新计算
    let total = 0
    for (const FZLOTListItem of reactiveData.detailsList[reactiveData.datailsIndex].FZLOTList) {
      total +=
        reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[FZLOTListItem]
          .FZquantity
    }
    reactiveData.detailsList[reactiveData.datailsIndex].currentTotal = total
  } else {
    console.log('非分装情况下', item)
    //非分装情况下
    reactiveData.detailsList[reactiveData.datailsIndex].currentTotal -= item.quantity //数量
  }
  //累计值
  reactiveData.detailsList[reactiveData.datailsIndex].cumulativeActualSend =
    reactiveData.detailsList[reactiveData.datailsIndex].cumulativeAct +
    reactiveData.detailsList[reactiveData.datailsIndex].currentTotal

  reactiveData.detailsList[reactiveData.datailsIndex].currentList[8].value =
    reactiveData.detailsList[reactiveData.datailsIndex].cumulativeActualSend
  //应发
  reactiveData.detailsList[reactiveData.datailsIndex].currentList[9].value =
    reactiveData.detailsList[reactiveData.datailsIndex].currentList[7].value -
    reactiveData.detailsList[reactiveData.datailsIndex].currentList[8].value
  console.log('删除后的值：', reactiveData.detailsList)
  emit('update:lowerCamelCaseList', reactiveData.detailsList)
}

useEmitt({
  name: 'update:datailsIndex',
  callback: async (val) => {
    reactiveData.datailsIndex = val
  }
})

//调用删除条码
useEmitt({
  name: 'deleteBarcode',
  callback: async (val) => {
    console.log('删除条码', val)
    deleteBarcode(val.item, val.index)
    //提示
    uni.showToast({
      title: '实发数量大于应发数量',
      icon: 'none'
    })
  }
})
watch(
  () => props.lowerCamelCaseList,
  (val: any) => {
    reactiveData.detailsList = val
    // console.log('页面数据改动', reactiveData.detailsList)
    // console.log('页面数据改动2', reactiveData.detailsList[reactiveData.datailsIndex])
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
          v-for="(item, index) of reactiveData.detailsList[reactiveData.datailsIndex]
            ?.currentList || []"
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
            reactiveData.detailsList.length > 0 &&
            reactiveData.detailsList[reactiveData.datailsIndex].barcodeList.length > 0
          "
          class="w-100%"
        >
          <view class="flex w-100%">
            <view class="w-50% flex items-center py-4px">
              <view class="w-70px flex justify-center">本箱数</view>
              <view class="text-18px ml-9px">{{
                reactiveData.detailsList[reactiveData.datailsIndex]?.barcodeList[
                  reactiveData.detailsList[reactiveData.datailsIndex].barcodeList.length - 1
                ]?.quantity
              }}</view>
            </view>
            <view class="w-50% flex items-center py-4px">
              <view class="w-70px flex justify-center">本次合计</view>
              <view class="text-18px ml-9px">
                {{ reactiveData.detailsList[reactiveData.datailsIndex]?.currentTotal }}</view
              >
            </view>
          </view>
          <view
            class="flex px-15px text-16px items-center text-#90BBF5"
            v-if="reactiveData.detailsList[reactiveData.datailsIndex]?.IsSplit"
          >
            <view class="text-center">{{
              reactiveData.detailsList[reactiveData.datailsIndex]?.barcodeList[
                reactiveData.detailsList[reactiveData.datailsIndex].barcodeList.length - 1
              ].subPackageNo
            }}</view>
            <view class="ml-8px text-center">{{
              reactiveData.detailsList[reactiveData.datailsIndex]?.barcodeList[
                reactiveData.detailsList[reactiveData.datailsIndex].barcodeList.length - 1
              ].partNumberName
            }}</view>
          </view>
        </view>
      </view>
      <!-- 明细 -->
      <view v-if="reactiveData.curNow == 1">
        <view class="flex bg-#f2f2f2 py-10rpx">
          <view class="w-12% text-center">序号</view>
          <view class="w-52%">产品描述</view>
          <view class="w-12% text-center">应发</view>
          <view class="w-12% text-center">累计</view>
          <view class="w-12% text-center">本次</view>
        </view>
        <scroll-view
          scroll-y
          style="height: calc(100vh - 44px - 44px - 80px - 34px - 40px - 26px - 30px)"
        >
          <view
            v-for="(item, index) of reactiveData.detailsList"
            :key="index"
            class="flex items-center mb-6rpx py-4px"
            :class="[
              index % 2 === 0 ? 'bg-#F2F2F2' : 'bg-white', // 基础黑白交替
              index === reactiveData.datailsIndex ? '!bg-[#C4D8EE]' : '' // 覆盖选中状态
            ]"
            @click="reactiveData.datailsIndex = index"
            @longpress="longpressClick(item, index)"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
          >
            <view class="w-12% flex justify-center">{{ index + 1 }}</view>
            <view class="w-52%">
              <view>{{ item.number }}</view>
              <view>{{ item.fname }}</view>
            </view>
            <view class="w-12% flex justify-center">{{ item.shouldSendQuantity }}</view>
            <view class="w-12% flex justify-center">{{ item.cumulativeActualSend }}</view>
            <view class="w-12% flex justify-center">{{ item.currentTotal }}</view>
          </view>
        </scroll-view>
      </view>
      <!-- 条码 -->
      <view v-if="reactiveData.curNow == 2">
        <view class="flex bg-#f2f2f2 py-10rpx">
          <view class="w-12% text-center">序号</view>
          <view class="w-38%">条码编码</view>
          <view class="w-12% text-center">数量</view>
          <view class="w-17% text-center">仓库</view>
          <view class="w-21% text-center">仓位</view>
        </view>
        <scroll-view scroll-y style="height: calc(100vh - 44px - 44px - 80px - 34px - 40px - 26px)">
          <view
            v-for="(item, index) of reactiveData.detailsList[reactiveData.datailsIndex]
              ?.barcodeList || []"
            :key="index"
            @longpress="longpressDetailsClick(item, index)"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
          >
            <view
              class="flex flex-wrap py-10rpx"
              :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''"
            >
              <view class="w-12% flex justify-center pt-3px">{{ index + 1 }}</view>
              <view class="w-38% pt-3px">
                <view style="overflow-wrap: break-word">{{ item.FNumber }}</view>
              </view>
              <view class="w-12% flex justify-center pt-3px">
                {{ item.quantity }}
              </view>
              <view class="w-17% flex justify-center">{{ item.FSTOCKName }}</view>
              <view class="w-21% flex justify-center pt-3px">{{ item.STOCKLOCName }}</view>

              <view
                class="flex ml-12% items-center"
                v-if="item.subPackageNo !== ' ' && item.subPackageNo !== ''"
              >
                <view class="mr-8px">分装：{{ item.subPackageNo }}</view>
                <view class="mr-8px">{{ item.partNumberName }}</view>
                <view class="mr-8px">用量：{{ item.unitQuantity }}</view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>
