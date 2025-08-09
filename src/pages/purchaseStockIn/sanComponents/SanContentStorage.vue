<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { savePurchaseOrder } from '@/api/modules/transferOrder'

const reactiveData = reactive({
  detailsList: [] as any,
  locationList: [],
  setData: {} as any,
  barcodeIndex: 0,
  loading: true,
  isShow: true
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
  reactiveData.loading = false
  const Model = {
    FID: reactiveData.setData.fid,
    FInStockEntry: [] as any
  }
  const FStockLocPJ = 'FSTOCKLOCID__' + reactiveData.setData.FlexNumber

  for (const item of reactiveData.detailsList) {
    const FStockLocId = {} as any
    FStockLocId[FStockLocPJ] = {
      FNumber: item.WarehousePosition
    }
    console.log('FStockLocId', item, FStockLocId)
    Model.FInStockEntry.push({
      FEntryID: item.entryId,
      FRealQty: item.Quantity2,
      FPriceUnitQty: item.Quantity2,
      FRemainInStockQty: item.Quantity2,
      FBaseUnitQty: item.Quantity2,
      FPriceBaseQty: item.Quantity2,
      FRemainInStockBaseQty: item.Quantity2,
      FAPNotJoinQty: item.Quantity2,
      FStockId: {
        FNumber: reactiveData.setData.warehouseNumber
      },
      FStockLocId: FStockLocId
    })
  }
  console.log('保存3', Model)
  const res = await savePurchaseOrder(Model)
  if (res && res.data && res.data?.Result?.Number) {
    uni.showToast({
      icon: 'none',
      title: '提交成功'
    })
    //清空
    reactiveData.isShow = false //隐藏标题组件
    setTimeout(() => {
      reactiveData.isShow = true //显示标题组件
    }, 500)
    reactiveData.detailsList = []
    reactiveData.barcodeIndex = 0
    reactiveData.setData = {}
  } else {
    uni.showToast({
      icon: 'none',
      title: res.data?.Result?.ResponseStatus?.Errors[0].Message,
      duration: 5000
    })
  }
  console.log('保存', res)
  reactiveData.loading = true
}

//暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <!-- 扫描条码 -->
  <view class="bg-#FFF" v-if="reactiveData.isShow">
    <HeadScan
      v-model:detailsList="reactiveData.detailsList"
      v-model:setData="reactiveData.setData"
      v-model:locationList="reactiveData.locationList"
      v-model:barcodeIndex="reactiveData.barcodeIndex"
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF" v-if="reactiveData.loading">
    <LowerCamelCase
      v-model:detailsList="reactiveData.detailsList"
      v-model:locationList="reactiveData.locationList"
      v-model:barcodeIndex="reactiveData.barcodeIndex"
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
