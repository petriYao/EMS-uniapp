<script setup lang="ts">
import { getImageURL, getSvgURL } from '@/utils'
import router from '@/router'
// import { onShow } from '@dcloudio/uni-app'
import { clearUserIdentity, getUserIdentity } from '@/hooks/useCache'
import { onBeforeMount, ref } from 'vue'
import { logoutApi } from '@/api'
import { reactive } from 'vue'
import { UserIdentityType } from '@/types/userModel'

const userInfo = ref<UserIdentityType | null>()
const dialog = reactive({
  show: false,
  title: '提示',
  content: '是否确认退出'
})

const uToastRef = ref()

const cellLisr = [
  {
    icon: 'my-info',
    title: '个人资料'
  },
  {
    icon: 'my-address',
    title: '我的地址'
  },
  {
    icon: 'my-about',
    title: '关于数小宝',
    value: '2023111401'
  },
  {
    icon: 'my-contact',
    title: '联系我们'
  }
]

/**跳转登录界面 */
const onLogin = () => {
  //H5的时候跳转
  // #ifdef H5
  router.push({
    url: '/pages/login/login'
  })
  // #endif
  //微信的时候跳转
  // #ifdef MP
  router.push({
    url: `/pages/login/login?isPhone=true`
  })
  // #endif
}

/**退出 */
const onExit = () => {
  dialog.show = true
}

/**弹框确认 */
const onConfirm = async () => {
  await logoutApi()
  clearUserIdentity()
  userInfo.value = null
  dialog.show = false
}

const onSetting = (title: string) => {
  if (!userInfo.value) {
    uToastRef.value.show({
      type: 'default',
      title: '默认主题',
      message: '请先登录账号'
    })
    return
  }
  if (title === '个人资料') {
    router.push({
      url: '/pages/personalData/index'
    })
  }
}

onBeforeMount(async () => {
  userInfo.value = await getUserIdentity()
})
</script>

<template>
  <ContentWrap>
    <view class="">
      <viev
        class="flex w-100vw h-500rpx position-absolute z-0"
        style="background: linear-gradient(135.93deg, #def6f9 0%, #e1e8f9 100%)"
      />
      <view class="position-relative z-1">
        <view class="pt-55px flex-rows pl-40rpx" @click="userInfo ? '' : onLogin()">
          <view class="mr-20rpx">
            <u-avatar
              :src="userInfo?.userInfo?.avatarImage?.listUrl ?? getImageURL('home', 'my-avatar')"
              size="100rpx"
            />
          </view>
          <view class="h-100rpx flex flex-col justify-around" v-if="userInfo">
            <view class="text-30rpx font-600"> {{ userInfo.userInfo.userNickname }} </view>
            <view class="text-22rpx"> {{ userInfo.userInfo.userPhoneNumber }} </view>
          </view>
          <view class="h-100rpx flex flex-col justify-around" v-else>
            <view class="text-30rpx font-600"> 未登录/请登录 </view>
          </view>
        </view>
        <view class="flex-rows justify-around py-60rpx">
          <view class="flex-column text-#333333">
            <view class="text-36rpx font-600 mb-10rpx">10</view>
            <view class="text-26rpx">我的订单</view>
          </view>
          <view class="flex-column text-#333333">
            <view class="text-36rpx font-600 mb-10rpx">5</view>
            <view class="text-26rpx">会员权益</view>
          </view>
          <view class="flex-column text-#333333">
            <view class="text-36rpx font-600 mb-10rpx">5996</view>
            <view class="text-26rpx">积分兑换</view>
          </view>
        </view>
      </view>
    </view>

    <view class="bg-[#F6F7FB] p-30rpx box position-relative z-1">
      <view class="table bg-#FFF py-10rpx rounded-20rpx">
        <view
          v-for="(item, index) in cellLisr"
          :key="index"
          class="table-item flex-rows justify-between p-40rpx"
          @click="onSetting(item.title)"
        >
          <view class="flex-rows">
            <view class="mr-20rpx mt-5rpx"
              ><u-icon :name="getSvgURL('my', item.icon)" size="26"
            /></view>
            <view class="text-32rpx">{{ item.title }}</view>
          </view>
          <view><u-icon name="arrow-right" size="18" /></view>
        </view>
      </view>
    </view>

    <view v-if="userInfo" class="aa px-60rpx mt-30rpx">
      <view @click="onExit" class="bg-#dfe8f7 text-#1c59e6 h-90rpx flex-center rounded-999">
        退出
      </view>
    </view>

    <u-modal
      :show="dialog.show"
      :title="dialog.title"
      showCancelButton
      :content="dialog.content"
      @confirm="onConfirm"
      @cancel="dialog.show = false"
    >
      <view class="flex-center">
        <view>{{ dialog.content }}</view>
      </view>
    </u-modal>

    <u-toast ref="uToastRef" />
  </ContentWrap>
</template>

<style lang="scss" scoped>
.box {
  border-radius: 30rpx 30rpx 0 0;
}
.table-item {
  position: relative;
  &:not(:last-child):after {
    /* 绝对定位到父元素低端，可以通过left/right的值控制边框长度或者定义width:100%;*/
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    /* 初始化边框 */
    content: '';
    box-sizing: border-box;
    height: 1px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    /* 以上代码，实现了一个边框为1px的元素，下面实现0.5px边框*/
    transform: scaleY(0.5); // 元素Y方向缩小为原来的0.5
    transform-origin: 0 0; // CSS属性让你更改一个元素变形的原点
  }
}
:deep(.u-button) {
  // background: #dfe8f7;
  color: #1c59e6;
  border: unset;
  height: 90rpx;
}

:deep(.uni-button:after) {
  border: unset !important;
}
</style>
