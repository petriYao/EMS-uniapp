<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  detailsList: {
    type: Array as any,
    default: () => [] as any
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
}>()
// const { emitter } = useEmitt()

const reactiveData = reactive({
  detailsList: [] as any,
  subsectionList: ['当前', '明细', '条码'],
  curNow: 1,
  barcodeList: [] as any, //条码
  barcodeIndex: 0
})

const getBarCode = async (item: any, index: number) => {
  reactiveData.barcodeIndex = index
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
          reactiveData.barcodeIndex = 0
        } else if (reactiveData.barcodeIndex > index) {
          reactiveData.barcodeIndex--
        } else {
          reactiveData.barcodeIndex = reactiveData.detailsList.length - 1
        }
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
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
  console.log('长按事件', item, index)
  //弹出删除提示框
  uni.showModal({
    title: '提示',
    content: '是否删除当前条码明细',
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
  reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.splice(index, 1)
  //删除当前明细
  if (reactiveData.detailsList[reactiveData.barcodeIndex].IsSplit) {
    //分装情况下
    reactiveData.detailsList[reactiveData.barcodeIndex].Quantity--
    //减去数量
    console.log(
      '减去',
      reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT,
      item
    )
    reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
      item.FZLOT
    ].packagingData[item.subPackageNo]['quantity'] -= item.quantity //数量
    //重新计算最小值
    reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
      item.FZLOT
    ].packagingData[item.subPackageNo]['finishedQty'] =
      reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT]
        .packagingData[item.subPackageNo]['quantity'] /
      reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT]
        .packagingData[item.subPackageNo]['unitQty']

    //判断是否有成品
    // productsQuantity保留最小值
    const packagingSig =
      reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT]
        .packagingSig

    let hasZero = false
    let minNonZero = Infinity

    packagingSig.forEach((item2: any) => {
      const sum = Number(
        reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT]
          .packagingData[item2].finishedQty
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
    //计算单分装数量
    reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT].FZquantity =
      Math.floor(productsQuantity)

    //判断productsQuantity是否为整数
    reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT].isInteger =
      productsQuantity % 1 === 0 && productsQuantity !== 0

    reactiveData.detailsList[reactiveData.barcodeIndex].isInteger =
      productsQuantity % 1 === 0 && productsQuantity !== 0
    if (
      reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT].isInteger
    ) {
      reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
        item.FZLOT
      ].packagingSig.forEach((element: any) => {
        if (
          reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[item.FZLOT]
            .packagingData[element].finishedQty !== productsQuantity
        ) {
          reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
            item.FZLOT
          ].isInteger = false
          reactiveData.detailsList[reactiveData.barcodeIndex].isInteger = false
          return
        }
      })
    }

    reactiveData.detailsList[reactiveData.barcodeIndex].Quantity2 = reCompute(
      reactiveData.detailsList[reactiveData.barcodeIndex]
    )
  } else {
    //非分装情况下
    reactiveData.detailsList[reactiveData.barcodeIndex].Quantity-- //件数
    reactiveData.detailsList[reactiveData.barcodeIndex].Quantity2 -= item.quantity //数量
  }
  // if (reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length === 0) {
  //   //删除明细
  //   reactiveData.detailsList.splice(reactiveData.barcodeIndex, 1)
  //   reactiveData.barcodeIndex--
  // }
  emit('update:detailsList', reactiveData.detailsList)
}
//重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  val.FZLOTList.forEach((item: any) => {
    sum += val.packagingDataFZLOT[item].FZquantity
  })
  return sum
}

useEmitt({
  name: 'update:datailsIndex',
  callback: async (val) => {
    reactiveData.barcodeIndex = val
  }
})

//调用删除条码
useEmitt({
  name: 'deleteBarcode',
  callback: async (val) => {
    console.log('删除条码', val)
    deleteBarcode(val.item, val.index)
  }
})

watch(
  () => props.detailsList,
  (val: any) => {
    console.log('val', JSON.stringify(val[6]?.barcodeList))
    reactiveData.detailsList = val
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <u-subsection
    :list="reactiveData.subsectionList"
    :current="reactiveData.curNow"
    @change="reactiveData.curNow = $event"
  />
  <scroll-view scroll-y style="height: calc(100vh - 44px - 44px - 40px - 34px - 40px - 26px)">
    <!-- 当前 -->
    <view v-if="reactiveData.curNow == 0" class="flex flex-wrap content-input">
      <view
        v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.currentList ||
        []"
        :key="index"
        class="flex items-center mb-6rpx"
        :style="item.style"
      >
        <view class="w-50px flex justify-center">
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
        v-if="reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList.length > 0"
        class="w-100% pl-2px mt-2px"
      >
        <view class="flex w-100% px-10px">
          <view class="w-50% flex items-center">
            <view>本箱数</view>
            <view class="ml-20px text-18px mt-2px">{{
              reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList[
                reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length - 1
              ]?.quantity
            }}</view>
          </view>
          <view class="w-50% flex items-center">
            <view>合计</view>
            <view class="ml-20px text-18px mt-2px">
              {{ reactiveData.detailsList[reactiveData.barcodeIndex]?.Quantity2 }}</view
            >
          </view>
        </view>
        <view
          class="flex px-10px items-center text-#90BBF5 mt-6rpx text-16px"
          v-if="reactiveData.detailsList[reactiveData.barcodeIndex]?.IsSplit"
        >
          <view class="text-center">{{
            reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList[
              reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length - 1
            ].subPackageNo
          }}</view>
          <view class="ml-8px text-center">{{
            reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList[
              reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length - 1
            ].partNumberName
          }}</view>
        </view>
      </view>
    </view>
    <view v-if="reactiveData.curNow === 1">
      <view
        v-for="(item, index) of props.detailsList || []"
        :key="index"
        @click="getBarCode(item, index)"
        @longpress="longpressClick(item, index)"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
      >
        <view
          class="flex"
          :class="[
            index % 2 === 0 ? 'bg-#F2F2F2' : 'bg-white', // 基础黑白交替
            index === reactiveData.barcodeIndex ? '!bg-[#C4D8EE]' : '' // 覆盖选中状态
          ]"
        >
          <view class="w-20px flex justify-center items-center">{{ index + 1 }}</view>
          <view class="flex-1">
            <view class="flex items-center">
              <view class="w-50px text-end">编码：</view>
              <view> {{ item.detailList.fnumber }}</view>
            </view>
            <view class="flex items-center">
              <view class="w-50px text-end">批号：</view>
              <view>{{ item.detailList.lot }}</view>
            </view>

            <view class="flex items-center">
              <view class="w-50px text-end">名称：</view>
              <view> {{ item.detailList.name }}</view>
            </view>
            <view class="flex">
              <view class="min-w-50px text-end">规格：</view>
              <view class="flex-wrap">{{ item.detailList.specification }}</view>
            </view>

            <view class="flex">
              <view class="min-w-50px text-end">储位：</view>
              <view class="flex-wrap">{{
                item.detailList.storageLocation || item.detailList.stockLocName
              }}</view>
            </view>

            <view class="flex">
              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">库存：</view>
                <view> {{ item.detailList.inventory }}</view>
              </view>

              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">可领：</view>
                <view> {{ item.detailList.receivableQuantity }}</view>
              </view>

              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">数量：</view>
                <view> {{ item.Quantity2 }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
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
          v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]
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
              v-if="item.subPackageNo && item.subPackageNo !== ' ' && item.subPackageNo !== ''"
            >
              <view class="mr-8px">分装：{{ item.subPackageNo }}</view>
              <view class="mr-8px">{{ item.partNumberName }}</view>
              <view class="mr-8px">用量：{{ item.unitQuantity }}</view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </scroll-view>
</template>
<style lang="less" scoped>
::v-deep .uni-select__selector-scroll {
  max-height: 140px !important;
}
::v-deep .u-input__content__field-wrapper__field {
  line-height: 34px;
}
::v-deep .u-input {
  height: 28px;
  padding: 2px 9px !important;
}
.content-input {
  ::v-deep .u-input {
    height: 22px;
    padding: 2px 9px !important;
  }
}
</style>
