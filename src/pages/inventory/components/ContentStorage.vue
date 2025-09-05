<script setup lang="ts">
import { reactive } from 'vue'
import HeadScan from './src/HeadScan.vue'
import LowerCamelCase from './src/LowerCamelCase.vue'
import { saveInventory } from '@/api/modules/transferOrder'
import { formatTime } from '@/utils'

const props = defineProps({
  scanCodeType: {
    type: String,
    default: ''
  }
})

const reactiveData = reactive({
  detailsList: [] as any,
  locationList: [],
  fid: 0,
  loading: true
})

//保存
const saveClick = async () => {
  console.log('保存1', reactiveData.detailsList)
  console.log('保存2', props.scanCodeType)
  //获取当前员工
  const username = uni.getStorageSync('username')
  let Model = {
    FID: reactiveData.fid,
    F_QADV_PDEntry: [] as any
  }
  if (props.scanCodeType == '初盘') {
    Model.F_QADV_PDEntry[0] = {
      FEntryId: reactiveData.detailsList[0].entity,

      F_QADV_CPQTY: reactiveData.detailsList[0].currentList[12].value,
      F_QADV_CYQTY:
        reactiveData.detailsList[0].currentList[12].value -
        reactiveData.detailsList[0].currentList[11].value,
      F_QADV_YG: {
        FUSERACCOUNT: username
      },
      F_QADV_CPDATE: formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }
  } else {
    Model.F_QADV_PDEntry[0] = {
      FEntryId: reactiveData.detailsList[0].entity,
      F_QADV_FPQTY: reactiveData.detailsList[0].currentList[12].value,
      F_QADV_FPCYQTY:
        reactiveData.detailsList[0].currentList[12].value -
        reactiveData.detailsList[0].currentList[11].value,
      F_QADV_YGFP: {
        FUSERACCOUNT: username
      },
      F_QADV_FPDATE: formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }
  }
  const res = await saveInventory(Model)
  if (res && res.data.Result.ResponseStatus.ErrorCode === 500) {
    uni.showToast({
      icon: 'none',
      title: res.data.Result.ResponseStatus.Errors[0].Message,
      duration: 5000
    })
    return
  }
  uni.showToast({
    icon: 'none',
    title: '保存成功',
    duration: 5000
  })
  reactiveData.loading = false
  setTimeout(() => {
    reactiveData.detailsList = []
    reactiveData.loading = true
  })
  console.log('保存结果', res)
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
      v-model:detailsList="reactiveData.detailsList"
      v-model:fid="reactiveData.fid"
      v-model:locationList="reactiveData.locationList"
      :scanCodeType="props.scanCodeType"
    />
  </view>
  <!-- 内容 -->
  <view class="bg-#FFF pt-6rpx" v-if="reactiveData.loading">
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
