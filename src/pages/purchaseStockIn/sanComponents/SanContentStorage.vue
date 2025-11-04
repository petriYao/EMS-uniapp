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

const emit = defineEmits<{
  (e: 'update:loading', modelValue: any): void
}>()

//保存
const saveClick = async () => {
  if (reactiveData.detailsList.length == 0) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  emit('update:loading', false)
  const Model = {
    FID: reactiveData.setData.fid,
    FInStockEntry: [] as any
  }
  const FStockLocPJ = 'FSTOCKLOCID__' + reactiveData.setData.FlexNumber

  let i = 0
  for (const item of reactiveData.detailsList) {
    console.log('item2', item.detailList.priceUnitQty)
    if (!item.isUnit && item.Quantity2 > 0 && item.detailList.priceUnitQty == 0) {
      uni.showToast({
        title: `第${i + 1}行计价数量应大于0`,
        icon: 'none'
      })
      emit('update:loading', true)
      return
    }
    i++

    const FStockLocId = {} as any
    FStockLocId[FStockLocPJ] = {
      FNumber: item.WarehousePosition
    }

    let FInStock = {
      FEntryID: item.entryId,
      FRealQty: item.Quantity2,
      // FRemainInStockQty: item.Quantity2,
      // FBaseUnitQty: item.Quantity2,
      FPriceUnitQty:
        item.detailList.priceUnitQty === 0 ? item.Quantity2 : item.detailList.priceUnitQty,
      FStockId: {
        FNumber: reactiveData.setData.warehouseNumber
      },
      FStockLocId: FStockLocId
    }
    Model.FInStockEntry.push(FInStock)
  }
  reactiveData.loading = false

  console.log('提交数据', Model)
  console.log('提交数据1', JSON.stringify(Model))
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
      emit('update:loading', true)
    }, 200)
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
  reactiveData.loading = true
  emit('update:loading', true)
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
