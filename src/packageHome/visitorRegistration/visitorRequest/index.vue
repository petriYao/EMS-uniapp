<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { getInputColumn, getCustomDateColumn } from '@/utils'
import FormPartItem from '@/components/Form/FormPart.vue'
import { getLocal, setLocal, visitorRequestkey } from '@/hooks/useCache'
import router from '@/router'

const formDataRef = ref()
// 轮播图
const reactiveData = reactive({
  formData: [] as any,
  rules: {},
  editData: [] as any
})

const onFormData = () => {
  const val = getLocal(visitorRequestkey)
  if (val) {
    reactiveData.editData = JSON.parse(val)
  }
  reactiveData.formData = [
    getInputColumn('受访问人公司', 'company', '请输入受访问人公司', {
      columnStyle: 'column-style'
    }),
    getInputColumn('受访问人', 'name', '请输入访问人', { columnStyle: 'column-style' }),
    getCustomDateColumn('预约来访时间', 'time', '请输入预约来访时间', {
      columnStyle: 'column-style'
    }),
    getInputColumn('来访原因', 'reason', '请输入来访原因', { columnStyle: 'column-style' })
  ]

  reactiveData.rules = {
    company: {
      type: 'string',
      required: true,
      message: '名字不能为空',
      trigger: []
    },
    name: {
      type: 'string',
      required: true,
      message: '手机号码不能为空',
      trigger: []
    },
    time: {
      type: 'string',
      required: true,
      message: '预约来访时间不能为空',
      trigger: []
    }
  }
}

const submitClick = () => {
  const data = formDataRef.value.saveClick()
  console.log('data', data)
  if (!data.name) {
    uni.showToast({
      title: '受访问人不能为空',
      icon: 'none'
    })
    return
  } else if (!data.company) {
    uni.showToast({
      title: '受访问人公司不能为空',
      icon: 'none'
    })
    return
  } else if (!data.time) {
    uni.showToast({
      title: '受访问人公司不能为空',
      icon: 'none'
    })
    return
  }
  data['type'] = 0
  reactiveData.editData.push(data)
  setLocal(visitorRequestkey, JSON.stringify(reactiveData.editData))
  router.back()
}
onBeforeMount(() => {
  onFormData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="访客申请" />

    <!-- 头部结束 -->
    <view v-if="reactiveData.formData" class="w-100% bg-[#F6F7FB]">
      <FormPartItem
        ref="formDataRef"
        category=""
        :formData="reactiveData.formData"
        :rules="reactiveData.rules"
        :editData="reactiveData.editData"
        labelPosition="top"
        :borderBottom="false"
        formStyle="form-style"
      />
    </view>
    <view class="h-120rpx" />
    <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx z-999">
      <view
        class="w-[100%] bg-[#466BF3] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center"
        hover-class="button-spread"
        @click="submitClick"
        >保存</view
      >
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
::v-deep .column-style {
  background: #fff;
  padding: 20rpx;
  margin-top: 20rpx;
  /* #ifdef H5 */
  width: 100%;
  /* #endif */
}

::v-deep .u-form-item__body__right__content {
  background: #f6f7fb;
}

::v-deep .u-form-item__body {
  padding: 0 !important;
}
</style>
