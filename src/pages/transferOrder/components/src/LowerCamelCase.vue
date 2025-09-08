<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { debounceSave } from '@/utils'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  detailsList: {
    type: Array as any,
    default: () => [] as any
  },
  locationList: {
    type: Array as any,
    default: () => []
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
}>()
const { emitter } = useEmitt()

const pickerShow = ref(false)

const reactiveData = reactive({
  detailsList: [] as any,
  subsectionList: ['当前', '明细', '条码'],
  locationList: [] as any,
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
          console.log('删除1')
          reactiveData.barcodeIndex--
        } else {
          console.log('删除2')
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
        reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.splice(index, 1)
        //删除当前明细
        if (reactiveData.detailsList[reactiveData.barcodeIndex].IsSplit) {
          //分装情况下
          reactiveData.detailsList[reactiveData.barcodeIndex].Quantity--
          //减去数量
          reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].packagingData[item.F_FZNO]['quantity'] -= item.F_UNITQTY //数量
          //重新计算最小值
          reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].packagingData[item.F_FZNO]['finishedQty'] =
            reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
              item.F_QADV_FZLOT
            ].packagingData[item.F_FZNO]['quantity'] /
            reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
              item.F_QADV_FZLOT
            ].packagingData[item.F_FZNO]['unitQty']

          //判断是否有成品
          // productsQuantity保留最小值
          const packagingSig =
            reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
              item.F_QADV_FZLOT
            ].packagingSig

          let hasZero = false
          let minNonZero = Infinity

          packagingSig.forEach((item2: any) => {
            const sum = Number(
              reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
                item.F_QADV_FZLOT
              ].packagingData[item2].finishedQty
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
          reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].FZquantity = Math.floor(productsQuantity)

          //判断productsQuantity是否为整数
          reactiveData.detailsList[reactiveData.barcodeIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].isInteger = productsQuantity % 1 === 0 && productsQuantity !== 0

          reactiveData.detailsList[reactiveData.barcodeIndex].Quantity2 = reCompute(
            reactiveData.detailsList[reactiveData.barcodeIndex]
          )
        } else {
          console.log('非分装情况下', item)
          //非分装情况下
          reactiveData.detailsList[reactiveData.barcodeIndex].Quantity-- //件数
          reactiveData.detailsList[reactiveData.barcodeIndex].Quantity2 -= item.F_UNITQTY //数量
        }
        console.log('删除后的值：', reactiveData.detailsList)
        if (reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length === 0) {
          //删除明细
          reactiveData.detailsList.splice(reactiveData.barcodeIndex, 1)
          if (reactiveData.detailsList.length === 0) reactiveData.barcodeIndex = 0
        }
        emit('update:detailsList', reactiveData.detailsList)
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
//重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  val.FZLOTList.forEach((item: any) => {
    sum += val.packagingDataFZLOT[item].FZquantity
  })
  return sum
}

//仓库
const warehouseChange = debounceSave((val: any) => {
  //获取仓库id替换为仓库名称
  const warehouseId: any = reactiveData.locationList.find((item: any) => item.value === val)
  console.log('warehouseId1', warehouseId)
  if (!warehouseId && val != '') {
    //提示仓库不存在
    uni.showToast({
      title: '仓位不存在',
      icon: 'none'
    })
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList[11].value = ''
    return
  }
  reactiveData.detailsList[reactiveData.barcodeIndex].currentList[11].value = warehouseId.value
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePosition = warehouseId.Id
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePositionNumber = warehouseId.value

  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.location = warehouseId.Id
  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = warehouseId.value

  pickerShow.value = false
  emit('update:detailsList', reactiveData.detailsList)
  emitter.emit('update:handleFocus')
})

const pickerConfirm = (warehouseItem: any) => {
  console.log('pickerConfirm', warehouseItem)
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePosition = warehouseItem.Id
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePositionNumber = warehouseItem.value

  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.location = warehouseItem.text
  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber =
    warehouseItem.value

  reactiveData.detailsList[reactiveData.barcodeIndex].currentList[11].value = warehouseItem.text
  pickerShow.value = false
  emit('update:detailsList', reactiveData.detailsList)
  emitter.emit('update:handleFocus')
}

const clearTimer = () => {
  // 清除定时器
  emitter.emit('update:clearTimer')
}

useEmitt({
  name: 'update:barcodeIndex',
  callback: async (val) => {
    reactiveData.barcodeIndex = val
  }
})

watch(
  () => props.detailsList,
  (val: any) => {
    console.log('val', val)
    reactiveData.detailsList = val
  },
  { immediate: true, deep: true }
)

watch(
  () => props.locationList,
  (val: any) => {
    reactiveData.locationList = val
    console.log('页面数据改动', val)
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
  <scroll-view scroll-y style="height: calc(100vh - 265px)">
    <!-- 当前 -->
    <view v-if="reactiveData.curNow == 0" class="flex flex-wrap">
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
        <view
          class="flex-1 mr-20rpx"
          style="border: 1px solid #f8f8f8"
          v-else-if="item.type == 'select'"
          @click="clearTimer"
        >
          <u-input
            v-model="item.value"
            :showAction="false"
            :disabled="reactiveData.locationList.length == 0"
            shape="round"
            placeholder=""
            @change="warehouseChange(item.value)"
          >
            <template #suffix>
              <view @click="reactiveData.locationList.length == 0 ? '' : (pickerShow = true)">
                <u-icon name="arrow-down" size="20" />
              </view>
              <view>
                <u-action-sheet
                  :show="pickerShow"
                  round="10"
                  :closeOnClickOverlay="true"
                  :closeOnClickAction="true"
                  @close="pickerShow = false"
                >
                  <view class="flex items-center p-20rpx" style="border-bottom: 1px solid #f8f8f8">
                    <view @tap="pickerShow = false">搜索 </view>
                    <view class="flex-1">
                      <u-input
                        id="searchInput2"
                        v-model="item.scValue2"
                        :showAction="false"
                        shape="round"
                        placeholder="请输入搜索关键词"
                        @focus="clearTimer"
                        @blur="clearTimer"
                      />
                    </view>
                  </view>
                  <view>
                    <!-- 滚动条 -->
                    <scroll-view scroll-y style="height: 800rpx">
                      <view
                        class=""
                        v-for="(warehouseItem, index) of reactiveData.locationList"
                        :key="index"
                      >
                        <view
                          class="flex justify-center py-10px"
                          style="border-bottom: 1px solid #f8f8f8"
                          v-if="warehouseItem.value.indexOf(item.scValue2 || '') !== -1"
                          @tap="pickerConfirm(warehouseItem)"
                        >
                          {{ warehouseItem.text }}
                        </view>
                      </view>
                    </scroll-view>
                  </view>
                </u-action-sheet>
              </view>
            </template>
          </u-input>
        </view>
      </view>
      <view v-if="reactiveData.detailsList.length > 0" class="w-100% pl-2px mt-2px">
        <view class="flex w-100% pl-3px pr-10px">
          <view class="w-50% flex items-center">
            <view>本箱数</view>
            <view class="ml-20px text-18px mt-2px">{{
              reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList[
                reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length - 1
              ]?.F_UNITQTY
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
            ].F_FZNO
          }}</view>
          <view class="ml-8px text-center">{{
            reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList[
              reactiveData.detailsList[reactiveData.barcodeIndex].barcodeList.length - 1
            ].F_BJNAME
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
              <view class="min-w-50px text-end">编码：</view>
              <view class="flex-wrap"> {{ item.detailList.fnumber }}</view>
            </view>
            <view class="flex items-center">
              <view class="min-w-50px text-end">批号：</view>
              <view class="flex-wrap">{{ item.detailList.lot }}</view>
            </view>

            <view class="flex">
              <view class="min-w-50px text-end">名称：</view>
              <view class="flex-wrap"> {{ item.detailList.name }}</view>
            </view>
            <view class="flex">
              <view class="min-w-50px text-end">规格：</view>
              <view class="flex-wrap">{{ item.detailList.specification }}</view>
            </view>

            <view class="flex">
              <view class="w-30% flex items-center h-20px">
                <view class="min-w-50px text-end">数量：</view>
                <view> {{ item.Quantity2 }}</view>
              </view>
              <view class="w-24% flex items-center h-20px">
                <view class="min-w-50px text-end">件数：</view>
                <view> {{ item.barcodeList.length }}</view>
              </view>

              <view class="w-46% flex items-center h-20px">
                <view class="min-w-50px text-end">仓位：</view>
                <view>{{ item.detailList.location }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="reactiveData.curNow === 2">
      <view class="flex bg-#f2f2f2 py-10rpx">
        <view class="w-15% text-center">序号</view>
        <view class="w-70%">条码编码</view>
        <view class="w-15% text-center">数量</view>
      </view>
      <view
        v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.barcodeList ||
        []"
        :key="item.FNUMBER"
        @longpress="longpressDetailsClick(item, index)"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
      >
        <view class="flex py-10rpx" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
          <view class="w-15% flex justify-center pt-3px">{{ index + 1 }}</view>
          <view class="w-70% pt-3px">
            <view>{{ item.F_BARCODENO }}</view>
            <view class="flex items-center" v-if="item.F_FZNO !== ' ' && item.F_FZNO !== ''">
              <view class="mr-8px">分装：{{ item.F_FZNO }}</view>
              <view class="mr-8px">{{ item.F_BJNAME }}</view>
              <view class="mr-8px">用量：{{ item.F_JUNITQTY }}</view>
            </view>
          </view>
          <view class="w-15% flex justify-center pt-3px">
            {{ item.F_UNITQTY }}
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>
