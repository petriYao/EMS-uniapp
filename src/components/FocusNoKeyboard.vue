<template>
  <text
    :ban="banSelector"
    :change:ban="focusNoKeyboard.watchBan"
    :focus="focusSelector"
    :change:focus="focusNoKeyboard.watchFocus"
  />
</template>

<script>
export default {
  props: {
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
    watchFocus(newValue) {
      if (newValue) {
        this.safeChangeFocus(newValue)
      }
    },
    watchBan(newValue) {
      if (newValue) {
        this.safeChangeBan(newValue)
      }
    },

    // 新增安全封装函数
    safeChangeFocus(fSelector) {
      // 安全获取文档对象
      const getDocument = () => {
        try {
          return typeof document !== 'undefined' ? document :
                 this.$ownerInstance.$el.ownerDocument;
        } catch (e) {
          console.warn("无法获取文档对象")
          return null
        }
      }

      const doc = getDocument()
      if (!doc) {
        console.warn("文档对象未定义，延迟重试...")
        // 延迟重试机制
        setTimeout(() => this.safeChangeFocus(fSelector), 200)
        return
      }

      this.changeFocus(fSelector, doc)
    },

    safeChangeBan(bSelector) {
      const doc = this.getDocument()
      if (!doc) {
        console.warn("文档对象未定义，延迟重试...")
        setTimeout(() => this.safeChangeBan(bSelector), 200)
        return
      }

      this.changeBan(bSelector, doc)
    },

    // 修改原有方法增加doc参数
    changeFocus(fSelector, doc = document) {
      if (!fSelector || !doc) return

      const el = doc.querySelector(fSelector)
      if (!el) {
        console.warn(`===== input 未渲染完成，请检查 ${fSelector} 是否有误 =====`)
        // 延迟重试
        setTimeout(() => this.changeFocus(fSelector, doc), 200)
        return
      }

      this.changeInputMode(el, 'noKeyboard')
      el.focus()

      // 设置适当的延迟确保手机兼容性
      setTimeout(() => {
        this.changeInputMode(el, 'hasKeyboard')

        // iOS需要额外处理
        if (this.isIOS()) {
          setTimeout(() => {
            el.removeAttribute('readonly')
            el.focus()
          }, 100)
        }
      }, 300)

      this.$ownerInstance.callMethod('resetFocus');
    },

    changeBan(bSelector, doc = document) {
      if (!bSelector || !doc) return

      const elements = doc.querySelectorAll(bSelector)
      if(elements.length > 0) {
        elements.forEach(el => {
          this.changeInputMode(el, 'noKeyboard')
        })
      }
    },

    // 安全获取文档对象
    getDocument() {
      try {
        // 尝试多种方式获取文档对象
        return typeof document !== 'undefined' ? document :
               this.$ownerInstance?.$el?.ownerDocument ||
               window?.document;
      } catch (e) {
        return null
      }
    },

    // 优化苹果设备检测
    isIOS() {
      try {
        const userAgent = navigator.userAgent || '';
        const platform = navigator.platform || '';
        return (
          /(iPhone|iPad|iPod|iOS)/i.test(userAgent) ||
          /(iPhone|iPad|iPod|iOS|Mac)/i.test(platform)
        )
      } catch (e) {
        return false;
      }
    },

    // 保留原有逻辑
    changeInputMode(el, type) {
      if (!el) return
      const isAppleDev = this.isIOS()

      if (type == 'noKeyboard') {
        el.setAttribute('inputmode', 'none')
        if (isAppleDev) el.setAttribute('readonly', 'readonly')
      }
      if (type == 'hasKeyboard') {
        el.removeAttribute('inputmode')
        if (isAppleDev) el.removeAttribute('readonly')
      }
    }
  }
}
</script>
