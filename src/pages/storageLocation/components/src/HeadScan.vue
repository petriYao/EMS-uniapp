<script setup lang="ts">
import { reactive, onBeforeUnmount, onBeforeMount, ref } from 'vue'
import { queryBarCode } from '@/api/modules/lowerCamelCase'
import { QueryStock } from '@/api/commonHttp'
// import { useEmitt } from '@/hooks/useEmitt'
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
const searchChange = () => {
  setTimeout(async () => {
    if (reactiveData.searchValue === '') {
      return
    }
    ss()
    //调用条码（单据查询）
    const queryRes: any = await queryBarCode(`fnumber = '${reactiveData.searchValue}'`)
    console.log('查询结果AC5879TEX0002', queryRes)
    if (queryRes && queryRes.data.length > 0) {
      reactiveData.heardList.num = ''
      let data = queryRes.data[0]
      reactiveData.heardList.number = data[0]
      reactiveData.heardList.name = data[1]
      reactiveData.heardList.type = data[2]
      //库存查询
      const stockRes: any = await QueryStock(data[0])
      // const stockRes: any = await QueryStock('AC5879TEX0002')
      console.log('库存结果2', stockRes)
      if (stockRes && stockRes.data.length > 0) {
        //合计数量
        let num = 0
        for (const item of stockRes.data) {
          num += item.qty
        }
        reactiveData.heardList.num = num.toString()
      }
      emit('update:detailsList', stockRes.data)
    } else {
      //提示
      uni.showToast({
        title: '条码不存在',
        icon: 'none',
        duration: 5000
      })
    }
    reactiveData.searchValue = ''
    reactiveData.focus = 22
    setTimeout(() => {
      reactiveData.focus = 1
    }, 200)
  }, 500)
}
//扫码
const searchClick = async () => {
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  console.log('扫码结果', res)
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

    <view class="pt-20rpx">
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
        <view class="w-50px flex justify-center">名称</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8">
          <u-input
            ref="searchInput"
            v-model="reactiveData.heardList.name"
            :showAction="false"
            :disabled="true"
            shape="round"
            placeholder=""
          />
        </view>
      </view>

      <view class="flex items-center pb-10rpx w-100%">
        <view class="w-50px flex justify-center">规格</view>
        <view class="flex-1" style="border: 1px solid #f8f8f8">
          <u-input
            ref="searchInput"
            v-model="reactiveData.heardList.type"
            :showAction="false"
            :disabled="true"
            shape="round"
            placeholder=""
          />
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
