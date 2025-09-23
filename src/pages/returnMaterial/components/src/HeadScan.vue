<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { purchaseScanBarcode, getcamelCase } from '@/common/returnMaterial/Index'
import { otherScanBarcode, getOtherCase } from '@/common/returnMaterial/OtherOutbound'
// import { salesScanBarcode, getSalesCase } from '@/common/returnMaterial/SalesReturn'
// import { queryBarCode } from '@/api/modules/lowerCamelCase'
import { useEmitt } from '@/hooks/useEmitt'
import { debounce } from '@/utils'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

//数据
const reactiveData = reactive({
  searchValue: '', //搜索值
  documentNumber: '', //单号
  fid: '', //单号ID
  focus: 99,
  //单号
  detailsList: [] as any
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:fid', modelValue: any): void
}>()
const { emitter } = useEmitt()

const searchInput = ref()

//扫描条码
// 使用防抖优化搜索函数，避免频繁触发
const searchChange = debounce(async () => {
  console.log('搜索值', reactiveData.searchValue)
  if (!reactiveData.searchValue) return // 空值检查提前

  handleFocus() // 聚焦操作

  try {
    // 情况1：单据号为空时（单据查询）
    if (!reactiveData.documentNumber) {
      await handleDocumentSearch()
    }
    // 情况2：已有单据号（条码扫描）
    else {
      await handleBarcodeScan()
    }
  } catch (error) {
    console.error('处理过程中出错:', error)
  } finally {
    resetSearchField() // 重置搜索字段
  }
}, 500)

// 单据查询处理
const handleDocumentSearch = async () => {
  let queryRes: any = {}
  console.log(props.title)

  switch (props.title) {
    case '采购退货':
      console.log('采购退货123')
      queryRes = await getcamelCase(reactiveData.searchValue)
      break
    // case '销售退货':
    //   queryRes = await getSalesCase(reactiveData.searchValue)
    //   break
    case '其他出库':
      queryRes = await getOtherCase(reactiveData.searchValue)
      break
  }

  console.log('单据查询结果', queryRes)

  // 处理无结果情况
  if (!queryRes?.dataList?.length) {
    // showToast('未找到相关单据')
    return
  }

  // 更新单据数据
  reactiveData.documentNumber = reactiveData.searchValue
  reactiveData.detailsList = queryRes.dataList
  reactiveData.fid = queryRes.fid
  emit('update:fid', reactiveData.fid)
  emit('update:detailsList', reactiveData.detailsList)
}

// 条码扫描处理
const handleBarcodeScan = async () => {
  let queryRes: any = {}
  switch (props.title) {
    case '采购退货':
      queryRes = await purchaseScanBarcode(reactiveData.searchValue)
      break
    // case '销售退货':
    //   queryRes = await salesScanBarcode(reactiveData.searchValue)
    //   break
    case '其他出库':
      queryRes = await otherScanBarcode(reactiveData.searchValue)
      break
  }

  console.log('条码扫描结果', queryRes)

  if (!queryRes) {
    // showToast('无效条码')
    return
  }

  // 查找所有匹配的明细项（支持多个相同 MaterialCode + Lot 的行）
  const matchingDetails = findMatchingDetails(queryRes)
  if (!matchingDetails.length) {
    showToast('条码与明细不符合')
    return
  }

  let matched = false

  for (const detail of matchingDetails) {
    const index = reactiveData.detailsList.indexOf(detail)

    // 重复条码拦截
    if (isBarcodeDuplicate(index, queryRes.BarCode)) {
      showToast('请勿重复扫描')
      continue
    }

    // 分装与非分装分别进行可接收性判断
    if (detail.IsSplit) {
      if (!canAcceptForDetail(detail, queryRes)) {
        // 本行接收会超额，尝试下一行
        continue
      }
    } else {
      const newQty = detail.Quantity2 + queryRes.Quantity2
      if (newQty > detail.canReceive) {
        continue
      }
    }

    // 通过可接收性校验后，再真正更新数据
    updateDetailItem(index, queryRes)
    matched = true
    break
  }

  if (!matched) {
    showToast('累计实发超过对应发数量')
  } else {
    emit('update:detailsList', reactiveData.detailsList)
  }
}

// 查找匹配的明细项（数组）
const findMatchingDetails = (queryRes: any): any[] => {
  return reactiveData.detailsList.filter((item: any) => {
    switch (props.title) {
      case '采购退货':
        return (
          item.MaterialCode === queryRes.MaterialCode &&
          item.SourceOrderNo === queryRes.SourceOrderNo &&
          item.Supplier === queryRes.Supplier &&
          item.Lot === queryRes.Lot
        )
      case '其他出库':
        return item.MaterialCode === queryRes.MaterialCode && item.Lot === queryRes.Lot
    }
  })
}

// 分装场景-模拟是否可接收（不落库，只计算）
const canAcceptForDetail = (detail: any, queryRes: any): boolean => {
  // 若当前行已达上限，则直接不再接收任何分装条码
  if (detail.IsSplit) {
    let currentTotal = 0
    const lotList: string[] = Array.isArray(detail.FZLOTList) ? detail.FZLOTList : []
    lotList.forEach((lot) => {
      currentTotal += detail.packagingDataFZLOT?.[lot]?.FZquantity || 0
    })
    if (currentTotal >= detail.canReceive) return false
  }

  // 非分装直接按原逻辑判断
  if (!detail.IsSplit) {
    const newQty = detail.Quantity2 + queryRes.Quantity2
    return newQty <= detail.canReceive
  }

  const fzlot = queryRes.FZLOTList?.[0]
  const splitCode = queryRes.SplitCode
  const splitValue = queryRes.SplitValue
  const unitQty = queryRes.unitQty

  // 基于当前行构建一个模拟的分装批次数据
  const simulatedPackagingByLot: Record<string, any> = JSON.parse(
    JSON.stringify(detail.packagingDataFZLOT || {})
  )
  const simulatedFZLOTList: string[] = Array.isArray(detail.FZLOTList) ? [...detail.FZLOTList] : []

  // 如该 FZLOT 在当前明细中不存在，则以本次条码自带的结构为基础新增
  if (!simulatedFZLOTList.includes(fzlot)) {
    simulatedFZLOTList.push(fzlot)
    simulatedPackagingByLot[fzlot] = JSON.parse(
      JSON.stringify(
        queryRes.packagingDataFZLOT?.[fzlot] || { packagingData: {}, packagingSig: [] }
      )
    )
    if (!simulatedPackagingByLot[fzlot].packagingData)
      simulatedPackagingByLot[fzlot].packagingData = {}
    if (!simulatedPackagingByLot[fzlot].packagingSig)
      simulatedPackagingByLot[fzlot].packagingSig = []
  }

  // 确保分装位存在
  if (!simulatedPackagingByLot[fzlot].packagingData[splitCode]) {
    simulatedPackagingByLot[fzlot].packagingData[splitCode] = {
      quantity: 0,
      unitQty: unitQty,
      finishedQty: 0
    }
  }

  // 模拟累加本次分装增量
  const simCell = simulatedPackagingByLot[fzlot].packagingData[splitCode]
  simCell.quantity += splitValue
  simCell.unitQty = unitQty
  simCell.finishedQty = simCell.quantity / simCell.unitQty

  // 计算该 FZLOT 的成品数量（成套数）
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

  // 汇总全部 FZLOT 的 FZquantity，但将当前 fzlot 替换为模拟值
  let simulatedQuantity2 = 0
  simulatedFZLOTList.forEach((lot) => {
    if (lot === fzlot) simulatedQuantity2 += simFZquantity
    else simulatedQuantity2 += detail.packagingDataFZLOT?.[lot]?.FZquantity || 0
  })

  return simulatedQuantity2 <= detail.canReceive
}

// 检查条码是否重复
const isBarcodeDuplicate = (index: number, barcode: string): boolean => {
  return reactiveData.detailsList[index].barcodeList.some((item: any) => {
    console.log('条码重复', item, barcode)
    return item.FNumber === barcode
  })
}

// 更新明细项数据
const updateDetailItem = (index: number, queryRes: any) => {
  const detail = reactiveData.detailsList[index]

  // 初始化分装标记
  if (detail.isLowerCamelCase) {
    detail.isLowerCamelCase = false
    detail.IsSplit = queryRes.IsSplit
  }

  // 添加条码并更新数量
  detail.barcodeList.push(queryRes.barcodeList)
  detail.Quantity++
  let showToast = ''
  switch (props.title) {
    case '采购退货':
      detail.currentList[7].value = queryRes.F_POQTY // 批量
      detail.currentList[9].value = queryRes.TotalBox // 总箱数
      showToast = '实退数量大于应退数量'
      break
    case '其他出库':
      detail.currentList[6].value = queryRes.F_POQTY // 批量
      detail.currentList[8].value = queryRes.TotalBox // 总箱数
      showToast = '实发数量大于可发数量'
      break
  }
  emitter.emit('update:datailsIndex', index)
  console.log('分装处理', detail)
  // 分装处理
  if (detail.IsSplit) {
    handleSplitPackage(detail, queryRes)
  }
  // 非分装处理
  else {
    detail.Quantity2 += queryRes.Quantity2
    detail.isInteger = true
  }
  //如果累计实发超过对应发数量，调用删除
  if (detail.Quantity2 > detail.canReceive) {
    let deleteBarcode = {
      item: detail.barcodeList[detail.barcodeList.length - 1],
      index: detail.barcodeList.length - 1
    }
    //提示
    uni.showToast({
      title: showToast,
      icon: 'none'
    })
    emitter.emit('deleteBarcode', deleteBarcode)
  }
}

// 处理分装逻辑
const handleSplitPackage = (detail: any, queryRes: any) => {
  const fzlot = queryRes.FZLOTList[0]
  console.log('处理分装逻辑1', queryRes)
  // 添加新分装批号
  if (!detail.FZLOTList.includes(fzlot)) {
    detail.FZLOTList.push(fzlot)
    detail.packagingDataFZLOT[fzlot] = queryRes.packagingDataFZLOT[fzlot]
    detail.packagingDataFZLOT[fzlot].packagingData[queryRes.SplitCode] = {
      quantity: 0,
      unitQty: queryRes.unitQty,
      finishedQty: 0
    }
  }

  // 更新分装数据
  const packagingData = detail.packagingDataFZLOT[fzlot].packagingData[queryRes.SplitCode]
  console.log('处理分装逻辑2', packagingData)

  packagingData.quantity += queryRes.SplitValue
  packagingData.unitQty = queryRes.unitQty
  packagingData.finishedQty = packagingData.quantity / packagingData.unitQty
  console.log('处理分装逻辑3', packagingData.quantity, packagingData.unitQty)
  // 计算成品数量
  const productsQuantity = calculateProductsQuantity(detail, fzlot)
  console.log('productsQuantity', productsQuantity)
  // 更新分装状态和数量
  updatePackageStatus(detail, fzlot, productsQuantity)
}

// 计算成品数量
const calculateProductsQuantity = (detail: any, fzlot: string): number => {
  const packagingData = detail.packagingDataFZLOT[fzlot]

  for (const key of packagingData.packagingSig) {
    const qty = Number(packagingData.packagingData[key]?.finishedQty || 0)
    if (qty === 0) {
      return 0 // 这会立即从整个函数返回0
    }
  }

  let minNonZero = Infinity
  for (const key of packagingData.packagingSig) {
    const qty = Number(packagingData.packagingData[key]?.finishedQty || 0)
    if (qty > 0 && qty < minNonZero) {
      minNonZero = qty
    }
  }

  return minNonZero === Infinity ? 0 : minNonZero
}

// 更新分装状态
const updatePackageStatus = (detail: any, fzlot: string, productsQuantity: number) => {
  const packagingData = detail.packagingDataFZLOT[fzlot]

  // 检查是否为整数
  const isInteger = productsQuantity > 0 && productsQuantity % 1 === 0
  packagingData.isInteger = isInteger
  detail.isInteger = isInteger
  console.log('分装状态', isInteger)
  console.log('分装状态2', productsQuantity)
  // 验证所有分装是否一致
  if (isInteger) {
    packagingData.packagingSig.forEach((key: string) => {
      console.log('分装状态3', packagingData.packagingData[key]?.finishedQty)
      if (packagingData.packagingData[key]?.finishedQty !== productsQuantity) {
        packagingData.isInteger = false
        detail.isInteger = false
      }
    })
  }

  // 更新数量
  packagingData.FZquantity = Math.floor(productsQuantity)
  detail.Quantity2 = reCompute(detail)
  //如果累计实发超过对应发数量，调用删除
  // if (detail.Quantity2 > detail.canReceive) {
  //   let deleteBarcode = {
  //     item: detail.barcodeList[detail.barcodeList.length - 1],
  //     index: detail.barcodeList.length - 1
  //   }
  //   emitter.emit('deleteBarcode', deleteBarcode)
  // }
}

// 工具函数：显示提示
const showToast = (title: string) => {
  uni.showToast({ title, icon: 'none' })
  reactiveData.searchValue = ''
  focusTm()
}

// 工具函数：重置搜索字段
const resetSearchField = () => {
  reactiveData.searchValue = ''
  focusTm()
}

const focusTm = () => {
  reactiveData.focus = 0
  setTimeout(() => {
    reactiveData.focus = 99
  }, 200)
}

//重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  val.FZLOTList.forEach((item: any) => {
    sum += val.packagingDataFZLOT[item].FZquantity
  })
  return sum
}
const hideTimer = ref<number | null>(null)
const handleFocus = () => {
  // 总是先清除已存在的定时器，再创建新的
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
  }

  hideTimer.value = setInterval(() => {
    uni.hideKeyboard()
  }, 50) as unknown as number
}

const clearTimer = () => {
  // 清除定时器
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
    hideTimer.value = null
  }
  console.log('清除定时器', hideTimer.value)
}

useEmitt({
  name: 'update:handleFocus',
  callback: async () => {
    console.log('设置定时器')
    handleFocus()
  }
})
useEmitt({
  name: 'update:clearTimer',
  callback: async () => {
    console.log('清除定时器')
    clearTimer()
  }
})
onBeforeMount(() => {
  // 组件挂载前的逻辑
  handleFocus()
})
onBeforeUnmount(() => {
  // 组件卸载时清理
  console.log('离开')
  clearTimer()
})
</script>

<template>
  <view>
    <!-- 订单号搜索 -->
    <view class="flex items-center pb-20rpx bg-#f2f2f2">
      <view class="w-50px flex justify-center"> 条码 </view>
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
      <view class="w-50px flex justify-center">单号</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.documentNumber"
          :showAction="false"
          :focus="reactiveData.focus == 1"
          :disabled="true"
          shape="round"
          placeholder=""
        />
      </view>
    </view>
  </view>
</template>
