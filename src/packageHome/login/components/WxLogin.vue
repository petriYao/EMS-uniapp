<script setup lang="ts">
import { reactive } from 'vue'
import { wxLogin, wxBindAccount } from '@/api'
import { setUserIdentity } from '@/hooks/useCache'
import router from '@/router'

const props = defineProps({
  navigateBack: {
    type: Number as any,
    default: 1
  }
})

const dialogData = reactive({
  loginShow: false,
  promptContent: ''
})
//微信登录
const loginClick = async () => {
  uni.login({
    success: async (res) => {
      const loginRes = await wxLogin(res.code)
      if (loginRes && loginRes.success) {
        setUserIdentity(loginRes.value)
        if (loginRes.value.userType === 'consumer') {
          dialogData.loginShow = true
        } else {
          console.log('去首页')
          router.back({
            delta: props.navigateBack
          })
        }
        // router.back({
        //   delta: props.navigateBack
        // })
      }
    }
  })
}

//确定获取手机号
const onGetPhoneNumber = async (e: any) => {
  dialogData.loginShow = false
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    const loginRes = await wxBindAccount(e.detail.code)
    if (loginRes && loginRes.success) {
      setUserIdentity(loginRes.value)
      //去逛一逛
      router.back({
        delta: 1
      })
    } else {
      if (loginRes.code === 10050) {
        //模态框
        uni.showModal({
          title: '提示',
          content: '账号已存在，请用账号密码登录，并前往设置绑定',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              //去逛一逛
            }
          }
        })
      }
    }
  } else {
    //提示获取手机号失败
    uni.showModal({
      title: '提示',
      content: '获取手机号失败!',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
        }
      }
    })
  }
}
//取消
const cancelClick = () => {
  dialogData.loginShow = false
  //去逛一逛
  router.back()
}

defineExpose({
  loginClick
})
</script>

<template>
  <!-- 绑定手机弹窗 -->
  <u-modal
    showCancelButton
    :show="dialogData.loginShow"
    title="提示"
    content="未绑定手机号，是否绑定"
  >
    <template #confirmButton>
      <view class="flex">
        <view class="w-50%">
          <u-button
            :hairline="false"
            customStyle="background-color: #FFF;border-color: #FFF;border:0 !important;"
            @click="cancelClick"
            >取消</u-button
          >
        </view>
        <view class="w-50%">
          <u-button
            :hairline="false"
            customStyle="background-color: #FFF;border-color: #FFF;border:0 !important;color:#196cff;"
            open-type="getPhoneNumber"
            @getphonenumber="onGetPhoneNumber"
            >确定</u-button
          >
        </view>
      </view>
    </template>
  </u-modal>

  <!-- @getphonenumber="onGetPhoneNumber" -->
</template>

<style lang="less" scoped>
:deep(.u-modal__button-group--confirm-button) {
  padding: 0 !important;
}
</style>
