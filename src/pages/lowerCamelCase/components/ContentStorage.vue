<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { SalesOutboundType } from '@/types/LowerCamelCaseType'

const props = defineProps({
  containerNoValue: {
    //柜号
    type: Number,
    default: 0
  },

  pickupOrderValue: {
    //单号
    type: String,
    default: ''
  }
})

//总界面缓存
const pageLoading = ref(false)

//数据
const reactiveData = reactive({
  Numbers: '', //单号
  lowerCamelCaseList: [] as SalesOutboundType[], //明细值
  model: {} as any,
  containerNoValue: 1, //分柜号
  loading: false
})

//保存
const saveClick = async () => {
  console.log('保存1', reactiveData.model)
  console.log('保存2', reactiveData.lowerCamelCaseList)
  if (reactiveData.lowerCamelCaseList.length === 0) {
    uni.showToast({
      title: '请先扫码',
      icon: 'none'
    })
    return
  }
  let model = reactiveData.model
  model.FEntity = []
  let isError = false //是否有错误

  await Promise.all(
    reactiveData.lowerCamelCaseList.map(async (item, index) => {
      console.log('item', item.isInteger, item)
      if (!item.isInteger && item.barcodeList.length > 0) {
        throw new Error(`第${index + 1}行不配套`)
      }
    })
  ).catch((error) => {
    isError = true //有错误
    console.error(`处理项出错:`, error)
    uni.showToast({
      title: error.message,
      icon: 'none'
    })
    return null
  })
  //循环出入明细数据(当条码中，仓库或者仓位不同时，分为多个明细)
  const processedData = groupbarcodeLists(reactiveData.lowerCamelCaseList)
  await Promise.all(
    processedData.result.map(async (item) => {
      if (item.currentTotal > 0) {
        if (item.cumulativeActualSend > item.shouldSendQuantity) {
          throw new Error('出库数量大于应发数量')
        }

        let FEntity_model = item.FEntity_model
        /** */
        /**仓库仓位 */
        FEntity_model.FStockID.FNumber = item.barcodeList[0].FSTOCKNumber
        FEntity_model.FStockLocId = item.barcodeList[0].FStockLocId
        /**数量 */
        let FZLOTList = [] as any
        let packagingDataFZLOT = {} as any

        let XSCKSubEntity = [] as any //条码
        let FRealQty = 0 //本次总额

        //循环条码表
        item.barcodeList.forEach((barcodeItem: any) => {
          //分装情况下
          if (item.IsSplit) {
            const index2 = FZLOTList.findIndex((FZLOTList_item: any) => {
              return FZLOTList_item === barcodeItem.FZLOT
            })
            if (index2 === -1) {
              //当生成批次号第一次出现时
              FZLOTList.push(barcodeItem.FZLOT)
              packagingDataFZLOT[barcodeItem.FZLOT] = {
                packagingSig: [],
                packagingData: {},
                FZquantity: 0
              }
              packagingDataFZLOT[barcodeItem.FZLOT].packagingSig =
                item.packagingDataFZLOT[barcodeItem.FZLOT].packagingSig

              packagingDataFZLOT[barcodeItem.FZLOT].packagingSig.forEach(
                (packagingSig_item: any) => {
                  packagingDataFZLOT[barcodeItem.FZLOT].packagingData[packagingSig_item] = {
                    quantity: 0,
                    unitQty: 0,
                    finishedQty: 0
                  }
                }
              )
              packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                barcodeItem.subPackageNo
              ].quantity += barcodeItem.quantity

              packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                barcodeItem.subPackageNo
              ].unitQty = barcodeItem.unitQuantity
              packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                barcodeItem.subPackageNo
              ].finishedQty = barcodeItem.quantity / barcodeItem.unitQuantity

              packagingDataFZLOT[barcodeItem.FZLOT].FZquantity =
                packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                  barcodeItem.subPackageNo
                ].finishedQty
            } else {
              //生成批次号不是第一次出现时
              packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                barcodeItem.subPackageNo
              ].quantity += barcodeItem.quantity
              packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                barcodeItem.subPackageNo
              ].unitQty = barcodeItem.unitQuantity
              packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                barcodeItem.subPackageNo
              ].finishedQty =
                packagingDataFZLOT[barcodeItem.FZLOT].packagingData[barcodeItem.subPackageNo]
                  .quantity /
                packagingDataFZLOT[barcodeItem.FZLOT].packagingData[barcodeItem.subPackageNo]
                  .unitQty

              packagingDataFZLOT[barcodeItem.FZLOT].FZquantity =
                packagingDataFZLOT[barcodeItem.FZLOT].packagingData[
                  barcodeItem.subPackageNo
                ].finishedQty
            }
          } else {
            FRealQty += barcodeItem.quantity
          }
          //给条码赋值
          XSCKSubEntity.push({
            F_BARCODENO: barcodeItem.FNumber, //条码编号
            F_UNITQTY: barcodeItem.quantity, //每箱数量
            F_FZNO: barcodeItem.subPackageNo, //分装编号
            F_BJNAME: barcodeItem.partNumberName, //部件名称
            // F_QADV_NBZQTY: barcodeItem., //内包装件数
            F_JUNITQTY: barcodeItem.unitQuantity, //部件用量
            F_QADV_FZLOT: barcodeItem.FZLOT //分装批次号
          })
        })
        if (item.IsSplit) {
          FZLOTList.forEach((FZLOTList_item: any) => {
            FRealQty += packagingDataFZLOT[FZLOTList_item].FZquantity
          })
        }
        //柜号
        FEntity_model.F_QADV_FGH = reactiveData.containerNoValue
        FEntity_model.FRealQty = FRealQty
        FEntity_model.FEntity_Link[0].FEntity_Link_FBaseUnitQty = FRealQty
        FEntity_model.FEntity_Link[0].FEntity_Link_FPriceBaseQty = FRealQty
        FEntity_model.FEntity_Link[0].FEntity_Link_FSalBaseQty = FRealQty
        FEntity_model.F_QADV_XSCKSubEntity = XSCKSubEntity //条码列表
        FEntity_model['FLot'] = { FNumber: item.barcodeList[0].FLot }

        model.FEntity.push(FEntity_model)
      }
    })
  ).catch((error) => {
    isError = true //有错误
    console.error(`处理项出错:`, error)
    uni.showToast({
      title: error.message,
      icon: 'none'
    })
    return null
  })
  console.log('保存4', model.FEntity.length)

  if (model.FEntity.length === 0 && isError === false) {
    isError = true //有错误
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
  }
  console.log('拆分后的条码列表:', processedData)
  console.log('保存5', model)
  return {
    model: model,
    lowerCamelCaseList: reactiveData.lowerCamelCaseList,
    isError,
    Numbers: reactiveData.Numbers,
    containerNoValue: reactiveData.containerNoValue,
    ThFilter: processedData.ThFilter
  }
}
// 处理数据函数
function groupbarcodeLists(data: any[]) {
  const result: any[] = []
  let ThFilterString = `` //提货单过滤
  let ThFilter2 = 0 //明细数量

  let tmList = [] as any //条码列表
  //储存单据行的ID跟数量
  let EntryIds = [] as any
  for (const item of data) {
    if (item.barcodeList.length === 0) {
      // 如果barcodeList为空，直接添加到结果
      result.push(item)
      continue
    }
    ThFilterString += `(d.FENTRYID = '${item.id}' AND  ${item.currentTotal} > d.F_QADV_WCYQTY ) OR `
    ThFilter2++
    EntryIds.push({
      id: item.id,
      quantity: item.currentTotal
    })
    // 创建一个Map来分组相同FSTOCKName和STOCKLOCName的条目
    const groupMap = new Map<string, any[]>()

    for (const barcode of item.barcodeList) {
      tmList.push(barcode.FNumber)
      const key = `${barcode.FSTOCKName}_${barcode.STOCKLOCName}`

      if (!groupMap.has(key)) {
        groupMap.set(key, [])
      }
      groupMap.get(key)?.push(barcode)
    }

    // 如果所有条目的FSTOCKName和STOCKLOCName都相同，直接添加原始项
    if (groupMap.size === 1) {
      result.push(item)
    } else {
      // 否则为每个分组创建一个新的数据项副本
      for (const [key, barcodes] of groupMap) {
        const newItem = JSON.parse(JSON.stringify(item)) as any
        newItem.barcodeList = barcodes
        result.push(newItem)
      }
    }
  }
  if (ThFilterString.length > 0) {
    //删除最后的OR
    ThFilterString = ThFilterString.substring(0, ThFilterString.length - 3)
  }
  let ThFilter = {
    filtersString: ThFilterString,
    ThFilterNum: ThFilter2,
    EntryIds,
    tmList
  }

  return { result, ThFilter }
}

onBeforeMount(() => {
  reactiveData.containerNoValue = props.containerNoValue
  reactiveData.Numbers = props.pickupOrderValue
})

//暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <view>
    <u-loading-page :loading="pageLoading" />
  </view>
  <!-- 扫描条码 -->
  <view class="bg-#FFF">
    <HeadScan
      v-model:lowerCamelCaseList="reactiveData.lowerCamelCaseList"
      v-model:loading="reactiveData.loading"
      v-model:model="reactiveData.model"
      v-model:containerNoValue="reactiveData.containerNoValue"
      v-model:numbers="reactiveData.Numbers"
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF">
    <LowerCamelCase v-model:lowerCamelCaseList="reactiveData.lowerCamelCaseList" />
  </view>
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
