<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { queryStorage } from '@/api/modules/storage'
import { scanBarCode, getSanDan } from '@/common/materialWithdrawal/Index'
import { getSanSimple } from '@/common/materialWithdrawal/Simple'
import { getSanOutsourcing } from '@/common/materialWithdrawal/Outsourced'
import { useEmitt } from '@/hooks/useEmitt'
import { debounce } from '@/utils'

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

//扫描条码
const searchChange = debounce(async () => {
  console.log('搜索值', reactiveData.searchValue)

  // 防止空值搜索
  if (!reactiveData.searchValue.trim()) {
    return
  }

  emitter.emit('update:handleFocus')

  try {
    if (!reactiveData.heardList.documentNumber) {
      //扫描采购订单
      let queryRes: any = {}
      switch (props.title) {
        case '生产领料':
          queryRes = await getSanDan(reactiveData.searchValue)
          break
        case '简单生产领料':
          queryRes = await getSanSimple(reactiveData.searchValue)
          break
        case '委外领料':
          queryRes = await getSanOutsourcing(reactiveData.searchValue)
          break
      }

      if (queryRes && queryRes.dataList?.length > 0) {
        reactiveData.setData.fid = queryRes.fid
        reactiveData.detailsList = queryRes.dataList
        reactiveData.heardList.documentNumber = reactiveData.searchValue

        // 安全检查确保数据存在
        if (queryRes.dataList[0]) {
          reactiveData.heardList.warehouse = queryRes.dataList[0].stockName || ''
          reactiveData.setData.warehouseNumber = queryRes.dataList[0].stockNumber || ''
          reactiveData.setData.warehouseId = queryRes.dataList[0].stockNumber || '' // 仓库ID通常与编号相同
          reactiveData.setData.FlexNumber = queryRes.dataList[0].FlexNumber || ''
        }

        emit('update:setData', reactiveData.setData)
        emit('update:detailsList', reactiveData.detailsList)
      } else {
        // uni.showToast({
        //   title: '未找到相关单据',
        //   icon: 'none'
        // })
      }
    } else {
      //调用条码（单据查询）
      const queryRes: any = await scanBarCode(reactiveData.searchValue)

      if (!queryRes) {
        reactiveData.searchValue = ''
        focusTm()
        return
      }

      const index = reactiveData.detailsList.findIndex((item: any) => {
        return item.MaterialCode === queryRes.MaterialCode && item.Lot === queryRes.Lot
      })

      if (index !== -1) {
        let Quantity = Number(queryRes.CurrentQty || 0)

        if (reactiveData.detailsList[index].isLowerCamelCase) {
          reactiveData.detailsList[index].Quantity2 += Quantity

          //当数量大于可领数量时，赋值为可领数量
          if (
            props.title !== '简单生产领料' &&
            reactiveData.detailsList[index].Quantity2 > reactiveData.detailsList[index].canReceive
          ) {
            reactiveData.detailsList[index].Quantity2 = reactiveData.detailsList[index].canReceive
            uni.showToast({
              title: '实收数量大于可领数量',
              icon: 'none'
            })
          }
          reactiveData.detailsList[index].currentList[11].value =
            reactiveData.detailsList[index].Quantity2
        } else {
          reactiveData.detailsList[index].Quantity2 = Quantity
          //当数量大于可领数量时，赋值为可领数量
          if (
            props.title !== '简单生产领料' &&
            reactiveData.detailsList[index].Quantity2 > reactiveData.detailsList[index].canReceive
          ) {
            reactiveData.detailsList[index].Quantity2 = reactiveData.detailsList[index].canReceive
            uni.showToast({
              title: '实收数量大于可领数量',
              icon: 'none'
            })
          }
          reactiveData.detailsList[index].currentList[11].value = Quantity
          reactiveData.detailsList[index].isLowerCamelCase = true
        }

        // 分配数量到EntityList
        const entityList = reactiveData.detailsList[index].EntityList || []
        let remainingValue = reactiveData.detailsList[index].Quantity2

        // 循环遍历EntityList，依次分配值给Quantity2，以canReceive为上限
        for (const item of entityList) {
          if (remainingValue <= 0) break

          // 计算可以分配给当前项的最大值（不超过canReceive）
          const maxAssignable = Math.min(remainingValue, item.canReceive || 0)

          // 分配值给Quantity2
          item.Quantity2 = maxAssignable

          // 更新剩余值
          remainingValue -= maxAssignable
        }

        // 更新父组件的数据
        emitter.emit('update:barcodeIndex', index)
      } else {
        //提示
        uni.showToast({
          title: '条码与编码或者批号不符',
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

const focusTm = () => {
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
const clearTimer = () => {
  emitter.emit('update:clearTimer')
}
onBeforeMount(() => {
  // 组件挂载前的逻辑
  getWarehouseList()
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
  </view>
</template>
