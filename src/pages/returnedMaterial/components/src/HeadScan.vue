<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { purchaseScanBarcode, getcamelCase } from '@/common/materialWithdrawal/Index'
import { getSimple } from '@/common/materialWithdrawal/Simple'
import { getOutsourcing } from '@/common/materialWithdrawal/Outsourced'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

// 数据
const reactiveData = reactive({
  searchValue: '', // 搜索值
  documentNumber: '', // 单号
  fid: '', // 单号ID
  focus: 99,
  detailsList: [] as any
})

const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:fid', modelValue: any): void
}>()

const { emitter } = useEmitt()

const searchInput = ref()

// 扫码获取数据
const searchClick = async () => {
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  if (res) {
    reactiveData.searchValue = res.result
    searchChange()
  }
}

// 防抖搜索
const searchChange = debounce(async () => {
  if (!reactiveData.searchValue) return
  handleFocus()
  try {
    if (!reactiveData.documentNumber) {
      await handleDocumentSearch()
    } else {
      await handleBarcodeScan()
    }
  } catch (error) {
    console.error('处理过程中出错:', error)
  } finally {
    resetSearchField()
  }
}, 500)

// 单据查询处理
const handleDocumentSearch = async () => {
  let queryRes: any = {}
  switch (props.title) {
    case '生产领料':
      queryRes = await getcamelCase(reactiveData.searchValue)
      break
    case '简单生产领料':
      queryRes = await getSimple(reactiveData.searchValue)
      break
    case '委外领料':
      queryRes = await getOutsourcing(reactiveData.searchValue)
      break
  }

  if (!queryRes?.dataList?.length) {
    // showToast('未找到相关单据')
    return
  }

  reactiveData.documentNumber = reactiveData.searchValue
  reactiveData.detailsList = queryRes.dataList
  reactiveData.fid = queryRes.fid
  emit('update:fid', reactiveData.fid)
  emit('update:detailsList', reactiveData.detailsList)
}

// 获取所有匹配的明细项（用于扫码时多匹配处理）
const findMatchingDetails = (queryRes: any): any[] => {
  return reactiveData.detailsList.filter((item: any) => {
    return item.MaterialCode === queryRes.MaterialCode && item.Lot === queryRes.Lot
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

  // 行剩余可接收的成品套数
  const lotListNow: string[] = Array.isArray(detail.FZLOTList) ? detail.FZLOTList : []
  const producedSoFar = lotListNow.reduce(
    (sum, lot) => sum + (detail.packagingDataFZLOT?.[lot]?.FZquantity || 0),
    0
  )
  const remainingKits = Math.max(0, detail.canReceive - producedSoFar)
  const incomingKits = (splitValue || 0) / (unitQty || 1)

  // 1) 快速拦截：单组件本次贡献超过剩余套数
  if (incomingKits > remainingKits) return false

  // 2) 快速拦截：同一组件(按 SplitCode)在全部 FZLOT 上累计的 finishedQty 不得超过 canReceive
  let existingComponentKits = 0
  lotListNow.forEach((lot) => {
    const pack = detail.packagingDataFZLOT?.[lot]
    if (pack?.packagingData?.[splitCode]) {
      existingComponentKits += Number(pack.packagingData[splitCode].finishedQty || 0)
    }
  })
  if (existingComponentKits + incomingKits > detail.canReceive) return false

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

  // 计算该 FZLOT 的成品数量（与 calculateProductsQuantity 逻辑一致）
  const packagingSig: string[] = simulatedPackagingByLot[fzlot].packagingSig || []
  // 若任何分装位为 0，则该 lot 的成套数为 0
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

  // 按 reCompute 规则，汇总全部 FZLOT 的 FZquantity，但将当前 fzlot 替换为模拟值
  let simulatedQuantity2 = 0
  simulatedFZLOTList.forEach((lot) => {
    if (lot === fzlot) {
      simulatedQuantity2 += simFZquantity
    } else {
      simulatedQuantity2 += detail.packagingDataFZLOT?.[lot]?.FZquantity || 0
    }
  })

  return simulatedQuantity2 <= detail.canReceive
}

// 条码扫描处理
const handleBarcodeScan = async () => {
  let queryRes: any = {}
  queryRes = await purchaseScanBarcode(reactiveData.searchValue)

  console.log('queryRes', queryRes)

  if (!queryRes) {
    // showToast('无效条码')
    return
  }
  const matchingDetails = findMatchingDetails(queryRes)
  if (!matchingDetails.length) {
    showToast('条码与明细不符合')
    return
  }

  let matched = false

  for (const detail of matchingDetails) {
    const index = reactiveData.detailsList.indexOf(detail)

    if (isBarcodeDuplicate(index, queryRes.BarCode)) {
      showToast('请勿重复扫描')
      return
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
    showToast('实领数量大于应领数量')
  } else {
    emit('update:detailsList', reactiveData.detailsList)
  }
}

// 检查条码是否重复
const isBarcodeDuplicate = (index: number, barcode: string): boolean => {
  return reactiveData.detailsList[index].barcodeList.some((item: any) => item.FNumber === barcode)
}

// 更新明细项数据
const updateDetailItem = (index: number, queryRes: any) => {
  const detail = reactiveData.detailsList[index]

  detail.isLowerCamelCase = false
  detail.IsSplit = queryRes.IsSplit

  detail.barcodeList.push(queryRes.barcodeList)
  detail.Quantity++

  switch (props.title) {
    case '生产领料':
    case '委外领料':
    case '简单生产领料':
      detail.currentList[7].value = queryRes.F_POQTY
      detail.currentList[9].value = queryRes.TotalBox
      break
  }

  emitter.emit('update:datailsIndex', index)

  if (detail.IsSplit) {
    handleSplitPackage(detail, queryRes)
    console.log('分装逻辑处理', detail)
  } else {
    detail.Quantity2 += queryRes.Quantity2
    detail.isInteger = true
  }
  console.log('更新明细项数据', detail.Quantity2)
  if (detail.Quantity2 > detail.canReceive) {
    uni.showToast({ title: '实领数量大于应领数量', icon: 'none' })
  }
}

// 处理分装逻辑
const handleSplitPackage = (detail: any, queryRes: any) => {
  const fzlot = queryRes.FZLOTList[0]

  if (!detail.FZLOTList || !detail.FZLOTList.includes(fzlot)) {
    detail.FZLOTList.push(fzlot)
    detail.packagingDataFZLOT[fzlot] = queryRes.packagingDataFZLOT[fzlot]
    detail.packagingDataFZLOT[fzlot].packagingData[queryRes.SplitCode] = {
      quantity: 0,
      unitQty: queryRes.unitQty,
      finishedQty: 0
    }
  }

  const packagingData = detail.packagingDataFZLOT[fzlot].packagingData[queryRes.SplitCode]

  packagingData.quantity += queryRes.SplitValue
  packagingData.unitQty = queryRes.unitQty
  packagingData.finishedQty = packagingData.quantity / packagingData.unitQty

  const productsQuantity = calculateProductsQuantity(detail, fzlot)
  console.log('productsQuantity', fzlot)
  updatePackageStatus(detail, fzlot, productsQuantity)
}

// 计算成品数量
const calculateProductsQuantity = (detail: any, fzlot: string): number => {
  const packagingData = detail.packagingDataFZLOT[fzlot]

  for (const key of packagingData.packagingSig) {
    const qty = Number(packagingData.packagingData[key]?.finishedQty || 0)
    if (qty === 0) return 0
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

  const isInteger = productsQuantity > 0 && productsQuantity % 1 === 0
  console.log('数量1', detail)
  packagingData.isInteger = isInteger
  detail.isInteger = isInteger
  console.log('分装状态3', isInteger)
  if (isInteger) {
    packagingData.packagingSig.forEach((key: string) => {
      console.log('数量2', packagingData.packagingData[key]?.finishedQty)
      if (packagingData.packagingData[key]?.finishedQty !== productsQuantity) {
        packagingData.isInteger = false
        detail.isInteger = false
      }
    })
  }

  //判断是否全部都是整数
  detail.FZLOTList.forEach((key: string) => {
    if (!detail.packagingDataFZLOT[key].isInteger) {
      detail.isInteger = false
    }
  })

  packagingData.FZquantity = Math.floor(productsQuantity)
  detail.Quantity2 = reCompute(detail)

  // 分装情况下，扫码后立即重新计算并判断是否超量
  if (detail.IsSplit && detail.Quantity2 > detail.canReceive) {
    uni.showToast({ title: '实领数量大于应领数量', icon: 'none' })
  }
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

// 防抖函数
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const focusTm = () => {
  reactiveData.focus = 0
  setTimeout(() => {
    reactiveData.focus = 99
  }, 200)
}

// 重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  if (val.IsSplit) {
    val.FZLOTList.forEach((item: any) => {
      sum += val.packagingDataFZLOT[item]?.FZquantity || 0
    })
  } else {
    sum = val.Quantity2
  }
  return sum
}

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

useEmitt({
  name: 'update:handleFocus',
  callback: async () => {
    handleFocus()
  }
})

useEmitt({
  name: 'update:clearTimer',
  callback: async () => {
    clearTimer()
  }
})

onBeforeMount(() => {
  handleFocus()
})

onBeforeUnmount(() => {
  clearTimer()
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
