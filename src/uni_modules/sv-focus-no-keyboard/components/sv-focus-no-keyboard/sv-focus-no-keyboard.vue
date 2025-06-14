<template>
  <text
    :ban="banSelector"
    :change:ban="focusNoKeyboard.watchBan"
    :focus="focusSelector"
    :change:focus="focusNoKeyboard.watchFocus"
  ></text>
</template>

<script>
export default {
  props: {
    // 禁止软键盘弹出的输入框选择器
    banSelector: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      focusSelector: ''
    }
  },
  methods: {
    focus(selector) {
      this.focusSelector = selector
    },
    resetFocus() {
      this.focusSelector = ''
    }
  }
}
</script>

<script module="focusNoKeyboard" lang="renderjs">
export default {
  data() {
    return { }
  },
  methods: {
    watchFocus(newValue, oldValue, ownerInstance, instance) {
      if (newValue) {
        this.changeFocus(newValue)
      }
    },
    watchBan(newValue, oldValue, ownerInstance, instance) {
      if (newValue) {
        this.changeBan(newValue)
      }
    },
    changeFocus(fSelector) {
      if (!fSelector) return
      const el = document.querySelector(fSelector);
      if (!el) return console.warn(`===== input 未渲染完成，请检查 ${fSelector} 是否有误 =====`)

      this.changeInputMode(el, 'noKeyboard')
      el.focus()
      setTimeout(() => {
        this.changeInputMode(el, 'hasKeyboard')
      })
      this.$ownerInstance.callMethod('resetFocus');
    },
    changeBan(bSelector) {
      if (!bSelector) return
      const elemens = document.querySelectorAll(bSelector);
      if(elemens.length > 0) {
        elemens.forEach(el => {
          this.changeInputMode(el, 'noKeyboard')
        })
      }
    },
    /**
     * 通过增加或移出inputmode属性来控制是否允许键盘弹出
     * @param {String} type hasKeyboard | noKeyboard
     * @description 要关闭软键盘的话，需要给 inputmode 属性设置 none；如果要打开软键盘的话，需要移除 inputmode 属性
     * @tutorial https://ask.dcloud.net.cn/article/39915
     */
    changeInputMode(el, type) {
      if (!el) return
      // 判断是否是苹果
      const isAppleDev = () => {
        // 正则匹配时忽略大小写
        const appleUA = /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)
        const applePlatform = /(iPhone|iPad|iPod|iOS|Mac)/i.test(navigator.platform)
        return appleUA && applePlatform
      }
      if (type == 'noKeyboard') {
        el.setAttribute('inputmode', 'none')
        if (isAppleDev()) el.setAttribute('readonly', 'readonly')
      }
      if (type == 'hasKeyboard') {
        el.removeAttribute('inputmode')
        if (isAppleDev()) el.removeAttribute('readonly')
      }
    },
  }
}
</script>
