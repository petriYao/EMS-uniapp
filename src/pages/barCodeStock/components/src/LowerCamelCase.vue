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
  subsectionList: ['明细', '条码'],
  curNow: 0,
  barCodeList: [] as any //条码
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
    console.log('val', val.length)
    if (val.length == 0) return
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
  <view v-if="reactiveData.curNow === 0">
    <view
      v-for="(item, index) of props.detailsList || []"
      :key="index"
      @click="getBarCode(item, index)"
    >
      <view class="flex" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
        <view class="ml-20px flex justify-center items-center">{{ index + 1 }}</view>
        <view class="flex-1">
          <view class="flex">
            <view class="w-70px text-end">客户：</view>
            <view> {{ item.KHNAME }}</view>
          </view>
          <view class="flex items-center h-20px">
            <view class="w-70px text-end">合同号：</view>
            <view>{{ item.F_HTNO }} - {{ item.F_QADV_HTENTRYID }}</view>
          </view>
          <view class="flex">
            <view class="w-50% flex items-center h-20px">
              <view class="w-70px text-end">仓库：</view>
              <view> {{ item.CKNAME }}</view>
            </view>
            <view class="w-50% flex items-center h-20px">
              <view class="w-70px text-end">仓位：</view>
              <view>{{ item.CWNAME }}</view>
            </view>
          </view>
          <view class="flex">
            <view class="w-50% flex items-center h-20px">
              <view class="w-70px text-end">订单数：</view>
              <view> {{ item.F_QADV_HTQTY }}</view>
            </view>
            <view class="w-50% flex items-center h-20px">
              <view class="w-70px text-end">数量：</view>
              <view> {{ item.qty }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <view v-if="reactiveData.curNow === 1">
    <view class="flex bg-#f2f2f2 py-10rpx">
      <view class="w-15% text-center">序号</view>
      <view class="w-70%">条码编码</view>
      <view class="w-15% text-center">数量</view>
    </view>
    <view v-for="(item, index) of reactiveData.barCodeList || []" :key="item.FNUMBER">
      <view class="flex py-10rpx" :style="index % 2 == 1 ? 'background-color:#f2f2f2' : ''">
        <view class="w-15% flex justify-center pt-3px">{{ index + 1 }}</view>
        <view class="w-70% pt-3px">
          <view>{{ item.FNUMBER }}</view>
          <view class="flex items-center" v-if="item.F_CHECKBOXFZ > 0">
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
