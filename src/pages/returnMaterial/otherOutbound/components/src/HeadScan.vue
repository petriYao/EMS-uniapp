<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { purchaseScanBarcode, getcamelCase } from '@/common/returnMaterial/Index'
// import { queryBarCode } from '@/api/modules/lowerCamelCase'
import { useEmitt } from '@/hooks/useEmitt'

//数据
const reactiveData = reactive({
  searchValue: 'CGTL000011', //搜索值
  documentNumber: '', //单号
  focus: 1,
  //单号
  detailsList: [] as any
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:setData', modelValue: any): void
  (e: 'update:locationList', modelValue: any): void
}>()
const { emitter } = useEmitt()

const searchInput = ref()
//扫码获取数据
const searchClick = async () => {
  //uniapp打开扫码
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  console.log('扫码结果', res)
  if (res) {
    reactiveData.searchValue = res.result
    searchChange()
    // searchInput.value.setValue(res.result)
    // searchChange()
  }
}

//扫描条码
const searchChange = () => {
  console.log('搜索值', reactiveData.searchValue)
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    handleFocus()
    //调用条码（单据查询）
    if (reactiveData.documentNumber === '') {
      const queryRes: any = await getcamelCase(reactiveData.searchValue)
      console.log('查询结果', queryRes)
      if (!queryRes || queryRes.dataList.length === 0) {
        reactiveData.searchValue = ''
        focusTm()
        return
      }
      reactiveData.documentNumber = reactiveData.searchValue
    } else {
      const queryRes: any = await purchaseScanBarcode(reactiveData.searchValue)
      console.log('查询结果', queryRes)
      if (!queryRes) {
        reactiveData.searchValue = ''
        focusTm()
        return
      }
      if (reactiveData.detailsList.length > 0) {
        const index = reactiveData.detailsList.findIndex((item: any) => {
          console.log('判断之前是否有一样的', item, queryRes)
          return (
            item.MaterialCode === queryRes.MaterialCode &&
            item.SourceOrderNo === queryRes.SourceOrderNo &&
            item.SourceOrderLineNo === queryRes.SourceOrderLineNo
          )
        })
        if (index !== -1) {
          //判断是否重复扫描
          if (
            reactiveData.detailsList[index].barCodeList.some(
              (item: any) => item.F_BARCODENO === queryRes.BarCode
            )
          ) {
            uni.showToast({
              title: '请勿重复扫描',
              icon: 'none'
            })
            reactiveData.searchValue = ''
            focusTm()
            return
          }

          reactiveData.detailsList[index].barCodeList.push(queryRes.barCodeList[0]) //条码
          reactiveData.detailsList[index].Quantity++ //件数
          emitter.emit('update:datailsIndex', index)
          if (reactiveData.detailsList[index].IsSplit) {
            //分装的情况下
            //判断源数据是否有相同的分装批号，有则跳过，无则push
            const index2 = reactiveData.detailsList[index].FZLOTList.findIndex((item: any) => {
              return item === queryRes.FZLOTList[0]
            })
            console.log('选中的明细1', index2)
            if (index2 === -1) {
              reactiveData.detailsList[index].FZLOTList.push(queryRes.FZLOTList[0])

              reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]] =
                queryRes.packagingDataFZLOT[queryRes.FZLOTList[0]]

              reactiveData.detailsList[index].packagingDataFZLOT[
                queryRes.FZLOTList[0]
              ].packagingData[queryRes.SplitCode]['quantity'] = 0
            }

            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
              queryRes.SplitCode
            ]['quantity'] += queryRes.SplitValue //数量
            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
              queryRes.SplitCode
            ]['unitQty'] = queryRes.UnitQty //单位用量
            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
              queryRes.SplitCode
            ]['finishedQty'] =
              reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]]
                .packagingData[queryRes.SplitCode]['quantity'] / queryRes.UnitQty
            //判断是否有成品
            const packagingSig =
              reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingSig
            let hasZero = false
            let minNonZero = Infinity

            packagingSig.forEach((item: any) => {
              const sum = Number(
                reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]]
                  .packagingData[item].finishedQty
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
            //判断productsQuantity是否为整数
            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].isInteger =
              productsQuantity % 1 === 0 && productsQuantity !== 0

            reactiveData.detailsList[index].isInteger =
              productsQuantity % 1 === 0 && productsQuantity !== 0
            console.log('isInteger1', reactiveData.detailsList[index], queryRes.FZLOTList[0])
            console.log(
              'isInteger1',
              reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]]
            )
            if (
              reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].isInteger
            ) {
              reactiveData.detailsList[index].packagingDataFZLOT[
                queryRes.FZLOTList[0]
              ].packagingSig.forEach((element: any) => {
                if (
                  reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]]
                    .packagingData[element].finishedQty !== productsQuantity
                ) {
                  reactiveData.detailsList[index].packagingDataFZLOT[
                    queryRes.FZLOTList[0]
                  ].isInteger = false
                  reactiveData.detailsList[index].isInteger = false
                  return
                }
              })
            }

            //计算单分装数量
            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].FZquantity =
              Math.floor(productsQuantity)

            //计算总数量
            reactiveData.detailsList[index].Quantity2 = reCompute(reactiveData.detailsList[index])
          } else {
            console.log('未封装新增', reactiveData.detailsList[index])
            reactiveData.detailsList[index].Quantity2 += queryRes.Quantity2
            reactiveData.detailsList[index].isInteger = true //是否整数
          }
        } else {
          //判断条码是否重复扫
          const scannedBarcodes = new Set(
            reactiveData.detailsList.flatMap((item: { barCodeList: any[] }) =>
              item.barCodeList.map((item2: { [x: string]: any }) => item2['F_BARCODENO'])
            )
          )
          if (scannedBarcodes.has(reactiveData.searchValue)) {
            uni.showToast({
              title: '请勿重复扫描',
              icon: 'none'
            })
            reactiveData.searchValue = ''
            focusTm()
            return
          }
          console.log('重复', scannedBarcodes, scannedBarcodes.has(reactiveData.searchValue))
          reactiveData.detailsList.push(queryRes)
          emitter.emit('update:datailsIndex', reactiveData.detailsList.length - 1)
        }
      } else {
        reactiveData.detailsList.push(queryRes)
        emitter.emit('update:datailsIndex', 0)
      }
    }

    emit('update:detailsList', reactiveData.detailsList)

    reactiveData.searchValue = ''
    focusTm()
  }, 500)
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
  // 设置定时器
  if (!hideTimer.value) {
    hideTimer.value = setInterval(() => {
      uni.hideKeyboard()
    }, 50) as unknown as number
  }
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
      <view class="w-50px flex justify-center">仓库</view>
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
