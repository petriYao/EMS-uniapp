import http from '@/utils/requset'
import { dateTimeStr } from '@/common/getdateTime'
import FromData from '@/common/FromIDs.json'
const SessionId = uni.getStorageSync('SessionId')
const KDSVCSessionId = uni.getStorageSync('KDSVCSessionId')

//查询
export function GetProcessList(data) {
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    // header: {
    // 	"Set-Cookie": "ASP.NET_SessionId=" + SessionId,
    // 	"Set-Cookie": "kdservice-sessionid=" + KDSVCSessionId
    // },
    requestTime: 5000, //等待5秒
    data: data
  })
}

//行开工
export function PostExecuteOperation(data) {
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteOperation.common.kdsvc',
    method: 'POST',
    // header: {
    // 	"Set-Cookie": "ASP.NET_SessionId=" + SessionId,
    // 	"Set-Cookie": "kdservice-sessionid=" + KDSVCSessionId
    // },
    requestTime: 5000, //等待5秒
    data: data
  })
}
//工序交接单下推
export function PostPush(EntryIds) {
  const data = {
    formid: `${FromData.SCGDFromID}`,
    data: {
      Ids: '',
      Numbers: [],
      EntryIds: `${EntryIds}`,
      RuleId: `${FromData.XT_GXJJDFromID}`, //下推 工序交接单
      TargetBillTypeId: '',
      TargetOrgId: 0,
      TargetFormId: '',
      IsEnableDefaultRule: 'false',
      IsDraftWhenSaveFail: 'true', // 保存失败，启用暂存
      CustomParams: {}
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Push.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//转移下推后查询行号信息
export function PushGetProject(EntryIds) {
  const data = {
    formid: `${FromData.GXJJDFromID}`,
    data: {
      CreateOrgId: 0,
      Number: '',
      Id: `${EntryIds}`,
      IsSortBySeq: 'false'
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.View.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//行关闭
export function PostRowClose(type, Fid, EntryIds) {
  const data = {
    formid: `${FromData.SCGDFromID}`,
    opNumber: `${type}`,
    data: {
      CreateOrgId: 0,
      Numbers: [],
      Ids: '',
      PkEntryIds: [
        {
          Id: `${Fid}`,
          EntryIds: `${EntryIds}`
        }
      ],
      NetworkCtrl: '',
      IgnoreInterationFlag: ''
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteOperation.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//数据状态颜色返回
export function FBillStatusStatusColor(state) {
  let colorstr = ''
  switch (state) {
    case '已关闭':
      colorstr = '#808080'
      break
    case '开工':
      colorstr = '#55aaff'
      break
    case '创建':
      colorstr = '#FFA500'
      break
    case '完工':
      colorstr = '#00aa00'
      break
    default:
      colorstr = '#62d5ff'
      break
  }
  return colorstr
}
export function FBillStatusStatusColorTo(state) {
  let colorstr = ''
  switch (state) {
    case '已关闭':
      colorstr = '#808080' // #808080"
      break
    case '开工':
      colorstr = '#55aaff' //"#55aaff"
      break
    case '创建':
      colorstr = '#FFA500' //"#FFA500"
      break
    case '完工':
      colorstr = '#00aa00' //"#00aa00"
      break
    case '下达':
      colorstr = '#62d5ff' //
      break
    default:
      colorstr = 'royal' //"#62d5ff"
      break
  }
  return colorstr
}
//生产汇报单 暂存
export function DraftProduction(canshu) {
  const body = []
  canshu.forEach((item) => {
    body.push({
      FEntryID: item.FEntryID,
      FNumber: {
        FNUMBER: `${item.FNumber}`
      },
      FSCQty: item.FSCQty,
      F_JJQty: item.FSCQty,
      F_Dept: {
        FNUMBER: `${item.F_Dept}`
      },
      F_GXNumber: {
        FNUMBER: `${item.F_GXNumber}`
      },

      F_ALMA_ZRGXBH: {
        FNUMBER: `${item.F_ALMA_ZRGXBH}`
      },
      F_QADV_ZCCJ: {
        FNUMBER: `${item.F_QADV_ZCCJ}`
      }
    })
  })
  const data = {
    formid: `${FromData.GXJJDFromID}`,
    data: {
      NeedUpDateFields: [],
      NeedReturnFields: [],
      IsDeleteEntry: 'true',
      SubSystemId: '',
      IsVerifyBaseDataField: 'false',
      IsEntryBatchFill: 'true',
      ValidateFlag: 'true',
      NumberSearch: 'true',
      IsAutoAdjustField: 'false',
      InterationFlags: '',
      IgnoreInterationFlag: '',
      IsControlPrecision: 'false',
      ValidateRepeatJson: 'false',
      Model: {
        FID: canshu[0].FID,
        F_Date: `${dateTimeStr('y-m-d h:i:s')}`,
        FDescription: '',
        FWorkShopID: {
          FNumber: ''
        },
        FGXJJDEntry: body
      }
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Draft.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//保存更新
export function SaveProduction(ResultID, canshu) {
  const body = []
  canshu.forEach((item) => {
    body.push({
      FEntryID: item.FEntryID,
      FNumber: {
        FNUMBER: `${item.FNumber}`
      },
      F_LJName: `${item.F_LJName}`,
      F_GXQty: item.F_GXQty,
      FSCQty: item.FSCQty,
      F_JJQty: item.F_JJQty,
      F_Dept: {
        FNUMBER: `${item.F_Dept}`
      },
      F_GXNO: item.F_GXNO, //转出工序号
      F_GXNumber: {
        FNUMBER: `${item.F_GXNumber}`
      },
      F_ZRGXNO: item.F_ZRGXNO, //转入工序号
      F_ALMA_ZRGXBH: {
        FNUMBER: `${item.F_ALMA_ZRGXBH}`
      },
      FSCGDNumber: `${item.FSCGDNumber}`, //生产工单编号
      F_Note: item.F_Note, //备注
      F_QADV_ZCCJ: {
        FNUMBER: `${item.F_QADV_ZCCJ}`
      },
      F_GDSCQty: item.F_GDSCQty,
      F_SCDNO: `${item.F_SCDNO}`, //生产订单编号
      F_SCDEntry: `${item.F_SCDEntry}`, //生产订单行号
      F_GYLXType: item.F_GYLXType, // 工艺路线类型
      F_GYLX: {
        FNUMBER: `${item.F_GYLX.Number}` //工艺路线
      },
      FGYLXBB: item.FGYLXBB, //工艺路线版本
      F_SourceBillNo: `${item.F_SourceBillNo}`, //源单编号
      F_SourceEntry: `${item.F_SourceEntry}`, //源单行号
      F_SourceEntryID: `${item.F_SourceEntryID}`, //源单分录内码
      F_SourceID: `${item.F_SourceID}`, //源单内码
      F_SourceBillType: `${item.F_SourceBillType}`, //源单类型
      F_SCDNumber: `${item.F_SCDNumber}`, //生产单号
      FGXJJDEntry_Link: [
        {
          FLinkId: `${item.FLinkId}`,
          FGXJJDEntry_Link_FRuleId: `${item.FGXJJDEntry_Link_FRuleId}`,
          FGXJJDEntry_Link_FSTableName: `${item.FGXJJDEntry_Link_FSTableName}`,
          FGXJJDEntry_Link_FSBillId: `${item.FGXJJDEntry_Link_FSBillId}`, //源单内码
          FGXJJDEntry_Link_FSId: `${item.FGXJJDEntry_Link_FSId}`, //源单分录id
          FGXJJDEntry_Link_FSCQtyOld: item.FGXJJDEntry_Link_FSCQtyOld, //原始携带量
          FGXJJDEntry_Link_FSCQty: item.FGXJJDEntry_Link_FSCQty //修改携带量
        }
      ]
    })
  })

  const data = {
    formid: `${FromData.GXJJDFromID}`,
    data: {
      NeedUpDateFields: ['F_GXQty'],
      NeedReturnFields: [],
      IsDeleteEntry: 'true',
      SubSystemId: '',
      IsVerifyBaseDataField: 'false',
      IsEntryBatchFill: 'true',
      ValidateFlag: 'true',
      NumberSearch: 'true',
      IsAutoAdjustField: 'false',
      InterationFlags: '',
      IgnoreInterationFlag: '',
      IsControlPrecision: 'false',
      ValidateRepeatJson: 'false',
      Model: {
        FID: ResultID,
        F_Date: `${dateTimeStr('y-m-d h:i:s')}`,
        FGXJJDEntry: body
      }
    }
  }
  console.log('转移保存', data)
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Save.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//提交
export function SubmitProduction(Fid, Numbers) {
  const data = {
    formid: `${FromData.GXJJDFromID}`,
    data: {
      CreateOrgId: 0,
      Numbers: [`${Numbers}`],
      Ids: `${Fid}`,
      SelectedPostId: 0,
      NetworkCtrl: '',
      IgnoreInterationFlag: ''
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Submit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//审核
export function GetProductionAudit(FID) {
  const data = {
    FormId: `${FromData.GXJJDFromID}`,
    data: {
      CreateOrgId: 0,
      Numbers: [],
      Ids: `${FID}`,
      InterationFlags: '',
      NetworkCtrl: '',
      IsVerifyProcInst: '',
      IgnoreInterationFlag: '',
      UseBatControlTimes: 'false'
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Audit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//删除出现错误无法保存的工序交接单
export function DeleteGXJJDProject(Ids) {
  const data = {
    formid: `${FromData.GXJJDFromID}`,
    data: {
      CreateOrgId: 0,
      Numbers: [],
      Ids: `${Ids}`,
      NetworkCtrl: ''
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Delete.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
