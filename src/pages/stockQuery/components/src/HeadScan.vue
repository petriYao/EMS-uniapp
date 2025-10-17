<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { queryBarCode, queryMaterial } from '@/api/modules/lowerCamelCase'
import { QueryInv } from '@/api/commonHttp'
// import { useEmitt } from '@/hooks/useEmitt'
import { debounce } from '@/utils'
//数据
const reactiveData = reactive({
  searchValue: '', //搜索值
  focus: 1,
  heardList: {
    number: '',
    name: '',
    type: '',
    num: ''
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
}>()

//离开时搜索
const searchChange = debounce(async () => {
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    ss()
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
    const stockRes: any = await QueryInv(reactiveData.heardList.number)
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
    emit('update:detailsList', stockRes.data)
    reactiveData.searchValue = ''
    reactiveData.focus = 22
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
  }, 200)
}, 300)
//扫码
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
}

onBeforeMount(() => {
  // 组件挂载前的逻辑
  ss()
})
onBeforeUnmount(() => {
  // 组件卸载时清理
  clearTimer()
})
</script>

<template>
  <view>
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
        <view class="w-50px flex justify-center">数量</view>
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
    </view>
  </view>
</template>
