# sv-focus-no-keyboard

### 兼容性

✅已兼容，❌未兼容 

| VUE2	|VUE3	| Android(APP/H5)	| iOS(APP/H5)	| 小程序	|
|:---:	|:---:| :---:						| :---:				| :---:	|
| ✅ ️	| ✅️	| ✅								| ❌						| ❌			|

- 本插件使用 [renderjs](https://uniapp.dcloud.net.cn/tutorial/renderjs.html#renderjs)
- nvue，小程序，无法使用 renderjs
- ios 由于固件限制聚焦必弹出键盘，本插件虽然能用，但本质上是通过设置输入框的 readonly 属性进行控制，会导致光标丢失，并非能像安卓那样完美兼容

### props

| 属性名			| 类型			| 默认值	| 说明																|
| :---				| :---		| :---	| :---															|
|	banSelector	|	 String	|				|	禁止软键盘弹出的输入框 选择器，可见示例	|

`被 banSelector 禁止的输入框，将永久不再弹出软键盘，除非通过下列 focus 方法重新主动聚焦`

### event

|  事件名	|  参数						|  说明																						|
|  :---		| :---						| :---																						|
|	focus		|	selector: String|	指定 选择器 的输入框聚焦，且禁止软键盘弹出，可见示例	|

`focus 不影响用户手动点击输入框的聚焦行为，即用户仍可手动点击输入框进行聚焦并弹出软键盘`

### 使用示例

```
<template>
  <view class="index-page">
    <!-- 输入框 -->
    <view>1. 普通组件输入框，聚焦伴随键盘弹出</view>
    <uni-easyinput placeholder="请输入内容"></uni-easyinput>

    <view style="margin-top: 20px">2. 处理后的组件输入框，主动聚焦后可阻止键盘弹出</view>
    <uni-easyinput id="fnk-input" placeholder="请输入内容"></uni-easyinput>
    <button size="mini" @click="focusNoKeyboard('#fnk-input input')">主动聚焦</button>

    <view style="margin-top: 20px">3. 组件输入框，聚焦永久阻止键盘弹出</view>
    <uni-easyinput id="fnk-always" placeholder="请输入内容"></uni-easyinput>

    <hr style="margin-top: 20px" />

    <view style="margin-top: 20px">4. 普通原生输入框，聚焦伴随键盘弹出</view>
    <input class="input-native" placeholder="请输入内容" />

    <view style="margin-top: 20px">5. 处理后的原生输入框，主动聚焦后可阻止键盘弹出</view>
    <input class="input-native" id="fnk-input-native" placeholder="请输入内容" />
    <button size="mini" @click="focusNoKeyboard('#fnk-input-native input')">
      主动聚焦
    </button>

    <view style="margin-top: 20px">6. 原生输入框，聚焦永久阻止键盘弹出</view>
    <input id="fnk-always-native" class="input-native" placeholder="请输入内容" />

    <!-- 使用 uni_modules 插件 -->
    <sv-focus-no-keyboard
      banSelector="#fnk-always input, #fnk-always-native input"
      ref="fnkRef"
    ></sv-focus-no-keyboard>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    focusNoKeyboard(focusSelector) {
      this.$refs.fnkRef.focus(focusSelector)
    }
  }
}
</script>
```

### 结语

本插件免费开源，如若借鉴源码还请注明出处，未经授权禁止转载售卖等侵犯版权行为，谢谢！

感谢您使用本插件，如果在使用过程中遇到任何问题，欢迎在评论区留言或加群讨论，制作不易，还望五星好评 🌟🌟🌟🌟🌟

欢迎进群🍌交流，🐧Q群：
- ①群：852637893
- ②群：816646292
- ③群：704990626

💬WX群可通过🐧Q群进入