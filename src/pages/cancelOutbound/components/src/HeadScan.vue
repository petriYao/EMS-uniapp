<script setup lang="ts">
import { reactive, ref, onBeforeUnmount, onBeforeMount, watch } from 'vue'
import { productionGetData } from '@/common/cancelOutbound/Index'
import { SalesOutboundCancelType } from '@/types/LowerCamelCaseType'
// import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps<{
  pickupOrderValue: any
  containerNoValue: any
}>()
//数据
const reactiveData = reactive({
  searchValue: '', //搜索值
  pickupOrderValue: '', //单号
  containerNoValue: 1, //柜号
  focus: 1,
  detailsList: {} as any,
  lowerCamelCaseList: {
    currentList: [] as any,
    barcodeList: [] as any[],
    packagingData: {} as any,
    packagingSig: [] as any,
    pickupOrderValue: '',
    containerNoValue: 0,
    FENTRYID: 0,
    isInteger: false, //是否成套
    isFE: false, //是否分装
    FRealQty: 0 //成套数量
  } as SalesOutboundCancelType,
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
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:lowerCamelCaseList', modelValue: any): void
}>()
// const { emitter } = useEmitt()

//离开时搜索
const searchChange = () => {
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    ss()
    // 第一次扫单号
    if (!reactiveData.pickupOrderValue) {
      reactiveData.pickupOrderValue = reactiveData.searchValue
      reactiveData.searchValue = ''
    } else {
      console.log('后续扫码-扫描单号', reactiveData.lowerCamelCaseList.barcodeList.length > 0)
      //后续扫码-扫描条码
      if (reactiveData.lowerCamelCaseList.barcodeList.length > 0) {
        //判断条码中F_BARCODENO是否有相同的条码
        const index = reactiveData.lowerCamelCaseList.barcodeList.findIndex((item: any) => {
          return item.F_BARCODENO === reactiveData.searchValue
        })
        if (index !== -1) {
          uni.showToast({
            title: '条码重复',
            icon: 'none'
          })
          reactiveData.searchValue = ''
          reactiveData.focus = 22
          setTimeout(() => {
            reactiveData.focus = 1
          }, 200)
          return
        }
      }
      const res: any = await productionGetData(
        reactiveData.searchValue,
        reactiveData.pickupOrderValue,
        reactiveData.containerNoValue
      )
      console.log('后续扫码-扫描条码', res)
      if (res != null) {
        reactiveData.detailsList = res
        reactiveData.lowerCamelCaseList.currentList = res.lowerCamelCaseList.currentList
        reactiveData.lowerCamelCaseList.warehouse = res.lowerCamelCaseList.warehouse
        reactiveData.lowerCamelCaseList.location = res.lowerCamelCaseList.location
        reactiveData.lowerCamelCaseList.FENTRYID = res.lowerCamelCaseList.FENTRYID
        reactiveData.lowerCamelCaseList.pickupOrderValue = reactiveData.pickupOrderValue
        reactiveData.lowerCamelCaseList.containerNoValue = reactiveData.containerNoValue
        /**添加到待删除列表中 */
        const index = reactiveData.detailsList.Model.FEntity[
          res.FEntityIndex
        ].F_QADV_XSCKSubEntity.findIndex((item: any) => {
          return item.F_BARCODENO === reactiveData.searchValue
        })
        if (reactiveData.lowerCamelCaseList.barcodeList.length === 0) {
          reactiveData.lowerCamelCaseList.isFE = res.isFE
        }
        console.log('是否分装', res.isFE)

        console.log('分装情况下1', reactiveData.lowerCamelCaseList.barcodeList, res.FEntityIndex)
        if (index !== -1) {
          //分装情况下
          if (reactiveData.lowerCamelCaseList.isFE) {
            //判断之前是否存在待删除分装，并且分装编号F_QADV_FZLOT一致
            console.log('分装情况下2', reactiveData.lowerCamelCaseList)
            if (reactiveData.lowerCamelCaseList.barcodeList.length > 0) {
              console.log('分装情况下4')
              if (
                reactiveData.lowerCamelCaseList.barcodeList[0].F_QADV_FZLOT ===
                reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[index]
                  .F_QADV_FZLOT
              ) {
                reactiveData.lowerCamelCaseList.barcodeList.push(
                  reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                    index
                  ]
                )
                console.log('报错1')
                reactiveData.lowerCamelCaseList.packagingData[
                  reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                    index
                  ].F_FZNO
                ].quantity +=
                  reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                    index
                  ].F_UNITQTY

                reactiveData.lowerCamelCaseList.packagingData[
                  reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                    index
                  ].F_FZNO
                ].unitQty =
                  reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                    index
                  ].F_JUNITQTY
                console.log('报错2')
                reactiveData.lowerCamelCaseList.packagingData[
                  reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                    index
                  ].F_FZNO
                ].finishedQty =
                  reactiveData.lowerCamelCaseList.packagingData[
                    reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                      index
                    ].F_FZNO
                  ].quantity /
                  reactiveData.lowerCamelCaseList.packagingData[
                    reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[
                      index
                    ].F_FZNO
                  ].unitQty

                //判断成套更最小成品数量
                const finishedQtys = []
                for (const packItem of reactiveData.lowerCamelCaseList.packagingSig) {
                  finishedQtys.push(
                    reactiveData.lowerCamelCaseList.packagingData[packItem].finishedQty
                  )
                }

                const isAllEqual = finishedQtys.every((qty, index, array) => qty === array[0])
                const minQty = Math.min(...finishedQtys)

                if (!isAllEqual) {
                  console.log(`finishedQty 不全相等， 最小值为：${minQty}`)
                  reactiveData.lowerCamelCaseList.FRealQty = minQty
                  reactiveData.lowerCamelCaseList.isInteger = false
                } else {
                  const isInteger = finishedQtys.every((qty) => Number.isInteger(qty))
                  if (isInteger) {
                    console.log(`finishedQty 全相等，且为整数`, minQty)
                    reactiveData.lowerCamelCaseList.FRealQty = minQty
                    reactiveData.lowerCamelCaseList.isInteger = true
                  } else {
                    console.log(`finishedQty 全相等，但不是整数`, minQty)
                    reactiveData.lowerCamelCaseList.FRealQty = minQty
                    reactiveData.lowerCamelCaseList.isInteger = false
                  }
                }
                reactiveData.lowerCamelCaseList.currentList[9].value = minQty
                console.log(
                  'packagingSig',
                  reactiveData.lowerCamelCaseList.packagingSig,
                  'packagingData',
                  reactiveData.lowerCamelCaseList.packagingData
                )
              } else {
                //提示 分装产品非同批出货
                uni.showToast({
                  title: '分装产品非同批出货',
                  icon: 'none'
                })
                reactiveData.searchValue = ''
                reactiveData.focus = 22
                setTimeout(() => {
                  reactiveData.focus = 1
                }, 200)
                return
              }
            } else {
              console.log('分装情况下3')
              //原数组没值，直接添加
              reactiveData.lowerCamelCaseList.barcodeList.push(
                reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[index]
              )
              let packagingSig = [] as any
              let packagingData = {} as any
              for (const item of res.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity) {
                //重复的不要
                if (!packagingSig.includes(item.F_FZNO)) {
                  packagingSig.push(item.F_FZNO)
                }
                packagingData[item.F_FZNO] = {
                  //数量
                  quantity: 0,
                  // 单位用量
                  unitQty: 0,
                  //成品数量
                  finishedQty: 0
                }
              }
              console.log('报错', reactiveData.lowerCamelCaseList.barcodeList)
              console.log('报错3', reactiveData.lowerCamelCaseList.barcodeList[0])

              console.log(
                '报错4',
                packagingData[reactiveData.lowerCamelCaseList.barcodeList[0].F_FZNO]
              )

              packagingData[reactiveData.lowerCamelCaseList.barcodeList[0].F_FZNO]['quantity'] +=
                reactiveData.lowerCamelCaseList.barcodeList[0].F_UNITQTY
              packagingData[reactiveData.lowerCamelCaseList.barcodeList[0].F_FZNO].unitQty =
                reactiveData.lowerCamelCaseList.barcodeList[0].F_JUNITQTY
              packagingData[reactiveData.lowerCamelCaseList.barcodeList[0].F_FZNO].finishedQty =
                reactiveData.lowerCamelCaseList.barcodeList[0].F_UNITQTY /
                reactiveData.lowerCamelCaseList.barcodeList[0].F_JUNITQTY

              reactiveData.lowerCamelCaseList.packagingData = packagingData
              reactiveData.lowerCamelCaseList.packagingSig = packagingSig
            }
          } else {
            //非分装的情况下替换
            console.log(
              '非分装的情况下替换1',
              reactiveData.detailsList.Model.FEntity[res.FEntityIndex]
            )
            console.log(
              '非分装的情况下替换2',
              reactiveData.detailsList.Model.FEntity[res.FEntityIndex],
              index
            )
            reactiveData.lowerCamelCaseList.barcodeList = [
              reactiveData.detailsList.Model.FEntity[res.FEntityIndex].F_QADV_XSCKSubEntity[index]
            ]
            reactiveData.lowerCamelCaseList.currentList[9].value =
              reactiveData.lowerCamelCaseList.barcodeList[0].F_UNITQTY
          }
        } else {
          //提示 分装产品非同批出货
          uni.showToast({
            title: '分装产品非同批出货',
            icon: 'none'
          })
          reactiveData.searchValue = ''
          reactiveData.focus = 22
          setTimeout(() => {
            reactiveData.focus = 1
          }, 200)
          return
        }
      }
    }

    emit('update:detailsList', reactiveData.detailsList)
    console.log('处理', reactiveData.lowerCamelCaseList)
    emit('update:lowerCamelCaseList', reactiveData.lowerCamelCaseList)
    reactiveData.searchValue = ''
    reactiveData.focus = 22
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
  }, 500)
}

//柜号选择
const containerNoClick = async (val: any) => {
  reactiveData.containerNoValue = val.value

  //清空数据
  reactiveData.lowerCamelCaseList = {
    currentList: [] as any,
    barcodeList: [] as any[],
    packagingData: {} as any,
    packagingSig: [] as any,
    pickupOrderValue: '',
    containerNoValue: 0,
    FENTRYID: 0,
    isInteger: false, //是否成套
    isFE: false, //是否分装
    FRealQty: 0 //成套数量
  } as SalesOutboundCancelType
  reactiveData.detailsList = {}
  emit('update:detailsList', reactiveData.detailsList)
  emit('update:lowerCamelCaseList', reactiveData.lowerCamelCaseList)
  console.log('清空数据', reactiveData.lowerCamelCaseList)
  reactiveData.pickerShow = false
}

const hideTimer = ref<number | null>(null)
const ss = () => {
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
  ss()
})
onBeforeUnmount(() => {
  // 组件卸载时清理
  console.log('离开')
  clearTimer()
})

watch(
  () => props.pickupOrderValue,
  (val: any) => {
    reactiveData.pickupOrderValue = val
    reactiveData.containerNoValue = props.containerNoValue
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <view>
    <view class="flex items-center py-10rpx">
      <view class="w-70px flex justify-center">条码</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="reactiveData.searchValue"
          :showAction="false"
          customStyle="background: #FFF;"
          shape="round"
          :focus="reactiveData.focus == 1"
          placeholder=""
          @blur="searchChange"
        />
      </view>
    </view>
    <view class="flex">
      <view class="flex items-center pb-10rpx w-70%">
        <view class="w-70px flex justify-center">提货单</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8" @click="clearTimer">
          <u-input
            ref="searchInput"
            v-model="reactiveData.pickupOrderValue"
            :showAction="false"
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
