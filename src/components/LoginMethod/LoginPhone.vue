<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import { loginApi } from '@/api'
import { setUserIdentity } from '@/hooks/useCache'
import { getAppName } from '@/config/config'

const fromData = ref({
  username: '',
  password: '',
  protocol: ''
})
const isPassword = ref(true)
const rules = {
  username: {
    type: 'string',
    required: true,
    message: '请填写账号',
    trigger: ['blur', 'change']
  },
  password: {
    type: 'string',
    required: true,
    message: '请填写密码',
    trigger: ['blur', 'change']
  },
  protocol: {
    type: 'array',
    min: 1,
    required: true,
    message: `请选阅读并同意${getAppName()}用户协议`,
    trigger: ['change']
  }
}

const formRef = ref()

/**注册 */
const onRegister = () => {
  router.push({
    url: '/packageHome/login/register'
  })
}

/**忘记密码 */
const onForgotPassword = () => {
  router.push({
    url: '/packageHome/login/forgotPassword'
  })
}

const onSubmit = () => {
  formRef.value
    .validate()
    .then(async (_res: any) => {
      const res = await loginApi(fromData.value.username, fromData.value.password)
      if (res.success) {
        setUserIdentity(res.value)
        router.back()
      }
    })
    .catch((_errors: any) => {
      console.log('校验失败')
    })
}
</script>

<template>
  <view class="px-30rpx">
    <u-form errorType="toast" :model="fromData" :rules="rules" ref="formRef">
      <u-form-item :borderBottom="true" prop="username">
        <u-input v-model="fromData.username" placeholder="请输入您的账号" />
      </u-form-item>
      <u-form-item :borderBottom="true" prop="password">
        <u-input
          v-model="fromData.password"
          :password="isPassword"
          placeholder="请输入您的密码"
          suffixIcon="eye-off"
        >
          <template #suffix>
            <u-icon
              :name="isPassword ? 'eye-off' : 'eye-fill'"
              color="#999"
              size="40rpx"
              @click="isPassword = !isPassword"
            />
          </template>
        </u-input>
      </u-form-item>
      <view class="flex-rows justify-between mt-20rpx">
        <u-form-item prop="protocol">
          <u-checkbox-group v-model="fromData.protocol" shape="square" size="36rpx">
            <view class="flex-rows">
              <u-checkbox
                shape="circle"
                labelColor="#999999"
                labelSize="24rpx"
                :customStyle="{ marginRight: '16px' }"
                label="我已阅读并同意"
              />
              <view class="text-24rpx">{{ getAppName() }}用户协议</view>
            </view>
          </u-checkbox-group>
        </u-form-item>
        <view class="text-24rpx text-#999999" @click="onForgotPassword">忘记密码？</view>
      </view>
    </u-form>
  </view>
  <view class="px-80rpx mt-80rpx">
    <u-button type="primary" shape="circle" @click="onSubmit">登录</u-button>
  </view>
  <view class="text-24rpx my-50rpx px-30rpx">
    <span class="text-#999999">没有账号？</span>
    <span class="text-#1C59E6" @click="onRegister">去注册</span>
  </view>
</template>

<style lang="scss" scoped></style>
