<template>
  <view class="index-page">
    <!-- 输入框 -->
    <view style="margin-top: 20px">5. 处理后的原生输入框，主动聚焦后可阻止键盘弹出</view>
    <input class="input-native" id="fnk-input-native" placeholder="请输入内容" />
    <button size="mini" @click="focusNoKeyboards('#fnk-input-native input')"> 主动聚焦 </button>

    <view style="margin-top: 20px">6. 原生输入框，聚焦永久阻止键盘弹出</view>
    <input id="input-KKBBR" class="input-native" placeholder="请输入内容" />
    <button size="mini" @click="focusNoKeyboards('#input-KKBBR input')"> 主动聚焦 </button>

    <FocusNoKeyboard banSelector="#fnk-always input, #fnk-always-native input" ref="fnkRef" />
  </view>
</template>

<script lang="ts" setup>
import FocusNoKeyboard from '@/components/FocusNoKeyboard.vue'
import { ref } from 'vue'
const fnkRef = ref(null) as any
function focusNoKeyboards(focusSelector: string) {
  fnkRef.value.focus(focusSelector)
}
</script>

<style>
.index-page {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  font-size: 12px;
}

.input-native {
  border: 1px solid #ccc;
  height: 35px;
  border-radius: 4px;
  padding: 0 10px;
  box-sizing: border-box;
  font-size: 12px;
}
</style>
