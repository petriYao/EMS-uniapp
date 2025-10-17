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
  },
  barcodeIndex: {
    type: Number,
    default: 0
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:barcodeIndex', modelValue: any): void
}>()
const { emitter } = useEmitt()

const pickerShow = ref(false)

const reactiveData = reactive({
  detailsList: [] as any,
  subsectionList: ['当前', '明细'],
  locationList: [] as any,
  curNow: 0,
  focus: 0,
  barcodeList: [] as any, //条码
  barcodeIndex: 0
})

const getBarCode = async (item: any, index: number) => {
  reactiveData.barcodeIndex = index
  emit('update:barcodeIndex', index)
}

//长按事件 删除明细
const longpressClick = (item: any, index: number) => {
  if (isMoved) return // 如果有移动，不触发长按事件

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
//仓位
const warehouseChange = debounceSave((val: any) => {
  const warehouseId: any = reactiveData.locationList.find((item: any) => item.value === val)
  if (!warehouseId && val != '') {
    uni.showToast({
      title: '仓位不存在',
      icon: 'none'
    })
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
      (i: any) => i.label === '仓位'
    ).value = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePosition = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePositionNumber = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.location = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = ''
    reactiveData.focus = 0
    setTimeout(() => {
      reactiveData.focus = 12
    }, 100)
    return
  }
  reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
    (i: any) => i.label === '仓位'
  ).value = warehouseId.value
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePosition = warehouseId.Id
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePositionNumber = warehouseId.value

  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.location = warehouseId.text
  reactiveData.detailsList[reactiveData.barcodeIndex].FStockLocId = warehouseId.Id

  pickerShow.value = false
  emit('update:detailsList', reactiveData.detailsList)
  // emitter.emit('update:handleFocus')
})

const pickerConfirm = (warehouseItem: any) => {
  reactiveData.detailsList[reactiveData.barcodeIndex].FStockLocId = warehouseItem.Id
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePosition = warehouseItem.value
  reactiveData.detailsList[reactiveData.barcodeIndex].WarehousePositionNumber = warehouseItem.value

  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.location = warehouseItem.text
  reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
    (i: any) => i.label === '仓位'
  ).value = warehouseItem.text
  pickerShow.value = false
  emit('update:detailsList', reactiveData.detailsList)
  // emitter.emit('update:handleFocus')
}

const quantChange = (val: any, item: any) => {
  console.log(val, item)
  if (item.label == '数量') {
    reactiveData.detailsList[reactiveData.barcodeIndex].Quantity2 = val * 1
  } else if (item.label == '计价数') {
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.priceUnitQty = val * 1
    //reactiveData.detailsList[reactiveData.barcodeIndex].currentList[15].value = val * 1
  }
}

function sectionChange(index: any) {
  reactiveData.curNow = index
  reactiveData.focus = 999
}

const clearTimer = () => {
  // 清除定时器
  emitter.emit('update:focus')
  emitter.emit('update:clearTimer')
}
watch(
  () => props.detailsList,
  (val: any) => {
    reactiveData.detailsList = val
  },
  { immediate: true, deep: true }
)

watch(
  () => props.locationList,
  (val: any) => {
    if (val && val.length > 0) {
      reactiveData.locationList = val
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <u-subsection
    :list="reactiveData.subsectionList"
    :current="reactiveData.curNow"
    @change="sectionChange"
  />
  <scroll-view scroll-y style="height: calc(100vh - 44px - 44px - 40px - 34px - 80px - 22px)">
    <!-- 当前 -->
    <view v-if="reactiveData.curNow == 0" class="flex flex-wrap content-input">
      <view
        v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.currentList ||
        []"
        :key="index"
        class="flex items-center mb-6rpx"
        :style="item.style"
      >
        <view class="w-60px flex justify-center">
          {{ item.label }}
        </view>
        <view class="flex-1 mr-20rpx" v-if="item.type == 'input'">
          <u-input
            v-model="item.value"
            :showAction="false"
            :disabled="item.disabled"
            shape="round"
            placeholder=""
            @change="quantChange"
            @click="clearTimer"
          />
        </view>
        <view
          class="flex-1 mr-20rpx"
          style="border: 1px solid #f8f8f8"
          v-else-if="item.type == 'number'"
        >
          <u-input
            v-model="item.value"
            :showAction="false"
            :disabled="item.disabled"
            shape="round"
            placeholder=""
            type="number"
            @change="quantChange($event, item)"
            @click="clearTimer"
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
            :focus="reactiveData.focus == index"
            @blur="warehouseChange(item.value)"
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
                    <view class="flex-1" @click="clearTimer">
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
          <!-- {{ item.detailList }} -->
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
              <view class="w-50% flex items-center h-20px">
                <view class="w-50px text-end">可收：</view>
                <view> {{ item.detailList.receivableQuantity }}</view>
              </view>

              <view class="w-50% flex items-center h-20px">
                <view class="w-80px text-end">数量：</view>
                <view class="mr-6px"> {{ item.Quantity2 }}</view>
                <view>{{ item.detailList.unit }}</view>
              </view>
            </view>
            <view class="flex">
              <view class="w-50% flex items-center h-20px">
                <view class="w-50px text-end">仓位：</view>
                <view>{{ item.detailList.location }}</view>
              </view>
              <view
                class="w-50% flex items-center h-20px"
                v-if="item.detailList.priceUnit !== item.detailList.unit"
              >
                <view class="w-77px text-end">计价数量：</view>
                <view class="mr-6px"> {{ item.detailList.priceUnitQty }}</view>
                <view> {{ item.detailList.priceUnit }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
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
