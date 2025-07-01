<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeadStorage from './components/HeadStorage.vue'
import ContentStorage from './components/ContentStorage.vue'
import {
  saveSalesOrder,
  pushClient,
  shipmentSubContainer,
  pickupOrder,
  shipmentSubContainerSave,
  UnAuditApiClient
} from '@/api/modules/lowerCamelCase'
import { throttleSave } from '@/utils'
import { barcodeStatus } from '@/api/modules/storage'
import { EditCKTM } from '@/api/commonHttp'

const reactiveData = reactive({
  isShow: true, //是否选择
  loading: false, //是否保存
  title: '销售出库',
  containerNoValue: 1, //柜号
  pickupOrderValue: '', //单号
  FEntity: [] as any //单据提交
})

const contentStorageRef = ref() //标题组件引用

const saveClick = throttleSave(async () => {
  console.log('保存')
  reactiveData.loading = true //显示保存按钮
  const results12 = await contentStorageRef.value?.saveClick()
  // let results12 = {} as any

  // /***存储数据 */
  // if (datasss.value) {
  //   results12 = datasss.value
  // } else {
  //   results12 = await contentStorageRef.value?.saveClick()
  //   //储存到本地缓存中
  //   uni.setStorageSync('SalesOutbound', JSON.stringify(reactiveData))
  // }
  console.log('results1', results12)

  /***保存数据 */
  if (!results12 || (results12 && results12.isError)) {
    // uni.showToast({
    //   icon: 'none',
    //   title: '无提交数据'
    // })
    reactiveData.loading = false
    return
  }

  // 将 F_BARCODENO 拼接成 SQL 查询条件
  const fNumbersInClause = results12.ThFilter.tmList.map((code: any) => `'${code}'`).join(',')
  // 构建最终的 SQL 条件字符串
  const sqlCondition = `FNUMBER in (${fNumbersInClause}) AND F_BARSTATUS != '2'`
  //单据查询 条码状态
  const barCodeRes: any = await barcodeStatus(sqlCondition)
  if (barCodeRes && barCodeRes.data && barCodeRes.data.length > 0) {
    //条码状态不为1的提示
    uni.showToast({
      title: `编码${barCodeRes.data[0][1]}中，条码${barCodeRes.data[0][0]}不为入库状态`,
      icon: 'none',
      duration: 5000
    })
    reactiveData.loading = false
    return
  }
  //调用发货通知单单据查询验证出运分柜数量是否超发货通知数量
  const pickupRes: any = await pickupOrder(results12.ThFilter.filtersString)
  if (pickupRes && pickupRes.data.length !== results12.ThFilter.ThFilterNum) {
    uni.showToast({
      icon: 'none',
      title: '出运分柜数量超出发货通知单数量',
      duration: 5000
    })
    reactiveData.loading = false
    return
  }
  console.log('model', JSON.stringify(results12.model))
  const res1 = await saveSalesOrder(results12.model)
  console.log('res', res1)
  if (res1 && res1.data && res1.data?.Result?.Number) {
    // uni.showToast({
    //   icon: 'none',
    //   title: '提交成功'
    // })
    EditCKTM({
      barcodes: results12.ThFilter.tmList,
      documentNumber: res1.data.Result.Number,
      documentType: '销售出库单',
      status: '3'
    })
    /*下推-出运分柜单*/
    //1.根据单号跟柜号查找出运分柜表中是否有相同
    const res2: any = await shipmentSubContainer(
      `F_QADV_THDNO_LSN = '${results12.Numbers}' and F_QADV_FGH = '${results12.containerNoValue}'`
    )
    console.log('res2', res2)
    //2.进行下推
    if (res2 && res2.data.length === 0) {
      let Numbers = results12.ThFilter.EntryIds.map((item: any) => item.id).join(',')
      const pushRes = await pushClient(Numbers, 'QADV_THDFG')
      console.log('pushRes', pushRes)
      if (pushRes && pushRes.data?.Result?.ResponseStatus?.IsSuccess) {
        console.log('出运分柜单号', pushRes.data.Result.ResponseStatus.SuccessEntitys[0])
        let pushResData = pushRes.data.Result.ResponseStatus.SuccessEntitys[0]
        let Model = {
          FID: pushResData.Id,
          F_QADV_FGH: results12.containerNoValue,
          FEntity: [] as any
        }
        await Promise.all(
          pushResData.EntryIds.FEntity.map(async (item: any, i: number) => {
            console.log('item', item)
            let item2 = {
              FEntryID: item,
              F_QADV_QTY: results12.ThFilter.EntryIds[i].quantity
            }
            Model.FEntity.push(item2)
          })
        )
        console.log('Model', Model)
        //3.保存出运分柜单
        const pushResSaveData = shipmentSubContainerSave(Model)
        console.log('pushResSaveData', pushResSaveData)
      }
    } else {
      //有这张出运分柜的情况下(判断是否有相同，有新增的情况下（源单单号+源单行号匹配提货单，直接按提货单的内容新增）)
      let Model = {
        FID: res2.data[0][0],
        FEntity: [] as any
      }
      console.log('res3')
      for (const item of res2.data) {
        console.log('res4', item)
        let item2 = {
          FEntryID: item[1],
          F_QADV_QTY: item[2],
          F_QADV_NUMBER: { FNUMBER: item[3] },
          F_QADV_SOURCEBILLNO: item[4],
          FOrderSeq: Number(item[5])
        }
        Model.FEntity.push(item2)
      }

      console.log('Model', Model)

      await Promise.all(
        results12.lowerCamelCaseList.map(async (item: any) => {
          if (item.currentTotal > 0) {
            const index = Model.FEntity.findIndex(
              (item2: any) =>
                item2.F_QADV_NUMBER.FNUMBER === item.number &&
                item2.F_QADV_SOURCEBILLNO === item.FEntity_model.FSRCBILLNO &&
                Number(item2.FOrderSeq) === Number(item.FEntity_model.F_QADV_YDENTRYID)
            )
            if (index !== -1) {
              Model.FEntity[index].F_QADV_QTY += item.currentTotal
            } else {
              let item2 = {
                FEntryID: 0, //新增
                Seq: Model.FEntity.length + 1, //序号
                F_QADV_QTY: item.currentTotal, //数量
                F_QADV_NUMBER: { FNUMBER: item.number }, //分柜号
                F_QADV_MARK: item.F_QADV_MARK, //正唛
                F_QADV_ORDER: item.FEntity_model.FSoorDerno, //销售订单
                F_QADV_SOURCEBILLTYPE: 'SAL_DELIVERYNOTICE', //源单类型
                F_QADV_SOURCEBILLNO: item.FEntity_model.FSRCBILLNO, //源单单号
                F_QADV_HTQTY: item.FEntity_model.FMustQty, //源单数量
                FOrderSeq: Number(item.FEntity_model.F_QADV_YDENTRYID), //源单行号
                //Link绑定
                FEntity_Link: [
                  {
                    FEntity_Link_FRuleId: '6878b73f-6124-4690-8840-d2694cbf2829',
                    STableId: 0,
                    FEntity_Link_FSTableName: 'T_SAL_DELIVERYNOTICEENTRY',
                    FEntity_Link_FSBillId: item.FEntity_model.FEntity_Link[0].FEntity_Link_FSBILLID,
                    FEntity_Link_FSId: item.FEntity_model.FEntity_Link[0].FEntity_Link_FSID,
                    FEntity_Link_F_QADV_QTYOld: item.FEntity_model.FMustQty, //源单数量
                    FEntity_Link_F_QADV_QTY: item.currentTotal //转入数量
                  }
                ]
              }
              Model.FEntity.push(item2)
            }
          }
        })
      )
      console.log('Model', Model)
      //反审核出运分柜单
      await UnAuditApiClient('QADV_THDFG', Model.FID)
      //3.保存出运分柜单
      const pushResSaveData = shipmentSubContainerSave(Model, false)
      console.log('pushResSaveData', pushResSaveData)
    }

    reactiveData.isShow = false //隐藏标题组件
    setTimeout(() => {
      reactiveData.isShow = true //显示标题组件
      reactiveData.containerNoValue = results12.containerNoValue
      reactiveData.pickupOrderValue = results12.Numbers
      console.log('reactiveData.pickupOrderValue', reactiveData.pickupOrderValue)
      console.log('reactiveData.containerNoValue', reactiveData.containerNoValue)
    }, 500)
  } else {
    uni.showToast({
      icon: 'none',
      title: res1.data?.Result?.ResponseStatus?.Errors[0].Message,
      duration: 5000
    })
  }
  reactiveData.loading = false
}) //调用标题组件的保存方法
</script>
<template>
  <view v-if="reactiveData.loading" class="bg-#FFF h-300rpx flex items-center justify-center">
    <u-loading-icon text="保存中" textSize="18" />
  </view>
  <u-loading-page loading-color="#000000" loadingText="保存中" :loading="reactiveData.loading" />
  <view>
    <HeadStorage :title="reactiveData.title" />
  </view>

  <scroll-view scroll-y style="height: calc(100vh - 40px - 44px - 24px)">
    <view v-if="reactiveData.isShow">
      <ContentStorage
        ref="contentStorageRef"
        :pickupOrderValue="reactiveData.pickupOrderValue"
        :containerNoValue="reactiveData.containerNoValue"
      />
    </view>
  </scroll-view>

  <view class="h-40px">
    <view>
      <view
        class="bg-#56a8fe text-#FFF w-100% h-40px flex justify-center items-center"
        @click="saveClick"
        >提交</view
      >
    </view>
  </view>
</template>
<style lang="less" scoped></style>
