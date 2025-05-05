// import { useAppStore } from '@/store'
// 定义请求地址
const BASE_URL = 'http://localhost/' //澳马正式环境
// const BASE_URL = 'http://125z0344r3.oicp.vip/' //澳马正式环境
// const BASE_URL = 'http://172.16.50.156/' //澳马正式环境
// 封装请求方法
const request = (obj: any) => {
  // const appStore = useAppStore()

  obj.url = obj.url || '' // 请求路径
  obj.method = obj.method || 'GET' //请求方式
  obj.data = obj.data || {} //请求携带的数据
  obj.header = obj.header || 'application/json' //请求头信息 content-type
  obj.loading = obj.loading === false ? false : true //是否显示请求加载中
  obj.requestTime = obj.requestTime || 5 //多久时间内完成网络请求，则不显示提示框

  let loadingStatus = true
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + obj.url,
      method: obj.method,
      data: obj.data,
      withCredentials: true,
      header: {
        'Content-Type': obj.header
      },
      success: (res: any) => {
        resolve(res)

        // console.log('requsetRes',res)
        // console.log('obj.data',obj.data)
        if (
          res.statusCode == 404 ||
          res?.data?.[0]?.[0]?.Result?.ResponseStatus?.ErrorCode == 500
        ) {
          //返回登录
          // uni.showToast({
          //   title: '登录信息超时，请重新登录',
          //   icon: 'none'
          // })
          // uni.reLaunch({
          //   url: '/pages/login/login'
          // })
        } else {
          // resolve(res)
        }
      },
      fail: (err) => {
        console.log('错误2', err)
        if (
          obj.url !==
          '/K3Cloud/Kingdee.BOS.ServiceFacade.ServicesStub.Account.AccountService.GetDataCenterList.common.kdsvc'
        ) {
          uni.showModal({
            title: '提示',
            content: '网络异常',
            success: function (res) {
              if (res.confirm) {
                reject(err)
                uni.hideLoading()
              } else if (res.cancel) {
                reject(err)
                uni.hideLoading()
              }
            }
          })
        } else {
          resolve('' as any)
        }
      },
      complete: () => {
        if (loadingStatus && obj.loading) {
        }
        loadingStatus = false
      }
    })
  })
}
export default request
