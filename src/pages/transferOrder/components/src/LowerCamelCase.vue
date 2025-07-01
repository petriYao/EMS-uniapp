<script setup lang="ts">
import { reactive, watch } from 'vue'
import { TMQuery } from '@/api/commonHttp'
const props = defineProps({
  detailsList: {
    type: Array as any,
    default: () => [] as any
  }
})

const reactiveData = reactive({
  detailsList: [] as any,
  subsectionList: ['当前', '明细', '条码'],
  curNow: 0,
  barCodeList: [] as any, //条码
  barcodeIndex: 0
})

const getBarCode = async (item: any, index: number, curNow = 1) => {
  console.log('条码', item, index)
  const res: any = await TMQuery([
    item.F_NUMBER,
    item.F_HTNO,
    item.F_QADV_HTENTRYID,
    '2',
    item.F_QADV_FSTOCKID,
    item.F_QADV_STOCKLOCID
  ])
  reactiveData.barCodeList = res.data
  console.log('条码', res)
  // reactiveData.barCodeList = item.F_BARCODE
  reactiveData.curNow = curNow
}

watch(
  () => props.detailsList,
  (val: any) => {
    console.log('val', val)
    if (val.length == 0) return
    reactiveData.detailsList = val

    getBarCode(val[0], 0, 0)
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
  <!-- 当前 -->
  <view v-if="reactiveData.curNow == 0" class="flex flex-wrap">
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
    </view>
    <view v-if="reactiveData.detailsList.length > 0" class="w-100% pl-2px mt-2px">
      <view class="flex w-100% px-10px">
        <view class="w-50% flex items-center">
          <view>本箱数</view>
          <view class="ml-20px text-18px mt-2px">{{
            reactiveData.detailsList[reactiveData.barcodeIndex]?.barCodeList[
              reactiveData.detailsList[reactiveData.barcodeIndex].barCodeList.length - 1
            ]?.F_UNITQTY
          }}</view>
        </view>
        <view class="w-50% flex items-center">
          <view>合计</view>
          <view class="ml-20px text-18px mt-2px">
            {{ reactiveData.detailsList[reactiveData.barcodeIndex]?.Quantity2 }}</view
          >
        </view>
      </view>
      <view
        class="flex px-10px items-center text-#90BBF5 mt-6rpx text-16px"
        v-if="reactiveData.detailsList[reactiveData.barcodeIndex]?.IsSplit"
      >
        <view class="text-center">{{
          reactiveData.detailsList[reactiveData.barcodeIndex]?.barCodeList[
            reactiveData.detailsList[reactiveData.barcodeIndex].barCodeList.length - 1
          ].F_FZNO
        }}</view>
        <view class="ml-8px text-center">{{
          reactiveData.detailsList[reactiveData.barcodeIndex]?.barCodeList[
            reactiveData.detailsList[reactiveData.barcodeIndex].barCodeList.length - 1
          ].F_BJNAME
        }}</view>
      </view>
    </view>
  </view>
  <view v-if="reactiveData.curNow === 1">
    <view
      v-for="(item, index) of props.detailsList || []"
      :key="index"
      @click="getBarCode(item, index)"
    >
      <view class="flex" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
        <view class="ml-20px flex justify-center items-center">{{ index + 1 }}</view>
        <view class="flex-1">
          <view class="flex">
            <view class="w-66% flex items-center h-20px">
              <view class="w-70px text-end">编码：</view>
              <view> {{ item.detailList.fnumber }}</view>
            </view>
            <view class="w-33% flex items-center h-20px">
              <view class="w-70px text-end">批号：</view>
              <view>{{ item.detailList.lot }}</view>
            </view>
          </view>
          <view class="flex">
            <view class="w-70px text-end">名称：</view>
            <view> {{ item.detailList.name }}</view>
          </view>
          <view class="flex items-center h-20px">
            <view class="w-70px text-end">规格：</view>
            <view>{{ item.detailList.specification }}</view>
          </view>

          <view class="flex">
            <view class="w-33% flex items-center h-20px">
              <view class="w-70px text-end">数量：</view>
              <view> {{ item.Quantity2 }}</view>
            </view>
            <view class="w-33% flex items-center h-20px">
              <view class="w-70px text-end">件数：</view>
              <view> {{ item.barCodeList.length }}</view>
            </view>

            <view class="w-33% flex items-center h-20px">
              <view class="w-70px text-end">仓位：</view>
              <view>{{ item.detailList.warehousePosition }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <view v-if="reactiveData.curNow === 2">
    <view class="flex bg-#f2f2f2 py-10rpx">
      <view class="w-15% text-center">序号</view>
      <view class="w-70%">条码编码</view>
      <view class="w-15% text-center">数量</view>
    </view>
    <view
      v-for="(item, index) of reactiveData.detailsList[reactiveData.barcodeIndex]?.barCodeList ||
      []"
      :key="item.FNUMBER"
    >
      <view class="flex py-10rpx" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
        <view class="w-15% flex justify-center pt-3px">{{ index + 1 }}</view>
        <view class="w-70% pt-3px">
          <view>{{ item.F_BARCODENO }}</view>
          <view class="flex items-center" v-if="item.F_FZNO !== ' ' && item.F_FZNO !== ''">
            <view class="mr-8px">分装：{{ item.F_FZNO }}</view>
            <view class="mr-8px">{{ item.F_BJNAME }}</view>
            <view class="mr-8px">用量：{{ item.F_JUNITQTY }}</view>
          </view>
        </view>
        <view class="w-15% flex justify-center pt-3px">
          {{ item.F_UNITQTY }}
        </view>
      </view>
    </view>
  </view>
</template>
