<script setup lang="ts">
import { findPasswordApi } from '@/api'
import BottomButton from '@/components/BottomButton/index.vue'
import router from '@/router'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const fromData = ref({
  userPhoneNumber: '',
  phoneCode: '',
  password: '',
  passwordNew: '',
  isPassword: true,
  isPasswordNew: true
})

const compareInputs = (_rule: any, _value: any, callback: any) => {
  if (fromData.value.password !== fromData.value.passwordNew) {
    callback('两次密码不一致') // 内容不同，校验失败
  }
}

const rules = {
  password: {
    type: 'string',
    required: true,
    message: '密码不能为空',
    trigger: ['blur', 'change']
  },
  passwordNew: [
    {
      type: 'string',
      required: true,
      message: '重复密码不能为空',
      trigger: ['blur', 'change']
    },
    { validator: compareInputs, trigger: 'blur' } // 添加自定义规则来比较两个输入框的内容]
  ]
}
const formRef = ref()

const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      const res = await findPasswordApi(
        fromData.value.userPhoneNumber,
        fromData.value.phoneCode,
        fromData.value.password
      )
      if (res.success) {
        router.back({
          delta: 3
        })
      }
    })
    .catch((_errors: any) => {
      console.log('校验失败')
    })
}

const onLogin = () => {
  router.back({
    delta: 2
  })
}

onLoad((event: any) => {
  if (event.fromData) {
    const val = JSON.parse(event.fromData)
    fromData.value.userPhoneNumber = val.userPhoneNumber
    fromData.value.phoneCode = val.phoneCode
  }
})
</script>

<template>
  <ContentWrap>
    <XWAHeader />
    <view class="px-40rpx py-60rpx text-32rpx font-600">新密码</view>
    <view class="px-30rpx">
      <u-form errorType="message" :model="fromData" :rules="rules" ref="formRef">
        <u-form-item :borderBottom="true" prop="password">
          <u-input
            v-model="fromData.password"
            :password="fromData.isPassword"
            placeholder="请输入您的新密码"
            suffixIcon="eye-off"
          >
            <template #suffix>
              <u-icon
                :name="fromData.isPassword ? 'eye-off' : 'eye-fill'"
                color="#999"
                size="40rpx"
                @click="fromData.isPassword = !fromData.isPassword"
              />
            </template>
          </u-input>
        </u-form-item>
        <u-form-item :borderBottom="true" prop="passwordNew">
          <u-input
            v-model="fromData.passwordNew"
            :password="fromData.isPasswordNew"
            placeholder="请重复您的新密码"
            suffixIcon="eye-off"
          >
            <template #suffix>
              <u-icon
                :name="fromData.isPasswordNew ? 'eye-off' : 'eye-fill'"
                color="#999"
                size="40rpx"
                @click="fromData.isPasswordNew = !fromData.isPasswordNew"
              />
            </template>
          </u-input>
        </u-form-item>
      </u-form>
    </view>
    <view class="px-80rpx mt-80rpx">
      <u-button type="primary" shape="circle" @click="onSubmit">完成</u-button>
    </view>
    <BottomButton>
      <view class="text-24rpx text-#999999 pl-40rpx mb-100rpx" @click="onLogin">
        <span>已有账号</span>
        <span class="text-#1C59E6 ml-10rpx">去登录</span>
      </view>
    </BottomButton>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-status-bar) {
  background-color: #fff !important;
}
:deep(.u-navbar__content) {
  background-color: #fff !important;
}
:deep(uni-page-body) {
  background-color: #fff !important;
}
:deep(.u-form-item__body) {
  padding: 10rpx 0 !important;
}
:deep(.u-form-item__body__right__message) {
  margin-left: 20rpx !important;
}
:deep(.u-button--primary) {
  background: linear-gradient(268.32deg, #1957e6 0%, #3b73f1 100%);
  box-shadow: 0px 5px 5px rgba(25, 108, 255, 0.16);
  border: unset;
  height: 90rpx;
}
</style>
