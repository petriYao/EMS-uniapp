<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from '../../components/src/HeadScan.vue'
import LowerCamelCase from '../../components/src/LowerCamelCase.vue'
// import { pushClient } from '@/api/modules/transferOrder'
import { EditCKTM, CYCKQuery } from '@/api/commonHttp'
import { TMStatusQuery } from '@/api/commonHttp'
import { queryPurchaseReturn, savePurchaseReturn } from '@/common/returnMaterial/Index'

const reactiveData = reactive({
  detailsList: [] as any,
  fid: '',
  title: '采购退货',
  loading: true
})

//保存
const saveClick = async () => {
  console.log('保存1', reactiveData.detailsList)
  console.log('保存2', reactiveData.fid)
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
  console.log('条码值', barcodeList)
  const tmStatusRes: any = await TMStatusQuery({
    barcodes: barcodeList,
    status: '2'
  })
  console.log('tmStatusRes', tmStatusRes)
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
    console.log('item', item.isInteger, item)
    if (!item.isInteger && item.barcodeList.length > 0) {
      // 条码不是整数的提示
      uni.showToast({
        title: `第${i + 1}行不配套`,
        icon: 'none'
      })
      isValid = false
      break
    }
    if (item.barcodeList.length !== 0) {
      detailsList.push({
        entryId: item.entryId,
        isSplit: item.IsSplit,
        sum: item.Quantity2,
        barcodeList: item.barcodeList
      })
    }
  }

  if (!isValid) {
    return // 阻止后续代码的执行
  }
  const pushResYz = await savePurchaseReturn({ FID: reactiveData.fid }, false)
  console.log('pushResYz', pushResYz)
  if (pushResYz && pushResYz.data.Result.ResponseStatus.ErrorCode === 500) {
    uni.showToast({
      title: pushResYz.data.Result.ResponseStatus.Errors[0].Message,
      icon: 'none',
      duration: 5000
    })
    return
  }
  console.log('detailsList', JSON.stringify(detailsList))
  const resQues: any = await CYCKQuery({
    fid: reactiveData.fid,
    detailsList: detailsList
  })
  const resQue = resQues.data
  console.log('resQue', resQue)
  /**库存检查***************************************************************** */

  if (resQue && resQue.isSuccess) {
    reactiveData.loading = false

    //单据查询 采购退料单
    const resView: any = await queryPurchaseReturn(
      'PUR_MRB',
      `fid = '${reactiveData.fid}'`,
      'FPURMRBENTRY_FEntryID,FRMREALQTY'
    )
    if (resView && resView.data.length > 0) {
      let Model = {
        FID: reactiveData.fid,
        FPURMRBENTRY: [] as any
      }
      for (const item of resView.data) {
        Model.FPURMRBENTRY.push({
          FENTRYID: item[0],
          FRMREALQTY: item[1]
        })
      }
      console.log('Model', Model)
      //3.保存采购退货单
      const pushResSaveData = await savePurchaseReturn(Model)

      console.log('pushResSaveData', pushResSaveData)

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
    }
  } else {
    uni.showToast({
      title: resQue.message,
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
    <LowerCamelCase v-model:detailsList="reactiveData.detailsList" />
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
