<script setup lang="ts">
import { reactive, ref, onBeforeMount, onBeforeUnmount } from 'vue'

import { getPickupOrder, productionGetData } from '@/common/lowerCamelCase/LowerCamelCase'
import { SalesOutboundType } from '@/types/LowerCamelCaseType'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  containerNoValue: {
    //柜号
    type: Number,
    default: 0
  },
  numbers: {
    //单号
    type: String,
    default: ''
  }
})
//数据
const reactiveData = reactive({
  searchValue: '', //搜索值
  TMdisabled: false,
  pickupOrderValue: '', //单号
  containerNoValue: 1, //柜号
  focus: 1,
  detailsList: [] as SalesOutboundType[],
  containerNoList: [
    {
      label: '1',
      value: 1
    },
    {
      label: '2',
      value: 2
    },
    {
      label: '3',
      value: 3
    },
    {
      label: '4',
      value: 4
    },
    {
      label: '5',
      value: 5
    },
    {
      label: '6',
      value: 6
    },
    {
      label: '7',
      value: 7
    },
    {
      label: '8',
      value: 8
    },
    {
      label: '9',
      value: 9
    },
    {
      label: '10',
      value: 10
    }
  ], //柜号数组
  pickerShow: false
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:lowerCamelCaseList', modelValue: SalesOutboundType[]): void
  (e: 'update:loading', modelValue: boolean): void
  (e: 'update:model', modelValue: any): void
  (e: 'update:containerNoValue', modelValue: any): void
  (e: 'update:numbers', modelValue: any): void
}>()
const { emitter } = useEmitt()

//离开时搜索
const searchChange = () => {
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    emit('update:loading', true)
    handleFocus()
    // 第一次扫单号
    if (!reactiveData.pickupOrderValue) {
      emitter.emit('update:TMdisabled', true)
      reactiveData.TMdisabled = true
      const res = await getPickupOrder(reactiveData.searchValue)
      if (res && res.dataList.length > 0) {
        reactiveData.TMdisabled = false
        emitter.emit('update:TMdisabled', false)
        reactiveData.pickupOrderValue = JSON.parse(JSON.stringify(reactiveData.searchValue))
        reactiveData.detailsList = res.dataList
        emit('update:lowerCamelCaseList', res.dataList)
        emit('update:model', res.model)
        emit('update:numbers', reactiveData.pickupOrderValue)
      } else {
        //扫码有问题
        reactiveData.TMdisabled = false
      }
    } else {
      //后续扫码-扫描条码
      let exitMethod = false
      /*判断条码是否重复扫面************************************************/
      reactiveData.detailsList.forEach((element: any) => {
        const index = element.barcodeList.findIndex((item: any) => {
          return item.FNumber === reactiveData.searchValue
        })
        if (index !== -1) {
          exitMethod = true
          uni.showToast({
            title: '重复扫描',
            icon: 'none'
          })

          return
        }
      })
      if (exitMethod) {
        reactiveData.searchValue = ''
        reactiveData.focus = 20
        setTimeout(() => {
          reactiveData.focus = 1
        }, 500)

        return
      }
      const res = await productionGetData(reactiveData.searchValue)
      if (res) {
        //判断条码单合同号是否一致
        const index = reactiveData.detailsList.findIndex((item: any) => {
          return (
            item.OrderNo === res.OrderNo &&
            item.OrderSeq === res.OrderSeq &&
            item.number === res.Fnumber
          )
        })

        if (index !== -1) {
          reactiveData.detailsList[index].barcodeList.push(res.barcodeList)
          reactiveData.detailsList[index].IsSplit = res.IsSplit
          emitter.emit('update:datailsIndex', index)
          //分装情况下
          if (res.IsSplit) {
            //判断分装批次号列表中是否有该分装批次号
            const index2 = reactiveData.detailsList[index].FZLOTList.findIndex((item: any) => {
              return item === res.FZLOT
            })

            if (index2 === -1) {
              //没有的情况下，添加分装批次号到列表中，并且把packagingData跟packagingSig储存到packagingDataFZLOT
              reactiveData.detailsList[index].FZLOTList.push(res.FZLOT)

              reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT] = {
                packagingData: res.packagingData,
                packagingSig: res.packagingSig
              }
            } else {
              // 有的情况下，直接加数量
              reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingData[
                res.barcodeList.subPackageNo
              ].quantity += res.packagingData[res.barcodeList.subPackageNo].quantity //数量

              reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingData[
                res.barcodeList.subPackageNo
              ].unitQty = res.packagingData[res.barcodeList.subPackageNo].unitQty //用量

              reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingData[
                res.barcodeList.subPackageNo
              ].finishedQty =
                reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingData[
                  res.barcodeList.subPackageNo
                ].quantity / res.packagingData[res.barcodeList.subPackageNo].unitQty //成品

              //计算最小值
            }

            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingSig =
              res.packagingSig
            let hasZero = false
            let minNonZero = Infinity

            res.packagingSig.forEach((item: any) => {
              const sum = Number(
                reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingData[item]
                  .finishedQty
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
            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].isInteger =
              productsQuantity % 1 === 0 && productsQuantity !== 0

            reactiveData.detailsList[index].isInteger =
              productsQuantity % 1 === 0 && productsQuantity !== 0

            if (reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].isInteger) {
              reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingSig.forEach(
                (element: any) => {
                  if (
                    reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].packagingData[
                      element
                    ].finishedQty !== productsQuantity
                  ) {
                    reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].isInteger = false
                    reactiveData.detailsList[index].isInteger = false
                    return
                  }
                }
              )
            }

            //计算单分装成品数量
            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOT].FZquantity =
              Math.floor(productsQuantity)

            let dataQuant = reCompute(reactiveData.detailsList[index])
            reactiveData.detailsList[index].currentTotal = dataQuant // 数量取整
          } else {
            reactiveData.detailsList[index].currentTotal += res.barcodeList.quantity //数量
            reactiveData.detailsList[index].isInteger = true //是否整数
          }
          reactiveData.detailsList[index].currentList[10].value =
            reactiveData.detailsList[index].barcodeList.length
          //累计值
          reactiveData.detailsList[index].cumulativeActualSend =
            reactiveData.detailsList[index].cumulativeAct +
            reactiveData.detailsList[index].currentTotal

          reactiveData.detailsList[index].currentList[8].value =
            reactiveData.detailsList[index].cumulativeActualSend

          reactiveData.detailsList[index].currentList[9].value =
            reactiveData.detailsList[index].currentList[7].value -
            reactiveData.detailsList[index].currentList[8].value
          emit('update:lowerCamelCaseList', reactiveData.detailsList)

          //如果累计实发超过对应发数量，调用删除
          if (
            reactiveData.detailsList[index].cumulativeActualSend >
            reactiveData.detailsList[index].shouldSendQuantity
          ) {
            let deleteBarcode = {
              item: reactiveData.detailsList[index].barcodeList[
                reactiveData.detailsList[index].barcodeList.length - 1
              ],
              index: reactiveData.detailsList[index].barcodeList.length - 1
            }
            emitter.emit('deleteBarcode', deleteBarcode)
          }
        } else {
          //提示
          uni.showToast({
            title: '条码与明细不相符',
            icon: 'none'
          })
        }
      }
    }
    reactiveData.focus = 20
    setTimeout(() => {
      reactiveData.searchValue = ''
      reactiveData.focus = 1
    }, 500)
    emit('update:loading', false)
  }, 500)
}

//柜号选择
const containerNoClick = async (val: any) => {
  reactiveData.containerNoValue = val.value
  emit('update:containerNoValue', reactiveData.containerNoValue)
  reactiveData.pickerShow = false
}

//重新计算总额
const reCompute = (val: any) => {
  let sum = 0
  val.FZLOTList.forEach((item: any) => {
    sum += val.packagingDataFZLOT[item].FZquantity
  })
  return sum
}

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

onBeforeMount(() => {
  // 组件挂载前的逻辑
  handleFocus()
  if (reactiveData.pickupOrderValue == '') {
    reactiveData.searchValue = props.numbers
    searchChange()
  }
  if (reactiveData.containerNoValue !== 0) {
    reactiveData.containerNoValue = props.containerNoValue
  }
})
onBeforeUnmount(() => {
  // 组件卸载时清理
  clearTimer()
})

const testClick = () => {
  let list = [
    'PE650010A000325070001',
    'PE650010A000425070001',
    'PE650010A000525070001',
    'PE650010A000625070001',
    'PE650010A000725070001',
    'PE650010A000825070001',
    'PE650010A001025070001',
    'PE650010A001225070001',
    'PE650010A001325070001',
    'PE650010A001425070001',
    'PE650010A001525070001',
    'PE650010A001625070001',
    'PE650010A001725070001',
    'PE650010A001825070001',
    'PE650010A001925070001',
    'PE650010A002025070001',
    'PE650010A002125070001',
    'PE650010A002225070001',
    'PE650010A002325070001',
    'PE650010A002425070001',
    'PE650031A0001.000125070001',
    'PE650031A0002.000125070001',
    'HA77001B000125070002',
    'HA77001B000125070003',
    'HC73003A000125070002',
    'HC73003A000125070003',
    'PE650010A000125070002',
    'PE650010A000125070003',
    'PE650010A000325070003',
    'PE650010A000325070002',
    'PE650010A000225070003',
    'PE650010A000425070002',
    'PE650010A000425070003',
    'PE650010A000525070002',
    'PE650010A000525070003',
    'PE650010A000725070003',
    'PE650010A000725070002',
    'PE650010A000625070003',
    'PE650010A000625070002',
    'PE650010A000825070002',
    'PE650010A000825070003',
    'PE650010A001025070002',
    'PE650010A001025070003',
    'PE650010A001125070002',
    'PE650010A001125070003',
    'PE650010A001225070002',
    'PE650010A001225070003',
    'PE650010A001325070002',
    'PE650010A001325070003',
    'PE650010A001425070002',
    'PE650010A001425070003',
    'PE650010A001525070002',
    'PE650010A001625070002',
    'PE650010A001625070003',
    'PE650010A001725070002',
    'PE650010A001725070003',
    'PE650010A001825070002',
    'PE650010A001825070003',
    'PE650010A001925070002',
    'PE650010A001925070003',
    'PE650010A002025070002',
    'PE650010A002025070003',
    'PE650010A002125070002',
    'PE650010A002125070003',
    'PE650010A002225070002',
    'PE650010A002225070003',
    'PE650010A002325070002',
    'PE650010A002325070003',
    'PE650010A002425070002',
    'PE650010A002425070003',
    'PE650031A0001.000125070003',
    'PE650031A0002.000125070002',
    'PE650031A0002.000125070003',
    'PE650010A000125070004',
    'PE650010A000225070004',
    'PE650010A000325070004',
    'PE650010A000425070004',
    'PE650010A000525070004',
    'PE650010A000625070004',
    'PE650010A000725070004',
    'PE650010A000825070004',
    'PE650010A001325070004',
    'PE650010A001225070004',
    'PE650010A001125070004',
    'PE650010A001025070004',
    'PE650010A001425070004',
    'PE650010A001525070004',
    'PE650010A001625070004',
    'PE650010A001725070004',
    'PE650010A001925070004',
    'PE650010A002025070004',
    'PE650010A002125070004',
    'PE650010A000125070005',
    'PE650010A002425070004',
    'PE650010A002325070004',
    'PE650010A002225070004',
    'PE650010A000225070005',
    'PE650010A000325070005',
    'PE650010A000425070005',
    'PE650010A000525070005',
    'PE650010A001025070005',
    'PE650010A000825070005',
    'PE650010A000725070005',
    'PE650010A000625070005',
    'PE650010A001125070005',
    'PE650010A001225070005',
    'PE650010A001325070005',
    'PE650010A001425070005',
    'PE650010A001625070005',
    'PE650010A001725070005',
    'PE650010A001825070005',
    'PE650010A002025070005',
    'PE650010A001925070005',
    'B1C2001N10ROP000125070001',
    'B1C2014A04RAT000125070001',
    'B1C2014N04RAT000125070001',
    'HA77001B000125070001',
    'HC73003A000125070001',
    'PE650010A000125070001',
    'PE650010A000225070001',
    'PE650010A000225070002',
    'PE650010A001125070001',
    'PE650010A001525070003',
    'PE650010A001525070005',
    'PE650010A001825070004',
    'PE650031A0001.000125070002'
  ]

  //每两秒读取一个值给搜索框赋值
  let b = 0
  const intervalId = setInterval(() => {
    if (b >= list.length) {
      clearInterval(intervalId) // 停止定时器
      return
    }

    reactiveData.searchValue = list[b]
    searchChange()
    b++
  }, 1000)
  return
}
</script>

<template>
  <view>
    <!-- <view @click="testClick">调试</view> -->
    <view class="flex items-center py-10rpx">
      <view class="w-70px flex justify-center">条码</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.searchValue"
          :showAction="false"
          shape="round"
          :disabled="reactiveData.TMdisabled"
          :focus="reactiveData.focus == 1"
          placeholder=""
          @blur="searchChange"
        />
      </view>
    </view>
    <view class="flex">
      <view class="flex items-center pb-10rpx w-70%">
        <view class="w-70px flex justify-center">单号</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8">
          <u-input
            v-model="reactiveData.pickupOrderValue"
            :showAction="false"
            :disabled="true"
            shape="round"
            placeholder=""
          />
        </view>
      </view>
      <view class="flex items-center pb-10rpx w-30%">
        <view class="w-40px flex justify-center">柜号</view>
        <view
          class="flex-1 mr-20rpx h-30px flex items-center pt-2px px-20px"
          style="border: 1px solid #f8f8f8"
          @click="reactiveData.pickerShow = true"
        >
          {{ reactiveData.containerNoValue }}
        </view>
      </view>
      <view>
        <u-action-sheet
          :show="reactiveData.pickerShow"
          round="10"
          :closeOnClickOverlay="true"
          :closeOnClickAction="true"
          @close="reactiveData.pickerShow = false"
        >
          <view>
            <!-- 滚动条 -->
            <scroll-view scroll-y style="height: 800rpx">
              <view
                class=""
                v-for="(warehouseItem, index) of reactiveData.containerNoList"
                :key="index"
              >
                <view
                  class="flex justify-center py-10px"
                  style="border-bottom: 1px solid #f8f8f8"
                  @click="containerNoClick(warehouseItem)"
                >
                  {{ warehouseItem.value }}
                </view>
              </view>
            </scroll-view>
          </view>
        </u-action-sheet>
      </view>
    </view>
  </view>
</template>
