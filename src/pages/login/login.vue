<script setup lang="ts">
import BottomButton from '@/components/BottomButton/index.vue'
import LoginPhone from '@/components/LoginMethod/LoginPhone.vue'
import { getImageURL, getSvgURL } from '@/utils'
import { ref } from 'vue'

const isPhone = ref(false)
const protocol = ref(false)
const onLoginMethod = () => {
  isPhone.value = !isPhone.value
}
</script>

<template>
  <ContentWrap>
    <Header :placeholder="false" />
    <img class="bg-img" :src="getImageURL('home', 'login-bg')" mode="heightFix" />
    <view class="position-relative z-1 mt-250rpx">
      <view class="pb-60rpx flex justify-center items-center flex-col">
        <view> <u-icon :name="getSvgURL('login', 'login-logo')" size="70" /></view>
        <view class="mt-40rpx text-42rpx font-600">您好，欢迎登录数小宝</view>
      </view>
      <view class="bg-#fff">
        <view class="phone" v-show="!isPhone">
          <LoginPhone />
        </view>
        <view class="wxchat" v-show="isPhone">
          <view class="px-80rpx mt-80rpx flex-column">
            <u-button type="primary" shape="circle">微信登录</u-button>

            <view class="mt-50rpx">
              <u-checkbox-group v-model="protocol" shape="square" size="36rpx">
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
            </view>
          </view>
        </view>

        <view class="w-100vw h-20vw" />
      </view>
    </view>
    <BottomButton>
      <view class="px-70rpx flex-column">
        <view class="w-82vw">
          <u-divider text="其他登录方式" />
        </view>
        <view class="flex-center">
          <u-icon
            :name="getSvgURL('login', 'login-WeChat')"
            size="80rpx"
            v-if="!isPhone"
            @click="onLoginMethod()"
          />
          <u-icon
            :name="getSvgURL('login', 'login-phone')"
            size="80rpx"
            v-if="isPhone"
            @click="onLoginMethod()"
          />
        </view>
      </view>
    </BottomButton>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.bg-img {
  position: absolute;
  height: 100vh;
}
:deep(.u-status-bar) {
  background-color: unset !important;
}
:deep(.u-navbar__content) {
  background-color: unset !important;
}
.phone {
  :deep(.u-form-item__body) {
    padding: 10rpx 0 !important;
  }
  :deep(.u-form-item__body__right__message) {
    margin-left: 20rpx !important;
  }
  :deep(.u-input__content__field-wrapper__field) {
    font-size: 30rpx !important;
  }
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
