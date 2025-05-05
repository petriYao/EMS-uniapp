import http from '@/utils/requset'
import FromData from '@/common/FromIDs.json'
//条码数据单查询
export function TM_GetBarcodeData(code: string) {
  const data = {
    data: {
      FormId: `${FromData.TM_SJDFromID}`,
      FieldKeys: 'F_WOMW__SourceBillNo11,F_WOMW__SourceBillNo12',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FBillNo',
          Compare: '=',
          Value: `${code}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//查询原单
export function TM_GetYuandanData(Fid: string) {
  // 0 F_SCDNumber  	生产单号
  // 1 FBILLNO		单据编号
  // 2 FWorkShopID	生产车间
  // 3 FPlanStartTime 计划开工时间
  // 4 FPlanFinishTime计划完工时间
  // 5 F_Number		产品编码
  // 6 F_Qty			生产数量
  // 7 FID
  // 8 F_Name 	产品名称
  // 9  F_Model  规格型号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,FBILLNO,FWorkShopID,FPlanStartTime,FPlanFinishTime,F_Number,F_Qty,FID,F_Name,F_Model',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//源单内码 + 分录号查询
export function TM_GetSourceBillNoData(ydnm: string, ydflh: string) {
  //0 F_SCDNumber 生产单号
  //1 F_GXHNo 	工序
  //2 F_GX		工序名称
  //3 F_LJName	零件名称
  //4 F_JJType	计件类型
  //5 F_Qty		生产数量
  //6 F_Dept		生产组别
  //7 F_WWGQty	未完工数量
  //8 FDocumentStatus	单据状态
  //9 FID 生产工单FID
  //10 FSCGDEntry_FEntryID 工序编号
  //11 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //12 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  // 13 F_ZCQty 转出数量
  //14 FBillNo 单据编号
  //15 FWORKSHOPID 生产车间 --
  //16 F_Number 产品编码
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 F_GXNumber 工序编号
  //20 F_SCQty 工序数量
  //21 F_ZRQty 待转移数量
  //22 F_TOGXNo 转入工序号
  //23 F_WGQty 完工数量 ++++++++++++++++++++++++++++++++
  //24 F_GXHNo 	工序
  //25 F_SourceBillType 源单类型
  //26 F_SourceBillNo 源单编号
  //27 FMOEntrySeq1 源单行号
  //28 FMONumber 生产订单编号
  //29 FMOEntrySeq 生产订单行号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${ydnm}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'FSCGDEntry_FEntryID',
          Compare: '=',
          Value: `${ydflh}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//工序id查询状态
export function TM_GetSourceBillNoData_Gxitems(gxId) {
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys: 'FBillStatus,F_CLoseRowState,FSCGDEntry_FEntryID',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FSCGDEntry_FEntryID',
          Compare: '=',
          Value: `${gxId}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//刷新分录列表
export function TM_GetSourceBillNoData_Refresh(ydnm) {
  //0 F_SCDNumber 生产单号
  //1 F_GXHNo 	工序
  //2 F_GX		工序名称
  //3 F_LJName	零件名称
  //4 F_JJType	计件类型
  //5 F_Qty		生产数量
  //6 F_Dept		生产组别
  //7 F_WWGQty	未完工数量
  //8 FDocumentStatus	单据状态
  //9 FID 生产工单FID
  //10 FSCGDEntry_FEntryID 工序编号
  //11 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //12 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  // 13 F_ZCQty 转出数量
  //14 FBillNo 单据编号
  //15 FWORKSHOPID 生产车间 --
  //16 F_Number 产品编码
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 F_GXNumber 工序编号
  //20 F_SCQty 工序数量
  //21 F_ZRQty 待转移数量
  //22 F_TOGXNo 转入工序号
  //23 F_WGQty 完工数量 ++++++++++++++++++++++++++++++++
  //24 F_GXHNo 	工序
  //25 F_SourceBillType 源单类型
  //26 F_SourceBillNo 源单编号
  //27 FMOEntrySeq1 源单行号
  //28 FMONumber 生产订单编号
  //29 FMOEntrySeq 生产订单行号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${ydnm}`,
          Right: ')',
          Logic: 'AND'
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//查询生产工单号-页头
export function TM_GetSource_F_SCDNumberData_TOP(SCGDH) {
  // 0 F_SCDNumber  	生产单号
  // 1 FBILLNO		单据编号
  // 2 FWorkShopID	生产车间
  // 3 FPlanStartTime 计划开工时间
  // 4 FPlanFinishTime计划完工时间
  // 5 F_Number		产品编码
  // 6 F_Qty			生产数量
  // 7 FID
  // 8 F_Name 	产品名称
  // 9  F_Model  规格型号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,FBILLNO,FWorkShopID,FPlanStartTime,FPlanFinishTime,F_Number,F_Qty,FID,F_Name,F_Model',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FBILLNO',
          Compare: '=',
          Value: `${SCGDH}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//生产工单号查询-页脚
export function TM_GetSource_F_SCDNumberData(SCGDH) {
  //0 F_SCDNumber 生产单号
  //1 F_GXHNo 	工序
  //2 F_GX		工序名称
  //3 F_LJName	零件名称
  //4 F_JJType	计件类型
  //5 F_Qty		生产数量
  //6 F_Dept		生产组别
  //7 F_WWGQty	未完工数量
  //8 FDocumentStatus	单据状态
  //9 FID 生产工单FID
  //10 FSCGDEntry_FEntryID 工序编号
  //11 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //12 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  // 13 F_ZCQty 转出数量
  //14 FBillNo 单据编号
  //15 FWORKSHOPID 生产车间 --
  //16 F_Number 产品编码
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 F_GXNumber 工序编号
  //20 F_SCQty 工序数量
  //21 F_ZRQty 待转移数量
  //22 F_TOGXNo 转入工序号
  //23 F_WGQty 完工数量 ++++++++++++++++++++++++++++++++
  //24 F_GXHNo 	工序
  //25 F_SourceBillType 源单类型
  //26 F_SourceBillNo 源单编号
  //27 FMOEntrySeq1 源单行号
  //28 FMONumber 生产订单编号
  //29 FMOEntrySeq 生产订单行号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FBILLNO',
          Compare: '=',
          Value: `${SCGDH}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}

//查询生产工单号+工序号-页头
export function TM_GetSource_F_SCDNumberData_GXH_TOP(SCGDH, GXH) {
  // 0 F_SCDNumber  	生产单号
  // 1 FBILLNO		单据编号
  // 2 FWorkShopID	生产车间
  // 3 FPlanStartTime 计划开工时间
  // 4 FPlanFinishTime计划完工时间
  // 5 F_Number		产品编码
  // 6 F_Qty			生产数量
  // 7 FID
  // 8 F_Name 	产品名称
  // 9  F_Model  规格型号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,FBILLNO,FWorkShopID,FPlanStartTime,FPlanFinishTime,F_Number,F_Qty,FID,F_Name,F_Model',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FBILLNO',
          Compare: '=',
          Value: `${SCGDH}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'F_GXHNo',
          Compare: '=',
          Value: `${GXH}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//查询生产工单号+工序号-页脚
export function TM_GetSource_F_SCDNumberData_GXH(SCGDH, GXH) {
  //0 F_SCDNumber 生产单号
  //1 F_GXHNo 	工序
  //2 F_GX		工序名称
  //3 F_LJName	零件名称
  //4 F_JJType	计件类型
  //5 F_Qty		生产数量
  //6 F_Dept		生产组别
  //7 F_WWGQty	未完工数量
  //8 FDocumentStatus	单据状态
  //9 FID 生产工单FID
  //10 FSCGDEntry_FEntryID 工序编号
  //11 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //12 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  // 13 F_ZCQty 转出数量
  //14 FBillNo 单据编号
  //15 FWORKSHOPID 生产车间 --
  //16 F_Number 产品编码
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 F_GXNumber 工序编号
  //20 F_SCQty 工序数量
  //21 F_ZRQty 待转移数量
  //22 F_TOGXNo 转入工序号
  //23 F_WGQty 完工数量 ++++++++++++++++++++++++++++++++
  //24 F_GXHNo 	工序
  //25 F_SourceBillType 源单类型
  //26 F_SourceBillNo 源单编号
  //27 FMOEntrySeq1 源单行号
  //28 FMONumber 生产订单编号
  //29 FMOEntrySeq 生产订单行号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FBILLNO',
          Compare: '=',
          Value: `${SCGDH}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'F_GXHNo',
          Compare: '=',
          Value: `${GXH}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//跳转加载-页头
export function TM_LOAD_TOP(Fid) {
  // 0 F_SCDNumber  	生产单号
  // 1 FBILLNO		单据编号
  // 2 FWorkShopID	生产车间
  // 3 FPlanStartTime 计划开工时间
  // 4 FPlanFinishTime计划完工时间
  // 5 F_Number		产品编码
  // 6 F_Qty			生产数量
  // 7 FID
  // 8 F_Name 	产品名称
  // 9  F_Model  规格型号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,FBILLNO,FWorkShopID,FPlanStartTime,FPlanFinishTime,F_Number,F_Qty,FID,F_Name,F_Model',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: 'AND'
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
export function pageLoad(Fid, StartRow, TopRowCount, Limit) {
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: ''
        }
      ],
      OrderString: '',
      TopRowCount: TopRowCount,
      StartRow: StartRow,
      Limit: Limit,
      SubSystemId: ''
    }
  }
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
//跳转加载  -页脚
export function TM_LOAD_Bottom(Fid) {
  //0 F_SCDNumber 生产单号
  //1 F_GXHNo 	工序
  //2 F_GX		工序名称
  //3 F_LJName	零件名称
  //4 F_JJType	计件类型
  //5 F_Qty		生产数量
  //6 F_Dept		生产组别
  //7 F_WWGQty	未完工数量
  //8 FDocumentStatus	单据状态
  //9 FID 生产工单FID
  //10 FSCGDEntry_FEntryID 工序编号
  //11 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //12 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  // 13 F_ZCQty 转出数量
  //14 FBillNo 单据编号
  //15 FWORKSHOPID 生产车间 --
  //16 F_Number 产品编码
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 F_GXNumber 工序编号
  //20 F_SCQty 工序数量
  //21 F_ZRQty 待转移数量
  //22 F_TOGXNo 转入工序号
  //23 F_WGQty 完工数量
  //24 F_GXHNo 	工序======================
  //25 F_SourceBillType 源单类型
  //26 F_SourceBillNo 源单编号
  //27 FMOEntrySeq1 源单行号
  //28 FMONumber 生产订单编号
  //29 FMOEntrySeq 生产订单行号

  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
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
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
// export function TM_LOAD_Bottom(pageindex, pageSize, Fid) {
// 	//0 F_SCDNumber 生产单号
// 	//1 F_GXHNo 	工序
// 	//2 F_GX		工序名称
// 	//3 F_LJName	零件名称
// 	//4 F_JJType	计件类型
// 	//5 F_Qty		生产数量
// 	//6 F_Dept		生产组别
// 	//7 F_WWGQty	未完工数量
// 	//8 FDocumentStatus	单据状态
// 	//9 FID 生产工单FID
// 	//10 FSCGDEntry_FEntryID 工序编号
// 	//11 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
// 	//12 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
// 	// 13 F_ZCQty 转出数量
// 	//14 FBillNo 单据编号
// 	//15 FWORKSHOPID 生产车间 --
// 	//16 F_Number 产品编码
// 	//17 FRouteId 工艺线路
// 	//18 FSCType 生产类型
// 	//19 F_GXNumber 工序编号
// 	//20 F_SCQty 工序数量
// 	//21 F_ZRQty 待转移数量
// 	//22 F_TOGXNo 转入工序号
// 	//23 F_WGQty 完工数量
// 	//24 F_GXHNo 	工序======================
// 	//25 F_SourceBillType 源单类型
// 	//26 F_SourceBillNo 源单编号
// 	//27 FMOEntrySeq1 源单行号
// 	//28 FMONumber 生产订单编号
// 	//29 FMOEntrySeq 生产订单行号

// 	let data = {
// 		"data": {
// 			"FormId": `${FromData.SCGDFromID}`,
// 			"FieldKeys": "F_SCDNumber,F_GXHNo,F_GX,F_LJName,F_JJType,F_Qty,F_Dept,F_WWGQty,FDocumentStatus,FID,FSCGDEntry_FEntryID,FBillStatus,F_CLoseRowState,F_ZCQty,FBillNo,FWORKSHOPID,F_Number,FRouteId,FSCType,F_GXNumber,F_SCQty,F_ZRQty,F_TOGXNo,F_WGQty,F_GXHNo,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1,FMONumber,FMOEntrySeq",
// 			"FilterString": [{
// 				"Left": "(",
// 				"FieldName": "FID",
// 				"Compare": "=",
// 				"Value": `${Fid}`,
// 				"Right": ")",
// 				"Logic": ""
// 			}],
// 			"OrderString": "",
// 			"TopRowCount": 0,
// 			"StartRow": pageindex,
// 			"Limit": pageSize,
// 			"SubSystemId": ""
// 		}
// 	}
// 	console.log("需要使用分页", data);
// 	return http({
// 		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
// 		method: 'POST',
// 		requestTime: 5000, //等待5秒
// 		data
// 	});
// }
//分录总行数查询  -页脚
export function TM_LOAD_Bottom_Count(Fid) {
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys: 'FSCGDEntry_FEntryID',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: 'AND'
        }
      ],
      OrderString: '',
      TopRowCount: 0,
      StartRow: 0,
      Limit: 0,
      SubSystemId: ''
    }
  }
  console.log('数据总行数返回', data)
  return http({
    url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data
  })
}
