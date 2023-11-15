<script setup lang="ts">
import { checkSmsCodeApi, registerApi, sendSmsCodeApi } from '@/api'
import BottomButton from '@/components/BottomButton/index.vue'
import { setUserIdentity } from '@/hooks/useCache'
import router from '@/router'
import { ref } from 'vue'

const fromData = ref({
  userPhoneNumber: '',
  phoneCode: '',
  userPassword: '',
  userPasswordNew: '',
  isuserPassword: true,
  isuserPasswordNew: true,
  protocol: ''
})

const compareInputs = (_rule: any, _value: any, callback: any) => {
  if (fromData.value.userPassword !== fromData.value.userPasswordNew) {
    callback('两次密码不一致') // 内容不同，校验失败
  }
}

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
  },
  userPassword: {
    type: 'string',
    required: true,
    message: '密码不能为空',
    trigger: ['blur', 'change']
  },
  userPasswordNew: [
    {
      type: 'string',
      required: true,
      message: '重复密码不能为空',
      trigger: ['blur', 'change']
    },
    { validator: compareInputs, trigger: 'blur' } // 添加自定义规则来比较两个输入框的内容]
  ],
  protocol: {
    type: 'array',
    min: 1,
    required: true,
    message: '请选阅读并同意数小宝用户协议',
    trigger: ['change']
  }
}

const formRef = ref() //表单ref
const codeRef = ref() //倒计时ref
const isGetCode = ref(false) //是否点击获取验证码
const codeTime = 59 * 1000 //重新获取验证码时长
const seconds = ref(59) //剩余时长

/**获取验证码 */
const onGetCode = async () => {
  const res = await sendSmsCodeApi(fromData.value.userPhoneNumber, 0)
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
    .then(async (_res: any) => {
      const res = await checkSmsCodeApi(fromData.value.userPhoneNumber, 0, fromData.value.phoneCode)
      if (res.success) {
        const resRegister = await registerApi(
          fromData.value.userPhoneNumber,
          fromData.value.phoneCode,
          fromData.value.userPassword
        )
        if (resRegister.success) {
          setUserIdentity(res.value)
          router.back({
            delta: 2
          })
        }
      }
    })
    .catch((_errors: any) => {
      console.log('校验失败')
    })
}

const onLogin = () => {
  router.push({
    meta: 'redirectTo',
    url: '/pages/login/login'
  })
}
</script>

<template>
  <ContentWrap>
    <Header />
    <view class="px-4 py-6 text-32rpx font-600">用户注册</view>
    <view class="px-3">
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
        <u-form-item :borderBottom="true" prop="userPassword">
          <u-input
            v-model="fromData.userPassword"
            :password="fromData.isuserPassword"
            placeholder="请输入您的新密码"
            suffixIcon="eye-off"
          >
            <template #suffix>
              <u-icon
                :name="fromData.isuserPassword ? 'eye-off' : 'eye-fill'"
                color="#999"
                size="40rpx"
                @click="fromData.isuserPassword = !fromData.isuserPassword"
              />
            </template>
          </u-input>
        </u-form-item>
        <u-form-item :borderBottom="true" prop="userPasswordNew">
          <u-input
            v-model="fromData.userPasswordNew"
            :password="fromData.isuserPasswordNew"
            placeholder="请重复您的新密码"
            suffixIcon="eye-off"
          >
            <template #suffix>
              <u-icon
                :name="fromData.isuserPasswordNew ? 'eye-off' : 'eye-fill'"
                color="#999"
                size="40rpx"
                @click="fromData.isuserPasswordNew = !fromData.isuserPasswordNew"
              />
            </template>
          </u-input>
        </u-form-item>
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
              <view class="text-24rpx">数小宝用户协议</view>
            </view>
          </u-checkbox-group>
        </u-form-item>
      </u-form>
    </view>
    <view class="px-8 mt-8">
      <u-button type="primary" shape="circle" @click="onSubmit">注册</u-button>
    </view>
    <BottomButton>
      <view class="text-24rpx text-#999999 pl-4 mb-10" @click="onLogin">
        <span>已有账号</span>
        <span class="text-#1C59E6 ml-1">去登录</span>
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
:deep(.u-checkbox) {
  margin-right: 0 !important;
}
:deep(.u-button--primary) {
  background: linear-gradient(268.32deg, #1957e6 0%, #3b73f1 100%);
  box-shadow: 0px 5px 5px rgba(25, 108, 255, 0.16);
  border: unset;
  height: 90rpx;
}
</style>
