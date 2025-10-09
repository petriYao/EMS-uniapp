<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { TMUpdate } from '@/api/commonHttp'
import { TMStatusQuery } from '@/api/commonHttp'
import { saveSalesReturn } from '@/api/modules/transferOrder'

const reactiveData = reactive({
  detailsList: [] as any,
  locationList: [],
  setData: {} as any,
  loading: true
})

//保存
const saveClick = async () => {
  if (!reactiveData.setData.warehouseNumber) {
    uni.showToast({
      title: '仓库不可为空',
      icon: 'none'
    })
    return
  }
  //判断条码入库状态
  let barcodeList = []
  // for (const item of reactiveData.detailsList) {
  //   barcodeList = item.barcodeList.map((item: any) => {
  //     return item.F_BARCODENO
  //   })
  // }
  for (const item of reactiveData.detailsList) {
    barcodeList.push(...item.barcodeList.map((item: any) => item.F_BARCODENO))
  }

  if (barcodeList.length == 0) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  const tmStatusRes: any = await TMStatusQuery({
    barcodes: barcodeList,
    status: '1'
  })
  if (tmStatusRes && tmStatusRes.data && tmStatusRes.data.length > 0) {
    //条码状态不为1的提示
    uni.showToast({
      title: `编码${tmStatusRes.data[0]['material_fnumber']}中，条码${tmStatusRes.data[0]['FNUMBER']}非审核、创建、未作废状态`,
      icon: 'none',
      duration: 5000
    })
    return
  }

  let isValid = true
  for (let i = 0; i < reactiveData.detailsList.length; i++) {
    const item = reactiveData.detailsList[i]
    if (reactiveData.locationList.length > 0) {
      if (item.detailList.location == '') {
        uni.showToast({
          title: `第${i + 1}行仓位不可为空`,
          icon: 'none'
        })
        return
      }
    }
    if (!item.isInteger && item.barcodeList.length > 0) {
      // 条码不是整数的提示
      uni.showToast({
        title: `第${i + 1}行不配套`,
        icon: 'none'
      })
      isValid = false
      break
    }
  }

  if (!isValid) {
    return // 阻止后续代码的执行
  }
  /**************************开始保存*************************/
  const Model = {
    FID: reactiveData.setData.fid,
    FEntity: [] as any
  }
  const FStockLocPJ = 'FSTOCKLOCID__' + reactiveData.setData.FlexNumber

  for (const item of reactiveData.detailsList) {
    if (item.Quantity2 == 0) continue //过滤掉数量为0的
    const FStockLocId = {} as any
    FStockLocId[FStockLocPJ] = {
      FNumber: item.detailList.locationNumber
    }

    Model.FEntity.push({
      FEntryId: item.entryId,
      FSTOCKID: {
        // 仓库
        FNumber: reactiveData.setData.warehouseNumber
      },
      FStockLocId: FStockLocId,
      F_QADV_XTSubEntity: item.barcodeList,
      FRealQty: item.Quantity2 //实际数量
    })
  }
  //保存销售退货单
  // return
  const res = await saveSalesReturn(Model)
  if (res && res.data.Result.ResponseStatus.ErrorCode === 500) {
    uni.showToast({
      icon: 'none',
      title: res.data.Result.ResponseStatus.Errors[0].Message,
      duration: 5000
    })
    return
  }
  if (res && res.data) {
    reactiveData.loading = false

    let numbers = res.data.Result.ResponseStatus.SuccessEntitys[0].Number
    for (const item of reactiveData.detailsList) {
      const tmList = item.barcodeList.map((item: any) => item.F_BARCODENO)
      TMUpdate({
        barcodes: tmList,
        warehouse: reactiveData.setData.warehouseId,
        location: item.WarehousePositionId,
        documentNumber: numbers,
        documentType: '销售退货单',
        status: '2'
      })
    }

    reactiveData.detailsList = []
    reactiveData.setData = {
      fid: 0,
      warehouseNumber: '',
      warehouseId: '',
      FlexNumber: '',
      warehouseDisplay: false,
      locationDisplay: false
    }

    uni.showToast({
      icon: 'none',
      title: '保存成功',
      duration: 5000
    })
    setTimeout(() => {
      reactiveData.loading = true
    }, 100)
  }
  setTimeout(() => {
    reactiveData.loading = true
  }, 100)
}

//暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <!-- 扫描条码 -->
  <view class="bg-#FFF" v-if="reactiveData.loading">
    <HeadScan
      v-model:detailsList="reactiveData.detailsList"
      v-model:setData="reactiveData.setData"
      v-model:locationList="reactiveData.locationList"
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
