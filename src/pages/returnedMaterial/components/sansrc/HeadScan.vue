<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { scanBarCode, getSanDan } from '@/common/returnedMaterial/Index'
import { getSanSimple } from '@/common/returnedMaterial/Simple'
import { getSanOutsourcing } from '@/common/returnedMaterial/Outsourced'
import { useEmitt } from '@/hooks/useEmitt'
import { debounce, debounceSave } from '@/utils'
import { getStockLoc } from '@/common/comModel/Index'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

//数据
const reactiveData = reactive({
  searchValue: '', //搜索值
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
  locationList: [] as any,
  detailsList: [] as any
})

const warehouseData = reactive({
  scValue: '',
  warehouseList: [] as any,
  show: false
})

const { emitter } = useEmitt()
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:setData', modelValue: any): void
  (e: 'update:locationList', modelValue: any): void
}>()

const searchInput = ref()

//扫码获取数据
const searchClick = async () => {
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  if (res) {
    reactiveData.searchValue = res.result
    searchChange()
  }
}

// 查找全部匹配的行
const findMatchingDetails = (queryRes: any): any[] => {
  return reactiveData.detailsList.filter((item: any) => {
    return item.MaterialCode === queryRes.MaterialCode && item.Lot === queryRes.Lot
  })
}

//扫描条码
const searchChange = debounce(async () => {
  console.log('搜索值', reactiveData.searchValue)

  // 防止空值搜索
  if (!reactiveData.searchValue.trim()) {
    return
  }

  handleFocus()

  try {
    if (!reactiveData.heardList.documentNumber) {
      //扫描采购订单
      let queryRes: any = {}
      switch (props.title) {
        case '生产退料':
          queryRes = await getSanDan(reactiveData.searchValue)
          break
        case '简单生产退料':
          queryRes = await getSanSimple(reactiveData.searchValue)
          break
        case '委外退料':
          queryRes = await getSanOutsourcing(reactiveData.searchValue)
          break
      }
      console.log('查询结果', queryRes)

      if (queryRes && queryRes.dataList?.length > 0) {
        reactiveData.setData.fid = queryRes.fid
        reactiveData.detailsList = queryRes.dataList
        reactiveData.heardList.documentNumber = reactiveData.searchValue
        console.log('查询结果2', queryRes.dataList[0])
        getWarehousePosition(queryRes.dataList[0].stockNumber)
        // 安全检查确保数据存在
        if (queryRes.dataList[0]) {
          reactiveData.heardList.warehouse = queryRes.dataList[0].stockName || ''
          reactiveData.setData.warehouseNumber = queryRes.dataList[0].stockNumber || ''
          reactiveData.setData.warehouseId = queryRes.dataList[0].stockNumber || '' // 仓库ID通常与编号相同
          reactiveData.setData.FlexNumber = queryRes.dataList[0].FlexNumber || ''
        }
        emit('update:setData', reactiveData.setData)
        emit('update:detailsList', reactiveData.detailsList)
      }
    } else {
      //调用条码（单据查询）
      const queryRes: any = await scanBarCode(reactiveData.searchValue)

      if (!queryRes) {
        reactiveData.searchValue = ''
        focusTm()
        return
      }

      // 改为查找全部匹配的明细项，支持同 MaterialCode+Lot 多行
      const matchingDetails = findMatchingDetails(queryRes)
      if (!matchingDetails.length) {
        uni.showToast({ title: '条码与明细不符', icon: 'none' })
        return focusTm()
      }

      let matched = false
      for (const detail of matchingDetails) {
        const index = reactiveData.detailsList.indexOf(detail)
        const Quantity = Number(queryRes.CurrentQty || 0)

        // 判断是否可接收
        let newQuantity = reactiveData.detailsList[index].Quantity2
        if (reactiveData.detailsList[index].isLowerCamelCase) {
          newQuantity += Quantity
        } else {
          newQuantity = Quantity
        }

        // 检查是否超过可退数量（简单生产退料不做限制）
        if (
          props.title !== '简单生产退料' &&
          newQuantity > reactiveData.detailsList[index].canReceive
        ) {
          // 本行接收会超额，尝试下一行
          continue
        }

        // 通过可接收性校验后，再真正更新数据
        if (reactiveData.detailsList[index].isLowerCamelCase) {
          reactiveData.detailsList[index].Quantity2 += Quantity
        } else {
          reactiveData.detailsList[index].Quantity2 = Quantity
          reactiveData.detailsList[index].isLowerCamelCase = true

          // 更新其他字段
          const contractField = reactiveData.detailsList[index].currentList.find(
            (i: any) => i.label === '合同'
          )
          if (contractField) {
            contractField.value = queryRes.contract
          }

          const batchField = reactiveData.detailsList[index].currentList.find(
            (i: any) => i.label === '批量'
          )
          if (batchField) {
            batchField.value = queryRes.batch
          }

          const customerField = reactiveData.detailsList[index].currentList.find(
            (i: any) => i.label === '客户'
          )
          if (customerField) {
            customerField.value = queryRes.customer
          }

          const totalBoxField = reactiveData.detailsList[index].currentList.find(
            (i: any) => i.label === '总箱数'
          )
          if (totalBoxField) {
            totalBoxField.value = queryRes.totalBox
          }
        }

        // 更新界面显示的数量字段
        const inventoryField = reactiveData.detailsList[index].currentList.find(
          (i: any) => i.label === '数量'
        )
        if (inventoryField) {
          inventoryField.value = reactiveData.detailsList[index].Quantity2
        }

        // 分配数量到EntityList
        const entityList = reactiveData.detailsList[index].EntityList || []
        let remainingValue = reactiveData.detailsList[index].Quantity2

        // 循环遍历EntityList，依次分配值给Quantity2，以canReceive为上限
        for (const item of entityList) {
          // 计算可以分配给当前项的最大值（不超过canReceive）
          const maxAssignable = Math.min(remainingValue, item.canReceive || 0)

          // 分配值给Quantity2
          item.Quantity2 = maxAssignable

          // 更新剩余值
          remainingValue -= maxAssignable
          if (remainingValue <= 0) break
        }

        // 更新父组件的数据
        emitter.emit('update:barcodeIndex', index)
        matched = true
        break
      }

      if (!matched) {
        uni.showToast({
          title: '实收数量大于可领数量',
          icon: 'none'
        })
      }
    }
  } catch (error) {
    console.error('搜索处理出错:', error)
    uni.showToast({
      title: '处理失败，请重试',
      icon: 'none'
    })
  } finally {
    reactiveData.searchValue = ''
    focusTm()
  }
}, 200)

// 仓库变更
const warehouseChange = debounceSave(async (val: string) => {
  reactiveData.heardList.location = ''
  if (val === '') {
    reactiveData.heardList.warehouse = ''
    reactiveData.setData.warehouseNumber = ''
    reactiveData.setData.warehouseId = ''
    await clearStock()
    return
  }
  const warehouse = warehouseData.warehouseList.find((item: any) => item.value === val)
  if (!warehouse && val) {
    uni.showToast({ title: '仓库不存在', icon: 'none' })
    reactiveData.heardList.warehouse = ''
    reactiveData.setData.warehouseNumber = ''
    reactiveData.setData.warehouseId = ''
    await clearStock()
    focusTm()
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
    return
  }
  reactiveData.heardList.warehouse = warehouse.text
  reactiveData.setData.warehouseNumber = warehouse.value
  reactiveData.setData.warehouseId = warehouse.id
  handleFocus()
  await getWarehousePosition(val)
  //清空明细中的仓位,并获取推荐仓位
  await clearStock()
  emit('update:setData', reactiveData.setData)
  emit('update:detailsList', reactiveData.detailsList)
})

//仓位清空
const clearStock = async () => {
  console.log('清空明细中的仓位')
  reactiveData.detailsList.forEach(async (item: any) => {
    console.log('清空明细中的仓位1', reactiveData.setData.FlexNumber)
    item.WarehousePosition = ''
    item.WarehousePositionName = ''
    item.WarehousePositionId = ''
    item.detailList.location = ''
    item.detailList.stockLocName = ''
    item.currentList.find((i: any) => i.label === '仓位').value = ''

    //删除FlexNumber第一个字符
    let FlexNumber = reactiveData.setData.FlexNumber.substring(1)
    let TJStockId = await getStockLoc(
      item.MaterialCode,
      item.Lot,
      FlexNumber,
      reactiveData.setData.warehouseNumber
    )
    console.log('清空明细中的仓位2', TJStockId)
    item.currentList.find((i: any) => i.label === '推荐').value = TJStockId
  })
}

const focusTm = () => {
  console.log('光标重聚')
  reactiveData.focus = 0
  setTimeout(() => {
    reactiveData.focus = 99
  }, 200)
}

//获取仓库列表
const getWarehouseList = async () => {
  try {
    const res: any = await queryStorage()
    if (res?.data) {
      warehouseData.warehouseList = res.data.map((item: any) => {
        return {
          id: item[2],
          text: item[0],
          value: item[1]
        }
      })
    }
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    uni.showToast({
      title: '获取仓库列表失败',
      icon: 'none'
    })
  }
}

// 仓库选择器确认
const pickerConfirm = async (val: any) => {
  reactiveData.heardList.warehouse = val.text
  reactiveData.setData.warehouseNumber = val.value
  reactiveData.setData.warehouseId = val.id
  //清空明细中的仓位

  getWarehousePosition(val.value)
  emit('update:setData', reactiveData.setData)
  emit('update:detailsList', reactiveData.detailsList)
  warehouseData.show = false
}
//获取仓位
const getWarehousePosition = async (warehouseId: any) => {
  console.log('获取仓位', warehouseId)
  //查看仓位
  if (warehouseId) {
    const res: any = await lookqueryStorage(warehouseId)
    console.log('res', res)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      reactiveData.setData.FlexNumber = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber
      console.log('list', list)
      if (list[0].Id === 0) {
        reactiveData.locationList = []
        reactiveData.setData.locationDisplay = true
        focusTm()
        handleFocus()
        emit('update:locationList', reactiveData.locationList)
        return
      }
      reactiveData.locationList = list.map((item: any) => {
        return {
          Id: item.Id,
          text: item.FlexEntryId.Name[0].Value,
          value: item.FlexEntryId.Number
        }
      })

      if (reactiveData.locationList.length == 0) {
        reactiveData.setData.locationDisplay = true
        focusTm()
      } else {
        reactiveData.setData.locationDisplay = false
        setTimeout(() => {
          console.log('到我')
          reactiveData.focus = 99
        }, 200)
      }
      handleFocus()
      emit('update:locationList', reactiveData.locationList)
      console.log('reactiveData.locationList', reactiveData.locationList)
    }
  }
}

const hideTimer = ref<number | null>(null)

const handleFocus = () => {
  // 清除之前的定时器
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
          @confirm="searchChange"
        />
      </view>
    </view>
    <view class="flex items-center py-4rpx w-100%">
      <view class="w-50px flex justify-center">单号</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8">
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
    <!-- 仓库 -->
    <view class="flex items-center py-4rpx w-100%">
      <view class="w-50px flex justify-center">仓库</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          v-model="reactiveData.heardList.warehouse"
          :focus="reactiveData.focus === 1"
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
                <view class="flex items-center p-20rpx" style="border-bottom: 1px solid #f8f8f8">
                  <view>搜索</view>
                  <view class="flex-1">
                    <u-input
                      v-model="warehouseData.scValue"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <scroll-view scroll-y style="height: 800rpx">
                  <view
                    class=""
                    v-for="(warehouseItem, index) in warehouseData.warehouseList"
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
              </u-action-sheet>
            </view>
          </template>
        </u-input>
      </view>
    </view>
  </view>
</template>
