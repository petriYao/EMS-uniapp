import http from '@/utils/requset'
const SessionId = uni.getStorageSync('SessionId')
const KDSVCSessionId = uni.getStorageSync('KDSVCSessionId')
///加载工单列表
export function loadList(data) {
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//单据类型
export function DocumentType(data) {
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.QueryBusinessInfo.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//查询单据对应的部门
export function QueryAssociation(data) {
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.View.common.kdsvc',
    method: 'POST',
    // header: {
    // 	"Set-Cookie": "ASP.NET_SessionId=" + SessionId,
    // 	"Set-Cookie": "kdservice-sessionid=" + KDSVCSessionId
    // },
    requestTime: 5000, //等待5秒
    data: data
  })
}
//数据状态颜色返回
export function FDocumentStatusColor(state) {
  let colorstr = ''
  switch (state) {
    case '暂存':
      colorstr = '#808080'
      break
    case '创建':
      colorstr = '#55aaff'
      break
    case '审核中':
      colorstr = '#FFA500'
      break
    case '已审核':
      colorstr = '#00aa00'
      break
    default:
      colorstr = '#FF0000'
      break
  }
  return colorstr
}
