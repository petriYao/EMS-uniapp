<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { pushClient } from '@/api/modules/transferOrder'
import { TMUpdate } from '@/api/commonHttp'
import { SubmitClient, AuditApiClient } from '@/api/modules/user'
import { TMStatusQuery } from '@/api/commonHttp'

const reactiveData = reactive({
  detailsList: [] as any,
  locationList: [],
  setData: {} as any,
  loading: true
})

//保存
const saveClick = async () => {
  console.log('保存1', reactiveData.detailsList)
  console.log('保存2', reactiveData.setData)
  if (reactiveData.detailsList.length == 0) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  //判断条码入库状态
  let barcodeList = []
  for (const item of reactiveData.detailsList) {
    barcodeList = item.barCodeList.map((item: any) => {
      return item.F_BARCODENO
    })
  }
  console.log('条码值', barcodeList)
  const tmStatusRes: any = await TMStatusQuery({
    barcodes: barcodeList,
    status: '1'
  })
  console.log('tmStatusRes', tmStatusRes)
  if (tmStatusRes && tmStatusRes.data && tmStatusRes.data.length > 0) {
    //条码状态不为1的提示
    uni.showToast({
      title: `编码${tmStatusRes.data[0]['material_fnumber']}中，条码${tmStatusRes.data[0]['FNUMBER']}不为创建状态`,
      icon: 'none',
      duration: 5000
    })
    reactiveData.loading = false
    return
  }

  reactiveData.detailsList.map(async (item: any, index: number) => {
    console.log('item', item.isInteger, item)
    if (!item.isInteger && item.barCodeList.length > 0) {
      //条码不是整数的提示
      uni.showToast({
        title: `第${index + 1}行不配套`,
        icon: 'none'
      })
      return
    }
  })
  return
  /**************************开始保存*************************/
  reactiveData.loading = false
  const CustomParams = {
    FEntry: [] as any,
    Numbers: [] as any
  }
  for (const item of reactiveData.detailsList) {
    CustomParams.Numbers.push(item.SourceOrderLineId)
    CustomParams.FEntry.push({
      FENTRYID: item.SourceOrderLineId, //源单行ID
      FStockID: reactiveData.setData.warehouseId, //库存ID
      FStockLocID: item.FStockLocId, //仓位ID
      FRealQty: item.Quantity2, //实际数量
      lot: item.detailList.lot, //批号
      F_QADV_WGTMSubEntity: item.barCodeList //条码列表
    })
  }
  //保存
  CustomParams.Numbers = Array.from(new Set(CustomParams.Numbers))
  let EntryIds = CustomParams.Numbers.map((item: any) => item).join(',')
  console.log('CustomParams', JSON.stringify(CustomParams.FEntry))
  const res = await pushClient(EntryIds, CustomParams.FEntry)
  console.log('保存结果', res)
  if (res && res.data.Result.ResponseStatus.ErrorCode === 500) {
    uni.showToast({
      icon: 'none',
      title: res.data.Result.ResponseStatus.Errors[0].Message,
      duration: 5000
    })
    reactiveData.loading = true
    return
  }
  if (res && res.data) {
    let numbers = res.data.Result.ResponseStatus.SuccessEntitys[0].Number
    //提交审核
    await SubmitClient('STK_InStock', numbers)
    const res2: any = await AuditApiClient('STK_InStock', numbers)
    if (res2 && res2.data.Result.ResponseStatus.ErrorCode === 500) {
      uni.showToast({
        icon: 'none',
        title: res2.data.Result.ResponseStatus.Errors[0].Message,
        duration: 5000
      })
      reactiveData.loading = true
      return
    }
    for (const item of reactiveData.detailsList) {
      const tmList = item.barCodeList.map((item: any) => item.F_BARCODENO)
      TMUpdate({
        barcodes: tmList,
        warehouse: reactiveData.setData.warehouseId,
        location: item.FStockLocId,
        documentNumber: numbers,
        documentType: '采购入库单',
        status: '2'
      })
    }

    reactiveData.detailsList = []

    uni.showToast({
      icon: 'none',
      title: '保存成功',
      duration: 5000
    })
  }
  reactiveData.loading = true
}

//暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <!-- 扫描条码 -->
  <view class="bg-#FFF">
    <HeadScan
      v-model:detailsList="reactiveData.detailsList"
      v-model:setData="reactiveData.setData"
      v-model:locationList="reactiveData.locationList"
      v-model:loading="reactiveData.loading"
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF pt-6rpx" v-if="reactiveData.loading">
    <LowerCamelCase
      v-model:detailsList="reactiveData.detailsList"
      v-model:locationList="reactiveData.locationList"
    />
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
