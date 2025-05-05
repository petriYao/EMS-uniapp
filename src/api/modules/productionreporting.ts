import http from '@/utils/requset'
import { dateTimeStr } from '@/common/getdateTime';
import FromData from '@/common/FromIDs.json'
const SessionId = uni.getStorageSync('SessionId');
const KDSVCSessionId = uni.getStorageSync('KDSVCSessionId');

//查询
export function GetProductionOrderList(data:any) { //生产工单查询
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data: data
	});
}

//条码数据单查询
export function GetBarcodeData(code:any) {
	//0 FID
	//1 F_WOMW__SourceBillNo12 分录id
	//2 F_WOMW__QADV_Quantity 报工数量
	//3 F_WOMW_Base1 员工编号
	//4 F_WOMW_Base2 生产组别
	let data = {
		"data": {
			"FormId": `${FromData.TM_SJDFromID}`,
			"FieldKeys": "FID,F_WOMW__SourceBillNo12,F_WOMW__QADV_Quantity,F_WOMW_Base1,F_WOMW_Base2",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FBillNo",
				"Compare": "=",
				"Value": `${code}`,
				"Right": ")",
				"Logic": ""
			}],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}
	}
	console.log("TMdata", data);
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//生产工单查询
export function GetBarcodeDataForSCGD(getcode:any) {
	let data = {
		"data": {
			"FormId": `${FromData.SCGDFromID}`,
			"FieldKeys": "FSCGDEntry_FEntryID", //"FDocumentStatus,F_WOMW__SCDNumber,FBillNo,F_WOMW_Base,F_WOMW__Number,F_WOMW__Name,F_WOMW__Model,F_WOMW__LJName,F_WOMW__GXHNo",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FBillNo",
				"Compare": "=",
				"Value": `${getcode}`,
				"Right": ")",
				"Logic": ""
			}],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
export function GetProductionGxAllXX() {
	let data = {
		"data": {
			"FormId": `${FromData.GXFromID}`,
			"FieldKeys": "FID,FNumber,FName",
			"FilterString": [],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//所有工序
export function GetProductionGxAll(gxno:any) {
	let data = {
		"data": {
			"FormId": `${FromData.GXFromID}`,
			"FieldKeys": "FID,FNumber,FName",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FID",
				"Compare": "=",
				"Value": `${gxno}`,
				"Right": ")",
				"Logic": ""
			}],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//查询工序编号
export function GetProductionFNumber(FID:any) {
	let data = {
		"data": {
			"FormId": `${FromData.GXFromID}`,
			"FieldKeys": "FNumber,FName",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FID",
				"Compare": "=",
				"Value": `${FID}`,
				"Right": ")",
				"Logic": ""
			}],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//报工审核
export function GetProductionAudit(FID:any) {
	let data = {
		"FormId": `${FromData.SCHBDFromID}`,
		"data": {
			"CreateOrgId": 0,
			"Numbers": [],
			"Ids": `${FID}`,
			"InterationFlags": "",
			"NetworkCtrl": "",
			"IsVerifyProcInst": "",
			"IgnoreInterationFlag": "",
			"UseBatControlTimes": "false"
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Audit.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//下推
export function PushProduction(EntryIds:any) {
	let data = {
		"formid": `${FromData.SCGDFromID}`,
		"data": {
			"Ids": "",
			"Numbers": [],
			"EntryIds": `${EntryIds}`,
			"RuleId": `${FromData.XT_SCHBDFromID}`, //下推至 生产汇报单
			"TargetBillTypeId": "",
			"TargetOrgId": 0,
			"TargetFormId": "",
			"IsEnableDefaultRule": "false",
			"IsDraftWhenSaveFail": "true", // 保存失败，启用暂存
			"CustomParams": {}
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Push.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//下推后查询行号信息
export function PushGetProject(EntryIds:any) {
	let data = {
		"formid": `${FromData.SCHBDFromID}`,
		"data": {
			"CreateOrgId": 0,
			"Number": "",
			"Id": `${EntryIds}`,
			"IsSortBySeq": "false"
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.View.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//删除出现错误无法保存的生产汇报单
export function DeleteSCHBDProject(Ids:any) {
	let data = {
		"formid": `${FromData.SCHBDFromID}`,
		"data": {
			"CreateOrgId": 0,
			"Numbers": [],
			"Ids": `${Ids}`,
			"NetworkCtrl": ""
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Delete.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//生产汇报单 暂存
export function DraftProduction(canshu:any) {
	let body = [] as any[]
	canshu.forEach((item:any) => {
		body.push({
			"F_BGType": `${item.F_JJType}`,
			"F_SCDNumber": `${item.F_SCDNumber}`,
			"FNumber": {
				"FNUMBER": `${item.FNumber}`
			},
			"F_LJName": `${item.F_LJName}`,
			"F_GXNO": item.F_GXNO,
			"F_GXNumber": {
				"FNUMBER": `${item.F_GXNumber}`
			},
			"F_GXQty": item.F_GXQty,
			"F_Price": item.F_Price,
			"F_Amount": item.F_Amount,
			"F_GYPrice": item.F_GYPrice,
			"F_Double": item.F_Double,
			"F_QADV_GYAmount": item.F_QADV_GYAmount,
			"FSCQty": item.FSCQty,
			"F_Dept": {
				"FNUMBER": `${item.F_Dept}`
			},
			"FYGNumber": {
				"FSTAFFNUMBER": `${item.FYGNumber}`
			},
			"F_Quantity": item.F_Quantity,
			"F_GYLX": {
				"FNUMBER": item.F_GYLX
			},
			"FGYLXBB": item.FGYLXBB,
			"F_Note": item.F_Note,
			"F_Order": item.F_Order,
			"F_GDSCQty": item.F_GDSCQty,
			"F_GDSCSET": item.F_GDSCSET,
			"F_WGQty": item.F_WGQty,
			"F_WWGQty": item.F_WWGQty,
			"F_SCDEntry": item.F_SCDEntry,
			"FSCGDNumber": item.FSCGDNumber,
			"F_SourceBillType": item.F_SourceBillType,
			"F_SourceBillNo": item.F_SourceBillNo,
			"F_SourceEntry": item.F_SourceEntry,
			"F_FBGX": item.F_FBGX,
			"F_JJGX": item.F_JJGX,
			"F_ZRGXNO": item.F_ZRGXNO,
			"F_SourceEntryID": item.F_SourceEntryID,
			"FSCHBDEntry_Link": [{
				"FSCHBDEntry_Link_FRuleId": `${FromData.XT_SCHBDFromID}`,
				"FSCHBDEntry_Link_FSTableName": "FSCGDEntry",
				"FSCHBDEntry_Link_FSBillId": `${item.FSBillId}`,
				"FSCHBDEntry_Link_FSId": `${item.F_SourceEntryID}`
			}]
		})
	})
	let data = {
		"formid": `${FromData.SCHBDFromID}`,
		"data": {
			"NeedUpDateFields": [],
			"NeedReturnFields": [],
			"IsDeleteEntry": "true",
			"SubSystemId": "",
			"IsVerifyBaseDataField": "false",
			"IsEntryBatchFill": "true",
			"ValidateFlag": "true",
			"NumberSearch": "true",
			"IsAutoAdjustField": "false",
			"InterationFlags": "",
			"IgnoreInterationFlag": "",
			"IsControlPrecision": "false",
			"ValidateRepeatJson": "false",
			"Model": {
				"F_Date": `${dateTimeStr('y-m-d h:i:s')}`,
				"FSCHBDEntry": body
			}
		}
	}
	console.log("暂存json:", data);
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Draft.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//保存更新
export function SaveProduction(canshu:any, Resultid:any) {
	let data = {
		"formid": `${FromData.SCHBDFromID}`,
		"data": {
			"NeedUpDateFields": [],
			"NeedReturnFields": [],
			"IsDeleteEntry": "true",
			"SubSystemId": "",
			"IsVerifyBaseDataField": "false",
			"IsEntryBatchFill": "true",
			"ValidateFlag": "true",
			"NumberSearch": "true",
			"IsAutoAdjustField": "true",
			"InterationFlags": "",
			"IgnoreInterationFlag": "",
			"IsControlPrecision": "false",
			"ValidateRepeatJson": "false",
			"Model": {
				"FID": Resultid,
				"F_Date": `${dateTimeStr('y-m-d h:i:s')}`,
				"FSCHBDEntry": canshu
			}
		}
	}
	console.log("保存时的json:", data);
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Save.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//提交生产汇报单
export function SubmitProduction(Fid:any, Numbers:any) {
	let data = {
		"formid": `${FromData.SCHBDFromID}`,
		"data": {
			"CreateOrgId": 0,
			"Numbers": [`${Numbers}`],
			"Ids": `${Fid}`,
			"SelectedPostId": 0,
			"NetworkCtrl": "",
			"IgnoreInterationFlag": ""
		}
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Submit.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}
//保存扫码记录	
export function SaveDoNothing(sqlModel:any, SCGDNumber:any) {
	let data = {
		"formid": "QADV_SMJLBYD",
		"data": {
			"NeedUpDateFields": [],
			"NeedReturnFields": [],
			"IsDeleteEntry": "true",
			"SubSystemId": "",
			"IsVerifyBaseDataField": "false",
			"IsEntryBatchFill": "true",
			"ValidateFlag": "true",
			"NumberSearch": "true",
			"IsAutoAdjustField": "false",
			"InterationFlags": "",
			"IgnoreInterationFlag": "",
			"IsControlPrecision": "false",
			"ValidateRepeatJson": "false",
			"Model": {
				"FID": sqlModel.Fid,
				"F_WOMW_SCGDBHfFID": sqlModel
					.F_WOMW_SCGDBHfFID, //F_WOMW_SCGDBHfFID 生产工单编号FID内码
				"F_ENTRYID": sqlModel.F_ENTRYID, //F_ENTRYID    分录ID
				"F_WOMW_Text": sqlModel.F_WOMW_Text, //F_WOMW_Text 扫码后解析的条码内容
				"F_SCHBDBillNo": SCGDNumber, //F_SCHBDBillNo 生产汇报单单号
				"F_SF_SCTM": sqlModel.F_SF_SCTM, //SF_SCTM  TM=1 ,非Tm 0
				"F_ALMA_Qty": sqlModel.F_ALMA_Qty, //F_ALMA_Qty 报工数量
				"F_SCGDDBillNo": sqlModel.F_SCGDDBillNo, //F_SCGDDBillNo 生产工单单号
				"F_GXH": sqlModel.F_GXH //F_GXH 工序号 
			}
		}
	}
	console.log("扫码记录保存", data);
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Save.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data
	});
}