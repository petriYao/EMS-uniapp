<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref, onBeforeUnmount, watch } from 'vue'
import HeadStorage from './components/HeadStorage.vue'
import TitleStorage from './components/TitleStorage.vue'
import TitleStorageB from './components/TitleStorageB.vue'
import { saveProductionOrder } from '@/api/modules/storage'
import { throttleSave } from '@/utils'
import { TMUpdate } from '@/api/commonHttp'
import { useEmitt } from '@/hooks/useEmitt'

const reactiveData = reactive({
  isShow: true, //是否选择
  loading: false, //是否保存
  title: '',
  scanCodeType: '扫码入库', //扫码类型
  FEntity: [] as any //单据提交
})

const titleStorageRef = ref() //标题组件引用
const titleStorageRefB = ref() //标题组件引用

const currentWarehouse = reactive({
  name: '',
  number: '',
  Id: 0,
  stoCurrentWarehouse: '', //当前库位
  warehousePositionList: [], //库位列表
  curNow: '',
  FlexNumber: ''
}) as any

const saveClick = throttleSave(async () => {
  // uni.showToast({
  //   title: '保存成功',
  //   icon: 'success'
  // })
  reactiveData.loading = true //显示保存按钮
  switch (reactiveData.scanCodeType) {
    case '扫码入库':
    case '单码双扫':
      // 执行扫码入库的保存逻辑
      // 执行单码双扫的保存逻辑
      const results12 = await titleStorageRef.value?.backClick()

      if (results12 && !results12.isError) {
        currentWarehouse.name = results12.currentData.currentWarehouseName //获取当前库位
        currentWarehouse.number = results12.currentData.currentWarehouseNumber //获取当前库房
        currentWarehouse.Id = results12.currentData.currentWarehouseId
        currentWarehouse.stoCurrentWarehouse = results12.currentData.stoCurrentWarehouse //获取当前库位
        currentWarehouse.warehousePositionList = results12.currentData.warehousePositionList //获取库位列表
        currentWarehouse.curNow = results12.currentData.curNow //获取当前库位
        currentWarehouse.FlexNumber = results12.currentData.FlexNumber

        if (results12.dataList.length === 0) {
          uni.showToast({
            icon: 'none',
            title: '无提交数据'
          })
        }
        const res1 = await saveProductionOrder(results12.dataList, results12.fid, results12.SCCJ)
        if (res1 && res1.data && res1.data?.Result?.Number) {
          for (const item of results12.dataList) {
            let tmList = [] as any
            for (const item2 of item.F_BARSubEntity) {
              tmList.push(item2.F_BARCODENO)
            }
            TMUpdate({
              barcodes: tmList,
              warehouse: results12.currentData.currentWarehouseId,
              location: item.currentWarehousePositionId,
              documentNumber: res1.data?.Result?.Number,
              documentType: '生产入库单',
              status: '2'
            })
          }
          uni.showToast({
            icon: 'none',
            title: '提交成功'
          })
          reactiveData.isShow = false //隐藏标题组件
          setTimeout(() => {
            reactiveData.isShow = true //显示标题组件
          }, 500)
        } else {
          uni.showToast({
            icon: 'none',
            title: res1.data?.Result?.ResponseStatus?.Errors[0].Message,
            duration: 5000
          })
        }
      }
      reactiveData.loading = false
      break

    case '扫单入库':
      // 执行扫单入库的保存逻辑
      const results3 = await titleStorageRefB.value?.backClick()
      if (results3 && !results3.isError) {
        const res3 = await saveProductionOrder(results3.dataList, results3.fid, results3.SCCJ)
        if (res3 && res3.data && res3.data?.Result?.Number) {
          uni.showToast({
            icon: 'none',
            title: '提交成功'
          })
          reactiveData.isShow = false //隐藏标题组件
          setTimeout(() => {
            reactiveData.isShow = true //显示标题组件
          }, 500)
        } else {
          uni.showToast({
            icon: 'none',
            title: res3.data?.Result?.ResponseStatus?.Errors[0].Message,
            duration: 5000
          })
        }
      }

      reactiveData.loading = false
      break
    default:
      break
  }
}) //调用标题组件的保存方法

// 组件卸载时清理
const hideTimer = ref<number | null>(null)
const handleFocus = () => {
  // 清除之前的定时器（如果存在）
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
  }

  // 设置新的定时器
  hideTimer.value = setInterval(() => {
    uni.hideKeyboard()
  }, 50) as unknown as number
}

const clearTimer = () => {
  // 清除定时器
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
    hideTimer.value = null
  }
}
useEmitt({
  name: 'update:handleFocus',
  callback: async () => {
    handleFocus()
  }
})
useEmitt({
  name: 'update:clearTimer',
  callback: async () => {
    clearTimer()
  }
})

watch(
  () => reactiveData.scanCodeType,
  () => {
    handleFocus()
  },
  { immediate: true, deep: true }
)

onBeforeUnmount(() => {
  // 组件卸载时清理
  clearTimer()
})

onLoad((e: any) => {
  //修改导航栏名称
  reactiveData.title = e.type
})
</script>
<template>
  <!-- <view v-if="reactiveData.loading" class="bg-#FFF h-300rpx flex items-center justify-center">
    <u-loading-icon text="保存中" textSize="18" />
  </view> -->
  <u-loading-page loading-color="#000000" loadingText="保存中" :loading="reactiveData.loading" />
  <view>
    <HeadStorage :title="reactiveData.title" v-model:scanCodeType="reactiveData.scanCodeType" />
  </view>
  <scroll-view scroll-y class="bg-#FFF" style="height: calc(100vh - 40px - 44px - 24px)">
    <view v-if="reactiveData.scanCodeType == '扫码入库' && reactiveData.isShow">
      <TitleStorage
        ref="titleStorageRef"
        :title="reactiveData.title"
        :stoCurrentWarehouse="currentWarehouse"
        v-model:scanCodeType="reactiveData.scanCodeType"
      />
    </view>
    <view v-else-if="reactiveData.scanCodeType == '单码双扫' && reactiveData.isShow">
      <TitleStorage
        ref="titleStorageRef"
        :title="reactiveData.title"
        :stoCurrentWarehouse="currentWarehouse"
        v-model:scanCodeType="reactiveData.scanCodeType"
      />
    </view>
    <view v-else-if="reactiveData.scanCodeType == '扫单入库' && reactiveData.isShow">
      <TitleStorageB
        ref="titleStorageRefB"
        :title="reactiveData.title"
        v-model:scanCodeType="reactiveData.scanCodeType"
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
    <view v-if="false" class="flex">
      <view
        class="bg-#f2f2f2 text-#000 w-50% h-40px flex justify-center items-center"
        @click="saveClick"
        >保存</view
      >
      <view
        class="bg-#56a8fe text-#FFF w-50% h-40px flex justify-center items-center"
        @click="saveClick"
        >提交</view
      >
    </view>
  </view>
</template>
<style lang="less" scoped></style>
