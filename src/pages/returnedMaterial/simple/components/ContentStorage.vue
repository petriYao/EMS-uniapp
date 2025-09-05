<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeadScan from '../../components/src/HeadScan.vue'
import LowerCamelCase from '../../components/src/LowerCamelCase.vue'
import { TMUpdate } from '@/api/commonHttp'
import { TMStatusQuery } from '@/api/commonHttp'
import { saveSimpleMaterialReturn } from '@/common/returnMaterial/OtherOutbound'
import { throttleSave } from '@/utils'
import FocusNoKeyboard from '@/components/FocusNoKeyboard.vue'

// 定义组件引用
const headScanRef = ref()
const lowerCamelCaseRef = ref()
const fnkRef = ref()

const reactiveData = reactive({
  detailsList: [] as any[],
  locationList: [],
  setData: {} as any,
  title: '简单生产退料',
  loading: true
})

// 保存方法
const saveClick = throttleSave(async () => {
  try {
    console.log('保存1', reactiveData.detailsList)
    console.log('保存2', reactiveData.setData)

    if (reactiveData.detailsList.length === 0) {
      uni.showToast({
        title: '无提交数据',
        icon: 'none'
      })
      return
    }

    const Model = {
      FID: reactiveData.setData.fid,
      FEntity: [] as any[]
    }

    // 收集条码列表
    const barcodeList: string[] = []

    // 验证数据、检查库存并收集条码（合并循环）
    for (let i = 0; i < reactiveData.detailsList.length; i++) {
      const item = reactiveData.detailsList[i]

      // 当库存小于应发数量时提示
      if (item.Quantity2 > item.detailList.inventory) {
        uni.showToast({
          title: `第${i + 1}行库存不足`,
          icon: 'none'
        })
        return
      }

      // 检查条码是否配套
      // console.log('item', item.isInteger, item)
      if (!item.isInteger && item.barcodeList && item.barcodeList.length > 0) {
        // 条码不是整数的提示
        uni.showToast({
          title: `第${i + 1}行不配套`,
          icon: 'none'
        })
        return
      }

      // 收集条码
      if (item.barcodeList && Array.isArray(item.barcodeList)) {
        barcodeList.push(...item.barcodeList.map((barcodeItem: any) => barcodeItem.F_BARCODENO))
      }
      if (item.Quantity2 == 0 || item.Quantity2 == '0') {
        //跳过
        continue
      }
      const FStockLocPJ = 'FSTOCKLOCID__' + reactiveData.setData.FlexNumber
      const FStockLocId = {} as any
      FStockLocId[FStockLocPJ] = {
        FNumber: item.detailList.locationNumber
      }
      console.log('locationNumber', item.WarehousePosition)
      console.log('FStockLocId', FStockLocId)
      Model.FEntity.push({
        FEntryID: item.entryId,
        FQty: item.Quantity2,
        FSTOCKID: {
          // 仓库
          FNumber: reactiveData.setData.warehouseNumber
        },
        FStockLocId: FStockLocId,
        F_QADV_JDTSubEntity: item.barcodeList
      })
    }

    if (barcodeList.length === 0) {
      uni.showToast({
        title: '无提交数据',
        icon: 'none'
      })
      return
    }

    console.log('条码值', barcodeList)

    // 查询条码状态
    const tmStatusRes: any = await TMStatusQuery({
      barcodes: barcodeList,
      status: '2'
    })

    console.log('tmStatusRes', tmStatusRes)

    if (tmStatusRes && tmStatusRes.data && tmStatusRes.data.length !== barcodeList.length) {
      // 条码状态不为1的提示
      uni.showToast({
        title: `编码${tmStatusRes.data[0]['material_fnumber']}中，条码${tmStatusRes.data[0]['FNUMBER']}非审核、创建/出库、非作废状态`,
        icon: 'none',
        duration: 5000
      })
      return
    }

    console.log('detailsList', JSON.stringify(Model.FEntity))

    /**库存检查***************************************************************** */

    console.log('Model', Model)
    console.log('Model', JSON.stringify(Model))

    // 保存简单生产退料单
    const res = await saveSimpleMaterialReturn(Model)
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
    reactiveData.loading = false

    if (res && res.data) {
      let numbers = res.data.Result.ResponseStatus.SuccessEntitys[0].Number

      for (const item of reactiveData.detailsList) {
        const tmList = item.barcodeList.map((item: any) => item.F_BARCODENO)
        TMUpdate({
          barcodes: tmList,
          warehouse: reactiveData.setData.warehouseId,
          location: item.FStockLocId,
          documentNumber: numbers,
          documentType: '生产退料单',
          status: '2'
        })
      }

      reactiveData.detailsList = []
      reactiveData.setData = {}
      uni.showToast({
        icon: 'none',
        title: '保存成功',
        duration: 5000
      })
      setTimeout(() => {
        reactiveData.loading = true
      }, 100)
    }
  } catch (error) {
    console.error('保存出错:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    setTimeout(() => {
      reactiveData.loading = true
    }, 200)
  }
})

// 暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <view class="content-storage">
    <!-- 添加FocusNoKeyboard组件 -->
    <FocusNoKeyboard ref="fnkRef" />

    <!-- 扫描条码 -->
    <view class="bg-#FFF" v-if="reactiveData.loading">
      <HeadScan
        ref="headScanRef"
        :title="reactiveData.title"
        v-model:detailsList="reactiveData.detailsList"
        v-model:locationList="reactiveData.locationList"
        v-model:setData="reactiveData.setData"
        v-model:loading="reactiveData.loading"
      />
    </view>

    <!-- 内容 -->
    <view class="bg-#FFF" v-if="reactiveData.loading">
      <LowerCamelCase
        ref="lowerCamelCaseRef"
        v-model:detailsList="reactiveData.detailsList"
        v-model:locationList="reactiveData.locationList"
      />
    </view>
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

.content-storage {
  // 可以添加更多样式优化
}
</style>
