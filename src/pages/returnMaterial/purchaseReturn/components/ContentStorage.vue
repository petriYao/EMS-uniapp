<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from '../../components/src/HeadScan.vue'
import LowerCamelCase from '../../components/src/LowerCamelCase.vue'
// import { pushClient } from '@/api/modules/transferOrder'
import { EditCKTM } from '@/api/commonHttp'
import { TMStatusQuery } from '@/api/commonHttp'
import { savePurchaseReturn } from '@/common/returnMaterial/Index'

const reactiveData = reactive({
  detailsList: [] as any,
  fid: '',
  title: '采购退货',
  loading: true
})

//保存
const saveClick = async () => {
  console.log('保存', reactiveData.detailsList)
  if (reactiveData.detailsList.length == 0) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  //判断条码入库状态
  let barcodeList = []
  // for (const item of reactiveData.detailsList) {
  //   barcodeList.push(
  //     ...item.barcodeList.map((item: any) => {
  //       return item.FNumber
  //     })
  //   )
  // }
  //修改条码
  for (const item of reactiveData.detailsList) {
    barcodeList.push(...item.barcodeList.map((item: any) => item.FNumber))
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
    status: '2'
  })
  if (tmStatusRes && tmStatusRes.data && tmStatusRes.data.length > 0) {
    //条码状态不为1的提示
    uni.showToast({
      title: `编码${tmStatusRes.data[0]['material_fnumber']}中，条码${tmStatusRes.data[0]['FNUMBER']}非审核、入库、非作废状态`,
      icon: 'none',
      duration: 5000
    })
    return
  }
  let detailsList = [] as any

  let isValid = true
  for (let i = 0; i < reactiveData.detailsList.length; i++) {
    const item = reactiveData.detailsList[i]
    if (!item.isInteger && item.barcodeList.length > 0) {
      // 条码不是整数的提示
      uni.showToast({
        title: `第${i + 1}行不配套`,
        icon: 'none'
      })
      isValid = false
      break
    }
    if (!item.isUnit) {
      console.log('item2', item.detailList.priceUnitQty)
      if (item.Quantity2 > 0 && item.detailList.priceUnitQty == 0) {
        uni.showToast({
          title: `第${i + 1}行计价数量应大于0`,
          icon: 'none'
        })
        isValid = false
        return
      }
    }

    if (item.barcodeList.length !== 0) {
      let THTMSubEntity = []
      for (const barcodeItem of item.barcodeList) {
        let THTMSub = {
          Seq: i + 1,
          F_BARCODENO: barcodeItem.FNumber,
          F_UNITQTY: barcodeItem.quantity,
          F_FZNO: barcodeItem.subPackageNo,
          F_BJNAME: barcodeItem.partNumberName,
          F_JUNITQTY: barcodeItem.unitQuantity,
          F_QADV_FZLOT: barcodeItem.FZLOT
        }
        THTMSubEntity.push(THTMSub)
      }

      detailsList.push({
        FEntryID: item.entryId,
        FRMREALQTY: item.Quantity2, //实退数量
        FREPLENISHQTY: item.Quantity2, //补料数量
        FKEAPAMTQTY: item.Quantity2, //扣款数量
        //FBASEUNITQTY: item.Quantity2,
        //FBaseReplayQty: item.Quantity2,//基本补料数量
        //FBaseKeapamtQty: item.Quantity2,
        FCarryQty: item.Quantity2, //采购数量
        //FCarryBaseQty: item.Quantity2,
        FpriceUnitQty: item.isUnit ? item.Quantity2 : item.detailList.priceUnitQty,
        F_QADV_THTMSubEntity: THTMSubEntity
      })
    }
  }

  if (!isValid) {
    return // 阻止后续代码的执行
  }
  reactiveData.loading = false
  //3.保存采购退货单
  const Model = {
    FID: reactiveData.fid,
    FPURMRBENTRY: detailsList
  }
  console.log('Model', JSON.stringify(Model))
  const pushResSaveData = await savePurchaseReturn(Model)
  if (pushResSaveData.data.Result.Number && pushResSaveData.data.Result.Number.length > 3) {
    EditCKTM({
      barcodes: barcodeList,
      documentNumber: pushResSaveData.data.Result.Number,
      documentType: '采购退料单',
      status: '3'
    })
    uni.showToast({
      title: '操作成功',
      icon: 'none'
    })
    reactiveData.detailsList = []
  } else {
    uni.showToast({
      title: pushResSaveData.data.Result.ResponseStatus.Errors[0].Message,
      icon: 'none',
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
  <view class="bg-#FFF" v-if="reactiveData.loading">
    <HeadScan
      :title="reactiveData.title"
      v-model:detailsList="reactiveData.detailsList"
      v-model:fid="reactiveData.fid"
      v-model:loading="reactiveData.loading"
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF" v-if="reactiveData.loading">
    <LowerCamelCase v-model:detailsList="reactiveData.detailsList" :title="reactiveData.title" />
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
