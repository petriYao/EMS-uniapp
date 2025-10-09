<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import { throttleSave } from '@/utils'
import { saveLocation } from '@/common/returnMaterial/OtherOutbound'

const reactiveData = reactive({
  loading: true,
  setData: {} as any,
  detailsList: [] as any,
  selectIndex: 0
})

// 保存方法
const saveClick = throttleSave(async () => {
  let details = reactiveData.detailsList[reactiveData.selectIndex]
  //新增
  const Model = {
    FID: details.storagelocationid,
    F_QADV_WL: {
      FNUMBER: details.materialcode
    },
    F_QADV_WH: {
      //仓库
      FNUMBER: reactiveData.setData.warehouseNumber
    },
    F_QADV_LOT: details.batchnumber, //批号
    F_QADV_WHCW: details.locationcode, //仓位名称
    F_QADV_CW: details.storagelocation //储位
  }
  const res = await saveLocation(Model)
  if (res && res.data.Result.ResponseStatus.ErrorCode === 500) {
    uni.showToast({
      icon: 'none',
      title: res.data.Result.ResponseStatus.Errors[0].Message,
      duration: 5000
    })
    return
  }

  reactiveData.loading = false
  reactiveData.detailsList = []
  // reactiveData.setData = {}
  reactiveData.selectIndex = 0
  uni.showToast({
    icon: 'none',
    title: '保存成功',
    duration: 5000
  })
  setTimeout(() => {
    reactiveData.loading = true
  }, 100)
})

// 暴露方法
defineExpose({
  saveClick
})
</script>

<template>
  <!-- 扫描条码 -->
  <view class="bg-#FFF" v-if="reactiveData.loading">
    <HeadScan
      v-model:detailsList="reactiveData.detailsList"
      v-model:selectIndex="reactiveData.selectIndex"
      v-model:setData="reactiveData.setData"
      :loading="reactiveData.loading"
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
