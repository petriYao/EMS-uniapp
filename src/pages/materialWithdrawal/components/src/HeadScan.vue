<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { purchaseScanBarcode, getcamelCase } from '@/common/materialWithdrawal/Index'
import { otherScanBarcode, getOtherCase } from '@/common/returnMaterial/OtherOutbound'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

// 数据
const reactiveData = reactive({
  searchValue: 'SOUT00000002', // 搜索值
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
    case '其他出库':
      queryRes = await getOtherCase(reactiveData.searchValue)
      break
  }

  if (!queryRes?.dataList?.length) {
    showToast('未找到相关单据')
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

// 条码扫描处理
const handleBarcodeScan = async () => {
  let queryRes: any = {}
  switch (props.title) {
    case '生产领料':
      queryRes = await purchaseScanBarcode(reactiveData.searchValue)
      break
    case '其他出库':
      queryRes = await otherScanBarcode(reactiveData.searchValue)
      return
  }

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
      continue
    }

    const newQty = detail.Quantity2 + queryRes.Quantity2
    if (newQty > detail.canReceive) {
      continue
    }

    updateDetailItem(index, queryRes)

    // 分装情况下，扫码后立即重新计算并判断是否超量
    if (detail.IsSplit) {
      const totalQty = reCompute(detail)
      if (totalQty > detail.canReceive) {
        showToast('累计实发超过对应发数量1')

        // 删除最后一条条码并获取信息
        const deletedBarcode = detail.barcodeList.splice(detail.barcodeList.length - 1, 1)[0]

        console.log('删除的条码', deletedBarcode)
        const fzlot = deletedBarcode.FZLOT
        const splitCode = queryRes.SplitCode

        // ✅ 重新计算受影响的 SplitCode 的 quantity 和 finishedQty
        const packagingData = detail.packagingDataFZLOT[fzlot]?.packagingData
        if (packagingData && packagingData[splitCode]) {
          const newQuantity = detail.barcodeList
            .filter((barcode: any) => barcode.FZLOT === fzlot && barcode.subPackageNo === splitCode)
            .reduce((sum: number, barcode: any) => sum + barcode.quantity, 0)

          packagingData[splitCode].quantity = newQuantity
          packagingData[splitCode].finishedQty = newQuantity / packagingData[splitCode].unitQty
        }

        // ✅ 重新计算该分装批次的 FZquantity
        const productsQuantity = calculateProductsQuantity(detail, fzlot)
        detail.packagingDataFZLOT[fzlot].FZquantity = Math.floor(productsQuantity)

        // ✅ 重新计算 isInteger
        updatePackageStatus(detail, fzlot, productsQuantity)
        // ✅ 重新计算总数量
        detail.Quantity2 = reCompute(detail)
        continue
      }
    }

    matched = true
    break
  }

  if (!matched) {
    showToast('累计实发超过对应发数量2')
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
      detail.currentList[7].value = queryRes.F_POQTY
      detail.currentList[9].value = queryRes.TotalBox
      break
    case '其他出库':
      detail.currentList[6].value = queryRes.F_POQTY
      detail.currentList[8].value = queryRes.TotalBox
      break
  }

  emitter.emit('update:datailsIndex', index)

  if (detail.IsSplit) {
    handleSplitPackage(detail, queryRes)
  } else {
    detail.Quantity2 += queryRes.Quantity2
    detail.isInteger = true
  }
  console.log('更新明细项数据', detail.Quantity2)
  if (detail.Quantity2 > detail.canReceive) {
    uni.showToast({ title: '实发数量大于可发数量', icon: 'none' })
  }
}

// 处理分装逻辑
const handleSplitPackage = (detail: any, queryRes: any) => {
  const fzlot = queryRes.FZLOTList[0]

  if (!detail.FZLOTList.includes(fzlot)) {
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
  packagingData.isInteger = isInteger
  detail.isInteger = isInteger

  if (isInteger) {
    packagingData.packagingSig.forEach((key: string) => {
      if (packagingData.packagingData[key]?.finishedQty !== productsQuantity) {
        packagingData.isInteger = false
        detail.isInteger = false
      }
    })
  }

  packagingData.FZquantity = Math.floor(productsQuantity)
  detail.Quantity2 = reCompute(detail)

  // 分装情况下，扫码后立即重新计算并判断是否超量
  if (detail.IsSplit && detail.Quantity2 > detail.canReceive) {
    uni.showToast({ title: '实发数量大于可发数量2', icon: 'none' })
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
