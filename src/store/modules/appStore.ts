import { defineStore } from 'pinia'

const useAppStore = defineStore('app', {
  state: () => {
    return {
      //缓存图片
      cacheImageList: {} as any,
      //
      deviceType: '首页',
      //小程序胶囊菜单按钮的高度
      menuTop: 0 as number,
      //小程序胶囊菜单按钮的上边界坐标
      menuHeight: 0,
      //小程序胶囊宽度
      menuRightWidth: 0,
      //小程序胶囊距离右边的距离
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
      //屏幕整个高度
      screenHeight: 0,
      //底部显示的值
      bottomTabbarTitle: '首页',
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

  },
  actions: {
    //初始化app的值 //APP-PLUS  MP-WEIXIN H5
   
  }
})

export default useAppStore
