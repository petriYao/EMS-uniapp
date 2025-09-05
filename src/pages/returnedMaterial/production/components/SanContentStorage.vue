<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from '../../components/sansrc/HeadScan.vue'
import LowerCamelCase from '../../components/sansrc/LowerCamelCase.vue'
import { throttleSave } from '@/utils'
import { saveMaterialRequisition } from '@/common/returnMaterial/OtherOutbound'

const reactiveData = reactive({
  detailsList: [] as any,
  setData: {} as any,
  title: '生产退料',
  barcodeIndex: 0,
  loading: true,
  isShow: true
})

//保存
const saveClick = throttleSave(async () => {
  console.log('保存1', reactiveData.detailsList)
  console.log('保存2', reactiveData.setData)
  if (reactiveData.detailsList.length == 0) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  let index = 1
  let flag = false
  for (const item of reactiveData.detailsList) {
    //当库存小于应发数量时提示
    if (item.Quantity2 > item.detailList.inventory) {
      uni.showToast({
        title: `第${index}行库存不足`,
        icon: 'none'
      })
      return
    }
    index++
    if (item.Quantity2 == 0 || item.Quantity2 == '0') {
      continue
    } else {
      let cangku = item.currentList.find((i: any) => i.label === '仓库')
      console.log('cangku', cangku)
      if (cangku.value == '') {
        uni.showToast({
          title: '仓库不可为空',
          icon: 'none'
        })
        return
      }
      let cangwei = item.currentList.find((i: any) => i.label === '仓位')
      if (!cangwei.disabled && cangwei.value == '') {
        uni.showToast({
          title: '仓位不可为空',
          icon: 'none'
        })
        return
      }

      flag = true
    }
  }
  if (!flag) {
    uni.showToast({
      title: '无提交数据',
      icon: 'none'
    })
    return
  }
  reactiveData.loading = false
  const Model = {
    FID: reactiveData.setData.fid,
    FEntity: [] as any
  }

  for (const item of reactiveData.detailsList) {
    const FStockLocId = {} as any
    const FStockLocPJ = 'FSTOCKLOCID__F' + item.FlexNumber

    FStockLocId[FStockLocPJ] = {
      FNumber: item.stockLocNumber
    }
    let FEntity = {
      FEntryID: 0,
      FStockId: {
        FNumber: item.stockNumber
      },
      FStockLocId: FStockLocId,
      FActualQty: 0
    } as any

    for (const barcode of item.EntityList) {
      FEntity.FEntryID = barcode.entryId
      FEntity.FActualQty = barcode.Quantity2
      Model.FEntity.push(JSON.parse(JSON.stringify(FEntity)))
    }
  }
  console.log('保存3', Model)
  const res = await saveMaterialRequisition(Model)
  if (res && res.data && res.data?.Result?.Number) {
    uni.showToast({
      icon: 'none',
      title: '提交成功'
    })
    //清空
    reactiveData.isShow = false //隐藏标题组件
    setTimeout(() => {
      reactiveData.isShow = true //显示标题组件
    }, 500)
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
  console.log('保存', res)
  setTimeout(() => {
    reactiveData.loading = true
  }, 200)
})

//暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <!-- 扫描条码 -->
  <view class="bg-#FFF" v-if="reactiveData.isShow">
    <HeadScan
      :title="reactiveData.title"
      v-model:detailsList="reactiveData.detailsList"
      v-model:setData="reactiveData.setData"
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
