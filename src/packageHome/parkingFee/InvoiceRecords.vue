<script setup lang="ts">
// import { getSvgURL } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import { reactive } from 'vue'

const reactiveData = reactive({
  infoData: {
    riseType: '个人',
    riseName: '',
    unitTaxNumber: '',
    invoiceType: '电子发票',
    content: '商品明细',
    allPrice: 0,
    mailbox: ''
  } as any,
  contentList: [
    {
      name: '发票类型',
      value: 'invoiceType'
    },
    {
      name: '发票内容',
      value: 'content'
    },
    {
      name: '开票金额',
      value: 'allPrice'
    },
    {
      name: '电子邮箱',
      value: 'mailbox'
    }
  ]
})

onLoad(async (val: any) => {
  console.log('val', val)
  reactiveData.infoData.allPrice = val.allPrice + '元'
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="电子发票" />
    <view class="text-28rpx">
      <view class="invoice-cell">
        <view>抬头类型</view>
        <view class="flex">
          <view
            class="w-120rpx mr-20rpx py-8rpx flex justify-center items-center bg-[#F2F2F2] rounded-70rpx"
            :style="
              reactiveData.infoData.riseType === '个人'
                ? 'border: 1px solid #196CFF;color: #196CFF;background-color: #E8F0FF;'
                : 'border: 1px solid #ccc'
            "
            @click="reactiveData.infoData.riseType = '个人'"
          >
            个人
          </view>
          <view
            class="w-120rpx py-8rpx flex justify-center items-center bg-[#F2F2F2] rounded-70rpx"
            :style="
              reactiveData.infoData.riseType === '企业'
                ? 'border: 1px solid #196CFF;color: #196CFF;background-color: #E8F0FF;'
                : 'border: 1px solid #ccc'
            "
            @click="reactiveData.infoData.riseType = '企业'"
          >
            企业
          </view>
        </view>
      </view>
      <view class="invoice-cell">
        <view>发票抬头</view>
        <view>{{ reactiveData.infoData.riseType }}</view>
      </view>

      <view class="invoice-cell" v-if="reactiveData.infoData.riseType === '企业'">
        <view>抬头名称</view>
        <view>
          <u-input
            placeholder="请输入抬头名称"
            border="surround"
            inputAlign="right"
            v-model="reactiveData.infoData.riseName"
          />
        </view>
      </view>
      <view class="invoice-cell" v-if="reactiveData.infoData.riseType === '企业'">
        <view>单位税号</view>
        <view>
          <u-input
            placeholder="请输入抬头名称"
            border="surround"
            inputAlign="right"
            v-model="reactiveData.infoData.unitTaxNumber"
          />
        </view>
      </view>

      <view>
        <view v-for="(item, index) of reactiveData.contentList" :key="index">
          <view class="invoice-cell">
            <view>{{ item.name }}</view>
            <view v-if="item.name === '电子邮箱'">
              <u-input
                :placeholder="`请输入${item.name}`"
                border="surround"
                inputAlign="right"
                v-model="reactiveData.infoData[item.value]"
              />
            </view>
            <view v-else>
              {{ reactiveData.infoData[item.value] }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="h-120rpx" />
    <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx z-999">
      <view
        class="w-[100%] bg-[#466BF3] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center"
        hover-class="button-spread"
        @click=""
      >
        保存
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.invoice-cell {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx;
}
::v-deep .u-input {
  padding: 0 !important;
}
</style>
