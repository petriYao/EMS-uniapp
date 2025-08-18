<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { camelCaseProduction, getcamelCase } from '@/common/purchaseStockIn/Index'
import { debounceSave } from '@/utils'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  barcodeIndex: {
    type: Number,
    default: 0
  }
})

//数据
const reactiveData = reactive({
  searchValue: 'SOUT00000002', //搜索值
  focus: 99,
  heardList: {
    documentNumber: '', //单号
    warehouse: '', //仓库
    location: '' //库位
  },
  setData: {
    fid: '',
    warehouseNumber: '', //仓库编号
    warehouseId: '', //仓库ID
    locationNumber: '', //库位
    locationId: '', //库位ID
    locationDisplay: true, //禁用
    FlexNumber: ''
  },
  detailsList: [] as any
})

const warehouseData = reactive({
  scValue: '',
  warehouseList: [] as any,
  show: false
})
const locationData = reactive({
  scValue: '',
  locationList: [] as any,
  show: false
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:setData', modelValue: any): void
  (e: 'update:locationList', modelValue: any): void
}>()

const searchInput = ref()
//扫码获取数据
const searchClick = async () => {
  //uniapp打开扫码
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  console.log('扫码结果', res)
  if (res) {
    //在focusIndex.value为0时，给搜索框赋值
    if (reactiveData.focus === 0) {
      reactiveData.searchValue = res.result
      searchChange()
    } else if (reactiveData.focus === 2) {
      //在reactiveData.focus为2时，给仓库赋值
      reactiveData.heardList.warehouse = res.result
      //触发更新事件
      reactiveData.focus = 3
    } else if (reactiveData.focus === 3) {
      //在reactiveData.focus为3时，给仓位赋值
      reactiveData.heardList.location = res.result
      reactiveData.focus = 0
    } else {
      searchInput.value.setValue(res.result)
    }
  }
}

//扫描条码
const searchChange = () => {
  console.log('搜索值', reactiveData.searchValue)
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    handleFocus()
    if (reactiveData.heardList.documentNumber === '') {
      //扫描采购订单
      const queryRes: any = await getcamelCase(reactiveData.searchValue)
      console.log('查询结果', queryRes)
      if (queryRes && queryRes.dataList.length > 0) {
        reactiveData.setData.fid = queryRes.fid

        reactiveData.detailsList = queryRes.dataList
        reactiveData.heardList.documentNumber = reactiveData.searchValue
        reactiveData.heardList.warehouse = queryRes.dataList[0].WarehouseName

        reactiveData.setData.warehouseNumber = queryRes.dataList[0].WarehouseNumber
        reactiveData.setData.warehouseId = queryRes.dataList[0].WarehouseId
        reactiveData.setData.FlexNumber = queryRes.dataList[0].FlexNumber
        getWarehousePosition(reactiveData.setData.warehouseNumber)
        emit('update:setData', reactiveData.setData)
        emit('update:detailsList', reactiveData.detailsList)
      }
    } else {
      //调用条码（单据查询）
      const queryRes: any = await camelCaseProduction(reactiveData.searchValue)
      if (!queryRes) {
        reactiveData.searchValue = ''
        focusTm()
      }
      console.log('是否第一次', reactiveData.detailsList[props.barcodeIndex].isLowerCamelCase)
      console.log('查询结果', reactiveData.detailsList[props.barcodeIndex], queryRes)
      if (
        reactiveData.detailsList[props.barcodeIndex].MaterialCode === queryRes.MaterialCode &&
        reactiveData.detailsList[props.barcodeIndex].Lot === queryRes.Lot
      ) {
        if (reactiveData.detailsList[props.barcodeIndex].isLowerCamelCase) {
          reactiveData.detailsList[props.barcodeIndex].Quantity2 += queryRes.Quantity * 1
          reactiveData.detailsList[props.barcodeIndex].currentList[13].value =
            reactiveData.detailsList[props.barcodeIndex].Quantity2
        } else {
          reactiveData.detailsList[props.barcodeIndex].Quantity2 = queryRes.Quantity * 1
          reactiveData.detailsList[props.barcodeIndex].currentList[13].value = queryRes.Quantity * 1
          reactiveData.detailsList[props.barcodeIndex].isLowerCamelCase = true
        }
      } else {
        //提示
        uni.showToast({
          title: '条码与编码或者批号不符',
          icon: 'none'
        })
      }
    }

    reactiveData.searchValue = ''
    focusTm()
  }, 500)
}

const focusTm = () => {
  reactiveData.focus = 0
  setTimeout(() => {
    reactiveData.focus = 99
  }, 200)
}

//获取仓库列表
const getWarehouseList = async () => {
  const res: any = await queryStorage()
  if (res) {
    warehouseData.warehouseList = res.data.map((item: any) => {
      return {
        id: item[2],
        text: item[0],
        value: item[1]
      }
    })
  }
}
//仓库选择器确认
const pickerConfirm = async (val: any) => {
  reactiveData.heardList.warehouse = val.text
  reactiveData.setData.warehouseNumber = val.value
  reactiveData.setData.warehouseId = val.id

  reactiveData.setData.locationNumber = ''
  reactiveData.setData.locationId = ''
  reactiveData.heardList.location = ''
  getWarehousePosition(val.value)
  emit('update:setData', reactiveData.setData)
  warehouseData.show = false
}

//获取仓位
const getWarehousePosition = async (warehouseId: any) => {
  //查看仓位
  if (warehouseId) {
    const res: any = await lookqueryStorage(warehouseId)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      reactiveData.setData.FlexNumber = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber
      if (list[0].Id === 0) {
        locationData.locationList = []
        reactiveData.setData.locationDisplay = true
        focusTm()

        return
      }
      locationData.locationList = list.map((item: any) => {
        return {
          Id: item.Id,
          text: item.FlexEntryId.Name[0].Value,
          value: item.FlexEntryId.Number
        }
      })

      if (locationData.locationList.length == 0) {
        reactiveData.setData.locationDisplay = true
        focusTm()
      } else {
        reactiveData.setData.locationDisplay = false
        setTimeout(() => {
          reactiveData.focus = 99
        }, 200)
      }
      handleFocus()
      emit('update:locationList', locationData.locationList)
    }
  }
}

//仓位选择器确认
const locationPickerConfirm = (val: any) => {
  //reactiveData.heardList.locationDisplay = false
  reactiveData.heardList.location = val.text
  reactiveData.setData.locationNumber = val.value
  reactiveData.setData.locationId = val.Id
  locationData.show = false
  focusTm()
  emit('update:setData', reactiveData.setData)
  // reactiveData.locationValue = val.value
}

//仓库
const warehouseChange = debounceSave((val: any) => {
  reactiveData.heardList.location = ''
  //获取仓库id替换为仓库名称
  const warehouseId: any = warehouseData.warehouseList.find((item: any) => item.value === val)
  if (!warehouseId && val != '') {
    //提示仓库不存在
    uni.showToast({
      title: '仓库不存在',
      icon: 'none'
    })
    reactiveData.heardList.warehouse = ''

    //重新回到光标位置
    reactiveData.focus = 0
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
    return
  }
  reactiveData.heardList.warehouse = warehouseId.text
  reactiveData.setData.warehouseNumber = warehouseId.value
  reactiveData.setData.warehouseId = warehouseId.id
  handleFocus()
  getWarehousePosition(val)
  emit('update:setData', reactiveData.setData)
})

//仓位
const locationChange = debounceSave((val: any) => {
  console.log('locationChange', val)
  const location: any = locationData.locationList.find((item: any) => item.value === val)
  console.log('location', location)
  if (!location && val != '') {
    //提示仓位不存在
    uni.showToast({
      title: '仓位不存在',
      icon: 'none'
    })
    reactiveData.heardList.location = ''
    //重新回到光标位置
    reactiveData.focus = 0
    setTimeout(() => {
      reactiveData.focus = 99
    }, 200)
    return
  }
  reactiveData.heardList.location = location.value
  reactiveData.setData.locationNumber = location.value
  reactiveData.setData.locationId = location.Id
  handleFocus()

  reactiveData.focus = 0
  setTimeout(() => {
    reactiveData.focus = 3
  }, 200)
  emit('update:setData', reactiveData.setData)
})

const hideTimer = ref<number | null>(null)
const handleFocus = () => {
  // 设置定时器
  if (!hideTimer.value) {
    hideTimer.value = setInterval(() => {
      uni.hideKeyboard()
    }, 50) as unknown as number
  }
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
onBeforeMount(() => {
  // 组件挂载前的逻辑
  handleFocus()
  getWarehouseList()
})
onBeforeUnmount(() => {
  // 组件卸载时清理
  console.log('离开')
  clearTimer()
})
</script>

<template>
  <view>
    <!-- 订单号搜索 -->
    <view class="flex items-center pb-20rpx bg-#f2f2f2">
      <view class="w-50px flex justify-center" @click="searchClick">
        <u-icon name="scan" size="24" />
      </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.searchValue"
          :showAction="false"
          customStyle="background: #FFF;"
          shape="round"
          placeholder="请输入搜索关键词"
          :focus="reactiveData.focus == 99"
          @blur="searchChange"
        />
      </view>
    </view>
    <view class="flex items-center py-10rpx w-100%">
      <view class="w-50px flex justify-center">单号</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.heardList.documentNumber"
          :showAction="false"
          :disabled="true"
          shape="round"
          placeholder=""
        />
      </view>
    </view>
    <view class="flex items-center py-10rpx w-100%">
      <view class="w-50px flex justify-center">仓库</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8">
        <u-input
          ref="searchInput"
          v-model="reactiveData.heardList.warehouse"
          :showAction="false"
          :focus="reactiveData.focus == 1"
          shape="round"
          placeholder=""
          @change="warehouseChange"
        >
          <template #suffix>
            <view @click="warehouseData.show = true">
              <u-icon name="arrow-down" size="20" />
            </view>
            <view>
              <u-action-sheet
                :show="warehouseData.show"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="warehouseData.show = false"
              >
                <view
                  class="flex items-center p-20rpx"
                  style="border-bottom: 1px solid #f8f8f8"
                  @click="clearTimer"
                >
                  <view @tap="warehouseData.show = false">搜索 </view>
                  <view class="flex-1">
                    <u-input
                      id="searchInput1"
                      v-model="warehouseData.scValue"
                      :showAction="false"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <view>
                  <!-- 滚动条 -->
                  <scroll-view scroll-y style="height: 800rpx">
                    <view
                      class=""
                      v-for="(warehouseItem, index) of warehouseData.warehouseList"
                      :key="index"
                    >
                      <view
                        class="flex justify-center py-10px"
                        style="border-bottom: 1px solid #f8f8f8"
                        v-if="warehouseItem.value.indexOf(warehouseData.scValue || '') !== -1"
                        @tap="pickerConfirm(warehouseItem)"
                      >
                        {{ warehouseItem.text }}
                      </view>
                    </view>
                  </scroll-view>
                </view>
              </u-action-sheet>
            </view>
          </template>
        </u-input>
      </view>
    </view>

    <view class="flex items-center pb-10rpx w-100%" v-if="false">
      <view class="w-50px flex justify-center">仓位</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8">
        <u-input
          ref="searchInput"
          v-model="reactiveData.heardList.location"
          :showAction="false"
          :focus="reactiveData.focus == 2"
          :disabled="reactiveData.setData.locationDisplay"
          shape="round"
          placeholder=""
          @change="locationChange"
        >
          <template #suffix>
            <view @click="!reactiveData.setData.locationDisplay ? (locationData.show = true) : ''">
              <u-icon name="arrow-down" size="20" />
            </view>
            <view>
              <u-action-sheet
                :show="locationData.show"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="locationData.show = false"
              >
                <view
                  class="flex items-center p-20rpx"
                  style="border-bottom: 1px solid #f8f8f8"
                  @click="clearTimer"
                >
                  <view @tap="locationData.show = false">搜索 </view>
                  <view class="flex-1">
                    <u-input
                      id="searchInput1"
                      v-model="warehouseData.scValue"
                      :showAction="false"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <view>
                  <!-- 滚动条 -->
                  <scroll-view scroll-y style="height: 800rpx">
                    <view
                      class=""
                      v-for="(warehouseItem, index) of locationData.locationList"
                      :key="index"
                    >
                      <view
                        class="flex justify-center py-10px"
                        style="border-bottom: 1px solid #f8f8f8"
                        v-if="warehouseItem.value.indexOf(warehouseData.scValue || '') !== -1"
                        @tap="locationPickerConfirm(warehouseItem)"
                      >
                        {{ warehouseItem.text }}
                      </view>
                    </view>
                  </scroll-view>
                </view>
              </u-action-sheet>
            </view>
          </template>
        </u-input>
      </view>
    </view>
  </view>
</template>
