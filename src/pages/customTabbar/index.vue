<script setup lang="ts">
import { useAppStore } from '@/store'
import { getSvgURL } from '@/utils'

import Home from './src/Home.vue'
import Serve from './src/Serve.vue'
import Qrcode from './src/Qrcode.vue'
import Welfare from './src/Welfare.vue'
import My from './src/My.vue'

const appStore = useAppStore()
// 底部导航栏
const tabBar = [
  {
    title: '首页',
    to: {
      name: 'Home'
    },
    icon: 'home-tab-home',
    onicon: 'home-tab-home-on',
    size: '26'
  },
  {
    title: '服务',
    to: {
      name: 'Serve'
    },
    icon: 'home-tab-serve',
    onicon: 'home-tab-serve-on',
    size: '26'
  },
  {
    title: '一码通',
    to: {
      name: 'Qrcode'
    },
    icon: 'home-tab-QRcode',
    onicon: 'home-tab-QRcode',
    size: '60'
  },
  {
    title: '福利',
    to: {
      name: 'Welfare'
    },
    icon: 'home-tab-welfare',
    onicon: 'home-tab-welfare-on',
    size: '26'
  },
  {
    title: '我的',
    to: {
      name: 'My'
    },
    icon: 'home-tab-mine',
    onicon: 'home-tab-mine-on',
    size: '26'
  }
]

// 底部导航栏切换
const onChange = (title: string) => {
  appStore.bottomTabbarTitle = title
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 0
  })
}

//是否显示
const isShow = (title: string) => {
  return appStore.bottomTabbarTitle === title
}
</script>

<template>
  <ContentWrap>
    <view v-show="isShow('首页')">
      <Home />
    </view>
    <view v-show="isShow('服务')">
      <Serve />
    </view>
    <view v-if="isShow('一码通')">
      <Qrcode />
    </view>
    <view v-if="isShow('福利')">
      <Welfare />
    </view>
    <view v-if="isShow('我的')">
      <My />
    </view>

    <!-- 底部导航栏 -->
    <view class="tabbar">
      <view class="tabbar__content tabbar--fixed">
        <view class="tabbar__content__item-wrapper">
          <view
            class="tabbar-item"
            v-for="(item, index) in tabBar"
            :key="index"
            :class="item.title === '一码通' ? 'qr' : ''"
            @click="onChange(item.title)"
          >
            <view class="tabbar-item__icon">
              <u-icon
                :name="getSvgURL('home', isShow(item.title) ? item.icon : item.onicon)"
                :size="item.size"
              />
            </view>
            <view
              class="tabbar-item__text"
              :style="isShow(item.title) ? 'color:#03030D;' : 'color:#999999;'"
            >
              {{ item.title }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="w-100vw h-180rpx" />
  </ContentWrap>
</template>

<style lang="scss" scoped>
.tabbar {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  .tabbar__content {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    padding-top: 8rpx;
    box-shadow: 2px -1px 5px rgba(0, 0, 0, 0.1);
    padding-bottom: 30rpx;
    .tabbar__content__item-wrapper {
      height: 50px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      .tabbar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        width: 100%;
        height: 100%;
        .tabbar-item__icon {
          display: flex;
          flex-direction: row;
          position: relative;
          width: 150rpx;
          justify-content: center;
        }
        .tabbar-item__text {
          margin-top: 2px;
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }
  .tabbar--fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
}
.qr {
  position: relative;
  top: -34rpx;
}

:deep(.notice-qr) {
  .u-icon__icon {
    color: #196cff !important;
  }
}

:deep(.u-search__content) {
  border: 0 !important;
}
</style>
