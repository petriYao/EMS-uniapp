import FromData from '@/common/FromIDs.json'
//import { AttachmentUpLoadType } from '@/types/commonModel'
import {
  executeBillQueryApi,
  saveApi,
  subitApi,
  auditApi,
  unAuditApi,
  attachmentDownLoadApi,
  attachmentUpLoadApi,
  viewApi,
  attachmentDeleteApi
} from '@/api/commonHttp'

//获取FId
export function getAuxiliary(fidValue: string, FParentId?: string) {
  const Filter = FParentId
    ? `FParentId = '${FParentId}' AND FId = '${fidValue}'`
    : `FId = '${fidValue}'`
  const data = {
    parameters: [
      {
        FormId: `${FromData.Auxiliary}`,
        FieldKeys: 'FNumber,FDataValue,FMASTERID',
        FilterString: Filter + ` AND FDocumentStatus = 'C' AND FForbidStatus = 'A'`,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}

//通用保存
export function SaveClient(formid: string, Model: any) {
  const data = {
    formid: formid,
    data: {
      NeedUpDateFields: [],
      NeedReturnFields: [],
      IsDeleteEntry: 'false',
      Model: Model
    }
  }
  return saveApi(data)
}

//通用提交
export function SubmitClient(formid: string, Numbers: any) {
  const data = {
    formid: formid,
    data: {
      CreateOrgId: 0,
      Numbers: Numbers,
      Ids: '',
      SelectedPostId: 0,
      NetworkCtrl: '',
      IgnoreInterationFlag: ''
    }
  }

  return subitApi(data)
}
//通用审核
export function AuditApiClient(formid: string, Numbers: any) {
  const data = {
    FormId: formid,
    data: {
      CreateOrgId: 0,
      Numbers: Numbers,
      InterationFlags: '',
      NetworkCtrl: '',
      IsVerifyProcInst: '',
      IgnoreInterationFlag: '',
      UseBatControlTimes: 'false'
    }
  }

  return auditApi(data)
}

//反审核unAuditApi
export function UnAuditApiClient(formid: string, Numbers: any) {
  const data = {
    FormId: formid,
    data: {
      CreateOrgId: 0,
      Numbers: Numbers,
      InterationFlags: '',
      NetworkCtrl: '',
      IsVerifyProcInst: '',
      IgnoreInterationFlag: '',
      UseBatControlTimes: 'false'
    }
  }

  return unAuditApi(data)
}

//用户列表
export function getUserList(FieldKeys: string, FilterString: any) {
  const data = {
    parameters: [
      {
        FormId: `${FromData.User}`,
        FieldKeys,
        FilterString,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}

//员工列表
export function getStaffList(FieldKeys: string, FilterString: any) {
  const data = {
    parameters: [
      {
        FormId: `${FromData.Empinfo}`,
        FieldKeys,
        FilterString,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}

//查看部门
export function lookDepartment(Id: string) {
  const data = {
    FormId: `${FromData.Department}`,
    data: {
      CreateOrgId: 0,
      Number: '',
      Id,
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data)
}

//上传附件
export function setFileList(filedata: any) {
  const data = {
    data: filedata
  }
  return attachmentUpLoadApi(data)
}

//删除附件
export function deleteFileList(FileId: string) {
  const data = {
    parameters: [FileId]
  }
  return attachmentDeleteApi(data)
}

//汇率
export function getexchange(filterstring = 'FCyForID = 7 AND FCyToID = 1') {
  const data = {
    parameters: [
      {
        FormId: `${FromData.ExchangeRate}`,
        FieldKeys: 'FExchangeRate,FReverseExRate',
        FilterString: filterstring,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}

//产品等级
export function getProductGrade(FilterString: any) {
  const data = {
    parameters: [
      {
        FormId: `${FromData.NXJGCLB}`,
        FieldKeys: 'F_QADV_CPDJ,F_QADV_JJBX',
        FilterString: FilterString,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}

//下载附件
export function getFileList(FileId: string) {
  const data = {
    data: {
      FileId,
      StartIndex: 0
    }
  }
  return attachmentDownLoadApi(data)
}

//查看附件管理
export function getAttachmentList(FieldKeys: string, FilterString: any) {
  const data = {
    parameters: [
      {
        FormId: `${FromData.Attachment}`,
        FieldKeys,
        FilterString,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}

//辅助资料 `FID in (${Filter})` 'FNumber,FDataValue,FMASTERID'
export function getAuxiliaryMaterials(FieldKeys: string, Filter?: string) {
  const data = {
    parameters: [
      {
        FormId: `BOS_ASSISTANTDATA_DETAIL`,
        FieldKeys: FieldKeys,
        FilterString: Filter,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}
