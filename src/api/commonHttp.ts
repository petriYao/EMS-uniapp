import http from '@/utils/requset'

//登录接口
export function login(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.AuthService.ValidateUser.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//保存接口
export function saveApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Save.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//提交接口
export function subitApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Submit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//审核接口
export function auditApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Audit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//反审核接口
export function unAuditApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.UnAudit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//下推接口
export function pushApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Push.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//查看接口
export function viewApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.View.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//表单数据查询接口
export function executeBillQueryApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//删除接口
export function deleteApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Delete.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//上传接口
export function attachmentUpLoadApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.AttachmentUpLoad.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//删除附件
export function attachmentDeleteApi(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.DeleteFilesWebApiService.DeleteFiles,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//下载接口
export function attachmentDownLoadApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.AttachmentDownLoad.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//查询报表
export function GetSysReportData(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.GetSysReportData.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//查询套打列表
export function GetPrintModel(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.PrintModelWebApiService.PrintModel,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//套打导出pdf
export function GetPrintPDF(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.PrintExportWebApiService.DownloadPrintExportPDF,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//发送邮件
export function GetEmail(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.SendAnEmailWebApiService.SendAnEmail,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
