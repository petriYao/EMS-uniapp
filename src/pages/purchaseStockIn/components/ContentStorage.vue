<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { saveProductionOrder } from '@/api/modules/transferOrder'
import { TMUpdate } from '@/api/commonHttp'

const reactiveData = reactive({
  detailsList: [],
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
  reactiveData.loading = false
  const Model = {
    FInStockEntry: [] as any
  }
  let tmList = [] as any
  reactiveData.detailsList.map(async (item: any, index: number) => {
    console.log('item', index, item)
    if (!item.isInteger) {
      //提升
      uni.showToast({
        title: `第${index + 1}行不配套`,
        icon: 'none'
      })
      reactiveData.loading = true
      return
    }
    item.barCodeList.forEach((obj: any) => {
      tmList.push(obj.F_BARCODENO)
    })
    //仓位
    const FStockLocPJ = 'FDESTSTOCKLOCID__' + reactiveData.setData.FlexNumber
    const FStockLocId = {} as any
    FStockLocId[FStockLocPJ] = {
      FNumber: reactiveData.setData.locationNumber
    }

    Model.FInStockEntry.push({
      FRowType: 'Standard', // 产品类型 - 标准类型
      FProductType: '1', // 产品类型编码
      FMaterialId: {
        // 物料信息
        FNumber: item.MaterialCode // 物料编号 - 2004号有扶手网布餐椅
      },
      FMaterialDesc: item.Name, // 物料描述
      FWWPickMtlQty: 0.0, // 委外领料套数 - 0表示非委外领料
      FUnitID: {
        // 库存单位
        FNumber: 'Pcs' // 单位编号 - 件
      },
      FRealQty: item.Quantity2, // 实收数量 - 90件
      FPriceUnitID: {
        // 计价单位
        FNumber: 'Pcs' // 单位编号 - 件(与库存单位相同)
      },
      FPrice: 8.849558, // 单价 - 8.85元/件(不含税)
      FStockId: {
        // 仓库信息
        FNumber: '101' // 仓库编号 - 101号仓库
      },
      FDisPriceQty: 0.0, // 拆单数量(计价) - 0表示未拆单
      FStockLocId: {
        // 仓位信息
        FSTOCKLOCID__FF100001: {
          // 原料仓位
          FNumber: '101' // 仓位编号 - 101号仓位
        }
      },
      FStockStatusId: {
        // 库存状态
        FNumber: 'KCZT01_SYS' // 库存状态编号 - 系统默认状态
      },
      FGiveAway: false, // 是否赠品 - 否
      FOWNERTYPEID: 'BD_OwnerOrg', // 货主类型 - 组织
      FExtAuxUnitQty: 0.0, // 实收数量(辅单位) - 0表示未使用辅单位
      FCheckInComing: false, // 来料检验 - 否
      FIsReceiveUpdateStock: false, // 收料更新库存 - 否
      FInvoicedJoinQty: 0.0, // 已开票关联数量 - 0
      FPriceBaseQty: 90.0, // 计价基本数量 - 90件
      FRemainInStockUnitId: {
        // 采购单位
        FNumber: 'Pcs' // 单位编号 - 件
      },
      FBILLINGCLOSE: false, // 立账关闭 - 否
      FRemainInStockQty: 90.0, // 采购数量 - 90件
      FAPNotJoinQty: 90.0, // 未关联应付数量 - 90件
      FRemainInStockBaseQty: 90.0, // 采购基本数量 - 90件
      FTaxPrice: 10.0, // 含税单价 - 10元/件
      FEntryTaxRate: 13.0, // 税率(%) - 13%
      FDiscountRate: 0.0, // 折扣率(%) - 0%
      FCostPrice: 0.0, // 成本价 - 0(可能未计算)
      FAuxUnitQty: 0.0, // 数量(库存辅单位) - 0
      FOWNERID: {
        // 货主信息
        FNumber: '100' // 货主编号 - 100号组织
      },
      FSRCBILLTYPEID: 'PUR_PurchaseOrder', // 源单类型 - 采购订单
      FSRCBillNo: 'CGDD000001', // 源单编号 - CGDD000001
      FAllAmountExceptDisCount: 900.0, // 价税合计(折前) - 900元
      FPriceDiscount: 0.0, // 单价折扣 - 0
      FConsumeSumQty: 0.0, // 消耗汇总数量 - 0
      FBaseConsumeSumQty: 0.0, // 消耗汇总基本单位数量 - 0
      FSalOutStockEntryId: 0, // 销售出库单分录Id - 0(无关联)
      FBeforeDisPriceQty: 0.0, // 拆单前原计价数量 - 0
      FPayableEntryID: 0, // 应付单分录ID - 0(未关联)
      F_QADV_WGHJ: 0.0, // 重量合计 - 0(可能未记录)
      F_QADV_KH: {
        // 客户信息
        FNUMBER: 'KH01' // 客户编号 - KH01
      },
      F_QADV_HTNO: 'XSDD000011', // 销售合同号 - XSDD000011
      FCOSTRATE: 0.0, // 成本权重 - 0
      FTaxDetailSubEntity: [
        // 税务明细
        {
          FTaxRate: 0.0 // 税率 - 0%(可能为默认值)
        }
      ]
    })
  })

  //保存
  const res = await saveProductionOrder(Model)
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
    reactiveData.detailsList = []

    TMUpdate({
      barcodes: tmList,
      warehouse: reactiveData.setData.warehouseId,
      location: reactiveData.setData.locationId,
      documentNumber: res.data.Result.Number,
      documentType: '直接调拨单',
      status: '2'
    })
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
