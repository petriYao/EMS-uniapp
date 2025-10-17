<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref, watch } from 'vue'
import { queryBarCode, queryMaterial } from '@/api/modules/lowerCamelCase'
import { QueryInvByCW } from '@/api/commonHttp'
import { queryStorage } from '@/api/modules/storage'
import { debounce, debounceSave } from '@/utils'

const props = defineProps<{
  loading: {
    type: Boolean
    default: false
  }
  setData: any
}>()

//数据
const reactiveData = reactive({
  searchValue: '', //搜索值
  focus: 2,
  warehouseList: [] as any, //仓库列表
  setData: {
    warehouseName: '',
    warehouseNumber: '',
    warehouseId: '',
    scValue: '',
    show: false
  },
  detailsList: [] as any,
  selectIndex: 0,
  details: {
    inventoryquantity: '',
    inventory: ''
  } as any,
  warehouse: '', //仓库
  heardList: {
    number: '',
    name: '',
    type: '',
    num: ''
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:setData', modelValue: any): void
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:selectIndex', modelValue: any): void
}>()

//离开时搜索
const searchChange = debounce(async () => {
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    if (reactiveData.setData.warehouseName === '') {
      uni.showToast({
        title: '请选择仓库',
        icon: 'none',
        duration: 5000
      })
      reactiveData.searchValue = ''
      reactiveData.focus = 2
      return
    }
    handleFocus()
    //调用条码（单据查询）
    //先看物料中是否存在
    const queryRes1: any = await queryMaterial(`fnumber = '${reactiveData.searchValue}'`)
    if (queryRes1 && queryRes1.data.length > 0) {
      reactiveData.heardList.num = ''
      let data = queryRes1.data[0]
      reactiveData.heardList.number = data[0]
      reactiveData.heardList.name = data[1]
      reactiveData.heardList.type = data[2]
    } else {
      const queryRes: any = await queryBarCode(`fnumber = '${reactiveData.searchValue}'`)
      if (queryRes && queryRes.data.length > 0) {
        reactiveData.heardList.num = ''
        let data = queryRes.data[0]
        reactiveData.heardList.number = data[0]
        reactiveData.heardList.name = data[1]
        reactiveData.heardList.type = data[2]
      } else {
        //提示
        uni.showToast({
          title: '条码不存在',
          icon: 'none',
          duration: 5000
        })
        reactiveData.searchValue = ''
        reactiveData.focus = 22
        setTimeout(() => {
          reactiveData.focus = 1
        }, 200)
        return
      }
    }
    //库存查询
    const stockRes: any = await QueryInvByCW(
      reactiveData.heardList.number,
      reactiveData.setData.warehouseName
    )
    // const stockRes: any = await QueryStock('AC5879TEX0002')
    if (stockRes && stockRes.data.length > 0) {
      //合计数量
      let num = 0
      for (const item of stockRes.data) {
        num += item.inventoryquantity
      }
      reactiveData.heardList.num = num == null ? '0' : num.toString()
    } else {
      reactiveData.heardList.num = '0'
    }
    reactiveData.detailsList = stockRes.data
    if (stockRes.data.length > 0) {
      reactiveData.details = reactiveData.detailsList[0]
    }
    emit('update:detailsList', stockRes.data)
    reactiveData.searchValue = ''
    reactiveData.focus = 22
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
  }, 300)
}, 300)

//扫码
const searchClick = async () => {
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  if (res) {
    if (reactiveData.focus === 1) {
      reactiveData.searchValue = res.result
      searchChange()
    } else if (reactiveData.focus === 2) {
      reactiveData.setData.warehouseName = res.result
      warehouseChange(res.result)
    } else if (reactiveData.focus === 3) {
      reactiveData.details.storagelocation += res.result
    }
  }
}
// 获取仓库列表
const getWarehouseList = async () => {
  const res: any = await queryStorage()
  if (res) {
    reactiveData.warehouseList = res.data.map((item: any) => ({
      id: item[2],
      text: item[0],
      value: item[1]
    }))
  }
}
// 仓库变更
const warehouseChange = debounceSave(async (val: string) => {
  const warehouse = reactiveData.warehouseList.find((item: any) => item.value === val)
  if (!warehouse && val) {
    uni.showToast({ title: '仓库不存在', icon: 'none' })
    reactiveData.setData.warehouseName = ''
    return
  }
  reactiveData.setData.warehouseName = warehouse.text
  reactiveData.setData.warehouseNumber = warehouse.value
  reactiveData.setData.warehouseId = warehouse.id
  setTimeout(() => {
    reactiveData.focus = 1
  }, 100)
  handleFocus()
  emit('update:setData', reactiveData.setData)
})

// 仓库选择器确认
const pickerConfirm = async (val: any) => {
  reactiveData.setData.warehouseName = val.text
  reactiveData.setData.warehouseNumber = val.value
  reactiveData.setData.warehouseId = val.id
  setTimeout(() => {
    reactiveData.focus = 1
  }, 100)
  emit('update:setData', reactiveData.setData)
  emit('update:detailsList', reactiveData.detailsList)
  reactiveData.setData.show = false
}

//选择当前行
const selectClick = (item: any, index: number) => {
  reactiveData.selectIndex = index
  reactiveData.details = item
  emit('update:selectIndex', reactiveData.selectIndex)
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

watch(
  () => props.loading,
  () => {
    if (props.loading && props.setData.warehouseNumber) {
      reactiveData.setData.warehouseName = props.setData.warehouseNumber
      setTimeout(() => {
        reactiveData.focus = 1
      }, 100)
      warehouseChange(props.setData.warehouseNumber)
    }
  },
  {
    immediate: true
  }
)

onBeforeMount(() => {
  // 组件挂载前的逻辑
  handleFocus()
  getWarehouseList()
})
onBeforeUnmount(() => {
  // 组件卸载时清理
  clearTimer()
})
</script>

<template>
  <view>
    <u-sticky offsetTop="68px" zIndex="100">
      <view class="flex items-center pb-20rpx bg-#f2f2f2">
        <view class="w-50px flex justify-center" @click="searchClick">
          <u-icon name="scan" size="24" />
        </view>
        <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
          <u-input
            id="fnk-input-native"
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
    </u-sticky>
    <!-- 仓库 -->
    <view class="flex items-center pt-10rpx w-100%">
      <view class="w-50px flex justify-center">仓库</view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          v-model="reactiveData.setData.warehouseName"
          shape="round"
          placeholder=""
          :focus="reactiveData.focus == 2"
          @blur="warehouseChange"
        >
          <template #suffix>
            <view @click="reactiveData.setData.show = true">
              <u-icon name="arrow-down" size="20" />
            </view>
            <view>
              <u-action-sheet
                :show="reactiveData.setData.show"
                round="10"
                :closeOnClickOverlay="true"
                :closeOnClickAction="true"
                @close="reactiveData.setData.show = false"
              >
                <view class="flex items-center p-20rpx" style="border-bottom: 1px solid #f8f8f8">
                  <view>搜索</view>
                  <view class="flex-1" @click="clearTimer">
                    <u-input
                      v-model="reactiveData.setData.scValue"
                      shape="round"
                      placeholder="请输入搜索关键词"
                      @blur="handleFocus"
                    />
                  </view>
                </view>
                <scroll-view scroll-y style="height: 800rpx">
                  <view
                    class=""
                    v-for="(warehouseItem, index) in reactiveData.warehouseList"
                    :key="index"
                  >
                    <view
                      class="flex justify-center py-10px"
                      style="border-bottom: 1px solid #f8f8f8"
                      v-if="warehouseItem.value.indexOf(reactiveData.setData.scValue || '') !== -1"
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

    <view class="mb-20px">
      <view class="pt-10rpx pr-20rpx">
        <view class="flex items-center pb-10rpx w-100%">
          <view class="w-50px flex justify-center">编码</view>
          <view class="flex-1" style="border: 1px solid #f8f8f8">
            <u-input
              ref="searchInput"
              v-model="reactiveData.heardList.number"
              :showAction="false"
              :disabled="true"
              shape="round"
              placeholder=""
            />
          </view>
        </view>

        <view class="flex items-center pb-10rpx w-100%">
          <view class="w-50px flex justify-center items-start"> 名称 </view>
          <view
            class="flex-1 min-h-28px px-6px bg-#F5F7FA pt-2px"
            style="border: 1px solid #f8f8f8; word-break: break-all"
          >
            {{ reactiveData.heardList.name }}
          </view>
        </view>

        <view class="flex items-center pb-10rpx w-100%">
          <view class="w-50px flex justify-center items-start"> 规格 </view>
          <view
            class="flex-1 min-h-28px px-6px bg-#F5F7FA pt-2px"
            style="border: 1px solid #f8f8f8; word-break: break-all"
          >
            {{ reactiveData.heardList.type }}
          </view>
        </view>

        <view class="flex items-center pb-10rpx w-100%">
          <view class="flex items-center w-70%">
            <view class="w-50px flex justify-center">库存</view>
            <view class="flex-1" style="border: 1px solid #f8f8f8">
              <u-input
                ref="searchInput"
                v-model="reactiveData.heardList.num"
                :showAction="false"
                :disabled="true"
                shape="round"
                placeholder=""
              />
            </view>
          </view>
          <view class="flex items-center w-30%">
            <view class="w-50px flex justify-center">单位</view>
            <view class="flex-1" style="border: 1px solid #f8f8f8">
              <u-input
                ref="searchInput"
                v-model="reactiveData.details.unitname"
                :showAction="false"
                :disabled="true"
                shape="round"
                placeholder=""
              />
            </view>
          </view>
        </view>

        <view class="flex items-center pb-10rpx w-100%">
          <view class="w-50px flex justify-center">储位</view>
          <view class="flex-1" style="border: 1px solid #f8f8f8" @click="clearTimer">
            <u-input
              ref="searchInput"
              v-model="reactiveData.details.storagelocation"
              :showAction="false"
              shape="round"
              placeholder=""
              :focus="reactiveData.focus === 3"
              @focus="reactiveData.focus = 3"
            />
          </view>
        </view>
      </view>
    </view>
    <view v-if="reactiveData.detailsList.length > 0">
      <view class="mb-40px">
        <view
          v-for="(item, index) of reactiveData.detailsList"
          :key="index"
          @click="selectClick(item, index)"
        >
          <view
            class="flex py-10rpx"
            :class="[
              index % 2 === 0 ? 'bg-#F2F2F2' : 'bg-white', // 基础黑白交替
              index === reactiveData.selectIndex ? '!bg-[#C4D8EE]' : '' // 覆盖选中状态
            ]"
          >
            <view class="ml-20rpx flex justify-center items-center">{{ index + 1 }}</view>
            <view class="flex-1">
              <view class="flex">
                <view class="w-60% flex items-center h-20px">
                  <view class="w-50px text-end">数量：</view>
                  <view> {{ item.inventoryquantity }}</view>
                </view>
                <view class="w-40% flex items-center h-20px">
                  <view class="w-50px text-end">批号：</view>
                  <view> {{ item.batchnumber }}</view>
                </view>
              </view>

              <view class="flex">
                <view class="w-60% flex items-center h-20px">
                  <view class="w-50px text-end">储位：</view>
                  <view> {{ item.storagelocation }}</view>
                </view>
                <view class="w-40% flex items-center h-20px">
                  <view class="w-50px text-end">仓位：</view>
                  <view>{{ item.locationcode }}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
