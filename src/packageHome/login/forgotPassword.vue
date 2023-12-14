<script setup lang="ts">
import { checkSmsCodeApi, sendSmsCodeApi } from '@/api'
import BottomButton from '@/components/BottomButton/index.vue'
import router from '@/router'
import { ref } from 'vue'

const fromData = ref({
  userPhoneNumber: '',
  phoneCode: ''
})

const rules = {
  userPhoneNumber: [
    {
      type: 'number',
      required: true,
      message: '手机号码不能为空',
      trigger: ['blur', 'change']
    },
    {
      len: 11,
      message: '请填写11位手机号码',
      trigger: ['blur']
    }
  ],
  phoneCode: {
    type: 'number',
    required: true,
    message: '验证码不能为空',
    trigger: ['blur', 'change']
  }
}
const formRef = ref() //表单ref
const codeRef = ref() //倒计时ref
const isGetCode = ref(false) //是否点击获取验证码
const codeTime = 59 * 1000 //重新获取验证码时长
const seconds = ref(59) //剩余时长

/**获取验证码 */
const onGetCode = async () => {
  const res = await sendSmsCodeApi(fromData.value.userPhoneNumber, 1)
  if (res.success) {
    isGetCode.value = true
    setTimeout(() => {
      codeRef.value.start()
    }, 300)
  }
}
/**剩余时长 */
const onChange = (e: any) => {
  seconds.value = e.seconds
}

/**倒计时结束 */
const onFinish = () => {
  isGetCode.value = false
}

const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      const res = await checkSmsCodeApi(fromData.value.userPhoneNumber, 1, fromData.value.phoneCode)
      if (res.success) {
        router.push({
          url: `/packageHome/login/resetPassword?fromData=${JSON.stringify(fromData.value)}`
        })
      }
    })
    .catch((_errors: any) => {})
}

const onLogin = () => {
  router.back()
}
</script>

<template>
  <ContentWrap>
    <XWAHeader />
    <view class="px-40rpx py-60rpx text-32rpx font-600">忘记密码</view>
    <view class="px-30rpx">
      <u-form errorType="message" :model="fromData" :rules="rules" ref="formRef">
        <u-form-item :borderBottom="true" prop="userPhoneNumber">
          <u-input v-model="fromData.userPhoneNumber" placeholder="请输入您的手机号码" />
        </u-form-item>
        <u-form-item :borderBottom="true" prop="phoneCode">
          <u-input v-model="fromData.phoneCode" placeholder="请输入验证码">
            <template #suffix>
              <view v-if="!isGetCode" @click="onGetCode">获取验证码</view>
              <view v-if="isGetCode">
                <u-count-down
                  :time="codeTime"
                  format="DD:HH:mm:ss"
                  :autoStart="false"
                  ref="codeRef"
                  @change="onChange"
                  @finish="onFinish"
                >
                  <view class="text-#999999">
                    <text class="time__item">重新发送({{ seconds }})</text>
                  </view>
                </u-count-down>
              </view>
            </template>
          </u-input>
        </u-form-item>
      </u-form>
    </view>
    <view class="px-80rpx mt-100rpx">
      <u-button type="primary" shape="circle" @click="onSubmit">下一步</u-button>
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
