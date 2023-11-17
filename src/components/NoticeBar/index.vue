<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  /**是否采用衔接滑动，即播放到末尾后重新回到开头 */
  circular: {
    type: Boolean,
    default: true
  },
  /**滑动方向是否为纵向 */
  vertical: {
    type: Boolean,
    default: true
  },
  /**是否自动切换 */
  autoplay: {
    type: Boolean,
    default: true
  },
  /**自动切换时间间隔 */
  interval: {
    type: Number,
    default: 3000
  },
  /**滑动动画时长 */
  duration: {
    type: Number,
    default: 500
  }
})

const noticeList = ref([
  { cName: '福建省福州市金玉满堂有限公司', content: '金女士，生日快乐1' },
  { cName: '福建省福州市金玉满堂有限公司', content: '金女士，生日快乐2' },
  { cName: '福建省福州市金玉满堂有限公司', content: '金女士，生日快乐3' },
  { cName: '福建省福州市金玉满堂有限公司', content: '金女士，生日快乐4' },
  { cName: '福建省福州市金玉满堂有限公司', content: '金女士，生日快乐5' }
])
</script>
<template>
  <view>
    <!-- 通告栏 -->
    <view class="noticeBar">
      <view class="flex-center mx-20rpx">
        <u-icon name="volume-fill" color="var(--UI-BLUE)" size="16" />
      </view>

      <swiper
        class="list"
        :circular="props.circular"
        :vertical="props.vertical"
        :autoplay="props.autoplay"
        :interval="props.interval"
        :duration="props.duration"
      >
        <swiper-item v-for="(item, index) in noticeList" :key="index">
          <view class="text_ellipsis">
            {{ item.cName }}
            <span class="highlight">{{ `<${item.content}>` }}</span>
          </view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// 公告栏样式
.noticeBar {
  height: 60rpx;
  line-height: 60rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
  display: flex;
  .list {
    width: 100%;
    height: 100%;
    .highlight {
      color: #196cff;
      margin-left: 20rpx;
    }
  }
}
</style>
