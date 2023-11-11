// 虚拟路由表
const routerTable: RouteRecordRaw[] = [
  {
    name: 'login',
    meta: 'reLaunch',
    path: '/packag/login'
  }
]

//加载中
const routerLoad = {
  //路由跳转中
  isPushIng: false,
  //路由返回中
  isBackIng: false
}

// 基本跳转操作
const navigateTo = (options: any) => {
  switch (options?.meta) {
    case 'navigateTo':
      uni.navigateTo(options)
      break
    case 'redirectTo':
      uni.redirectTo(options)
      break
    case 'reLaunch':
      uni.reLaunch(options)
      break
    case 'switchTab':
      uni.switchTab(options)
      break
    default:
      uni.navigateTo(options)
      break
  }
}

// 路由跳转
const push = (options: RouterOptions) => {
  const urlSplit = options.url.split('?')
  const pages = getCurrentPages()
  //跳转中
  if (routerLoad.isPushIng) return
  //处理
  if (!options.meta || options.meta === 'navigateTo') {
    if (pages.length > 9) {
      //太多了就关掉之前的
      options.meta = 'redirectTo'
    } else if (pages.length > 0) {
      //上次相同界面也关掉
      if (urlSplit[0] == pages[pages.length - 1].route) {
        options.meta = 'redirectTo'
      }
    }
  }

  //准备跳转
  routerLoad.isPushIng = true
  options.complete = () => {
    routerLoad.isPushIng = false
  }
  // url ： 路由路径
  // params ： 传参一般为对象
  // 跳转方式默认为普通跳转对照上面的·RouterMode·配置
  const params = options?.params
  if (params) {
    const arr: string[] = []
    for (const key in params) {
      if (Object.hasOwnProperty.call(params, key)) {
        const element = params[key]
        const str = `${key}=${element}`
        arr.push(str)
      }
    }
    //转化参数
    if (arr.length > 0) {
      let url = options.url + '?'
      url = url + arr.join('&')
      options.url = url
    }
    navigateTo(options)
  } else {
    navigateTo(options)
  }
}

// 路由返回
const back = (options?: RouterBackOptions) => {
  // delta值为层数默认为1
  // const pages = getCurrentPages()
  //返回中
  if (routerLoad.isBackIng) return

  //准备返回
  routerLoad.isBackIng = true
  options = options ? options : { delta: 1 }
  options.complete = () => {
    routerLoad.isBackIng = false
  }
  uni.navigateBack(options)
}

// 定点路由，名称跳转
const check = (name: string, options?: RouterOptions) => {
  // name 路由昵称：对照上面的·routerTable·数组配置
  // mode 跳转方式
  routerTable.forEach((item) => {
    if (item.name === name) {
      options = { ...(options ?? {}), url: item.path }
      if (item.meta) options.meta = item.meta
      push(options)
    }
  })
}

const router = {
  // 路由跳转
  push,
  // 返回
  back,
  // 定点路由，名称跳转
  check
}

export default router
