<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { transferScanBarcode } from '@/common/purchaseStockIn/Index'
// import { queryBarCode } from '@/api/modules/lowerCamelCase'

// import { useEmitt } from '@/hooks/useEmitt'
//数据
const reactiveData = reactive({
  searchValue: 'AC2004N04TEX002125070001', //搜索值
  focus: 1,
  heardList: {
    documentNumber: '', //单号
    warehouse: '', //仓库
    location: '' //库位
  },
  setData: {
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
    // searchChange()
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
    //调用条码（单据查询）
    const queryRes: any = await transferScanBarcode(reactiveData.searchValue)
    console.log('查询结果', queryRes)
    if (reactiveData.detailsList.length > 0) {
      const index = reactiveData.detailsList.findIndex((item: any) => {
        console.log('判断之前是否有一样的', item, queryRes)
        return (
          item.MaterialCode === queryRes.MaterialCode &&
          item.SourceOrderNo === queryRes.SourceOrderNo &&
          item.SourceOrderLineNo === queryRes.SourceOrderLineNo
        )
      })
      if (index !== -1) {
        //判断仓库是否一样
        if (reactiveData.detailsList[index].WarehouseNumber !== queryRes.WarehouseNumber) {
          uni.showToast({
            title: '仓库不一致',
            icon: 'none'
          })

          return
        }
        //判断是否重复扫描
        if (reactiveData.detailsList.some((item: any) => item.BarCode === queryRes.BarCode)) {
          uni.showToast({
            title: '请勿重复扫描',
            icon: 'none'
          })

          return
        }

        reactiveData.detailsList[index].barCodeList.push(queryRes.barCodeList[0]) //条码
        reactiveData.detailsList[index].Quantity++ //件数

        if (reactiveData.detailsList[index].IsSplit) {
          //分装的情况下
          //判断源数据是否有相同的分装批号，有则跳过，无则push
          const index2 = reactiveData.detailsList[index].FZLOTList.findIndex((item: any) => {
            return item === queryRes.FZLOTList[0]
          })
          console.log('选中的明细1', index2)
          if (index2 === -1) {
            reactiveData.detailsList[index].FZLOTList.push(queryRes.FZLOTList[0])

            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]] =
              queryRes.packagingDataFZLOT[queryRes.FZLOTList[0]]

            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
              queryRes.SplitCode
            ]['quantity'] = 0
          }

          reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
            queryRes.SplitCode
          ]['quantity'] += queryRes.SplitValue //数量
          reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
            queryRes.SplitCode
          ]['unitQty'] = queryRes.UnitQty //单位用量
          reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
            queryRes.SplitCode
          ]['finishedQty'] =
            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingData[
              queryRes.SplitCode
            ]['quantity'] / queryRes.UnitQty
          //判断是否有成品
          const packagingSig =
            reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].packagingSig
          let hasZero = false
          let minNonZero = Infinity

          packagingSig.forEach((item: any) => {
            const sum = Number(
              reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]]
                .packagingData[item].finishedQty
            )

            if (isNaN(sum)) {
              // 如果转换失败，根据需求决定如何处理，这里假设视为 0
              hasZero = true
            } else {
              if (sum === 0) {
                hasZero = true
              } else if (sum < minNonZero) {
                minNonZero = sum
              }
            }
          })

          // 如果存在任何一个 0，或者所有值都是无效的，则设为 0
          const productsQuantity = hasZero || minNonZero === Infinity ? 0 : minNonZero
          //判断productsQuantity是否为整数
          reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].isInteger =
            productsQuantity % 1 === 0 && productsQuantity !== 0

          //计算单分装数量
          reactiveData.detailsList[index].packagingDataFZLOT[queryRes.FZLOTList[0]].FZquantity =
            Math.floor(productsQuantity)

          //计算总数量
          reactiveData.detailsList[index].Quantity2 = reCompute(reactiveData.detailsList[index])
        } else {
          console.log('未封装新增', reactiveData.detailsList[index])
          reactiveData.detailsList[index].Quantity2 += queryRes.Quantity2
          reactiveData.detailsList[index].isInteger = true //是否整数
        }
      } else {
        //判断条码是否重复扫
        const scannedBarcodes = new Set(
          reactiveData.detailsList.flatMap((item: { barCodeList: any[] }) =>
            item.barCodeList.map((item2: { [x: string]: any }) => item2['F_BARCODENO'])
          )
        )
        if (scannedBarcodes.has(reactiveData.searchValue)) {
          uni.showToast({
            title: '请勿重复扫描',
            icon: 'none'
          })
          reactiveData.searchValue = ''
          focusTm()
          return
        }
        console.log('重复', scannedBarcodes, scannedBarcodes.has(reactiveData.searchValue))
        reactiveData.detailsList.push(queryRes)
      }
    } else {
      reactiveData.detailsList.push(queryRes)
    }
    emit('update:detailsList', reactiveData.detailsList)

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

//重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  val.FZLOTList.forEach((item: any) => {
    sum += val.packagingDataFZLOT[item].FZquantity
  })
  return sum
}

//获取仓库列表
const getWarehouseList = async () => {
  const res: any = await queryStorage()
  console.log('获取仓库列表', res)
  if (res) {
    warehouseData.warehouseList = res.data.map((item: any) => {
      return {
        id: item[2],
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
    console.log('res', res)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      reactiveData.setData.FlexNumber = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber
      console.log('list', list)
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
          console.log('到我')
          reactiveData.focus = 2
        }, 200)
      }
      handleFocus()
      emit('update:locationList', locationData.locationList)
      console.log('focusIndex', reactiveData.focus)
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
    <!-- <view class="flex items-center py-10rpx w-100%">
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
    </view> -->
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
