<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { getInputColumn } from '@/utils'
import FormPartItem from '@/components/Form/FormPart.vue'
import { getLocal, setLocal, visitorApplicatKey } from '@/hooks/useCache'
import router from '@/router'

const formDataRef = ref()
// 轮播图
const reactiveData = reactive({
  formData: [] as any,
  rules: {},
  editData: [] as any
})

const onFormData = () => {
  const val = getLocal(visitorApplicatKey)
  if (val) {
    reactiveData.editData = JSON.parse(val)
  }
  reactiveData.formData = [
    getInputColumn('名字', 'name', '请输入昵称', { columnStyle: 'column-style' }),
    getInputColumn('手机号码', 'phone', '请输入手机号码', { columnStyle: 'column-style' }),
    getInputColumn('公司', 'company', '请输入公司', { columnStyle: 'column-style' })
  ]

  reactiveData.rules = {
    name: {
      type: 'string',
      required: true,
      message: '名字不能为空',
      trigger: []
    },
    phone: {
      type: 'string',
      required: true,
      message: '手机号码不能为空',
      trigger: []
    }
  }
}

const submitClick = () => {
  const data = formDataRef.value.saveClick()
  console.log('data', data)
  if (!data.name) {
    uni.showToast({
      title: '名字不能为空',
      icon: 'none'
    })
    return
  } else if (!data.phone) {
    uni.showToast({
      title: '手机号码不能为空',
      icon: 'none'
    })
    return
  }
  setLocal(visitorApplicatKey, JSON.stringify(data))
  router.back()
}
onBeforeMount(() => {
  onFormData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="添加申请人信息" />

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
      >
        保存
      </view>
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
