<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { debounceSave } from '@/utils'
import { camelCaseProduction, getcamelCase } from '@/common/storage/production'
import { productionOrder } from '@/api/modules/storage'
import { queryStorage, lookqueryStorage } from '@/api/modules/storage'
import { useEmitt } from '@/hooks/useEmitt'

//加载
const loading = ref(false)
const pageLoading = ref(true)
const focusIndex = ref(0) // 当前焦点索引
const { emitter } = useEmitt()
//仓库选择器
const pickerShow = ref(false)
//仓位选择器
const pickerShow2 = ref(false)
//仓位选择器
const pickerShow3 = ref(false)
//当前仓库
const currentWarehouse = reactive({
  name: '',
  number: ''
}) as any
//当前仓位
const currentWarehousePosition = reactive({
  name: '',
  number: ''
}) as any
//仓库
const warehouseList = ref([] as any)
//仓位
const warehousePositionList = ref([] as any)
const FlexNumber = ref('')

const reactiveData = reactive({
  searchValue: '',
  fid: 0,
  titleList: [
    {
      label: '单号',
      value: '',
      disabled: true,
      select: false
    },
    { label: '生产部门', value: '', disabled: true, select: false, display: true },
    { label: '仓库', value: '', scValue: '', disabled: false, select: true, change: true },
    { label: '仓位', value: '', scValue2: '', disabled: true, select: true, display: true }
  ],
  subsectionList: ['当前', '明细'],
  curNow: 1,
  currentList: [
    { label: '序号', value: '', disabled: true, select: false },
    { label: '源单号', value: '', disabled: true, select: false },
    { label: '批号', value: '', disabled: true, select: false },
    { label: '客户', value: '', disabled: true, select: false },
    { label: '批量', value: '', disabled: true, select: false },
    { label: '总箱数', value: '', disabled: true, select: false },
    { label: '物料编码', value: '', disabled: true, select: false },
    { label: '物料名称', value: '', disabled: true, select: false },
    { label: '规格型号', value: '', disabled: true, select: false },
    { label: '计量单位', value: '', disabled: true, select: false },
    { label: '推荐仓位', value: '', disabled: true, select: false },
    { label: '数量', value: '', disabled: true, select: false },
    { label: '仓位', value: '', disabled: false, select: false }
  ], //当前
  detailsList: [] as any, //明细
  //当前明细
  datailsIndex: 0
})
const searchInput = ref()
//订单号输入框
const searchChange = async () => {
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    handleFocus()

    /*在扫单入库的情况下第一次扫描单号*********************************/
    if (reactiveData.titleList[0].value === '') {
      const res = await getcamelCase(reactiveData.searchValue)
      reactiveData.detailsList = res.dataList
      reactiveData.fid = res.fid

      if (reactiveData.detailsList.length !== 0) {
        reactiveData.titleList[0].value = reactiveData.searchValue
        reactiveData.titleList[2].value = reactiveData.detailsList[0].WarehouseName
        //仓库
        currentWarehouse.name = reactiveData.detailsList[0].WarehouseName
        currentWarehouse.number = reactiveData.detailsList[0].WarehouseId
        warehouseClick(reactiveData.detailsList[0].WarehouseId)
        //仓位
        pickerConfirm2(
          {
            text: reactiveData.detailsList[0].WarehousePositionName,
            value: reactiveData.detailsList[0].WarehousePosition
          },
          false
        )
        setTimeout(() => {
          focusIndex.value = 0
        }, 200)
      }
      reactiveData.searchValue = ''
      changeFocus()
      return
    }
    loading.value = true
    const res: any = await camelCaseProduction(
      reactiveData.searchValue,
      currentWarehousePosition.number
    )
    if (!res) {
      reactiveData.searchValue = ''
      loading.value = false
      changeFocus()
      return
    }
    const index = reactiveData.detailsList.findIndex((item: any) => {
      return item.MaterialCode === res.MaterialCode && item.Lot === res.Lot
    })
    if (index !== -1) {
      if (!reactiveData.detailsList[index].isLowerCamelCase) {
        reactiveData.detailsList[index].isLowerCamelCase = true
        reactiveData.detailsList[index].Quantity2 = res.Quantity2
        reactiveData.detailsList[index].currentList[13].value = res.Quantity2
      } else {
        reactiveData.detailsList[index].Quantity2 += res.Quantity2
        reactiveData.detailsList[index].currentList[13].value =
          reactiveData.detailsList[index].Quantity2
      }
    } else {
      uni.showToast({
        icon: 'none',
        title: '当前明细不存在'
      })
    }
    reactiveData.searchValue = ''

    loading.value = false
    changeFocus()
  }, 500)
}
const changeFocus = () => {
  //光标位置
  focusIndex.value = 20
  if (currentWarehouse.number === '' && !reactiveData.titleList[3].display) {
    setTimeout(() => {
      focusIndex.value = 2
    }, 500)
  } else if (
    currentWarehousePosition.number === '' &&
    !reactiveData.titleList[3].disabled &&
    !reactiveData.titleList[3].display
  ) {
    setTimeout(() => {
      focusIndex.value = 3
    }, 500)
  } else {
    setTimeout(() => {
      focusIndex.value = 0
    }, 500)
  }
}

//获取仓库列表
const getWarehouseList = async () => {
  const res: any = await queryStorage()
  if (res) {
    warehouseList.value = res.data.map((item: any, index: number) => {
      return {
        id: index,
        text: item[0],
        value: item[1]
      }
    })
    pageLoading.value = false
  }
}
//扫码获取数据
const searchClick = async () => {
  //uniapp打开扫码
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  if (res) {
    const result = res.result

    if (focusIndex.value === 0) {
      reactiveData.searchValue = result
      searchChange()
    } else if (focusIndex.value === 2) {
      reactiveData.titleList[2].value = result
      warehouseChange(result, 2, true) // 手动调用仓库 change
      setTimeout(() => {
        focusIndex.value = 3
      }, 500)
    } else if (focusIndex.value === 3) {
      reactiveData.titleList[3].value = result
      warehouseChange(result, 3, false) // 手动调用仓位 change
      setTimeout(() => {
        focusIndex.value = 0
      }, 500)
    } else {
      searchInput.value.setValue(result)
    }
  }
}

function sectionChange(index: any) {
  reactiveData.curNow = index
  focusIndex.value = 999
}

//仓库扫出数据
const warehouseChange = debounceSave(
  async (val: any, iswarehouse: boolean, focus: number, iswarehousePosition?: boolean) => {
    // if (focusIndex.value == focus) {
    //   handleFocus()
    // }
    if (val == '') return

    if (iswarehouse) {
      clearAllPositions()
      //获取仓库id替换为仓库名称
      const warehouseId: any = warehouseList.value.find(
        (item: any) => item.value === val || item.text === val
      )
      if (!warehouseId) {
        //提示仓库不存在
        uni.showToast({
          title: '仓库不存在',
          icon: 'none'
        })
        reactiveData.titleList[2].value = ''
        currentWarehouse.name = ''
        currentWarehouse.number = ''
        //重新回到光标位置
        focusIndex.value = 20
        setTimeout(() => {
          focusIndex.value = 2
        }, 200)

        return
      }
      if (currentWarehouse.name == warehouseId.text) return
      focusIndex.value = 0
      reactiveData.titleList[2].value = warehouseId.text
      currentWarehouse.name = warehouseId.text
      currentWarehouse.number = warehouseId.value
      warehouseClick(val)
    } else {
      //获取仓位id替换为仓位名称
      if (warehousePositionList.value.length !== 0) {
        const warehouseId: any = warehousePositionList.value.find((item: any) => item.value === val)
        if (!warehouseId) {
          //提示仓位不存在
          uni.showToast({
            title: '仓位不存在',
            icon: 'none'
          })
          reactiveData.detailsList[reactiveData.datailsIndex].currentList[12].value = ''
          currentWarehousePosition.name = ''
          currentWarehousePosition.number = ''
          return
        }
        if (reactiveData.detailsList.length !== 0) {
          reactiveData.detailsList[reactiveData.datailsIndex].currentList[12].value =
            warehouseId.text
        }
        if (!iswarehousePosition) {
          reactiveData.titleList[3].value = warehouseId.text
          currentWarehousePosition.name = warehouseId.text
          currentWarehousePosition.number = warehouseId.value
          if (reactiveData.detailsList.length !== 0) {
            reactiveData.detailsList[reactiveData.datailsIndex].WarehousePosition =
              warehouseId.value
          }
        } else {
          reactiveData.detailsList[reactiveData.datailsIndex].currentList[12].value =
            warehouseId.text
          reactiveData.detailsList[reactiveData.datailsIndex].WarehousePosition = warehouseId.value
          reactiveData.detailsList[reactiveData.datailsIndex].WarehousePositionId = warehouseId.id
        }

        focusIndex.value = 0
      } else {
        reactiveData.titleList[3].value = ''
      }
    }
  }
)
//选择仓库
const warehouseClick = async (val: any) => {
  //清空仓位
  currentWarehousePosition.name = ''
  currentWarehousePosition.number = ''
  reactiveData.titleList[3].value = ''
  //查看仓位
  if (val) {
    const res: any = await lookqueryStorage(val)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      FlexNumber.value = res.data.Result.Result.StockFlexItem[0].FlexId?.FlexNumber
      if (list[0].Id === 0) {
        warehousePositionList.value = []
        return
      }
      warehousePositionList.value = list.map((item: any) => {
        return {
          text: item.FlexEntryId.Name[0].Value,
          value: item.FlexEntryId.Number
        }
      })
    }
  }
}
//仓库选择器确认
const pickerConfirm = async (val: any) => {
  currentWarehouse.name = val.text
  currentWarehouse.number = val.value
  reactiveData.titleList[2].value = val.text
  clearAllPositions()

  warehouseClick(val.value)
  pickerShow.value = false
}
//仓位选择器确认
const pickerConfirm2 = (val: any, iswarehousePosition?: boolean) => {
  if (reactiveData.detailsList.length !== 0) {
    reactiveData.detailsList[reactiveData.datailsIndex].currentList[12].value = val.text
  }
  if (!iswarehousePosition) {
    reactiveData.titleList[3].value = val.value
    currentWarehousePosition.name = val.text
    currentWarehousePosition.number = val.value
    if (reactiveData.detailsList.length !== 0) {
      reactiveData.detailsList[reactiveData.datailsIndex].WarehousePosition = val.value
    }
  }
  pickerShow2.value = false
  pickerShow3.value = false
}

//长按事件 删除明细
const longpressClick = (item: any, index: number) => {
  //弹出删除提示框
  uni.showModal({
    title: '提示',
    content: '是否删除当前明细',
    success: (res) => {
      if (res.confirm) {
        //删除当前明细
        reactiveData.detailsList.splice(index, 1)
        if (reactiveData.detailsList.length === 0) {
          reactiveData.datailsIndex = 0
        } else if (reactiveData.datailsIndex > index) {
          reactiveData.datailsIndex--
        }
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

//清空仓位
const clearAllPositions = () => {
  // 清空当前仓位信息
  currentWarehousePosition.name = ''
  currentWarehousePosition.number = ''

  // 清空表头仓位显示
  reactiveData.titleList[3].value = ''

  // 清空明细列表中所有项目的仓位信息
  if (reactiveData.detailsList && reactiveData.detailsList.length > 0) {
    reactiveData.detailsList.forEach((item: any) => {
      // 清空仓位编号
      item.WarehousePosition = ''
      item.WarehousePositionName = ''
      // 清空仓位相关字段
      if (item.currentList.length > 0) {
        item.currentList.find((i: any) => i.label === '仓位').value = ''
      }
    })
  }
}

//返回到父组件
const backClick = async () => {
  // 声明为异步函数
  //搜索条件 查找源单号和源单行号的分录编码
  const conditions = reactiveData.detailsList.map((item: any) => {
    return `(FBillNo = '${item.SourceOrderNo}' AND FTreeEntity_FSeq = ${item.SourceOrderLineNo})`
  })
  const result = conditions.join(' OR ')
  const res: any = await productionOrder(result)

  let dataList = [] as any
  let integer = {
    isInteger: true,
    Name: ''
  }

  //表头生产车间
  let SCCJ = 'BM000001'
  let isError = false //是否有错误
  // 使用Promise.all等待所有异步操作完成
  await Promise.all(
    reactiveData.detailsList.map(async (item: any, index: number) => {
      if (!item.isInteger) {
        integer.isInteger = false //如果有一个不是整数就返回false
        integer.Name = item.Name
        //提示不配套

        throw new Error(`第${index + 1}行不配套`)
      }

      if (currentWarehouse.number === '') {
        throw new Error('请先选择仓库')
      }
      if (currentWarehousePosition.number === '' && !reactiveData.titleList[3].disabled) {
        throw new Error('请先选择仓位')
      }
      if (item.Quantity2 > item.canReceive) {
        throw new Error(`第${index + 1}行数量大于可收数量`)
      }
      if (res && res.data && res.data.length > 0) {
        const orderData = res.data
        //查找相同
        const index = orderData.findIndex((item1: any) => {
          return item1[1] === item.SourceOrderNo && item1[2] === item.SourceOrderLineNo
        })
        if (index === -1) return
        //单据内码
        const documentInnerCode = orderData[index][0] //单据内码
        //分录内码
        const entryInnerCode = orderData[index][3] //分录内码
        //应收数量
        const mustQty = orderData[index][4] //应收数量

        //表头生产车间赋值
        if (item.ProductionDepartment) {
          SCCJ = item.ProductionDepartment
        }
        //仓位
        const FStockLocPJ = 'FSTOCKLOCID__' + FlexNumber.value
        const FStockLocId = {} as any
        FStockLocId[FStockLocPJ] = {
          FNumber: item.WarehousePosition
        }
        // 构建 data 对象（同上）
        let data = {
          FSrcEntryId: entryInnerCode, //源单分录内码
          FIsNew: false, //是否新增行
          FMaterialId: {
            //物料编码
            FNumber: item.MaterialCode
          },
          FProductType: '1', //产品类型
          FInStockType: '1', //入库类型
          FREQSRC: 1, //需求来源
          FReqBillNo: item.SourceOrderNo, //需求单据
          FReqBillId: entryInnerCode, //需求单据内码
          FReqEntrySeq: item.SourceOrderLineNo, //需求单据行号
          FUnitID: {
            //单位
            FNumber: item.Unit
          },
          FMustQty: mustQty, //应收数量
          FRealQty: item.Quantity2, //实收数量
          FCostRate: 100.0, //成本权重
          FBaseUnitId: {
            //基本单位
            FNumber: item.Unit
          },
          FBaseMustQty: mustQty, //基本单位应收数量
          FBaseRealQty: item.Quantity2, //基本单位库存实收数量
          FOwnerTypeId: 'BD_OwnerOrg', //货主类型
          FOwnerId: {
            //货主
            FNumber: '100'
          },
          FStockId: {
            //仓库
            FNumber: currentWarehouse.number
          },
          FStockLocId: FStockLocId, //仓位
          FLot: {
            FNumber: item.Lot
          },
          FISBACKFLUSH: true, //倒冲领料
          FWorkShopId1: {
            //生产车间
            FNumber: orderData[index][5]
          },
          FMoBillNo: item.SourceOrderNo, //生产订单编号
          FMoId: documentInnerCode, //生产订单内码
          FMoEntryId: entryInnerCode, //生产订单分录内码
          FMoEntrySeq: item.SourceOrderLineNo, //生产订单行号
          FMemo: item.otherData.FMemo, //备注
          FStockUnitId: {
            //库存单位
            FNumber: item.Unit
          },
          FStockRealQty: item.Quantity2, //库存单位实收数量
          FSecRealQty: 0.0, //辅助单位实收数量
          FSrcBillType: 'PRD_MO', //源单类型
          FSrcInterId: documentInnerCode, //源单内码
          FSrcBillNo: item.SourceOrderNo, //源单编号
          FBasePrdRealQty: item.Quantity2, //基本单位生产实收数量
          FIsFinished: false, //完工
          FStockStatusId: {
            //库存状态
            FNumber: 'KCZT01_SYS'
          },
          FSrcEntrySeq: item.SourceOrderLineNo, //源单行号
          FMOMAINENTRYID: entryInnerCode, //生产订单主产品分录
          FKeeperTypeId: 'BD_KeeperOrg', //保管者类型
          FKeeperId: {
            //保管者
            FNumber: '100'
          },
          FSelReStkQty: 0.0, //退库选单数
          FBaseSelReStkQty: 0.0, //基本单位退库选单数量
          F_ALMA_SCANQTY: 0.0, //扫描数量
          FIsOverLegalOrg: false, //组织间结算跨法人
          F_QADV_KH: {
            //客户
            FNUMBER: item.otherData.F_QADV_KH
          },
          F_QADV_TIQTY: orderData[index][6], //累计入库数量
          F_QADV_HTNO: item.otherData.F_QADV_HTNO, //合同号
          F_BARSubEntity: item.barcodeList,
          FEntity_Link: item.FEntity_Link,
          FBFLowId: {
            FID: 'f11b462a-8733-40bd-8f29-0906afc6a201'
          } //流转单ID
        }
        if (item.Quantity2 !== 0) {
          dataList.push(data)
        }
      }
    })
  ).catch((error) => {
    isError = true //有错误
    console.error(`处理项出错:`, error)
    uni.showToast({
      title: error.message,
      icon: 'none'
    })
    return null
  })
  return { dataList, fid: reactiveData.fid, isError, SCCJ } // 返回填充后的数据
}
const quantChange = (val: any) => {
  reactiveData.detailsList[reactiveData.datailsIndex].Quantity2 = val
  reactiveData.detailsList[reactiveData.datailsIndex].currentList[13].value = val
}

const clearTimer = () => {
  // 清除定时器
  emitter.emit('update:clearTimer')
}
const handleFocus = () => {
  emitter.emit('update:handleFocus')
}

onBeforeMount(() => {
  // 组件挂载前的逻辑
  getWarehouseList()
})

defineExpose({
  backClick
})
</script>

<template>
  <view>
    <u-loading-page :loading="pageLoading" />
  </view>
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
        :focus="focusIndex == 0"
        @focus="focusIndex = 0"
        @blur="searchChange"
      />
    </view>
  </view>
  <!-- 生产部门 -->
  <view class="bg-#FFF pt-4px">
    <view
      v-for="(item, index) of reactiveData.titleList"
      :key="index"
      class="flex items-center pb-4px"
      v-show="!item.display"
    >
      <view class="w-50px flex justify-center">{{ item.label }} </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" v-if="!item.select">
        <u-input
          v-model="item.value"
          :showAction="false"
          :disabled="item.disabled"
          shape="round"
          placeholder=""
          :focus="index == focusIndex"
        />
      </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" v-else @click="clearTimer">
        <u-input
          v-model="item.value"
          :showAction="false"
          :disabled="item.disabled"
          shape="round"
          placeholder=""
          :focus="index == focusIndex"
          @focus="focusIndex = index"
          @blur="warehouseChange($event, item.label == '仓库', index)"
        >
          <template #suffix>
            <view
              @click="
                item.label == '仓库'
                  ? (pickerShow = true)
                  : !item.disabled
                  ? (pickerShow2 = false)
                  : (pickerShow2 = false)
              "
            >
              <u-icon name="arrow-down" size="20" />
            </view>
            <view>
              <u-action-sheet
                :show="pickerShow"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="pickerShow = false"
              >
                <view class="flex items-center p-20rpx" style="border-bottom: 1px solid #f8f8f8">
                  <view @tap="pickerShow = false">搜索 </view>
                  <view class="flex-1" @click="clearTimer">
                    <u-input
                      id="searchInput1"
                      v-model="item.scValue"
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
                    <view class="" v-for="(warehouseItem, index) of warehouseList" :key="index">
                      <view
                        class="flex justify-center py-10px"
                        style="border-bottom: 1px solid #f8f8f8"
                        v-if="warehouseItem.value.indexOf(item.scValue || '') !== -1"
                        @tap="pickerConfirm(warehouseItem)"
                      >
                        {{ warehouseItem.text }}
                      </view>
                    </view>
                  </scroll-view>
                </view>
              </u-action-sheet>
            </view>
            <view>
              <u-action-sheet
                :show="pickerShow2"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="pickerShow2 = false"
              >
                <view class="flex items-center p-20rpx" style="border-bottom: 1px solid #f8f8f8">
                  <view @tap="pickerShow2 = false">搜索 </view>
                  <view class="flex-1" @click="clearTimer">
                    <u-input
                      id="searchInput2"
                      v-model="item.scValue2"
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
                      v-for="(warehouseItem, index) of warehousePositionList"
                      :key="index"
                    >
                      <view
                        class="flex justify-center py-10px"
                        style="border-bottom: 1px solid #f8f8f8"
                        v-if="warehouseItem.value.indexOf(item.scValue2 || '') !== -1"
                        @tap="pickerConfirm2(warehouseItem, false)"
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
  <view v-if="loading" class="bg-#FFF h-300rpx flex items-center justify-center">
    <u-loading-icon text="加载中" textSize="18" />
  </view>
  <view v-else class="bg-#FFF content-input">
    <u-subsection
      :list="reactiveData.subsectionList"
      :current="reactiveData.curNow"
      @change="sectionChange"
    />
    <scroll-view scroll-y style="height: calc(100vh - 44px - 44px - 80px - 34px - 40px - 26px)">
      <view class="pt-6rpx">
        <!-- 当前 -->
        <view v-if="reactiveData.curNow == 0" class="flex flex-wrap">
          <view
            v-for="(item, index) of reactiveData.detailsList[reactiveData.datailsIndex]
              ?.currentList || []"
            :key="index"
            class="flex items-center mb-6rpx"
            :style="item.style"
          >
            <view class="w-50px flex justify-center">
              {{ item.label }}
            </view>
            <view
              class="flex-1 mr-20rpx"
              style="border: 1px solid #f8f8f8"
              v-if="item.type == 'input'"
              @click="clearTimer"
            >
              <u-input
                v-model="item.value"
                :showAction="false"
                :disabled="item.disabled"
                shape="round"
                placeholder=""
                :type="item.label === '数量' ? 'number' : 'text'"
                @change="quantChange"
              />
            </view>
            <view
              class="flex-1 mr-20rpx"
              style="border: 1px solid #f8f8f8"
              v-else-if="item.type == 'select'"
              @click="clearTimer"
            >
              <u-input
                v-model="item.value"
                :showAction="false"
                :disabled="warehousePositionList.length == 0"
                shape="round"
                placeholder=""
                :focus="index == focusIndex"
                @blur="warehouseChange($event, item.label == '仓库', index, true)"
              >
                <template #suffix>
                  <view @click="warehousePositionList.length !== 0 ? (pickerShow3 = true) : ''">
                    <u-icon name="arrow-down" size="20" />
                  </view>
                  <view>
                    <u-action-sheet
                      :show="pickerShow3"
                      round="10"
                      :closeOnClickOverlay="true"
                      :closeOnClickAction="true"
                      @close="pickerShow3 = false"
                    >
                      <view
                        class="flex items-center p-20rpx"
                        style="border-bottom: 1px solid #f8f8f8"
                      >
                        <view @tap="pickerShow3 = false">搜索 </view>
                        <view class="flex-1" @click="clearTimer">
                          <u-input
                            id="searchInput2"
                            v-model="item.scValue2"
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
                            v-for="(warehouseItem, index) of warehousePositionList"
                            :key="index"
                          >
                            <view
                              class="flex justify-center py-10px"
                              style="border-bottom: 1px solid #f8f8f8"
                              v-if="warehouseItem.value.indexOf(item.scValue2 || '') !== -1"
                              @tap="pickerConfirm2(warehouseItem, false)"
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
        <!-- 明细 -->
        <view v-else-if="reactiveData.curNow == 1">
          <view
            v-for="(item, index) of reactiveData.detailsList"
            :key="index"
            class="flex items-center mb-6rpx"
            :class="[
              index % 2 === 0 ? 'bg-#F2F2F2' : 'bg-white', // 基础黑白交替
              index === reactiveData.datailsIndex ? '!bg-[#C4D8EE]' : '' // 覆盖选中状态
            ]"
            @click="reactiveData.datailsIndex = index"
            @longpress="longpressClick(item, index)"
          >
            <view class="w-20px flex justify-center">{{ index + 1 }}</view>
            <view class="flex-1 mr-20rpx">
              <view class="flex">
                <view class=""> 编码： {{ item.MaterialCode }}</view>
              </view>
              <view class=""> 批号： {{ item.Lot }}</view>

              <view> 名称： {{ item.Name }}</view>
              <view class="flex-wrap"> 规格： {{ item.Specification }}</view>
              <view class="flex">
                <view class="w-50%"> 可收： {{ item.canReceive }}</view>
                <view class="w-50%"> 数量： {{ item.Quantity2 }}</view>
              </view>
              <view class="flex">
                <view class="w-50%"> 仓位： {{ item.WarehousePosition }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
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
