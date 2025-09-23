<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { debounce } from 'lodash-es'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  detailsList: {
    type: Array as any,
    default: () => [] as any
  },
  title: {
    type: String,
    default: ''
  },
  locationList: {
    type: Array as any,
    default: () => []
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:barcodeIndex', modelValue: any): void
  (e: 'update:locationList', modelValue: any): void
}>()
const { emitter } = useEmitt()

const pickerShow = ref(false)

const reactiveData = reactive({
  detailsList: [] as any,
  subsectionList: ['当前', '汇总', '明细'],
  warehouseList: [] as any, //仓库
  locationList: [] as any, //仓位
  curNow: 1,
  barcodeList: [] as any, //条码
  barcodeIndex: 0
})

const getBarCode = async (item: any, index: number) => {
  reactiveData.barcodeIndex = index
  emit('update:barcodeIndex', index)
}

//长按事件 删除明细
const longpressClick = (item: any, index: number) => {
  if (isMoved) return // 如果有移动，不触发长按事件

  //弹出删除提示框
  uni.showModal({
    title: '提示',
    content: '是否删除当前明细',
    success: (res) => {
      if (res.confirm) {
        //删除当前明细
        reactiveData.detailsList.splice(index, 1)
        if (reactiveData.detailsList.length === 0) {
          reactiveData.barcodeIndex = 0
        } else if (reactiveData.barcodeIndex > index) {
          reactiveData.barcodeIndex--
        } else {
          reactiveData.barcodeIndex = reactiveData.detailsList.length - 1
        }
      } else if (res.cancel) {
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
const openName = ref('')
//打开选择
const openSelect = (item: any, disabled: boolean) => {
  console.log('打开选择', item)
  if (disabled) return
  openName.value = item
  pickerShow.value = true
}
//手动选择
const pickerConfirm = (warehouseItem: any, name: any) => {
  console.log('pickerConfirm', warehouseItem)
  if (name === '仓位') {
    // 修改仓位
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
      (i: any) => i.label === '仓位'
    ).value = warehouseItem.text
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocName = warehouseItem.text
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber = warehouseItem.value
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber =
      warehouseItem.value

    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.stockLocName = warehouseItem.text
    //获取仓库，储位

    for (const item of reactiveData.detailsList[reactiveData.barcodeIndex].EntityList) {
      item.stockLocName = warehouseItem.text
      item.detailList.stockLocName = warehouseItem.text
      item.detailList.locationNumber = warehouseItem.value
      item.stockLocNumber = warehouseItem.value
    }
  }
  pickerShow.value = false
  emit('update:detailsList', reactiveData.detailsList)
}

const quantChange = debounce((val: any, item: any) => {
  console.log('val', val, item)
  switch (item.label) {
    case '数量':
      let Quantity = val
      //如果val大于可领数量，赋值为可领数量
      if (
        props.title !== '简单生产退料' &&
        Quantity > reactiveData.detailsList[reactiveData.barcodeIndex].canReceive
      ) {
        Quantity = reactiveData.detailsList[reactiveData.barcodeIndex].canReceive
        item.value = Quantity
        uni.showToast({
          title: '实收数量大于可领数量',
          icon: 'none'
        })
      }
      reactiveData.detailsList[reactiveData.barcodeIndex].Quantity2 = Quantity
      // 调用新函数，将val分配给EntityList中的项目
      distributeValueToEntityList(Quantity)
      break
    case '仓库':
      warehouseChange(val)
      console.log('仓库', reactiveData.detailsList)
      break
    case '仓位':
      locationChange(val)
      console.log('仓位', reactiveData.detailsList)
      break
  }
  emit('update:detailsList', reactiveData.detailsList)
}, 300)

const distributeValueToEntityList = (val: number) => {
  const entityList = reactiveData.detailsList[reactiveData.barcodeIndex]?.EntityList || []
  let remainingValue = val

  // 循环遍历EntityList，依次分配值给Quantity2，以canReceive为上限
  for (const item of entityList) {
    //if (remainingValue <= 0) break

    // 计算可以分配给当前项的最大值（不超过canReceive）
    const maxAssignable = Math.min(remainingValue, item.canReceive)

    // 分配值给Quantity2
    item.Quantity2 = maxAssignable

    // 更新剩余值
    remainingValue -= maxAssignable
  }

  // 更新父组件的数据
  emit('update:detailsList', reactiveData.detailsList)
}
// ========== 输入处理 ==========
const warehouseChange = debounce((val: any) => {
  const warehouseId = reactiveData.warehouseList.find((item: any) => item.value === val)
  if (!warehouseId && val !== '') {
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
      (i: any) => i.label === '仓位'
    ).value = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = ''

    uni.showToast({ title: '仓库不存在', icon: 'none' })
    return
  } else {
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
      (i: any) => i.label === '仓位'
    ).value = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = ''
  }
}, 300)
//仓位
const locationChange = debounce((val: any) => {
  const location = reactiveData.locationList.find((item: any) => item.value === val)
  if (val === '') {
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
      (i: any) => i.label === '仓位'
    ).value = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].location = ''
    return
  }
  if (!location && val !== '') {
    reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
      (i: any) => i.label === '仓位'
    ).value = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.stockLocName = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = ''
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber = ''
    uni.showToast({ title: '仓位不存在', icon: 'none' })
    return
  }
  reactiveData.detailsList[reactiveData.barcodeIndex].currentList.find(
    (i: any) => i.label === '仓位'
  ).value = location.text
  reactiveData.detailsList[reactiveData.barcodeIndex].stockLocName = location.text
  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.stockLocName = location.text
  reactiveData.detailsList[reactiveData.barcodeIndex].detailList.locationNumber = location.value
  reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber = location.value
  console.log(
    '选择仓位',
    reactiveData.detailsList[reactiveData.barcodeIndex].stockLocNumber,
    location.value
  )
}, 300)

const clearTimer = () => {
  console.log('清除定时器')
  // 清除定时器
  emitter.emit('update:clearTimer')
}

useEmitt({
  name: 'update:barcodeIndex',
  callback: async (val: any) => {
    reactiveData.barcodeIndex = val
  }
})

watch(
  () => props.detailsList,
  (val: any) => {
    reactiveData.detailsList = val
  },
  { immediate: true, deep: true }
)

watch(
  () => props.locationList,
  (val: any) => {
    if (val && val.length > 0) {
      reactiveData.locationList = val
    } else {
      reactiveData.locationList = []
    }
    console.log('页面数据改动', val)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <u-subsection
    :list="reactiveData.subsectionList"
    :current="reactiveData.curNow"
    @change="reactiveData.curNow = $event"
  />
  <scroll-view
    scroll-y
    style="height: calc(100vh - 44px - 44px - 40px - 34px - 40px - 40px - 22px)"
  >
    <!-- 当前 -->
    <view v-if="reactiveData.curNow == 0" class="flex flex-wrap content-input">
      <view
        v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.currentList ||
        []"
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
          v-else-if="item.type == 'number'"
        >
          <u-input
            v-model="item.value"
            :showAction="false"
            :disabled="item.disabled"
            shape="round"
            placeholder=""
            type="number"
            @change="quantChange($event, item)"
            @click="clearTimer"
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
            :disabled="reactiveData.locationList.length == 0"
            shape="round"
            placeholder=""
            @blur="quantChange($event, item)"
          >
            <template #suffix>
              <view @click="openSelect(item.label, item.disabled)">
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
                        v-for="(warehouseItem, warehouseItemIndex) of openName == '仓库'
                          ? reactiveData.warehouseList
                          : reactiveData.locationList"
                        :key="warehouseItemIndex"
                      >
                        <view
                          class="flex justify-center py-10px"
                          style="border-bottom: 1px solid #f8f8f8"
                          v-if="warehouseItem.value.indexOf(item.scValue2 || '') !== -1"
                          @tap="pickerConfirm(warehouseItem, openName)"
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
    <view v-if="reactiveData.curNow === 1">
      <view
        v-for="(item, index) of props.detailsList || []"
        :key="index"
        @click="getBarCode(item, index)"
        @longpress="longpressClick(item, index)"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
      >
        <view
          class="flex"
          :class="[
            index % 2 === 0 ? 'bg-#F2F2F2' : 'bg-white', // 基础黑白交替
            index === reactiveData.barcodeIndex ? '!bg-[#C4D8EE]' : '' // 覆盖选中状态
          ]"
        >
          <view class="w-20px flex justify-center items-center">{{ index + 1 }}</view>
          <view class="flex-1">
            <view class="flex items-center">
              <view class="w-50px text-end">编码：</view>
              <view> {{ item.detailList.fnumber }}</view>
            </view>
            <view class="flex items-center">
              <view class="w-50px text-end">批号：</view>
              <view>{{ item.detailList.lot }}</view>
            </view>

            <view class="flex items-center">
              <view class="w-50px text-end">名称：</view>
              <view> {{ item.detailList.name }}</view>
            </view>
            <view class="flex">
              <view class="min-w-50px text-end">规格：</view>
              <view class="flex-wrap">{{ item.detailList.specification }}</view>
            </view>

            <view class="flex items-center">
              <view class="min-w-50px text-end">源单：</view>
              <view class="flex-wrap">{{ item?.SrcBillNo }} - {{ item?.SrcEntrySeq }}</view>
            </view>

            <view class="flex">
              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">仓位：</view>
                <view> {{ item.detailList.stockLocName }}</view>
              </view>

              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">可领：</view>
                <view> {{ item.detailList.receivableQuantity }}</view>
              </view>

              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">数量：</view>
                <view> {{ item.Quantity2 }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="reactiveData.curNow == 2">
      <view
        v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.EntityList ||
        []"
        :key="index"
        @click="getBarCode(item, index)"
        @longpress="longpressClick(item, index)"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
      >
        <view
          class="flex"
          :class="[
            index % 2 === 0 ? 'bg-#F2F2F2' : 'bg-white', // 基础黑白交替
            index === reactiveData.barcodeIndex ? '!bg-[#C4D8EE]' : '' // 覆盖选中状态
          ]"
        >
          <view class="w-20px flex justify-center items-center">{{ item.seq }}</view>
          <view class="flex-1">
            <view class="flex items-center">
              <view class="w-50px text-end">编码：</view>
              <view> {{ item.detailList.fnumber }}</view>
            </view>
            <view class="flex items-center">
              <view class="w-50px text-end">批号：</view>
              <view>{{ item.detailList.lot }}</view>
            </view>

            <view class="flex items-center">
              <view class="w-50px text-end">名称：</view>
              <view> {{ item.detailList.name }}</view>
            </view>
            <view class="flex">
              <view class="min-w-50px text-end">规格：</view>
              <view class="flex-wrap">{{ item.detailList.specification }}</view>
            </view>

            <view class="flex">
              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">仓位：</view>
                <view> {{ item.detailList.stockLocName }}</view>
              </view>

              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">可领：</view>
                <view> {{ item.canReceive }}</view>
              </view>

              <view class="w-33% flex items-center h-20px">
                <view class="w-50px text-end">数量：</view>
                <view> {{ item.Quantity2 }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
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
