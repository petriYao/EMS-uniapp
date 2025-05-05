<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref, watch } from 'vue'
import HeadStorage from './components/HeadStorage.vue'
import TitleStorage from './components/TitleStorage.vue'
import TitleStorageB from './components/TitleStorageB.vue'
import { saveProductionOrder } from '@/api/modules/storage'
import { throttleSave } from '@/utils'

const reacticeData = reactive({
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
  number: ''
}) as any

const currentWarehousePosition = reactive({
  name: '',
  number: ''
}) as any

const StoFocusIndex = ref(2) //焦点索引

const saveClick = throttleSave(async () => {
  console.log('保存')
  // uni.showToast({
  //   title: '保存成功',
  //   icon: 'success'
  // })
  reacticeData.loading = true //显示保存按钮
  StoFocusIndex.value = 22 //重置焦点索引

  setTimeout(() => {
    StoFocusIndex.value = 0 //重置焦点索引
  }, 500)
  switch (reacticeData.scanCodeType) {
    case '扫码入库':
      // 执行扫码入库的保存逻辑
      console.log('扫码入库')
      const results12 = await titleStorageRef.value?.backClick()
      console.log('results1', results12)
      if (results12) {
        currentWarehouse.name = results12.currentData.currentWarehouseName //获取当前库位
        currentWarehouse.number = results12.currentData.currentWarehouseNumber //获取当前库房
        currentWarehousePosition.name = results12.currentData.currentWarehousePositionName //获取当前库位
        currentWarehousePosition.number = results12.currentData.currentWarehousePositionNumber //获取当前库房

        const res1 = await saveProductionOrder(results12.dataList, results12.fid, results12.SCCJ)
        console.log('res', res1)
        if (res1 && res1.data && res1.data?.Result?.Number) {
          uni.showToast({
            icon: 'none',
            title: '提交成功'
          })
          reacticeData.isShow = false //隐藏标题组件
          setTimeout(() => {
            reacticeData.isShow = true //显示标题组件
          }, 500)
        } else {
          uni.showToast({
            icon: 'none',
            title: res1.data?.Result?.ResponseStatus?.Errors[0].Message,
            duration: 5000
          })
        }
      }

      reacticeData.loading = false

      break
    case '单码双扫':
      // 执行单码双扫的保存逻辑
      const results2 = await titleStorageRef.value?.backClick()
      console.log('results2', results2)
      if (results2) {
        currentWarehouse.name = results12.currentData.currentWarehouseName //获取当前库位
        currentWarehouse.number = results12.currentData.currentWarehouseNumber //获取当前库房
        currentWarehousePosition.name = results12.currentData.currentWarehousePositionName //获取当前库位
        currentWarehousePosition.number = results12.currentData.currentWarehousePositionNumber //获取当前库房
        if (!results2.integer.isInteger) {
          uni.showToast({
            icon: 'none',
            title: results2.integer.Name + '不是整套'
          })
          return
        } else {
          console.log('报错', results2)
          const res2 = await saveProductionOrder(results2.dataList, results2.fid, results2.SCCJ)

          if (res2 && res2.data && res2.data?.Result?.Number) {
            uni.showToast({
              icon: 'none',
              title: '保存成功'
            })
            reacticeData.isShow = false //隐藏标题组件
            setTimeout(() => {
              reacticeData.isShow = true //显示标题组件
            }, 500)
          } else if (res2 && res2.data && res2.data?.Result?.ResponseStatus?.Errors) {
            console.log('results2', res2.data?.Result?.ResponseStatus?.Errors[0].Message)
            uni.showToast({
              icon: 'none',
              title: res2.data?.Result?.ResponseStatus?.Errors[0].Message,
              duration: 5000
            })
          }
        }
      }
      reacticeData.loading = false
      break
    case '扫单入库':
      // 执行扫单入库的保存逻辑
      const results3 = await titleStorageRefB.value?.backClick()
      console.log('results3', results3)
      if (results3) {
        const res3 = await saveProductionOrder(results3.dataList, results3.fid, results3.SCCJ)
        if (res3 && res3.data && res3.data?.Result?.Number) {
          uni.showToast({
            icon: 'none',
            title: '提交成功'
          })
          reacticeData.isShow = false //隐藏标题组件
          setTimeout(() => {
            reacticeData.isShow = true //显示标题组件
          }, 500)
        } else {
          uni.showToast({
            icon: 'none',
            title: res3.data?.Result?.ResponseStatus?.Errors[0].Message,
            duration: 5000
          })
        }
      }

      reacticeData.loading = false
      break
    default:
      break
  }
}) //调用标题组件的保存方法

watch(
  () => reacticeData.scanCodeType,
  (newVal) => {
    if (newVal == '扫码入库') {
      StoFocusIndex.value = 2 //扫码入库焦点索引
    } else if (newVal == '单码双扫') {
      StoFocusIndex.value = 0 //单码双扫焦点索引
    } else if (newVal == '扫单入库') {
      StoFocusIndex.value = 0 //扫单入库焦点索引
    }
  },
  { immediate: true }
)

onLoad((e: any) => {
  console.log('ee', e)
  //修改导航栏名称
  reacticeData.title = e.type
})
</script>
<template>
  <!-- <view v-if="reacticeData.loading" class="bg-#FFF h-300rpx flex items-center justify-center">
    <u-loading-icon text="保存中" textSize="18" />
  </view> -->
  <u-loading-page loading-color="#000000" loadingText="保存中" :loading="reacticeData.loading" />
  <view>
    <HeadStorage :title="reacticeData.title" v-model:scanCodeType="reacticeData.scanCodeType" />
  </view>
  <scroll-view scroll-y style="height: calc(100vh - 60rpx - 44px - 24px)">
    <view v-if="reacticeData.scanCodeType == '扫码入库' && reacticeData.isShow">
      <TitleStorage
        ref="titleStorageRef"
        :title="reacticeData.title"
        :stoFocusIndex="StoFocusIndex"
        :stoCurrentWarehouse="currentWarehouse"
        :stoCurrentWarehousePosition="currentWarehousePosition"
        v-model:scanCodeType="reacticeData.scanCodeType"
      />
    </view>
    <view v-else-if="reacticeData.scanCodeType == '单码双扫' && reacticeData.isShow">
      <TitleStorage
        ref="titleStorageRef"
        :title="reacticeData.title"
        :stoFocusIndex="StoFocusIndex"
        :stoCurrentWarehouse="currentWarehouse"
        :stoCurrentWarehousePosition="currentWarehousePosition"
        v-model:scanCodeType="reacticeData.scanCodeType"
      />
    </view>
    <view v-else-if="reacticeData.scanCodeType == '扫单入库' && reacticeData.isShow">
      <TitleStorageB
        ref="titleStorageRefB"
        :title="reacticeData.title"
        v-model:scanCodeType="reacticeData.scanCodeType"
      />
    </view>
  </scroll-view>

  <view class="h-60rpx">
    <view>
      <view
        class="bg-#56a8fe text-#FFF w-100% h-60rpx flex justify-center items-center"
        @click="saveClick"
        >提交</view
      >
    </view>
    <view v-if="false" class="flex">
      <view
        class="bg-#f2f2f2 text-#000 w-50% h-60rpx flex justify-center items-center"
        @click="saveClick"
        >保存</view
      >
      <view
        class="bg-#56a8fe text-#FFF w-50% h-60rpx flex justify-center items-center"
        @click="saveClick"
        >提交</view
      >
    </view>
  </view>
</template>
<style lang="less" scoped></style>
