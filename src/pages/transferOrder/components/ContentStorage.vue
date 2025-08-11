<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { saveProductionOrder } from '@/api/modules/transferOrder'
import { TMUpdate } from '@/api/commonHttp'
import { TMStatusQuery } from '@/api/commonHttp'
const reactiveData = reactive({
  detailsList: [] as any,
  setData: {} as any,
  locationList: [] as any,
  loading: true
})

//保存
const saveClick = async () => {
  console.log('保存1', reactiveData.detailsList)
  if (reactiveData.detailsList.length === 0) {
    uni.showToast({
      title: '无提交数据',
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
    reactiveData.loading = false
    return
  }

  reactiveData.loading = false
  const Model = {
    FBillEntry: [] as any
  }
  let isInteger = true
  let myIndex = 0
  reactiveData.detailsList.map(async (item: any, index: number) => {
    if (item.IsSplit) {
      item.FZLOTList.forEach((element: any) => {
        let faLotData = item.packagingDataFZLOT[element]
        if (!faLotData.isInteger) {
          myIndex = index
          isInteger = false
        }

        let finishedQty = faLotData.packagingData[faLotData.packagingSig[0]].finishedQty //成品数量
        faLotData.packagingSig.forEach((element: any) => {
          if (faLotData.packagingData[element].finishedQty !== finishedQty) {
            myIndex = index
            isInteger = false
          }
        })
      })
    }

    //仓位
    const FStockLocPJ = 'FDESTSTOCKLOCID__' + reactiveData.setData.FlexNumber
    const FStockLocId = {} as any
    FStockLocId[FStockLocPJ] = {
      FNumber: item.WarehousePositionNumber
    }

    Model.FBillEntry.push({
      FRowType: 'Standard', // 产品类型
      FMaterialId: {
        // 物料编码
        FNumber: item.MaterialCode
      },
      FUnitID: {
        // 单位
        FNumber: 'Pcs'
      },
      FLot: {
        FNumber: item.Lot
      },
      FDestLot: {
        FNumber: item.Lot
      },
      FQty: item.Quantity2, // 数量
      FSrcStockId: {
        // 源仓库
        FNumber: item.WarehouseNumber
      },
      FSrcStockLocId: item.detailList.FStockLocId, // 源仓库仓位
      FDestStockId: {
        // 目标仓库
        FNumber: reactiveData.setData.warehouseNumber
      },
      FDestStockLocId: FStockLocId, // 目标仓库仓位
      FSrcStockStatusId: {
        // 源库存状态
        FNumber: 'KCZT01_SYS'
      },
      FDestStockStatusId: {
        // 目标库存状态
        FNumber: 'KCZT01_SYS'
      },
      //FBusinessDate: '2025-06-28 00:00:00', // 业务日期
      FSrcBillTypeId: '', // 源单据类型
      FOwnerTypeOutId: 'BD_OwnerOrg', // 货主类型（出）
      FOwnerOutId: {
        // 货主（出）
        FNumber: '100'
      },
      FOwnerTypeId: 'BD_OwnerOrg', // 货主类型
      FOwnerId: {
        // 货主
        FNumber: '100'
      },
      FNoteEntry: '', // 备注
      FSrcBillNo: '', // 源单据编号
      FSecQty: 0.0, // 辅助数量
      FExtAuxUnitQty: 0.0, // 扩展辅助单位数量
      FBaseUnitId: {
        // 基本单位
        FNumber: 'Pcs'
      },
      FBaseQty: item.Quantity2, // 基本数量
      FISFREE: false, // 是否赠品
      FKeeperTypeId: 'BD_KeeperOrg', // 保管者类型
      FActQty: 0.0, // 实际数量
      FKeeperId: {
        // 保管者
        FNumber: '100'
      },
      FKeeperTypeOutId: 'BD_KeeperOrg', // 保管者类型（出）
      FKeeperOutId: {
        // 保管者（出）
        FNumber: '100'
      },
      FDiscountRate: 0.0, // 折扣率
      FRepairQty: 0.0, // 返修数量
      FDestMaterialId: {
        // 目标物料
        FNUMBER: item.MaterialCode
      },
      FSaleUnitId: {
        // 销售单位
        FNumber: 'Pcs'
      },
      FSaleQty: item.Quantity2, // 销售数量
      FSalBaseQty: item.Quantity2, // 销售基本数量
      FPriceUnitID: {
        // 计价单位
        FNumber: 'Pcs'
      },
      F_QADV_TBTMSubEntity: item.barcodeList, // 条码
      FPriceQty: item.Quantity2, // 计价数量
      FPriceBaseQty: item.Quantity2, // 计价基本数量
      FOutJoinQty: 0.0, // 出库关联数量
      FBASEOUTJOINQTY: 0.0, // 基本出库关联数量
      FSOEntryId: 0, // 销售订单分录ID
      FTransReserveLink: false, // 是否转预留
      FQmEntryId: 0, // 质量管理分录ID
      FConvertEntryId: 0, // 转换分录ID
      FCheckDelivery: false, // 是否检查交货
      FBomEntryId: 0 // BOM分录ID
    })
  })
  if (!isInteger) {
    //提升
    uni.showToast({
      title: `第${myIndex + 1}行不配套`,
      icon: 'none'
    })
    reactiveData.loading = true
    return
  }
  //保存
  const res = await saveProductionOrder(Model)
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
    for (const item of reactiveData.detailsList) {
      const tmList = item.barcodeList.map((item: any) => item.F_BARCODENO)
      TMUpdate({
        barcodes: tmList,
        warehouse: reactiveData.setData.warehouseId,
        location: item.WarehousePosition,
        documentNumber: res.data.Result.Number,
        documentType: '直接调拨单',
        status: '2'
      })
    }

    uni.showToast({
      icon: 'none',
      title: '保存成功',
      duration: 5000
    })
    reactiveData.detailsList = []
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
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF" v-if="reactiveData.loading">
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
