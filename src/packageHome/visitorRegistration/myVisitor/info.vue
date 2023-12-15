<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import FormCustomDate from '@/components/Form/formItem/FormCustomDate.vue'
import { ref } from 'vue'
import { findIndex } from '@/utils'
import router from '@/router'

const popupShow = ref(false)
const infoData = ref({
  name: '',
  phone: '',
  company: '',
  reason: '',
  time: '',
  waterGate: '1#闸口'
} as any)

const list = ref([
  { label: '访客姓名', value: 'name', component: 'input', readonly: false, required: true },
  { label: '访客号码', value: 'phone', component: 'input', readonly: false },
  { label: '访客公司', value: 'company', component: 'input', readonly: false },
  { label: '访客理由', value: 'reason', component: 'input', readonly: false },
  { label: '访问时间', value: 'time', component: 'customDate', readonly: false, required: true },
  { label: '开启闸口', value: 'waterGate', component: 'select', readonly: false, required: true }
])
const popupValue = ref([{ label: '1#闸口', value: 1 }])
const popupValue2 = ref([{ label: '1#闸口', value: 1 }])

const popupList = [
  { label: '1#闸口', value: 1 },
  { label: '2#闸口', value: 2 },
  { label: '3#闸口', value: 3 }
]

const editClick = () => {
  console.log('item', infoData.value)
  if (!infoData.value.name || !infoData.value.time || !infoData.value.waterGate) {
    uni.showToast({
      title: '请填写必填项',
      icon: 'none'
    })
    return
  } else {
    router.back()
  }
}

const cellClick = (item: any) => {
  const index = findIndex(popupValue.value, (v: any) => v.value === item.value)
  if (index > -1) {
    popupValue.value.splice(index, 1)
  } else {
    popupValue.value.push(item)
  }
}

const cellStyle = (item: any) => {
  const index = findIndex(popupValue.value, (v: any) => v.value === item.value)
  if (index > -1) {
    return 'background:#1957E6'
  }
}

const popupShowClick = () => {
  popupValue.value = JSON.parse(JSON.stringify(popupValue2.value))
  popupShow.value = true
}
const popupSaveClick = () => {
  popupValue2.value = JSON.parse(JSON.stringify(popupValue.value))
  infoData.value.waterGate = ''

  for (let i = 0; i < popupValue.value.length; i++) {
    infoData.value.waterGate += popupValue.value[i].label
    if (i !== popupValue.value.length - 1) {
      infoData.value.waterGate += ','
    }
  }

  popupShow.value = false
}

onLoad((val: any) => {
  console.log('val', val)
  if (val.item) {
    list.value[0].readonly = true
    list.value[1].readonly = true
    list.value[2].readonly = true
    Object.assign(infoData.value, JSON.parse(val.item))
  }
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="申请记录" />

    <!-- 头部结束 -->
    <view>
      <view
        v-for="(item, index) in list"
        :key="index"
        class="flex items-center bg-[#FFF] mt-20rpx px-20rpx py-10rpx text-[28rpx] rounded-10rpx"
      >
        <view class="w-160rpx"
          >{{ item.label }}<text v-if="item.required" class="text-red">*</text></view
        >
        <view class="flex-1">
          <view v-if="item.component === 'input'">
            <u-input
              :placeholder="`请输入${item.label}`"
              border="surround"
              inputAlign="right"
              :readonly="item.readonly"
              v-model="infoData[item.value]"
            />
          </view>
          <view
            v-else-if="item.component === 'customDate'"
            class="h-36px flex items-center justify-end"
          >
            <FormCustomDate v-model="infoData[item.value]" placeholder="请选择时间" />
          </view>
          <view
            v-else-if="item.component === 'select'"
            class="pr-20rpx h-36px flex items-center justify-end"
            @click="popupShowClick"
          >
            <view> {{ infoData[item.value] }}</view>

            <view><u-icon name="arrow-right" size="14" color="#C0C4CC" /></view>
          </view>
        </view>
      </view>
    </view>
    <u-popup :show="popupShow" :round="10" @close="popupShow = false">
      <view class="h-600rpx pt-40rpx">
        <u-cell-group>
          <u-cell
            v-for="(item, index) in popupList"
            :key="index"
            clickable
            :title="item.label"
            @click="cellClick(item)"
          >
            <template #value>
              <view
                class="w-36rpx h-36rpx rounded-50 flex items-center justify-center"
                style="border: 1px solid #7b7b7d"
                :style="cellStyle(item)"
              >
                <u-icon name="checkbox-mark" color="#FFF" />
              </view>
            </template>
          </u-cell>
        </u-cell-group>
      </view>
      <view class="flex px-20rpx pb-20rpx">
        <view
          class="bg-[#E8EEFC] w-[50%] rounded-20rpx mx-20rpx text-[#196CFF] flex justify-center items-center h-80rpx"
          @click="popupShow = false"
        >
          <text class="">关闭</text>
        </view>
        <view
          class="bg-[#1957E6] w-[50%] rounded-20rpx mx-20rpx text-[#FFF] flex justify-center items-center h-80rpx"
          @click="popupSaveClick"
        >
          <text class="">保存</text>
        </view>
      </view>
    </u-popup>
    <view class="h-120rpx" />
    <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx flex z-999">
      <view
        class="w-[50%] bg-[#1957E6] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center mr-10rpx"
        hover-class="button-spread"
        @click="editClick"
        >保存</view
      >
      <view
        class="w-[50%] bg-[#1957E6] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center ml-10rpx"
        hover-class="button-spread"
        @click="editClick"
        >保存并分享</view
      >
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
::v-deep .form-custom-date {
  justify-content: flex-end;
}
.button-spread {
  background: rgb(138 163 222);
}
</style>
