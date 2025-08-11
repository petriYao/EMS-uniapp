import http from '@/utils/requset'
import FromData from '@/common/FromIDs.json'
//条码数据单查询
export function PDA_GetBarcodeData(Dannumber, Gxh) {
  //0 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //1 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  //2 F_SCDNumber 生产单号
  //3 FBillNo  生产工单
  //4 FWORKSHOPID 生产车间
  //5 F_Number 产品编码
  //6 F_Name   产品名称
  //7 F_Model  规格型号
  //8 F_LJName 零件名称
  //9 F_GXHNo 工序号
  //10 F_GX 工序名称
  //11 F_Qty 生产数量
  //12 F_WWGQty 未完工数量
  //13 F_ZCQty 转出数量
  //14 FID
  //15 FDocumentStatus 单据状态
  //16 F_GXNumber 工序编号
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 FSCGDEntry_FEntryID 工序分录ID
  //20 F_BZPrice	 工艺单价
  //21 F_GJBX 工价倍数
  //22 F_Price	 单价
  //23 F_QADV_Amount 金额
  //24 F_QADV_Amount1 原始金额
  //25 F_SCQty 工序数量
  //26 F_Dept //生产组别
  //27 F_GXHNo 工序号
  //--------------------------------
  //28 F_Quantity 单位用量
  //29 F_FBGX  翻倍工序
  //30 F_JJGX 交接工序
  //31 F_TOGXNo 转入工序序号
  //32 F_WGQty 完工数量
  //33 F_ZDJJ 自动交接
  //34 FMONumber 生产订单编号
  //35 FMOEntrySeq 生产订单行号
  //36 F_SET 生产套数
  //37 F_GYLXVersion 工艺路线版本号 *****
  //38 F_Remark 备注
  //39 F_Orderid 合同号
  //40 F_SourceBillType 源单类型
  //41 F_SourceBillNo 源单编号
  //42 FMOEntrySeq1 源单行号

  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'FBillStatus,F_CLoseRowState,F_SCDNumber,FBillNo,FWORKSHOPID,F_Number,F_Name,F_Model,F_LJName,F_GXHNo,F_GX,F_Qty,F_WWGQty,F_ZCQty,FID,FDocumentStatus,F_GXNumber,FRouteId,FSCType,FSCGDEntry_FEntryID,F_BZPrice,F_GJBX,F_Price,F_QADV_Amount,F_QADV_Amount1,F_SCQty,F_Dept,F_GXHNo,F_Quantity,F_FBGX,F_JJGX,F_TOGXNo,F_WGQty,F_ZDJJ,FMONumber,FMOEntrySeq,F_SET,F_GYLXVersion,F_Remark,F_Orderid,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FBillNo',
          Compare: '=',
          Value: `${Dannumber}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'F_GXHNo',
          Compare: '=',
          Value: `${Gxh}`,
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
export function PDA_GetTMcodeData(FEntryid) {
  //0 FBillStatus 状态(1:创建,2:下达,3:开工,4:完工)
  //1 F_CLoseRowState 行关闭状态 (1:未关闭 , 2:已关闭)
  //2 F_SCDNumber 生产单号
  //3 FBillNo  生产工单
  //4 FWORKSHOPID 生产车间
  //5 F_Number 产品编码
  //6 F_Name   产品名称
  //7 F_Model  规格型号
  //8 F_LJName 零件名称
  //9 F_GXHNo 工序号
  //10 F_GX 工序名称
  //11 F_Qty 生产数量
  //12 F_WWGQty 未完工数量
  //13 F_ZCQty 转出数量
  //14 FID
  //15 FDocumentStatus 单据状态
  //16 F_GXNumber 工序编号
  //17 FRouteId 工艺线路
  //18 FSCType 生产类型
  //19 FSCGDEntry_FEntryID 工序分录ID
  //20 F_BZPrice	 工艺单价
  //21 F_GJBX 工价倍数
  //22 F_Price	 单价
  //23 F_QADV_Amount 金额
  //24 F_QADV_Amount1 原始金额
  //25 F_SCQty 工序数量
  //26 F_Dept //生产组别
  //27 F_GXHNo 工序号
  //--------------------------------
  //28 F_Quantity 单位用量
  //29 F_FBGX  翻倍工序
  //30 F_JJGX 交接工序
  //31 F_TOGXNo 转入工序序号
  //32 F_WGQty 完工数量
  //33 F_ZDJJ 自动交接
  //34 FMONumber 生产订单编号
  //35 FMOEntrySeq 生产订单行号
  //36 F_SET 生产套数
  //37 F_GYLXVersion 工艺路线版本号 ***** F_GYLXVersion,F_Remark,F_Orderid,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1
  //38 F_Remark 备注
  //39 F_Orderid 合同号
  //40 F_SourceBillType 源单类型
  //41 F_SourceBillNo 源单编号
  //42 FMOEntrySeq1 源单行号
  const data = {
    data: {
      FormId: `${FromData.SCGDFromID}`,
      FieldKeys:
        'FBillStatus,F_CLoseRowState,F_SCDNumber,FBillNo,FWORKSHOPID,F_Number,F_Name,F_Model,F_LJName,F_GXHNo,F_GX,F_Qty,F_WWGQty,F_ZCQty,FID,FDocumentStatus,F_GXNumber,FRouteId,FSCType,FSCGDEntry_FEntryID,F_BZPrice,F_GJBX,F_Price,F_QADV_Amount,F_QADV_Amount1,F_SCQty,F_Dept,F_GXHNo,F_Quantity,F_FBGX,F_JJGX,F_TOGXNo,F_WGQty,F_ZDJJ,FMONumber,FMOEntrySeq,F_SET,F_GYLXVersion,F_Remark,F_Orderid,F_SourceBillType,F_SourceBillNo,FMOEntrySeq1',
      FilterString: [
        {
          Left: '(',
          FieldName: 'FSCGDEntry_FEntryID',
          Compare: '=',
          Value: `${FEntryid}`,
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
