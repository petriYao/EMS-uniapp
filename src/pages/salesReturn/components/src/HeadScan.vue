<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, watch, onBeforeMount } from 'vue'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { purchaseScanBarcode, getcamelCase } from '@/common/purchaseStockIn/SalesReturn'
import { debounceSave } from '@/utils'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// 数据定义
const searchValue = ref<string>('')
const focus = ref<number>(99)
const heardList = ref({
  documentNumber: '',
  warehouse: '',
  location: ''
})
const setData = ref({
  fid: 0,
  warehouseNumber: '',
  warehouseId: '',
  FlexNumber: '',
  warehouseDisplay: false,
  locationDisplay: false
})
const detailsList = ref<any[]>([])

const warehouseData = reactive({
  scValue: '',
  warehouseList: [] as any[],
  show: false
})
const locationData = reactive({
  locationList: [] as any[]
})

// 事件定义
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:setData', modelValue: any): void
  (e: 'update:locationList', modelValue: any): void
}>()

const { emitter } = useEmitt()

const searchInput = ref()

// 扫码逻辑
const searchClick = async () => {
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  if (res) {
    if (focus.value === 0) {
      searchValue.value = res.result
      searchChange()
    } else if (focus.value === 2) {
      heardList.value.warehouse = res.result
      focus.value = 3
    } else if (focus.value === 3) {
      heardList.value.location = res.result
      focus.value = 0
    } else {
      searchInput.value.setValue(res.result)
    }
  }
}

// 搜索变化处理
const searchChange = () => {
  setTimeout(async () => {
    if (!searchValue.value) return
    handleFocus()
    if (!heardList.value.documentNumber) {
      await handleScanPurchaseOrder()
    } else {
      await handleScanBarcode()
    }
    emit('update:detailsList', detailsList.value)

    searchValue.value = ''
    resetFocus()
  }, 500)
}

// 重置焦点
const resetFocus = () => {
  focus.value = 0
  setTimeout(() => {
    focus.value = 99
  }, 200)
}

// 处理采购订单扫码
const handleScanPurchaseOrder = async () => {
  const queryRes: any = await getcamelCase(searchValue.value)
  if (queryRes && queryRes.dataList?.length > 0) {
    const firstItem = queryRes.dataList[0]
    setData.value = {
      fid: queryRes.fid,
      warehouseNumber: firstItem.WarehouseNumber,
      warehouseId: firstItem.WarehouseId,
      FlexNumber: firstItem.FlexNumber,
      warehouseDisplay: false,
      locationDisplay: false
    }
    heardList.value = {
      documentNumber: searchValue.value,
      warehouse: firstItem.WarehouseName,
      location: ''
    }
    detailsList.value = queryRes.dataList
    getWarehousePosition(firstItem.WarehouseNumber)
    emit('update:setData', setData.value)
  }
}

// 处理条码扫码
const handleScanBarcode = async () => {
  const queryRes: any = await purchaseScanBarcode(searchValue.value, setData.value)
  if (!queryRes) return resetFocus()

  // 改为查找全部匹配的明细项，支持同 MaterialCode+Lot 多行
  const matchingDetails = findMatchingDetails(queryRes)
  if (!matchingDetails.length) {
    uni.showToast({ title: '条码与明细不符', icon: 'none' })
    return resetFocus()
  }

  let matched = false
  for (const detail of matchingDetails) {
    const index = detailsList.value.indexOf(detail)

    if (isBarcodeScanned(detailsList.value[index], queryRes.BarCode)) {
      uni.showToast({ title: '请勿重复扫描', icon: 'none' })
      continue
    }

    // 分装与非分装分别进行可接收性判断
    if (detailsList.value[index].IsSplit) {
      if (!canAcceptForDetail(detailsList.value[index], queryRes)) {
        // 本行接收会超额，尝试下一行
        continue
      }
    } else {
      const newQty = detailsList.value[index].Quantity2 + queryRes.Quantity2
      if (newQty > detailsList.value[index].receivableQuantity) {
        continue
      }
    }

    // 通过可接收性校验后，再真正更新数据
    handleBarcodeAddition(index, queryRes)
    matched = true
    break
  }

  if (!matched) {
    uni.showToast({ title: '实收数量大于可收数量', icon: 'none' })
  }
}

// 查找物料索引
const findMaterialIndex = (queryRes: any) =>
  detailsList.value.findIndex((item: any) => {
    console.log('item', item, queryRes)
    return (
      item.MaterialCode === queryRes.MaterialCode && // 编码
      item.SourceOrderNo === queryRes.ContractNo && // 来源单号
      item.SourceOrderLineNo === queryRes.ContractLineNo && // 来源单行号
      item.Lot === queryRes.Lot && // 批次
      item.Customer === queryRes.Customer // 客户
    )
  })

// 判断是否已扫描
const isBarcodeScanned = (item: any, barcode: string) =>
  item.barcodeList.some((b: any) => b.F_BARCODENO === barcode)

// 新增：查找全部匹配的行
const findMatchingDetails = (queryRes: any): any[] => {
  return detailsList.value.filter((item: any) => {
    return (
      item.MaterialCode === queryRes.MaterialCode &&
      item.SourceOrderNo === queryRes.ContractNo &&
      item.SourceOrderLineNo === queryRes.ContractLineNo &&
      item.Lot === queryRes.Lot &&
      item.Customer === queryRes.Customer
    )
  })
}

// 新增：分装模拟校验
const canAcceptForDetail = (detail: any, queryRes: any): boolean => {
  if (!detail.IsSplit) {
    const newQty = detail.Quantity2 + queryRes.Quantity2
    return newQty <= detail.receivableQuantity
  }

  // 若当前行已达上限，则直接不再接收任何分装条码
  let currentTotal = 0
  const lotList: string[] = Array.isArray(detail.FZLOTList) ? detail.FZLOTList : []
  lotList.forEach((lot) => {
    currentTotal += detail.packagingDataFZLOT?.[lot]?.FZquantity || 0
  })
  if (currentTotal >= detail.receivableQuantity) return false

  const fzlot = queryRes.FZLOTList?.[0]
  const splitCode = queryRes.SplitCode
  const splitValue = queryRes.SplitValue
  const unitQty = queryRes.UnitQty

  const simulatedPackagingByLot: Record<string, any> = JSON.parse(
    JSON.stringify(detail.packagingDataFZLOT || {})
  )
  const simulatedFZLOTList: string[] = Array.isArray(detail.FZLOTList)
    ? [...detail.FZLOTList]
    : []

  if (!simulatedFZLOTList.includes(fzlot)) {
    simulatedFZLOTList.push(fzlot)
    simulatedPackagingByLot[fzlot] = simulatedPackagingByLot[fzlot] || {
      packagingData: {},
      packagingSig: [],
      isInteger: false,
      FZquantity: 0
    }
  }

  if (!simulatedPackagingByLot[fzlot].packagingData[splitCode]) {
    simulatedPackagingByLot[fzlot].packagingData[splitCode] = {
      quantity: 0,
      unitQty: unitQty,
      finishedQty: 0
    }
  }

  const simCell = simulatedPackagingByLot[fzlot].packagingData[splitCode]
  simCell.quantity += splitValue
  simCell.unitQty = unitQty
  simCell.finishedQty = simCell.quantity / simCell.unitQty

  const packagingSig: string[] = simulatedPackagingByLot[fzlot].packagingSig || []
  let minNonZero = Infinity
  for (const key of packagingSig) {
    const qty = Number(simulatedPackagingByLot[fzlot].packagingData[key]?.finishedQty || 0)
    if (qty === 0) {
      minNonZero = 0
      break
    }
    if (qty > 0 && qty < minNonZero) minNonZero = qty
  }
  const productsQuantity = minNonZero === Infinity ? 0 : minNonZero
  const simFZquantity = Math.floor(productsQuantity)

  let simulatedQuantity2 = 0
  simulatedFZLOTList.forEach((lot) => {
    if (lot === fzlot) simulatedQuantity2 += simFZquantity
    else simulatedQuantity2 += detail.packagingDataFZLOT?.[lot]?.FZquantity || 0
  })

  return simulatedQuantity2 <= detail.receivableQuantity
}

// 新增条码
const handleBarcodeAddition = (index: number, queryRes: any) => {
  detailsList.value[index].barcodeList.push(queryRes.barcodeList[0])
  detailsList.value[index].Quantity++

  if (detailsList.value[index].IsSplit) {
    handleSplitBarcodeAddition(index, queryRes)
  } else {
    detailsList.value[index].Quantity2 += queryRes.Quantity2
    detailsList.value[index].isInteger = true
  }

  console.log('是否超', detailsList.value[index])
  if (detailsList.value[index].Quantity2 > detailsList.value[index].receivableQuantity) {
    let deleteBarcode = {
      item: detailsList.value[index].barcodeList[detailsList.value[index].barcodeList.length - 1],
      index: detailsList.value[index].barcodeList.length - 1
    }
    //提示
    uni.showToast({
      title: '实收数量大于可收数量',
      icon: 'none'
    })
    emitter.emit('deleteBarcode', deleteBarcode)
  }

  emitter.emit('update:datailsIndex', index)
}

// 分装处理
const handleSplitBarcodeAddition = (index: number, queryRes: any) => {
  const { FZLOTList, SplitCode, SplitValue, UnitQty } = queryRes

  const index2 = detailsList.value[index].FZLOTList.findIndex(
    (item: string) => item === FZLOTList[0]
  )
  if (index2 === -1) {
    detailsList.value[index].FZLOTList.push(FZLOTList[0])
    detailsList.value[index].packagingDataFZLOT[FZLOTList[0]] = {
      packagingData: {},
      packagingSig: [],
      isInteger: false
    }
    detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].packagingData[SplitCode] = {
      quantity: 0,
      unitQty: UnitQty,
      finishedQty: 0
    }
  }

  const data = detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].packagingData[SplitCode]
  data.quantity += SplitValue
  data.finishedQty = data.quantity / UnitQty

  // 判断是否整数
  const packagingSig = detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].packagingSig
  let hasZero = false
  let minNonZero = Infinity

  packagingSig.forEach((item: any) => {
    const sum = Number(
      detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].packagingData[item].finishedQty
    )
    if (sum === 0) hasZero = true
    else if (sum < minNonZero) minNonZero = sum
  })

  const productsQuantity = hasZero || minNonZero === Infinity ? 0 : minNonZero
  const isInteger = productsQuantity % 1 === 0 && productsQuantity !== 0

  detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].isInteger = isInteger
  detailsList.value[index].isInteger = isInteger

  if (isInteger) {
    packagingSig.forEach((element: any) => {
      if (
        detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].packagingData[element]
          .finishedQty !== productsQuantity
      ) {
        detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].isInteger = false
        detailsList.value[index].isInteger = false
        return
      }
    })
  }

  detailsList.value[index].packagingDataFZLOT[FZLOTList[0]].FZquantity =
    Math.floor(productsQuantity)
  detailsList.value[index].Quantity2 = reCompute(detailsList.value[index])
}

// 新增明细
// const handleNewItemAddition = (queryRes: any) => {
//   const scannedBarcodes = new Set(
//     detailsList.value.flatMap((item: any) => item.barcodeList.map((b: any) => b.F_BARCODENO))
//   )
//   if (scannedBarcodes.has(searchValue.value)) {
//     uni.showToast({ title: '请勿重复扫描', icon: 'none' })
//     return resetFocus()
//   }
//   detailsList.value.push(queryRes)
//   emitter.emit('update:datailsIndex', detailsList.value.length - 1)
// }

// 重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  val.FZLOTList.forEach((item: string) => {
    sum += val.packagingDataFZLOT[item]?.FZquantity || 0
  })
  return sum
}

// 获取仓库列表
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

// 仓库选择器确认
const pickerConfirm = (val: any) => {
  heardList.value.warehouse = val.text
  setData.value.warehouseNumber = val.value
  setData.value.warehouseId = val.id
  getWarehousePosition(val.value)
  //清空明细中的仓位
  detailsList.value.forEach((item: any) => {
    item.WarehousePosition = ''
    item.WarehousePositionName = ''
    item.WarehousePositionId = ''
    item.detailList.location = ''
    item.currentList[12].value = ''
  })
  emit('update:setData', setData.value)
  emit('update:detailsList', detailsList.value)
  warehouseData.show = false
}

// 获取仓位
const getWarehousePosition = async (warehouseId: string) => {
  if (warehouseId) {
    const res: any = await lookqueryStorage(warehouseId)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      setData.value.FlexNumber = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber
      if (list[0].Id === 0) {
        locationData.locationList = []
        setData.value.locationDisplay = true
        resetFocus()
        handleFocus()
        emit('update:locationList', locationData.locationList)
        return
      }
      locationData.locationList = list.map((item: any) => ({
        Id: item.Id,
        text: item.FlexEntryId.Name[0].Value,
        value: item.FlexEntryId.Number
      }))
      setData.value.locationDisplay = locationData.locationList.length === 0
      if (!setData.value.locationDisplay) {
        // setTimeout(() => {
        //   focus.value = 2
        // }, 200)
      }
      handleFocus()
      emit('update:locationList', locationData.locationList)
    }
  }
}

// 仓库变更
const warehouseChange = debounceSave((val: string) => {
  heardList.value.location = ''
  const warehouse = warehouseData.warehouseList.find((item: any) => item.value === val)
  if (!warehouse && val) {
    uni.showToast({ title: '仓库不存在', icon: 'none' })
    heardList.value.warehouse = ''
    resetFocus()
    setTimeout(() => {
      focus.value = 1
    }, 200)
    return
  }
  heardList.value.warehouse = warehouse.text
  setData.value.warehouseNumber = warehouse.value
  setData.value.warehouseId = warehouse.id
  handleFocus()
  getWarehousePosition(val)
  //清空明细中的仓位
  detailsList.value.forEach((item: any) => {
    item.WarehousePosition = ''
    item.WarehousePositionName = ''
    item.WarehousePositionId = ''
    item.detailList.location = ''
    item.currentList[12].value = ''
  })
  emit('update:setData', setData.value)
  emit('update:detailsList', detailsList.value)
})

// 键盘控制
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

watch(
  () => props.loading,
  (val) => {
    if (val && heardList.value.warehouse) {
      resetFocus()
      detailsList.value = []
    }
  },
  { deep: true }
)

onBeforeUnmount(() => {
  clearTimer()
})

onBeforeMount(() => {
  getWarehouseList()
  handleFocus()
})
</script>

<template>
  <view>
    <!-- 订单号搜索 -->
    <view class="flex items-center pb-20rpx bg-#f2f2f2">
      <view class="w-50px flex justify-center" @click="searchClick">
        <u-icon name="scan" size="24" />
      </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="searchValue"
          :showAction="false"
          customStyle="background: #FFF;"
          shape="round"
          placeholder="请输入搜索关键词"
          :focus="focus === 99"
          @blur="searchChange"
        />
      </view>
    </view>
    <!-- 单号 -->
    <view class="flex items-center py-4rpx w-100%">
      <view class="w-50px flex justify-center">单号</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8">
        <u-input v-model="heardList.documentNumber" :disabled="true" shape="round" placeholder="" />
      </view>
    </view>

    <!-- 仓库 -->
    <view class="flex items-center py-4rpx w-100%">
      <view class="w-50px flex justify-center">仓库</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8">
        <u-input
          v-model="heardList.warehouse"
          :focus="focus === 1"
          :disabled="setData.warehouseDisplay"
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
                <view class="flex items-center p-20rpx" style="border-bottom: 1px solid #f8f8f8">
                  <view>搜索</view>
                  <view class="flex-1">
                    <u-input
                      v-model="warehouseData.scValue"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <scroll-view scroll-y style="height: 800rpx">
                  <view
                    class=""
                    v-for="(warehouseItem, index) in warehouseData.warehouseList"
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
              </u-action-sheet>
            </view>
          </template>
        </u-input>
      </view>
    </view>
  </view>
</template>
