import { defineStore } from 'pinia'

import { getUserIdentity } from '@/hooks/useCache'
import router from '@/router'
import { getImageURL } from '@/utils'
import { getAppStatusBarHeight } from '@/interaction'

const useAppStore = defineStore('app', {
  state: () => {
    return {
      //缓存图片
      cacheImageList: {} as any,
      //小程序胶囊菜单按钮的高度
      menuTop: 0,
      //小程序胶囊菜单按钮的上边界坐标
      menuHeight: 0,
      //小程序胶囊宽度
      menuWidth: 0,
      //自定义安全高度
      menuSafeHeight: 8,
      //顶部整个的高度
      navbarHeight: 0,
      //计算刘海屏高度 rpx
      notchHeight: 0,
      //底部安全栏 rpx
      bottomHeight: 0,
      //底部整个的高度 rpx
      bottomTabbarHeight: 0,
      //rpx
      screenWidth: 0,
      //底部显示的值
      bottomTabbarTitle: '',
      //加载
      loadedList: [] as string[],
      //是否登录
      isLogin: false,
      //身份类型
      instituteType: '' as '' | 'consumer' | 'user' | 'company' | 'shop',
      //个人信息
      personal: {
        userType: '',
        title: '',
        content: '',
        avatarUrl: ''
      }
    }
  },
  getters: {
    strollAroundBG(state) {
      return state.cacheImageList['strollAroundBG'] ?? ''
    },
    myBG(state) {
      return state.cacheImageList['myBG'] ?? ''
    },
    noData(state) {
      return state.cacheImageList['noData'] ?? ''
    },
    needLogin(state) {
      return !state.instituteType || state.instituteType == 'consumer'
    },
    loginMessage(state) {
      return state.instituteType == 'consumer' ? '未绑定，是否绑定？' : '未登录，是否登录？'
    },
    personalInfo(state) {
      return {
        userType: state.personal.userType,
        title: state.personal.title,
        content: state.personal.content,
        avatarUrl:
          state.personal.avatarUrl.length > 0
            ? state.personal.avatarUrl
            : getImageURL('home', 'head')
      }
    }
  },
  actions: {
    //初始化app的值 //APP-PLUS  MP-WEIXIN H5
    initApp() {
      //小程序胶囊 条件编译
      //#ifdef MP-WEIXIN
      const menuButton = uni.getMenuButtonBoundingClientRect()
      this.menuWidth = menuButton.width
      this.menuHeight = menuButton.height
      this.menuTop = menuButton.top
      //#endif
      this.navbarHeight = this.menuHeight + this.menuTop + this.menuSafeHeight
      //获取安全区域边距信息 rpx
      const systemInfo = uni.getSystemInfoSync()
      const safeAreaInsets = systemInfo.safeAreaInsets
      this.notchHeight = safeAreaInsets?.top ?? 0
      this.bottomHeight = safeAreaInsets?.bottom ?? 0
      this.bottomTabbarHeight = this.bottomHeight + 120
      //#ifdef H5
      this.menuTop = Number(getAppStatusBarHeight())
      //#endif
      //屏幕宽度
      const getWindowInfo = uni.getWindowInfo()
      this.screenWidth = getWindowInfo.screenWidth

      //身份信息
      const userIdentity = getUserIdentity()
      //是否登录
      this.isLogin = userIdentity && userIdentity?.userId
      //身份类型
      this.instituteType = userIdentity?.instituteType ?? ''
      //个人信息
      this.setPersonalInfo(this.isLogin ? userIdentity : null)

      //底部显示的值
      this.bottomTabbarTitle = '首页'

      //是否已加载
      this.loadedList = []
    },
    //切换首页
    showHome() {
      this.bottomTabbarTitle = '首页'
    },
    //跳转到首页
    goToHome() {
      this.showHome()
      router.push({ url: '/pages/CustomTabbar', meta: 'reLaunch' })
    },
    //跳转到我的
    goToMy() {
      this.bottomTabbarTitle = '我的'
      router.push({ url: '/pages/CustomTabbar', meta: 'reLaunch' })
    },
    //加载数据
    toLoaded(name: string, f: (isLogin: boolean) => void, nf?: () => void) {
      const loaded = this.loadedList.indexOf(name) >= 0
      if (!loaded) {
        this.loadedList.push(name)
        f(this.isLogin)
      } else {
        if (nf) nf()
      }
    },
    //设置统计数据
    setHomeIndex() {
      //统计数据
    },
    //个人头像
    setPersonalInfo(value?: any) {
      if (value?.userHead) {
        this.instituteType = value.instituteType
        this.personal.userType = value.userType
        this.personal.title = value.userHead.title
        this.personal.content = value.userHead.content
        this.personal.avatarUrl = value.userHead.avatarImage?.listUrl ?? ''
      } else {
        this.personal = {
          userType: '',
          title: '',
          content: '',
          avatarUrl: ''
        }
      }
    }
  }
})

export default useAppStore
