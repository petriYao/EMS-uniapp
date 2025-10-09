<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { SalesOutboundCancelType } from '@/types/LowerCamelCaseType'
import {
  saveSalesOrder,
  deleteSalesOrder,
  UnAuditApiClient,
  lookBarCode,
  saveBarCode,
  barcodeStatus
} from '@/api/modules/lowerCamelCase'
import { changeOutbound } from '@/common/cancelOutbound/Index'
//数据
const reactiveData = reactive({
  lowerCamelCaseList: {} as SalesOutboundCancelType,
  detailsList: {} as any, //保存值
  Model: {} as any,
  loading: false,
  isShow: true,
  pickupOrderValue: '', //单号
  containerNoValue: 1 //柜号
})
/**条码处理 */
const editBarCode = async (Number: any) => {
  //修改条码状态
  //查看条码
  const barCodeStatusRes: any = await lookBarCode(Number)
  const barCode: any = barCodeStatusRes.data.Result.Result
  if (barCode.F_BARSTATUS === '3') {
    const Model = {
      FID: barCode.Id,
      F_BARSTATUS: '2',
      F_QADV_BARCODEENTRY: [] as any
    }
    for (const SALitem of barCode.F_QADV_BARCODEENTRY) {
      if (
        SALitem.F_QADV_TYPE == '销售出库单' &&
        SALitem.Id === barCode.F_QADV_BARCODEENTRY[barCode.F_QADV_BARCODEENTRY.length - 1].Id
      ) {
      } else {
        Model.F_QADV_BARCODEENTRY.push({
          FENTRYID: SALitem.Id,
          F_QADV_QTY: SALitem.F_QADV_QTY
        })
      }
    }
    //保存条码
    await saveBarCode(Model)
    return true
  }
}
//保存
const saveClick = async () => {
  //判断如果reactiveData.detailsList是空对象,返回错误
  if (Object.keys(reactiveData.detailsList).length === 0) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  reactiveData.Model = JSON.parse(JSON.stringify(reactiveData.detailsList.Model))
  //如果是空对象，则返回
  if (Object.keys(reactiveData.lowerCamelCaseList).length === 0) {
    uni.showToast({
      title: '请先扫描条码',
      icon: 'none',
      duration: 5000
    })
    return
  }
  //找到单据体ID
  const index = reactiveData.Model.FEntity.findIndex((item: any) => {
    return item.FENTRYID === reactiveData.lowerCamelCaseList.FENTRYID
  })
  reactiveData.loading = true
  let num = 0

  const barcodeList = reactiveData.lowerCamelCaseList.barcodeList.map((item: any) => {
    return item.F_BARCODENO
  })

  //条码单据查询
  const fNumbersInClause = barcodeList.map((code: any) => `'${code}'`).join(',')
  // 构建最终的 SQL 条件字符串
  const sqlCondition = `FNUMBER in (${fNumbersInClause}) AND F_BARSTATUS != '3'`
  //单据查询 条码状态
  const barCodeRes: any = await barcodeStatus(sqlCondition)
  if (barCodeRes && barCodeRes.data && barCodeRes.data.length > 0) {
    //条码状态不为1的提示
    uni.showToast({
      title: `编码${barCodeRes.data[0][1]}中，条码${barCodeRes.data[0][0]}非审核、出库、非作废状态`,
      icon: 'none',
      duration: 5000
    })
    reactiveData.loading = false
    return
  }

  //判断分装
  if (reactiveData.detailsList.isFE) {
    if (reactiveData.lowerCamelCaseList.isInteger) {
      //删除Model.FEntity[0].F_QADV_XSCKSubEntity中F_BARCODENO=searchValue的值

      for (const item of reactiveData.lowerCamelCaseList.barcodeList) {
        // const result = await editBarCode(item.F_BARCODENO)
        // if (!result) return
        reactiveData.Model.FEntity[index].F_QADV_XSCKSubEntity = reactiveData.Model.FEntity[
          index
        ].F_QADV_XSCKSubEntity.filter(
          (modelItem: any) => modelItem.F_BARCODENO !== item.F_BARCODENO
        )
      }
      num = reactiveData.lowerCamelCaseList.FRealQty
      reactiveData.Model.FEntity[index].FSALUNITQTY =
        reactiveData.Model.FEntity[index].FSALUNITQTY - reactiveData.lowerCamelCaseList.FRealQty
      //如果不大于0，则删除该条数据
      if (reactiveData.Model.FEntity[index].FSALUNITQTY <= 0) {
        reactiveData.Model.FEntity.splice(index, 1)
      }
      //如果删除后数组长度为0，则删除该单据
      if (reactiveData.Model.FEntity.length === 0) {
        //反审核
        const AuditRes: any = await UnAuditApiClient('SAL_OUTSTOCK', reactiveData.Model.FID)
        if (AuditRes && AuditRes.data.Result.ResponseStatus.ErrorCode === 500) {
          uni.showToast({
            title: '销售出库不允许修改',
            icon: 'none',
            duration: 5000
          })
          reactiveData.loading = false
          return
        }
        //调用删除单据接口
        const saveRes: any = await deleteSalesOrder(reactiveData.Model.FID)

        if (saveRes && saveRes.data.Result.ResponseStatus.ErrorCode === 500) {
          uni.showToast({
            title: saveRes.data.Result.ResponseStatus.Errors[0].Message,
            icon: 'none',
            duration: 5000
          })
          reactiveData.loading = false
          return
        }
      } else {
        await UnAuditApiClient('SAL_OUTSTOCK', reactiveData.Model.FID)

        const saveRes = await saveSalesOrder(reactiveData.Model)

        if (saveRes && saveRes.data?.Result?.ResponseStatus?.ErrorCode === 500) {
          uni.showToast({
            title: saveRes.data.Result.ResponseStatus.Errors[0].Message,
            icon: 'none',
            duration: 5000
          })
          reactiveData.loading = false
          return
        }
      }
      for (const item of reactiveData.lowerCamelCaseList.barcodeList) {
        await editBarCode(item.F_BARCODENO)
      }
    } else {
      //提示产品未成套
      uni.showToast({
        title: '套装产品未成套',
        icon: 'none',
        duration: 5000
      })
      reactiveData.loading = false
      return
    }
  } else {
    //减去销售出库单数量
    reactiveData.Model.FEntity[index].FSALUNITQTY =
      reactiveData.Model.FEntity[index].FSALUNITQTY -
      reactiveData.lowerCamelCaseList.barcodeList[0].F_UNITQTY
    num = reactiveData.lowerCamelCaseList.barcodeList[0].F_UNITQTY
    //删除该条数据
    for (const item of reactiveData.lowerCamelCaseList.barcodeList) {
      reactiveData.Model.FEntity[index].F_QADV_XSCKSubEntity = reactiveData.Model.FEntity[
        index
      ].F_QADV_XSCKSubEntity.filter((modelItem: any) => modelItem.F_BARCODENO !== item.F_BARCODENO)
    }

    if (reactiveData.Model.FEntity[index].FSALUNITQTY <= 0) {
      reactiveData.Model.FEntity.splice(index, 1)
    }
    if (reactiveData.Model.FEntity.length === 0) {
      //反审核
      const AuditRes: any = await UnAuditApiClient('SAL_OUTSTOCK', reactiveData.Model.FID)
      if (AuditRes && AuditRes.data.Result.ResponseStatus.ErrorCode === 500) {
        uni.showToast({
          title: '销售出库不允许修改',
          icon: 'none',
          duration: 5000
        })
        reactiveData.loading = false
        return
      }
      const saveRes: any = await deleteSalesOrder(reactiveData.Model.FID)
      if (saveRes && saveRes.data.Result.ResponseStatus.ErrorCode === 500) {
        uni.showToast({
          title: saveRes.data.Result.ResponseStatus.Errors[0].Message,
          icon: 'none',
          duration: 5000
        })
        reactiveData.loading = false
        return
      }
    } else {
      await UnAuditApiClient('SAL_OUTSTOCK', reactiveData.Model.FID)

      const saveRes = await saveSalesOrder(reactiveData.Model)
      if (saveRes && saveRes.data?.Result?.ResponseStatus?.ErrorCode === 500) {
        uni.showToast({
          title: saveRes.data.Result.ResponseStatus.Errors[0].Message,
          icon: 'none',
          duration: 5000
        })
        reactiveData.loading = false
        return
      }
    }
    const result = await editBarCode(reactiveData.lowerCamelCaseList.barcodeList[0].F_BARCODENO)
    if (!result) return
  }

  /**修改出运分柜 */
  changeOutbound(
    reactiveData.lowerCamelCaseList.pickupOrderValue,
    reactiveData.lowerCamelCaseList.containerNoValue,
    reactiveData.lowerCamelCaseList.currentList[3].value,
    num
  )
  reactiveData.pickupOrderValue = reactiveData.lowerCamelCaseList.pickupOrderValue
  reactiveData.containerNoValue = reactiveData.lowerCamelCaseList.containerNoValue
  reactiveData.loading = false
  reactiveData.isShow = false //隐藏标题组件
  setTimeout(() => {
    reactiveData.lowerCamelCaseList = {} as SalesOutboundCancelType
    reactiveData.detailsList = {}
    reactiveData.isShow = true //显示标题组件
  }, 500)
}

//暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <view
    v-if="reactiveData.isShow == false"
    class="bg-#FFF h-300rpx flex items-center justify-center"
  >
    <u-loading-icon text="保存中" textSize="18" />
  </view>
  <u-loading-page loading-color="#000000" loadingText="保存中" :loading="reactiveData.loading" />

  <!-- 扫描条码 -->
  <view class="bg-#FFF" v-if="reactiveData.isShow">
    <HeadScan
      v-model:detailsList="reactiveData.detailsList"
      v-model:lowerCamelCaseList="reactiveData.lowerCamelCaseList"
      v-model:loading="reactiveData.isShow"
      :pickupOrderValue="reactiveData.pickupOrderValue"
      :containerNoValue="reactiveData.containerNoValue"
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF" v-if="reactiveData.isShow">
    <LowerCamelCase
      v-model:lowerCamelCaseList="reactiveData.lowerCamelCaseList"
      :packagingSig="reactiveData.detailsList.packagingSig"
      :packagingData="reactiveData.detailsList.packagingData"
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
