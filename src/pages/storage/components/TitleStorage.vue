<script setup lang="ts">
import { reactive, watch, onBeforeMount, ref, onBeforeUnmount } from 'vue'
import { debounceSave } from '@/utils'
import { productionGetData, getInboundOrder } from '@/common/storage/production'
import { productionOrder, lowerCamelCase2 } from '@/api/modules/storage'
import { queryStorage, lookqueryStorage, barcodeStatus } from '@/api/modules/storage'
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  scanCodeType: {
    type: String,
    default: ''
  },
  stoCurrentWarehouse: {
    type: Object,
    default: () => ({})
  }
})

//加载
const loading = ref(false)
const pageLoading = ref(true)
const focusIndex = ref(0) // 当前焦点索引

//仓库选择器
const pickerShow = ref(false)
//表头仓位选择器
const pickerShow2 = ref(false)
//表体仓位选择器显示
const pickerShow3 = ref(false)

//当前仓库
const currentWarehouse = reactive({
  Id: 0,
  name: '',
  number: ''
}) as any
//当前仓位
const currentWarehousePosition = reactive({
  Id: 0,
  name: '',
  number: ''
}) as any
//本箱数
//仓库
const warehouseList = ref([
  {
    id: 1,
    text: '仓库1',
    value: '仓库1'
  },
  {
    id: 2,
    text: '仓库2',
    value: '仓库2'
  }
])
const FlexNumber = ref('')
//仓位
const warehousePositionList = ref([] as any)

const reactiveData = reactive({
  // searchValue: 'AC2004N04TEX+MO000004+1',
  searchValue: '',
  fid: 0,
  titleList: [
    {
      label: '单号',
      value: '',
      disabled: true,
      select: false,
      display: true
    },
    { label: '生产部门', value: '', disabled: true, select: false, display: true },
    { label: '仓库', value: '', scValue: '', disabled: false, select: true, change: true },
    { label: '仓位', value: '', scValue2: '', disabled: true, select: true }
  ],
  subsectionList: ['当前', '明细', '条码'],
  curNow: 0,
  currentList: [
    { label: '序号', value: '', disabled: true, select: false },
    { label: '源单号', value: '', disabled: true, select: false },
    { label: '批号', value: '', disabled: true, select: false },
    { label: '客户', value: '', disabled: true, select: false },
    { label: '订单数', value: '', disabled: true, select: false },
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
  datailsIndex: 0,
  barCodeList: [] //条码
})
const searchInput = ref()
//订单号输入框
const searchChange = async () => {
  handleFocus()
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }

    /*在单码双扫的情况下第一次扫描单号*********************************/
    if (props.scanCodeType === '单码双扫') {
      if (reactiveData.titleList[0].value === '') {
        const res = await getInboundOrder(reactiveData.searchValue)
        console.log('res', res)
        reactiveData.detailsList = res.dataList
        reactiveData.fid = res.fid

        console.log('单据内容', reactiveData.detailsList)
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
        }
        reactiveData.searchValue = ''
        reactiveData.curNow = 1
        changeFocus()

        return
      }
    }
    let exitMethod = false
    /*判断条码是否重复扫面************************************************/
    reactiveData.detailsList.forEach((element: any) => {
      const index = element.barCodeList.findIndex((item: any) => {
        return item.F_BARCODENO === reactiveData.searchValue
      })
      console.log('判断之前是否扫过', index)
      if (index !== -1) {
        exitMethod = true
        uni.showToast({
          title: '重复扫描',
          icon: 'none'
        })
        changeFocus()

        return
      }
    })
    if (exitMethod) {
      reactiveData.searchValue = ''
      changeFocus()

      return
    }
    loading.value = true
    /*获取条码数据************************************************* */
    const res: any = await productionGetData(
      reactiveData.searchValue,
      currentWarehousePosition.number,
      props.scanCodeType === '单码双扫'
    )
    console.log('是否单码双扫')
    if (!res) {
      loading.value = false
      reactiveData.searchValue = ''
      changeFocus()

      return
    }
    //判断之前是否有一样的，有的话累计数量，没有的话push
    if (reactiveData.detailsList.length !== 0) {
      const index = reactiveData.detailsList.findIndex((item: any) => {
        console.log('判断之前是否有一样的', item, res)
        if (props.scanCodeType === '单码双扫') {
          return (
            item.MaterialCode === res.MaterialCode &&
            item.SourceOrderNo === res.SourceOrderNo &&
            item.SourceOrderLineNo === res.SourceOrderLineNo
          )
        } else {
          return (
            item.MaterialCode === res.MaterialCode &&
            item.SourceOrderNo === res.SourceOrderNo &&
            item.SourceOrderLineNo === res.SourceOrderLineNo &&
            item.Lot === res.Lot &&
            item.WarehousePosition === currentWarehousePosition.number
          )
        }
      })
      console.log('index', index)
      if (index !== -1) {
        /*1.在单码双扫时：如果仓位不一样需要复制一行相同编码的，批号不一样无法添加（所以在这里做这两个判断）*/
        if (props.scanCodeType === '单码双扫') {
          if (reactiveData.detailsList[index].Lot !== res.Lot) {
            uni.showToast({
              title: '批号不一样无法添加',
              icon: 'none'
            })
            reactiveData.searchValue = ''
            reactiveData.curNow = 0
            loading.value = false
            console.log('未调用吗？？？？')
            changeFocus()

            return
          }
          console.log(
            '仓位',
            reactiveData.detailsList[index].WarehousePosition,
            res.WarehousePosition
          )
          // if (
          //   reactiveData.detailsList[index].WarehousePosition &&
          //   reactiveData.detailsList[index].WarehousePosition !== res.WarehousePosition
          // ) {
          //   //仓位不一样需要复制一行相同编码的
          //   let data = JSON.parse(JSON.stringify(reactiveData.detailsList[index])) //深拷贝
          //   data['WarehousePosition'] = res.WarehousePosition //仓位
          //   data['Quantity2'] = res.Quantity2 //数量
          //   data.barCodeList = res.barCodeList //条码
          //   reactiveData.detailsList.push(data)
          //   console.log('复制的值', data)
          //   reactiveData.searchValue = ''
          //   reactiveData.curNow = 0
          //   loading.value = false
          //   return
          // }
        }
        reactiveData.datailsIndex = index
        reactiveData.detailsList[index].currentList[7].value = res.currentList[7].value
        reactiveData.detailsList[index].currentList[9].value = res.currentList[9].value
        res.barCodeList[0].one = reactiveData.detailsList[index].barCodeList.length + 1
        reactiveData.detailsList[index].barCodeList.push(res.barCodeList[0]) //条码
        reactiveData.detailsList[index].Quantity++ //件数

        console.log('选中的明细', reactiveData.detailsList[index])
        /**更新之前的数据 */
        reactiveData.detailsList[index].IsSplit = res.IsSplit //是否分装

        if (reactiveData.detailsList[index].IsSplit) {
          //分装的情况下
          //判断源数据是否有相同的分装批号，有则跳过，无则push
          const index2 = reactiveData.detailsList[index].FZLOTList.findIndex((item: any) => {
            return item === res.FZLOTList[0]
          })
          console.log('选中的明细1')
          if (index2 === -1) {
            reactiveData.detailsList[index].FZLOTList.push(res.FZLOTList[0])

            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]] =
              res.packagingDataFZLOT[res.FZLOTList[0]]

            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingData[
              res.SplitCode
            ]['quantity'] = 0
          }

          reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingData[
            res.SplitCode
          ]['quantity'] += res.SplitValue //数量
          reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingData[
            res.SplitCode
          ]['unitQty'] = res.UnitQty //单位用量
          reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingData[
            res.SplitCode
          ]['finishedQty'] =
            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingData[
              res.SplitCode
            ]['quantity'] / res.UnitQty
          //判断是否有成品
          const packagingSig =
            reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingSig
          let hasZero = false
          let minNonZero = Infinity

          packagingSig.forEach((item: any) => {
            const sum = Number(
              reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].packagingData[
                item
              ].finishedQty
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
          reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].isInteger =
            productsQuantity % 1 === 0 && productsQuantity !== 0

          //计算单分装数量
          reactiveData.detailsList[index].packagingDataFZLOT[res.FZLOTList[0]].FZquantity =
            Math.floor(productsQuantity)

          //计算总数量
          reactiveData.detailsList[index].Quantity2 = reCompute(reactiveData.detailsList[index])
        } else {
          //非分装情况下
          reactiveData.detailsList[index].Quantity2 += res.Quantity2
          reactiveData.detailsList[index].isInteger = true //是否整数
        }
      } else {
        console.log('不重复', res)

        //不重复的情况下，在单码双扫时提示条码与源单无相符数据
        if (props.scanCodeType === '单码双扫') {
          //提示无相符数据
          uni.showToast({
            title: '条码与源单无相符数据',
            icon: 'none'
          })
        } else {
          //获取推荐仓位（根据物料编码、批号、仓库查库存表）
          // const FMaterialId = res.MaterialCode //物料编码FMaterialId.Fnumber
          // const FLot = res.Lot //批号FLot
          // const FStockId = currentWarehouse.number //仓库FStockId.Fname

          // const lowerRes = await lowerCamelCase2(`
          //   FMaterialId.Fnumber = '${FMaterialId}' AND FLot.Fnumber = '${FLot}' AND FStockId.Fnumber = '${FStockId}'
          // `)
          // console.log('lowerRes', lowerRes)

          reactiveData.detailsList.push(res)
          reactiveData.curNow = 0
          reactiveData.datailsIndex = reactiveData.detailsList.length - 1
        }
      }
    } else {
      console.log('第一次的值', res)

      //获取推荐仓位（根据物料编码、批号、仓库查库存表）
      const FMaterialId = res.MaterialCode //物料编码FMaterialId.Fnumber
      const FLot = res.Lot //批号FLot
      const FStockId = currentWarehouse.number //仓库FStockId.Fname
      const FilterString = `FMaterialId.Fnumber = '${FMaterialId}' AND FLot.Fnumber = '${FLot}' AND FStockId.Fnumber = '${FStockId}' AND FBaseQty > 0`
      const FieldKeys = `FStockLocId.${FlexNumber.value}.FNumber`
      const lowerRes: any = await lowerCamelCase2(FilterString, FieldKeys)
      console.log('lowerRes', lowerRes)
      if (lowerRes && lowerRes.data && lowerRes.data.length > 0) {
        res.currentList[10].value = lowerRes.data.map((item: any) => item[0]).join(',') //推荐仓位
      }
      reactiveData.detailsList.push(res)
      reactiveData.curNow = 0
      reactiveData.datailsIndex = reactiveData.detailsList.length - 1
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
    warehouseList.value = res.data.map((item: any) => {
      return {
        id: item[2],
        text: item[0],
        value: item[1]
      }
    })
    pageLoading.value = false
  }
}
//扫码获取数据
const searchClick = async () => {
  let list = [
    'PE650010A000325070001',
    'PE650010A000425070001',
    'PE650010A000525070001',
    'PE650010A000625070001',
    'PE650010A000725070001',
    'PE650010A000825070001',
    'PE650010A001025070001',
    'PE650010A001125070001',
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
    'PE650010A000225070002',
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
    'PE650010A001525070003',
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
    'PE650031A0001.000125070002',
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
    'PE650010A001825070004',
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
    'PE650010A001525070005',
    'PE650010A001625070005',
    'PE650010A001725070005',
    'PE650010A001825070005',
    'PE650010A002225070005',
    'PE650010A002125070005',
    'PE650010A002025070005',
    'PE650010A001925070005',
    'PE650010A002325070005',
    'PE650010A002425070005',
    'PE650031A0001.000125070004',
    'PE650031A0002.000125070004'
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
  }, 3000)
  return
  //uniapp打开扫码
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  console.log('扫码结果', res)
  if (res) {
    //在focusIndex.value为0时，给搜索框赋值
    if (focusIndex.value === 0) {
      reactiveData.searchValue = res.result
      searchChange()
    } else if (focusIndex.value === 2) {
      //在focusIndex.value为2时，给仓库赋值
      reactiveData.titleList[2].value = res.result
      //触发更新事件
      focusIndex.value = 3
    } else if (focusIndex.value === 3) {
      //在focusIndex.value为3时，给仓位赋值
      reactiveData.titleList[3].value = res.result
      focusIndex.value = 0
    } else {
      searchInput.value.setValue(res.result)
    }
    // searchChange()
  }
}

function sectionChange(index: any) {
  reactiveData.curNow = index
}

//仓库扫出数据
const warehouseChange = debounceSave(
  async (val: any, iswarehouse: boolean, iswarehousePosition?: boolean) => {
    console.log('warehouseChange', val, iswarehouse)
    if (iswarehouse) {
      //获取仓库id替换为仓库名称
      const warehouseId: any = warehouseList.value.find((item: any) => item.value === val)
      console.log('warehouseId1', warehouseId)
      if (!warehouseId && val != '') {
        //提示仓库不存在
        uni.showToast({
          title: '仓库不存在',
          icon: 'none'
        })
        reactiveData.titleList[2].value = ''
        //重新回到光标位置
        focusIndex.value = 20
        setTimeout(() => {
          focusIndex.value = 2
        }, 500)
        return
      }
      reactiveData.titleList[2].value = warehouseId.text
      currentWarehouse.name = warehouseId.text
      currentWarehouse.number = warehouseId.value
      warehouseClick(val)
    } else {
      //获取仓位id替换为仓位名称
      if (warehousePositionList.value.length !== 0) {
        const warehouseId: any = warehousePositionList.value.find((item: any) => item.value === val)
        if (!warehouseId && val != '') {
          //提示仓位不存在
          uni.showToast({
            title: '仓位不存在',
            icon: 'none'
          })
          reactiveData.titleList[3].value = ''
          //重新回到光标位置
          focusIndex.value = 20
          setTimeout(() => {
            focusIndex.value = 3
          }, 500)
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
          console.log('仓位', reactiveData.detailsList)
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
  console.log('选择仓库', val)
  //清空仓位
  currentWarehousePosition.name = ''
  currentWarehousePosition.number = ''
  reactiveData.titleList[3].value = ''
  //查看仓位
  if (val) {
    const res: any = await lookqueryStorage(val)
    console.log('res', res)
    if (res) {
      const list = res.data.Result.Result.StockFlexItem[0].StockFlexDetail
      FlexNumber.value = res.data.Result.Result.StockFlexItem[0].FlexId.FlexNumber
      console.log('list', list)
      if (list[0].Id === 0) {
        warehousePositionList.value = []
        reactiveData.titleList[3].disabled = true
        focusIndex.value = 0
        return
      }
      warehousePositionList.value = list.map((item: any) => {
        return {
          id: item.Id,
          text: item.FlexEntryId.Name[0].Value,
          value: item.FlexEntryId.Number
        }
      })

      if (warehousePositionList.value.length == 0) {
        reactiveData.titleList[3].disabled = true
        focusIndex.value = 0
      } else {
        reactiveData.titleList[3].disabled = false
        setTimeout(() => {
          console.log('到我')
          focusIndex.value = 3
        }, 200)
      }
      handleFocus()
      console.log('focusIndex', focusIndex.value)
    }
  }
}
//仓库选择器确认
const pickerConfirm = async (val: any) => {
  console.log('pickerConfirm', val)
  currentWarehouse.Id = val.id
  currentWarehouse.name = val.text
  currentWarehouse.number = val.value

  reactiveData.titleList[2].value = val.text
  handleFocus()
  focusIndex.value = 3
  warehouseClick(val.value)
  pickerShow.value = false
  console.log('pickerShow.value ', warehousePositionList.value)
}
//仓位选择器确认(iswarehousePosition为true时，表示表头仓位选择器，否则为当前仓位选择器)
const pickerConfirm2 = (val: any, iswarehousePosition?: boolean) => {
  console.log('选择仓位2', val)

  if (iswarehousePosition) {
    reactiveData.titleList[3].value = val.value
    currentWarehousePosition.Id = val.id
    currentWarehousePosition.name = val.text
    currentWarehousePosition.number = val.value
    console.log('仓位', reactiveData.detailsList)
  } else {
    //无论选择哪个，有明细时都是会变的
    if (reactiveData.detailsList.length !== 0) {
      console.log('报错1', reactiveData.detailsList[reactiveData.datailsIndex])
      reactiveData.detailsList[reactiveData.datailsIndex].currentList[12].value = val.text
      console.log('报错2')
      reactiveData.detailsList[reactiveData.datailsIndex].WarehousePosition = val.value
    }
  }
  handleFocus()
  focusIndex.value = 0
  pickerShow2.value = false
  pickerShow3.value = false
}

//长按事件 删除明细
const longpressClick = (item: any, index: number) => {
  if (isMoved) return // 如果有移动，不触发长按事件

  console.log('长按事件', item, index)
  //弹出删除提示框
  uni.showModal({
    title: '提示',
    content: '是否删除当前明细',
    success: (res) => {
      if (res.confirm) {
        console.log('用户点击确定')
        //删除当前明细
        reactiveData.detailsList.splice(index, 1)
        if (reactiveData.detailsList.length === 0) {
          reactiveData.datailsIndex = 0
        } else if (reactiveData.datailsIndex > index) {
          reactiveData.datailsIndex--
        } else {
          reactiveData.datailsIndex = reactiveData.detailsList.length - 1
        }
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
//长按事件 删除条码明细
let startX = 0
let startY = 0
let isMoved = false

const handleTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isMoved = false
}

const handleTouchMove = (e: TouchEvent) => {
  const moveX = Math.abs(e.touches[0].clientX - startX)
  const moveY = Math.abs(e.touches[0].clientY - startY)

  // 如果移动超过5px就认为是在滑动
  if (moveX > 5 || moveY > 5) {
    isMoved = true
  }
}

const longpressDetailsClick = (item: any, index: number) => {
  if (isMoved) return // 如果有移动，不触发长按事件
  console.log('长按事件', item, index)
  //弹出删除提示框
  uni.showModal({
    title: '提示',
    content: '是否删除当前条码明细',
    success: (res) => {
      if (res.confirm) {
        reactiveData.detailsList[reactiveData.datailsIndex].barCodeList.splice(index, 1)
        //删除当前明细
        if (reactiveData.detailsList[reactiveData.datailsIndex].IsSplit) {
          //分装情况下
          reactiveData.detailsList[reactiveData.datailsIndex].Quantity--
          //减去数量
          reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].packagingData[item.F_FZNO]['quantity'] -= item.F_UNITQTY //数量
          //重新计算最小值
          reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].packagingData[item.F_FZNO]['finishedQty'] =
            reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
              item.F_QADV_FZLOT
            ].packagingData[item.F_FZNO]['quantity'] /
            reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
              item.F_QADV_FZLOT
            ].packagingData[item.F_FZNO]['unitQty']

          //判断是否有成品
          // productsQuantity保留最小值
          const packagingSig =
            reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
              item.F_QADV_FZLOT
            ].packagingSig

          let hasZero = false
          let minNonZero = Infinity

          packagingSig.forEach((item2: any) => {
            const sum = Number(
              reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
                item.F_QADV_FZLOT
              ].packagingData[item2].finishedQty
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
          //计算单分装数量
          reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].FZquantity = Math.floor(productsQuantity)

          //判断productsQuantity是否为整数
          reactiveData.detailsList[reactiveData.datailsIndex].packagingDataFZLOT[
            item.F_QADV_FZLOT
          ].isInteger = productsQuantity % 1 === 0 && productsQuantity !== 0

          reactiveData.detailsList[reactiveData.datailsIndex].Quantity2 = reCompute(
            reactiveData.detailsList[reactiveData.datailsIndex]
          )
        } else {
          console.log('非分装情况下', item)
          //非分装情况下
          reactiveData.detailsList[reactiveData.datailsIndex].Quantity-- //件数
          reactiveData.detailsList[reactiveData.datailsIndex].Quantity2 -= item.F_UNITQTY //数量
        }
        console.log('删除后的值：', reactiveData.detailsList)
        if (reactiveData.detailsList[reactiveData.datailsIndex].barCodeList.length === 0) {
          //删除明细
          reactiveData.detailsList.splice(reactiveData.datailsIndex, 1)
          reactiveData.datailsIndex--
        }
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
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
const ds = ref(0)
const handleFocus = () => {
  // 设置定时器
  if (!hideTimer.value) {
    hideTimer.value = setInterval(() => {
      uni.hideKeyboard()
      ds.value++
      // console.log('ds', ds.value)
    }, 50) as unknown as number
  }
}
const clearTimer = () => {
  // 清除定时器
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
    ds.value = 0
    hideTimer.value = null
  }
  console.log('清除定时器', hideTimer.value)
}
//返回到父组件
const backClick = async () => {
  // 声明为异步函数
  console.log('返回到父组件', reactiveData.detailsList)
  if (reactiveData.detailsList.length === 0) {
    uni.showToast({
      title: '请先扫码',
      icon: 'none'
    })
    return
  }
  //搜索条件
  const conditions = reactiveData.detailsList.map((item: any) => {
    return `(FBillNo = '${item.SourceOrderNo}' AND FTreeEntity_FSeq = ${item.SourceOrderLineNo})`
  })
  const result = conditions.join(' OR ')
  console.log(result)
  const res: any = await productionOrder(result)
  console.log('res', res)
  const orderData = res.data

  //搜索条码单状态（获取条码列表）
  // 提取所有的 F_BARCODENO
  const barCodes = reactiveData.detailsList
    .map((item: any) => item.barCodeList.map((barCode: any) => barCode.F_BARCODENO))
    .flat()
  console.log('barCodes', barCodes)
  if (barCodes.length === 0) {
    uni.showToast({
      icon: 'none',
      title: '无提交数据'
    })
    return null
  }
  // 将 F_BARCODENO 拼接成 SQL 查询条件
  const fNumbersInClause = barCodes.map((code: any) => `'${code}'`).join(',')
  // 构建最终的 SQL 条件字符串
  const sqlCondition = `FNUMBER in (${fNumbersInClause}) AND F_BARSTATUS != '1'`

  //单据查询 条码状态
  const barCodeRes: any = await barcodeStatus(sqlCondition)
  console.log(sqlCondition)
  console.log('条码状态', barCodeRes)
  if (barCodeRes && barCodeRes.data && barCodeRes.data.length > 0) {
    //条码状态不为1的提示
    uni.showToast({
      title: `编码${barCodeRes.data[0][1]}中，条码${barCodeRes.data[0][0]}不为创建状态`,
      icon: 'none',
      duration: 5000
    })
    return
  }

  let dataList = [] as any
  //表头生产车间
  let SCCJ = 'BM000001'

  let isError = false //是否有错误
  // 使用Promise.all等待所有异步操作完成
  await Promise.all(
    reactiveData.detailsList.map(async (item: any, index: number) => {
      console.log('item', item)
      if (item.barCodeList.length === 0) {
        return
      }
      //分装情况下
      if (item.IsSplit) {
        item.FZLOTList.forEach((element: any) => {
          let faLotData = item.packagingDataFZLOT[element]
          if (!faLotData.isInteger) {
            throw new Error(`第${index + 1}行不配套`)
          }

          let finishedQty = faLotData.packagingData[faLotData.packagingSig[0]].finishedQty //成品数量
          console.log('成品数量', finishedQty)
          faLotData.packagingSig.forEach((element: any) => {
            console.log('成品数量值', faLotData.packagingData[element].finishedQty)
            if (faLotData.packagingData[element].finishedQty !== finishedQty) {
              throw new Error(`第${index + 1}行不配套`)
            }
          })
        })
      }
      if (currentWarehouse.number === '') {
        throw new Error('请先选择仓库')
      }
      if (
        currentWarehousePosition.number === '' &&
        !reactiveData.titleList[3].disabled &&
        !reactiveData.titleList[3].display
      ) {
        throw new Error('请先选择仓位')
      }

      // if (item.Quantity2 > item.canReceive) {
      //   throw new Error('应收数量大于可收数量')
      // }
      console.log('res2', res)
      if (res && res.data && res.data.length > 0) {
        //查找相同
        const index = orderData.findIndex((item1: any) => {
          return item1[1] === item.SourceOrderNo && item1[2] === item.SourceOrderLineNo
        })
        console.log('index', index)
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
        console.log('FStockLocId', FStockLocId)
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
          FREQSRC: item.SourceOrderType, //需求来源
          FReqBillNo: item.SourceOrderNo2, //需求单据
          //FReqBillId: item.SourceOrderNo2, //需求单据内码
          FReqEntrySeq: item.SourceOrderLineNo2, //需求单据行号
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
          F_QADV_TIQTY: orderData[index][6], //累计入库数量(合格品入库数量)

          F_QADV_HTNO: item.otherData.F_QADV_HTNO, //合同号
          F_BARSubEntity: item.barCodeList,
          currentWarehousePositionId: currentWarehousePosition.Id, //仓位ID
          FEntity_Link: [
            {
              FEntity_Link_FRuleId: 'PRD_MO2INSTOCK',
              FEntity_Link_FSTableName: 'T_PRD_MOENTRY',
              FEntity_Link_FSBillId: documentInnerCode,
              FEntity_Link_FSId: entryInnerCode,
              FEntity_Link_FFlowId: 'f11b462a-8733-40bd-8f29-0906afc6a201',
              FEntity_Link_FFlowLineId: '5',
              FEntity_Link_FBasePrdRealQtyOld: mustQty,
              FEntity_Link_FBasePrdRealQty: item.Quantity2
            }
          ],
          FBFLowId: {
            FID: 'f11b462a-8733-40bd-8f29-0906afc6a201'
          } //流转单ID
        }
        console.log('测试1', data)

        console.log('测试2', JSON.stringify(data))
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

  let currentData = {
    currentWarehouseId: currentWarehouse.Id,
    currentWarehouseName: currentWarehouse.name,
    currentWarehouseNumber: currentWarehouse.number,
    currentWarehousePositionName: currentWarehousePosition.name,
    currentWarehousePositionNumber: currentWarehousePosition.number,
    warehousePositionList: warehousePositionList.value,
    curNow: reactiveData.curNow,
    FlexNumber: FlexNumber.value
  }
  console.log('当前仓库', currentData)
  return {
    dataList,
    fid: reactiveData.fid,
    SCCJ,
    isError,
    currentData
  } // 返回填充后的数据
}
//监听
watch(
  () => props.scanCodeType,
  (val) => {
    console.log('val', val)
    if (val === '扫单入库') {
      reactiveData.titleList[0].display = false //显示单号
      reactiveData.subsectionList = ['当前', '明细']
      reactiveData.curNow = 0
    } else if (val === '单码双扫') {
      focusIndex.value = 0
      reactiveData.titleList[0].display = false //显示单号
      //隐藏仓位
      reactiveData.titleList[3].display = true
      reactiveData.subsectionList = ['当前', '明细', '条码']
      reactiveData.curNow = 1
      focusIndex.value = 0
    } else {
      reactiveData.subsectionList = ['当前', '明细', '条码']
      reactiveData.curNow = 1
      focusIndex.value = 2
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.stoCurrentWarehouse,
  () => {
    console.log('props.stoCurrentWarehouse', props.stoCurrentWarehouse)
    if (props.stoCurrentWarehouse.name === '') return
    currentWarehouse.name = props.stoCurrentWarehouse.name
    currentWarehouse.number = props.stoCurrentWarehouse.number

    reactiveData.curNow = props.stoCurrentWarehouse.curNow
    reactiveData.titleList[2].value = currentWarehouse.name

    warehousePositionList.value = props.stoCurrentWarehouse.warehousePositionList //仓位
    FlexNumber.value = props.stoCurrentWarehouse.FlexNumber
    if (warehousePositionList.value.length == 0) {
      console.log('1')
      reactiveData.titleList[3].disabled = true
      focusIndex.value = 22
      setTimeout(() => {
        focusIndex.value = 0
      }, 200)
    } else {
      console.log('2')
      reactiveData.titleList[3].disabled = false
      focusIndex.value = 22
      setTimeout(() => {
        focusIndex.value = 3
      }, 200)
    }
  },
  { immediate: true, deep: true }
)

// 组件卸载时清理
onBeforeUnmount(() => {
  console.log('离开')
  clearTimer()
})
onBeforeMount(() => {
  // 组件挂载前的逻辑
  handleFocus()
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
      <view class="w-50px flex justify-center">{{ item.label }}</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" v-if="!item.select">
        <u-input
          v-model="item.value"
          :showAction="false"
          :disabled="item.disabled"
          shape="round"
          placeholder=""
          :focus="index == focusIndex"
          @focus="focusIndex = 0"
        />
      </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" v-else @click="clearTimer">
        <!-- <uni-data-select
          :focus="index == focusIndex"
          v-model="item.value"
          :localdata="item.label == '仓库' ? warehouseList : warehousePositionList"
          @change="selectChange($event, item.change)"
        /> -->
        <u-input
          v-model="item.value"
          :showAction="false"
          :disabled="item.disabled"
          shape="round"
          placeholder=""
          :focus="index == focusIndex"
          @change="warehouseChange($event, item.label == '仓库')"
          @blur="handleFocus"
        >
          <template #suffix>
            <view
              @click="
                item.label == '仓库'
                  ? (pickerShow = true)
                  : !item.disabled
                  ? (pickerShow2 = true)
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
                <view
                  class="flex items-center p-20rpx"
                  style="border-bottom: 1px solid #f8f8f8"
                  @click="clearTimer"
                >
                  <view @tap="pickerShow = false">搜索 </view>
                  <view class="flex-1">
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
                        @tap="pickerConfirm2(warehouseItem, true)"
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
          <view class="flex-1 mr-20rpx" v-if="item.type == 'input'">
            <u-input
              v-model="item.value"
              :showAction="false"
              :disabled="item.disabled"
              shape="round"
              placeholder=""
            />
          </view>
          <view
            class="flex-1 mr-20rpx"
            style="border: 1px solid #f8f8f8"
            v-else-if="item.type == 'select'"
          >
            <u-input
              v-model="item.value"
              :showAction="false"
              :disabled="warehousePositionList.length == 0"
              shape="round"
              placeholder=""
              :focus="index == focusIndex"
              @change="warehouseChange($event, item.label == '仓库', true)"
            >
              <template #suffix>
                <view @click="warehousePositionList.length == 0 ? '' : (pickerShow3 = true)">
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
                      <view class="flex-1">
                        <u-input
                          id="searchInput2"
                          v-model="item.scValue2"
                          :showAction="false"
                          shape="round"
                          placeholder="请输入搜索关键词"
                          @focus="clearTimer"
                          @blur="clearTimer"
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
        <view v-if="reactiveData.detailsList.length > 0" class="w-100% pl-2px mt-2px">
          <view class="flex w-100% px-10px">
            <view class="w-50% flex items-center">
              <view>本箱数</view>
              <view class="ml-20px text-18px mt-2px">{{
                reactiveData.detailsList[reactiveData.datailsIndex]?.barCodeList[
                  reactiveData.detailsList[reactiveData.datailsIndex].barCodeList.length - 1
                ]?.F_UNITQTY
              }}</view>
            </view>
            <view class="w-50% flex items-center">
              <view>合计</view>
              <view class="ml-20px text-18px mt-2px">
                {{ reactiveData.detailsList[reactiveData.datailsIndex]?.Quantity2 }}</view
              >
            </view>
          </view>
          <view
            class="flex px-10px items-center text-#90BBF5 mt-6rpx text-16px"
            v-if="reactiveData.detailsList[reactiveData.datailsIndex]?.IsSplit"
          >
            <view class="text-center">{{
              reactiveData.detailsList[reactiveData.datailsIndex]?.barCodeList[
                reactiveData.detailsList[reactiveData.datailsIndex].barCodeList.length - 1
              ].F_FZNO
            }}</view>
            <view class="ml-8px text-center">{{
              reactiveData.detailsList[reactiveData.datailsIndex]?.barCodeList[
                reactiveData.detailsList[reactiveData.datailsIndex].barCodeList.length - 1
              ].F_BJNAME
            }}</view>
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
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
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
              <view class="w-50%"> 件数： {{ item.Quantity }}</view>
            </view>
          </view>
        </view>
      </view>
      <!-- 条码 -->
      <view v-else>
        <view class="flex bg-#f2f2f2 py-10rpx">
          <view class="w-15% text-center">序号</view>
          <view class="w-70%">条码编号</view>
          <view class="w-15% text-center">数量</view>
          <!-- <view class="w-10% text-center">分装</view>
          <view class="w-40% text-center">部件名称</view> -->
          <!-- <view class="w-10% text-center">用量</view> -->
        </view>
        <view
          v-for="(item, index) of reactiveData.detailsList[reactiveData.datailsIndex]
            ?.barCodeList || []"
          :key="index"
          @longpress="longpressDetailsClick(item, index)"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
        >
          <view class="flex py-10rpx" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
            <view class="w-15% flex items-center justify-center">{{ index + 1 }}</view>
            <view class="w-70%" style="overflow-wrap: break-word">
              <view> {{ item.F_BARCODENO }}</view>
              <view class="flex items-center" v-if="item.F_FZNO !== ' ' && item.F_FZNO !== ''">
                <view class=""> 分装： {{ item.F_FZNO }}</view>
                <view class="ml-8px flex items-center justify-center h-100%">
                  用量：{{ item.F_JUNITQTY === 0 ? '' : item.F_JUNITQTY }}
                </view>
                <view class="ml-8px h-24px flex items-center">{{ item.F_BJNAME }}</view>
              </view>
            </view>
            <view class="w-15% flex justify-center">{{ item.F_UNITQTY }}</view>
          </view>
        </view>
      </view>
    </view>
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
