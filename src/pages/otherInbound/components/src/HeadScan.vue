<script setup lang="ts">
import { reactive, ref, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { purchaseScanBarcode } from '@/common/purchaseStockIn/OtherInbound'
import { debounce } from 'lodash-es'
import { useEmitt } from '@/hooks/useEmitt'
import { lowerCamelCase2 } from '@/api/modules/storage'

// ========== 类型定义 ==========
interface PackagingData {
  quantity: number
  unitQty: number
  finishedQty: number
}

interface PackagingSig {
  packagingData: Record<string, PackagingData>
  packagingSig: string[]
  isInteger: boolean
  FZquantity: number
}

interface DetailItem {
  currentList: any[]
  MaterialCode: string
  Lot: string
  FStockLocId: string
  barcodeList: any[]
  Quantity: number
  IsSplit: boolean
  FZLOTList: string[]
  packagingDataFZLOT: Record<string, PackagingSig>
  isInteger: boolean
  Quantity2: number
  receivableQuantity: number
}

// ========== 数据定义 ==========
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const reactiveData = reactive({
  searchValue: '',
  focus: 1,
  heardList: {
    documentNumber: '',
    warehouse: '',
    location: ''
  },
  setData: {
    warehouseNumber: '',
    warehouseId: '',
    warehouseDisplay: false,
    locationNumber: '',
    locationId: '',
    locationDisplay: true,
    FlexNumber: ''
  },
  detailsList: [] as DetailItem[]
})

const warehouseData = reactive({
  scValue: '',
  warehouseList: [] as any[],
  show: false
})

const locationData = reactive({
  scValue: '',
  locationList: [] as any[],
  show: false
})

// ========== 事件定义 ==========
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: DetailItem[]): void
  (e: 'update:setData', modelValue: any): void
  (e: 'update:locationList', modelValue: any[]): void
}>()

const { emitter } = useEmitt()

const searchInput = ref()

// ========== 核心逻辑函数 ==========

// 搜索处理
const searchChange = () => {
  if (!reactiveData.searchValue) return

  setTimeout(async () => {
    handleFocus()
    const queryRes: any = await purchaseScanBarcode(reactiveData.searchValue, reactiveData.setData)
    if (!queryRes) {
      resetSearch()
      return
    }
    if (reactiveData.detailsList.length > 0) {
      if (reactiveData.detailsList[0].currentList[0].value !== queryRes.currentList[0].value) {
        uni.showToast({
          title: '不同部门需分批扫描',
          icon: 'none'
        })
        reactiveData.searchValue = ''
        focusTm()
        return
      }
    }

    handleBarcodeResult(queryRes)
    emit('update:detailsList', reactiveData.detailsList)
    resetSearch()
  }, 500)
}

// 处理扫码结果
const handleBarcodeResult = (queryRes: any) => {
  reactiveData.setData.warehouseDisplay = true

  if (reactiveData.detailsList.length > 0) {
    handleExistingDetails(queryRes)
  } else {
    addNewBarcodeDetail(queryRes)
  }
}

// 已有明细处理
const handleExistingDetails = (queryRes: any) => {
  const index = findMaterialIndex(queryRes)

  if (index === -1) {
    if (checkDuplicateBarcode(queryRes)) return
    addNewBarcodeDetail(queryRes)
  } else {
    handleUpdateBarcodeDetail(index, queryRes)
    emitter.emit('update:datailsIndex', index)
  }
}

// 添加新明细
const addNewBarcodeDetail = async (queryRes: any) => {
  reactiveData.detailsList.push(queryRes)
  const FMaterialId = queryRes.MaterialCode //物料编码FMaterialId.Fnumber
  const FLot = queryRes.Lot //批号FLot
  const FStockId = reactiveData.setData.warehouseNumber //仓库FStockId.Fname
  console.log('获取推荐仓位（根据物料编码、批号、仓库查库存表）', reactiveData.setData.FlexNumber)
  if (reactiveData.setData.FlexNumber !== '') {
    let FilterString = `FMaterialId.Fnumber = '${FMaterialId}'`
    if (FLot !== '') {
      FilterString += ` AND FLot.Fnumber = '${FLot}'`
    }
    FilterString += ` AND FStockId.Fnumber = '${FStockId}' AND FBaseQty > 0`
    const FieldKeys = `FStockLocId.${reactiveData.setData.FlexNumber}.FNumber`
    const lowerRes: any = await lowerCamelCase2(FilterString, FieldKeys)
    if (lowerRes && lowerRes.data && lowerRes.data.length > 0) {
      reactiveData.detailsList[reactiveData.detailsList.length - 1].currentList[9].value =
        lowerRes.data.map((item: any) => item[0]).join(',') //推荐仓位
    }
  }

  emitter.emit('update:datailsIndex', reactiveData.detailsList.length - 1)
}

// 更新已有明细
const handleUpdateBarcodeDetail = (index: number, queryRes: any) => {
  if (
    reactiveData.detailsList[index].barcodeList.some(
      (item) => item.F_BARCODENO === queryRes.BarCode
    )
  ) {
    uni.showToast({ title: '请勿重复扫描', icon: 'none' })
    return
  }

  reactiveData.detailsList[index].barcodeList.push(queryRes.barcodeList[0])
  reactiveData.detailsList[index].Quantity++

  if (reactiveData.detailsList[index].IsSplit) {
    handleSplitUpdate(index, queryRes)
  } else {
    handleNormalUpdate(index, queryRes)
  }
}

// 分装处理
const handleSplitUpdate = (index: number, queryRes: any) => {
  const index2 = findFZLOTIndex(index, queryRes)

  if (index2 === -1) {
    reactiveData.detailsList[index].FZLOTList.push(queryRes.FZLOTList[0])
    reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]] =
      queryRes.packagingDataFZLOT[queryRes.FZLOTList[0]]
  }

  updatePackagingData(index, queryRes)
  calculateIsInteger(index, queryRes)
  calculateTotalQuantity(index)
}

// 普通处理
const handleNormalUpdate = (index: number, queryRes: any) => {
  reactiveData.detailsList[index].Quantity2 += queryRes.Quantity2
  reactiveData.detailsList[index].isInteger = true
}

// ========== 仓库/仓位相关 ==========
const getWarehouseList = async () => {
  const res: any = await queryStorage()
  if (res) {
    warehouseData.warehouseList = res.data.map((item: any) => ({
      id: item[2],
      text: item[0],
      value: item[1]
    }))
  }
}

const getWarehousePosition = async (warehouseId: any) => {
  if (warehouseId) {
    const res: any = await lookqueryStorage(warehouseId)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      reactiveData.setData.FlexNumber = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber

      if (list[0].Id === 0) {
        locationData.locationList = []
        reactiveData.setData.locationDisplay = true
        focusTm()
        handleFocus()
        emit('update:locationList', locationData.locationList)
        return
      }

      locationData.locationList = list.map((item: any) => ({
        Id: item.Id,
        text: item.FlexEntryId.Name[0].Value,
        value: item.FlexEntryId.Number
      }))

      if (locationData.locationList.length === 0) {
        reactiveData.setData.locationDisplay = true
        focusTm()
      } else {
        reactiveData.setData.locationDisplay = false
        setTimeout(() => {
          reactiveData.focus = 2
        }, 200)
      }

      handleFocus()
      emit('update:locationList', locationData.locationList)
    }
  }
}

const pickerConfirm = (val: any) => {
  reactiveData.heardList.warehouse = val.text
  reactiveData.setData.warehouseNumber = val.value
  reactiveData.setData.warehouseId = val.id

  reactiveData.setData.locationNumber = ''
  reactiveData.setData.locationId = ''
  reactiveData.heardList.location = ''

  getWarehousePosition(val.value)
  emit('update:setData', reactiveData.setData)
  warehouseData.show = false
}

const locationPickerConfirm = (val: any) => {
  reactiveData.heardList.location = val.text
  reactiveData.setData.locationNumber = val.value
  reactiveData.setData.locationId = val.Id
  locationData.show = false
  focusTm()
  handleFocus()
  emit('update:setData', reactiveData.setData)
}

// ========== 输入处理 ==========
const warehouseChange = debounce((val: any) => {
  reactiveData.heardList.location = ''
  const warehouseId = warehouseData.warehouseList.find((item: any) => item.value === val)
  if (!warehouseId && val !== '') {
    uni.showToast({ title: '仓库不存在', icon: 'none' })
    reactiveData.heardList.warehouse = ''
    reactiveData.focus = 0
    setTimeout(() => (reactiveData.focus = 1), 200)
    return
  }

  reactiveData.heardList.warehouse = warehouseId.text
  reactiveData.setData.warehouseNumber = warehouseId.value
  reactiveData.setData.warehouseId = warehouseId.id
  handleFocus()
  getWarehousePosition(val)
  emit('update:setData', reactiveData.setData)
}, 300)

const locationChange = debounce((val: any) => {
  const location = locationData.locationList.find((item: any) => item.value === val)
  if (!location && val !== '') {
    uni.showToast({ title: '仓位不存在', icon: 'none' })
    reactiveData.heardList.location = ''
    reactiveData.focus = 0
    setTimeout(() => (reactiveData.focus = 2), 200)
    return
  }

  reactiveData.heardList.location = location.value
  reactiveData.setData.locationNumber = location.value
  reactiveData.setData.locationId = location.Id
  handleFocus()

  reactiveData.focus = 0
  setTimeout(() => (reactiveData.focus = 99), 200)
  emit('update:setData', reactiveData.setData)
}, 300)

// ========== 工具函数 ==========
const findMaterialIndex = (queryRes: any) => {
  return reactiveData.detailsList.findIndex(
    (item: any) =>
      item.MaterialCode === queryRes.MaterialCode &&
      item.Lot === queryRes.Lot &&
      item.FStockLocId === queryRes.FStockLocId
  )
}

const findFZLOTIndex = (index: number, queryRes: any) => {
  return reactiveData.detailsList[index].FZLOTList.findIndex(
    (item: any) => item === queryRes.FZLOTList[0]
  )
}

const updatePackagingData = (index: number, queryRes: any) => {
  const key = queryRes.FZLOTList[0]
  const splitCode = queryRes.SplitCode

  if (!reactiveData.detailsList[index].packagingDataFZLOT[key]) {
    reactiveData.detailsList[index].packagingDataFZLOT[key] = {
      packagingData: {},
      isInteger: false,
      FZquantity: 0,
      packagingSig: []
    }
  }

  const data = reactiveData.detailsList[index].packagingDataFZLOT[key].packagingData
  if (!data[splitCode]) {
    data[splitCode] = { quantity: 0, unitQty: 0, finishedQty: 0 }
  }

  data[splitCode].quantity += queryRes.SplitValue
  data[splitCode].unitQty = queryRes.UnitQty
  data[splitCode].finishedQty = data[splitCode].quantity / queryRes.UnitQty
}

// 计算成品数量
const calculateIsInteger = (index: number, queryRes: any) => {
  const key = queryRes.FZLOTList[0]
  const packagingSig = reactiveData.detailsList[index].packagingDataFZLOT[key].packagingSig
  let hasZero = false
  let minNonZero = Infinity

  packagingSig.forEach((item: any) => {
    const sum = Number(
      reactiveData.detailsList[index].packagingDataFZLOT[key].packagingData[item].finishedQty
    )
    if (isNaN(sum) || sum === 0) {
      hasZero = true
    } else if (sum < minNonZero) {
      minNonZero = sum
    }
  })

  const productsQuantity = hasZero || minNonZero === Infinity ? 0 : minNonZero
  const isInteger = productsQuantity % 1 === 0 && productsQuantity !== 0

  // 更新 isInteger 状态
  reactiveData.detailsList[index].packagingDataFZLOT[key].isInteger = isInteger
  reactiveData.detailsList[index].isInteger = isInteger

  // 计算 FZquantity
  const fZquantity = isInteger ? Math.floor(productsQuantity) : 0
  reactiveData.detailsList[index].packagingDataFZLOT[key].FZquantity = fZquantity

  if (isInteger) {
    packagingSig.forEach((element: any) => {
      if (
        reactiveData.detailsList[index].packagingDataFZLOT[key].packagingData[element]
          .finishedQty !== productsQuantity
      ) {
        reactiveData.detailsList[index].packagingDataFZLOT[key].isInteger = false
        reactiveData.detailsList[index].isInteger = false
        return
      }
    })
  }
}

const calculateTotalQuantity = (index: number) => {
  let sum = 0
  reactiveData.detailsList[index].FZLOTList.forEach((item: any) => {
    sum += reactiveData.detailsList[index].packagingDataFZLOT[item].FZquantity
  })
  console.log('分装合计', reactiveData.detailsList[index])
  reactiveData.detailsList[index].Quantity2 = sum
}

const checkDuplicateBarcode = (queryRes: any) => {
  const scannedBarcodes = new Set(
    reactiveData.detailsList.flatMap((item: any) =>
      item.barcodeList.map((item2: any) => item2.F_BARCODENO)
    )
  )
  return scannedBarcodes.has(queryRes.BarCode)
}

const resetSearch = () => {
  reactiveData.searchValue = ''
  focusTm()
}

const focusTm = () => {
  reactiveData.focus = 0
  setTimeout(() => {
    reactiveData.focus = 99
  }, 200)
}

// ========== 定时器 ==========
const hideTimer = ref<number | null>(null)

const handleFocus = () => {
  if (!hideTimer.value) {
    hideTimer.value = setInterval(() => {
      uni.hideKeyboard()
    }, 50) as unknown as number
  }
}

const clearTimer = () => {
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
    hideTimer.value = null
  }
}

// ========== 生命周期 ==========
onBeforeMount(() => {
  handleFocus()
  getWarehouseList()
})

onBeforeUnmount(() => {
  clearTimer()
})

watch(
  () => props.loading,
  (val) => {
    if (val && reactiveData.heardList.warehouse !== '') {
      reactiveData.focus = 0
      setTimeout(() => {
        reactiveData.focus = 99
        reactiveData.detailsList = []
      }, 200)
    }
  },
  { deep: true }
)

useEmitt({
  name: 'update:handleFocus',
  callback: async () => handleFocus()
})

useEmitt({
  name: 'update:clearTimer',
  callback: async () => clearTimer()
})
</script>

<template>
  <view>
    <!-- 订单号搜索 -->
    <view class="flex items-center pb-20rpx bg-#f2f2f2">
      <view class="w-50px flex justify-center">
        <view class="w-50px flex justify-center"> 条码 </view>
      </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.searchValue"
          :showAction="false"
          customStyle="background: #FFF;"
          shape="round"
          placeholder="请输入搜索关键词"
          :focus="reactiveData.focus == 99"
          @blur="searchChange"
        />
      </view>
    </view>
    <view class="flex items-center py-4rpx w-100%">
      <view class="w-50px flex justify-center">仓库</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.heardList.warehouse"
          :showAction="false"
          :focus="reactiveData.focus == 1"
          :disabled="reactiveData.setData.warehouseDisplay"
          shape="round"
          placeholder=""
          @change="warehouseChange"
        >
          <template #suffix>
            <view @click="warehouseData.show = true">
              <u-icon name="arrow-down" size="20" />
            </view>
            <view>
              <u-action-sheet
                :show="warehouseData.show"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="warehouseData.show = false"
              >
                <view
                  class="flex items-center p-20rpx"
                  style="border-bottom: 1px solid #f8f8f8"
                  @click="clearTimer"
                >
                  <view @tap="warehouseData.show = false">搜索 </view>
                  <view class="flex-1">
                    <u-input
                      id="searchInput1"
                      v-model="warehouseData.scValue"
                      :showAction="false"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <view>
                  <!-- 滚动条 -->
                  <scroll-view scroll-y style="height: 800rpx">
                    <view
                      class=""
                      v-for="(warehouseItem, index) of warehouseData.warehouseList"
                      :key="index"
                    >
                      <view
                        class="flex justify-center py-10px"
                        style="border-bottom: 1px solid #f8f8f8"
                        v-if="warehouseItem.value.indexOf(warehouseData.scValue || '') !== -1"
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

    <view class="flex items-center pb-4rpx w-100%">
      <view class="w-50px flex justify-center">仓位</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.heardList.location"
          :showAction="false"
          :focus="reactiveData.focus == 2"
          :disabled="reactiveData.setData.locationDisplay"
          shape="round"
          placeholder=""
          @change="locationChange"
        >
          <template #suffix>
            <view @click="!reactiveData.setData.locationDisplay ? (locationData.show = true) : ''">
              <u-icon name="arrow-down" size="20" />
            </view>
            <view>
              <u-action-sheet
                :show="locationData.show"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="locationData.show = false"
              >
                <view
                  class="flex items-center p-20rpx"
                  style="border-bottom: 1px solid #f8f8f8"
                  @click="clearTimer"
                >
                  <view @tap="locationData.show = false">搜索 </view>
                  <view class="flex-1">
                    <u-input
                      id="searchInput1"
                      v-model="warehouseData.scValue"
                      :showAction="false"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <view>
                  <!-- 滚动条 -->
                  <scroll-view scroll-y style="height: 800rpx">
                    <view
                      class=""
                      v-for="(warehouseItem, index) of locationData.locationList"
                      :key="index"
                    >
                      <view
                        class="flex justify-center py-10px"
                        style="border-bottom: 1px solid #f8f8f8"
                        v-if="warehouseItem.value.indexOf(warehouseData.scValue || '') !== -1"
                        @tap="locationPickerConfirm(warehouseItem)"
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
</template>
