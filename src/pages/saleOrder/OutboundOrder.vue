<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive } from 'vue'
import { lookOutstock } from '@/api/modules/saleOrder'
import { SaveClient, SubmitClient, AuditApiClient, UnAuditApiClient } from '@/api/modules/user'

const reactiveData = reactive({
  state: 'C',
  number: '',
  headList: [
    { label: '单据编号', field: 'FBillNo', value: '', readonly: false, placeholder: '自动生成' },
    { label: '客户', field: 'FCustomerID', value: '', readonly: false, placeholder: '自动生成' },
    { label: '销售员', field: 'Number', value: '', readonly: false, placeholder: '自动生成' },
    { label: '结算币别', field: 'Number', value: '', readonly: false, placeholder: '自动生成' }
  ],
  contentList: [] as any,
  Model: {
    FID: 0,
    FEntity: []
  } as any,
  actionList: [
    { label: '保存', icon: 'save', disabled: false },
    { label: '审核', icon: 'shengHe', disabled: false },
    { label: '反审核', icon: 'FshengHe', disabled: false }
  ]
})

const getData = async () => {
  const res: any = await lookOutstock(reactiveData.Model.FID)
  let resData = res.data.Result.Result
  console.log('res', resData.CustomerID)

  reactiveData.Model.FCustomerID = {
    FNumber: resData.CustomerID.Number
  }
  reactiveData.Model.FReceiverID = {
    FNumber: resData.CustomerID.Number
  }
  reactiveData.Model.FSettleID = {
    FNumber: resData.CustomerID.Number
  }
  reactiveData.Model.FPayerID = {
    FNumber: resData.CustomerID.Number
  }
  for (const item of reactiveData.headList) {
    switch (item.label) {
      case '单据编号':
        item.value = resData.BillNo
        break
      case '客户':
        item.value = resData.CustomerID.Name[0].Value
        break
      case '销售员':
        item.value = resData.SalesManID.Name[0].Value
        break
      case '结算币别':
        item.value = resData.CustomerID.TRADINGCURRID.Name[0].Value
        break
    }
  }

  for (const item of resData.SAL_OUTSTOCKENTRY) {
    console.log('明细', item)
    let mxData = {
      number: item.MaterialID.Number,
      MustQty: item.MustQty,
      list: [
        { label: '应发数量', field: 'MustQty', value: item.MustQty, disabled: true },
        { label: '实发数量', field: 'RealQty', value: item.RealQty }
      ]
    }

    let FEntityData = {
      FMaterialID: {
        FNumber: item.MaterialID.Number
      },
      FUnitID: {
        FNumber: 'Pcs'
      },
      FRealQty: item.RealQty,
      FSALUNITQTY: item.RealQty,
      FSALBASEQTY: item.RealQty,
      FPRICEBASEQTY: item.RealQty,
      FARNOTJOINQTY: item.RealQty,
      FMaterialID_Sal: {
        FNUMBER: item.MaterialID.Number
      },
      FStockID: {
        //仓库
        FNumber: '205'
      },
      FRowType: item.RowType,
      FPrice: item.Price,
      FTaxPrice: item.TaxPrice,
      FMustQty: item.MustQty,
      FBaseMustQty: item.MustQty,
      FIsFree: item.IsFree,
      FOwnerTypeID: 'BD_OwnerOrg',
      FOwnerID: {
        FNumber: item.OwnerID.Number
      },
      FEntryTaxRate: 0.0,
      FAuxUnitQty: item.AuxUnitQty,
      FExtAuxUnitQty: item.ExtAuxUnitQty,
      FStockStatusID: {
        // FNumber: 'KCZT01_SYS'
        FNumber: item.StockStatusID.Number
      },
      FSrcType: item.SrcType,
      FSrcBillNo: item.SrcBillNo,
      FSoorDerno: item.SoorDerno,
      FDiscountRate: item.DiscountRate,
      FPriceDiscount: item.PriceDiscount,
      FActQty: item.ActQty,
      FOUTCONTROL: item.OUTCONTROL,
      FRepairQty: item.RepairQty,
      FIsOverLegalOrg: item.IsOverLegalOrg,
      FQmEntryID: item.QmEntryID,
      FConvertEntryID: item.ConvertEntryID,
      FSOEntryId: item.SOEntryId,
      FBeforeDisPriceQty: item.BeforeDisPriceQty,
      FSignQty: item.SignQty,
      FCheckDelivery: item.CheckDelivery,
      FAllAmountExceptDisCount: item.AllAmountExceptDisCount,
      FSettleBySon: item.SettleBySon,
      FBOMEntryId: item.BOMEntryId,
      FInStockEntryId: item.InStockEntryId,
      FReceiveEntryId: item.ReceiveEntryId,
      FIsReplaceOut: item.IsReplaceOut,
      FVmiBusinessStatus: item.VmiBusinessStatus,
      FEntity_Link: [
        {
          FEntity_Link_FRuleId: item.FEntity_Link[0].RuleId,
          FEntity_Link_FSTableName: item.FEntity_Link[0].STableName,
          FEntity_Link_FSBillId: item.FEntity_Link[0].SBillId,
          FEntity_Link_FSId: item.FEntity_Link[0].SId,
          FEntity_Link_FBaseUnitQtyOld: item.FEntity_Link[0].BaseUnitQtyOld,
          FEntity_Link_FBaseUnitQty: item.FEntity_Link[0].BaseUnitQty,
          FEntity_Link_FSALBASEQTYOld: item.FEntity_Link[0].SALBASEQTYOld,
          FEntity_Link_FSALBASEQTY: item.FEntity_Link[0].SALBASEQTY,
          FEntity_Link_FPRICEBASEQTYOld: item.FEntity_Link[0].PRICEBASEQTYOld,
          FEntity_Link_FPRICEBASEQTY: item.FEntity_Link[0].PRICEBASEQTY,
        }
      ]
    }

    reactiveData.contentList.push(mxData)
    reactiveData.Model.FEntity.push(FEntityData)
  }
}

const actionClick = async (name: any) => {
  console.log('name', name)
  switch (name.label) {
    case '保存':
      for (let i = 0; i < reactiveData.contentList.length; i++) {
        let qty = reactiveData.contentList[i].list[1].value
        console.log('contentList', reactiveData.contentList[i])
        console.log('qty', qty)
        reactiveData.Model.FEntity[i].FRealQty = qty
        reactiveData.Model.FEntity[i].FSALUNITQTY = qty
        reactiveData.Model.FEntity[i].FSALBASEQTY = qty
        reactiveData.Model.FEntity[i].FPRICEBASEQTY = qty
        reactiveData.Model.FEntity[i].FARNOTJOINQTY = qty
      }

      console.log('Model', reactiveData.Model)
      const saveRes: any = await SaveClient('SAL_OUTSTOCK', reactiveData.Model)
      console.log('saveRes', saveRes)
      reactiveData.number = saveRes.data.Result.Number
      break
    case '审核':
      await SubmitClient('SAL_OUTSTOCK', [reactiveData.number])
      const Auditres = await AuditApiClient('SAL_OUTSTOCK', [reactiveData.number])
      if (Auditres) {
        uni.showToast({
          icon: 'none',
          title: '审核成功'
        })
        reactiveData.state = 'D'
      }
      break
    case '反审核':
      const UnAuditRes = await UnAuditApiClient('SAL_OUTSTOCK', [reactiveData.number])
      if (UnAuditRes) {
        uni.showToast({
          icon: 'none',
          title: '反审核成功'
        })
        reactiveData.state = 'D'
      }
      break
  }
}

onLoad((e: any) => {
  reactiveData.Model.FID = e.id
  getData()
})
</script>
<template>
  <view class="content">
    <scroll-view scroll-y class="content default-font-size" style="height: calc(100vh - 60px)">
      <view class="mx-20rpx">
        <view v-for="(item, index) of reactiveData.headList" :key="index">
          <view
            class="flex justify-between h-30px py-4rpx items-center"
            style="border-bottom: 2rpx solid #f2f2f2"
          >
            <view>{{ item.label }}</view>

            <view class="flex-1 ml-8px">
              <u-input
                v-model="item.value"
                :placeholder="item.placeholder"
                border="none"
                :readonly="reactiveData.state === 'C' || !item.readonly"
                fontSize="--default-font-size"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 订单明细 -->
      <view class="mx-20rpx">
        <view class="my-20rpx" style="border-top: 0rpx solid #f2f2f2">订单明细</view>
        <view
          v-for="(contentItem, contentIndex) of reactiveData.contentList"
          :key="contentIndex"
          class="py-10rpx"
          style="border-bottom: 2rpx solid #f2f2f2"
        >
          <view class="pb-10rpx flex items-center justify-between">
            <view>物料编码：</view>
            <view class="text-red">{{ contentItem.number }}</view>
          </view>
          <view
            v-for="(item, index) of contentItem.list"
            :key="index"
            class="flex items-center justify-between"
          >
            <view>{{ item.label }}</view>
            <view>
              <u-number-box
                v-model="item.value"
                min="0"
                :disabled="item.disabled"
                :max="contentItem.MustQty"
                :showMinus="false"
                :showPlus="false"
                bgColor="#f6f7fb"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>

  <!-- 底部操作栏 -->
  <view class="flex justify-justify items-center bg-#F2F2F2 h-60px">
    <view
      v-for="(item, index) of reactiveData.actionList"
      :key="index"
      class="w-33% flex flex-col justify-center"
      @click="actionClick(item)"
    >
      <view class="flex justify-center">
        <!-- <u-icon :name="item.icon" :color="item.disabled ? '#C0C0C0' : '#000000'" size="20px" /> -->
      </view>
      <view
        class="flex justify-center default-save-size"
        :style="item.disabled ? 'color:#C0C0C0' : 'color:#000000'"
      >
        {{ item.label }}
      </view>
    </view>
  </view>
</template>
<style lang="less" scoped>
.content {
  ::v-deep .uni-input-input {
    text-align: right;
    height: 34px;
  }
  ::v-deep .uni-input-placeholder {
    text-align: right;
  }
  ::v-deep .u-input__content__field-wrapper__field {
    height: auto;
  }
}
</style>
