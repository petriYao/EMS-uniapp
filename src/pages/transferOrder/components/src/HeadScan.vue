<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { transferScanBarcode } from '@/common/transferOrder/Index'
// import { queryBarCode } from '@/api/modules/lowerCamelCase'

// import { useEmitt } from '@/hooks/useEmitt'
//数据
const reactiveData = reactive({
  focus: 1,
  heardList: {
    warehouse: '成品仓', //仓库
    warehouseDisplay: false, //禁用
    location: '', //库位
    locationDisplay: false, //禁用
    barcode: 'AC2004N04TEX25060007' //条码
  },
  setData: {
    warehouseId: '205', //仓库ID
    locationId: '', //库位ID
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
}>()

//扫描条码
const searchChange = () => {
  setTimeout(async () => {
    if (reactiveData.heardList.barcode === '') {
      return
    }
    handleFocus()
    //调用条码（单据查询）
    const queryRes: any = await transferScanBarcode(
      reactiveData.heardList.barcode,
      reactiveData.setData.warehouseId
    )
    console.log('查询结果', queryRes)
    reactiveData.detailsList.push(queryRes)
    emit('update:detailsList', reactiveData.detailsList)

    reactiveData.heardList.barcode = ''
    reactiveData.focus = 22
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
  }, 500)
}

//获取仓库列表
const getWarehouseList = async () => {
  const res: any = await queryStorage()
  if (res) {
    warehouseData.warehouseList = res.data.map((item: any, index: number) => {
      return {
        id: index,
        text: item[0],
        value: item[1]
      }
    })
    console.log('内容', warehouseData.warehouseList)
  }
}
//仓库选择器确认
const pickerConfirm = async (val: any) => {
  console.log('pickerConfirm', val)
  reactiveData.heardList.warehouse = val.text
  reactiveData.setData.warehouseId = val.value
  getWarehousePosition(val.value)
  warehouseData.show = false
}

//获取仓位
const getWarehousePosition = async (warehouseId: any) => {
  //查看仓位
  if (warehouseId) {
    const res: any = await lookqueryStorage(warehouseId)
    console.log('res', res)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      reactiveData.setData.FlexNumber = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber
      console.log('list', list)
      if (list[0].Id === 0) {
        locationData.locationList = []
        reactiveData.heardList.locationDisplay = true
        reactiveData.focus = 0
        return
      }
      locationData.locationList = list.map((item: any) => {
        return {
          text: item.FlexEntryId.Name[0].Value,
          value: item.FlexEntryId.Number
        }
      })

      if (locationData.locationList.length == 0) {
        reactiveData.heardList.locationDisplay = true
        reactiveData.focus = 0
      } else {
        reactiveData.heardList.locationDisplay = false
        setTimeout(() => {
          console.log('到我')
          reactiveData.focus = 0
        }, 200)
      }
      handleFocus()
      console.log('focusIndex', reactiveData.focus)
    }
  }
}

//仓位选择器确认
const locationPickerConfirm = (val: any) => {
  //reactiveData.heardList.locationDisplay = false
  reactiveData.heardList.location = val.text
  reactiveData.setData.locationId = val.value
  locationData.show = false
  // reactiveData.locationValue = val.value
}
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
  console.log('清除定时器', hideTimer.value)
}

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
    <view class="pt-20rpx">
      <view class="flex items-center pb-10rpx w-100%">
        <view class="w-70px flex justify-center">调入仓</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8">
          <u-input
            ref="searchInput"
            v-model="reactiveData.heardList.warehouse"
            :showAction="false"
            :font="reactiveData.focus == 1"
            shape="round"
            placeholder=""
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

      <view class="flex items-center pb-10rpx w-100%">
        <view class="w-70px flex justify-center">仓位</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8">
          <u-input
            ref="searchInput"
            v-model="reactiveData.heardList.location"
            :showAction="false"
            :font="reactiveData.focus == 2"
            :disabled="reactiveData.heardList.locationDisplay"
            shape="round"
            placeholder=""
          >
            <template #suffix>
              <view
                @click="!reactiveData.heardList.locationDisplay ? (locationData.show = true) : ''"
              >
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

      <view class="flex items-center pb-10rpx w-100%">
        <view class="w-70px flex justify-center">条码</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8" @click="clearTimer">
          <u-input
            ref="searchInput"
            v-model="reactiveData.heardList.barcode"
            :showAction="false"
            :font="reactiveData.focus == 3"
            shape="round"
            placeholder=""
            @blur="searchChange"
          />
        </view>
      </view>
    </view>
  </view>
</template>
