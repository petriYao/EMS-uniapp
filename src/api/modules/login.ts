import http from '@/utils/requset'
import FromData from '@/common/FromIDs.json'
export function login(data: any) {
  return http({
    url: 'K3Cloud/Kingdee.BOS.WebApi.ServicesStub.AuthService.ValidateUser.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
export function PDAAppupdate() {
  const data = {
    data: {
      FormId: `${FromData.PDAVERSION}`,
      FieldKeys: 'F_QADV__VERSION,F_QADV__ADDRESS',
      FilterString: [
        {
          Left: '(',
          FieldName: 'F_QADV__NAME',
          Compare: '=',
          Value: 'PDAUpdate',
          Right: ')',
          Logic: ''
        }
      ],
      OrderString: '',
      TopRowCount: 0,
      StartRow: 0,
      Limit: 2000,
      SubSystemId: ''
    }
  }
  return http({
    url: 'K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
export function loginPDAUser(username: string) {
  //0 FDocumentStatus 数据状态
  //1 FForbidStatus 禁用状态
  //2 FName 用户名
  //3 F_QADV_PWD  密码
  //5 FNumber 用户编码。关联云星空用户id
  const data = {
    data: {
      FormId: `${FromData.PDAUser}`,
      FieldKeys: 'FDocumentStatus,FForbidStatus,FName,F_QADV_PWD,FID,F_QADV_Base',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FDocumentStatus',
          Compare: '=',
          Value: 'C',
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'FForbidStatus',
          Compare: '=',
          Value: 'A',
          Right: ')',
          Logic: ''
        },
        {
          Left: '(',
          FieldName: 'FName',
          Compare: '=',
          Value: `${username}`,
          Right: ')',
          Logic: ''
        }
      ],
      OrderString: '',
      TopRowCount: 0,
      StartRow: 0,
      Limit: 2000,
      SubSystemId: ''
    }
  }
  return http({
    url: 'K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//通过userfid 查询角色以及权限
export function loginPDAUserRole(userfid: any) {
  // 0 FName
  // 1 FNumber
  // 2 F_QADV_Combo
  // 3 F_QADV_Base
  const data = {
    data: {
      FormId: `${FromData.PDARole}`,
      FieldKeys: 'FName,FNumber,F_QADV_JSGN,F_QADV_Base',
      FilterString: [
        {
          Left: '(',
          FieldName: 'F_QADV_Base',
          Compare: '=',
          Value: `${userfid}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'FDocumentStatus',
          Compare: '=',
          Value: 'C',
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'FForbidStatus',
          Compare: '=',
          Value: 'A',
          Right: ')',
          Logic: ''
        }
      ],
      OrderString: '',
      TopRowCount: 0,
      StartRow: 0,
      Limit: 2000,
      SubSystemId: ''
    }
  }
  return http({
    url: 'K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
