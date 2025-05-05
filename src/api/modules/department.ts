import http from '@/utils/requset'
import FromData from '@/common/FromIDs.json'

//根据组别id 查询对应的组别信息
export function GetZubieForFid(FdeptId) {
	let data = {
		"parameters": [{
			"FormId": `${FromData.ZBFromID}`,
			"FieldKeys": "FName,FNumber,FDEPTID",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FDEPTID",
				"Compare": "=",
				"Value": `${FdeptId}`,
				"Right": ")",
				"Logic": ""
			}],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}]
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data: data
	});
}
//查询单据对应的部门
export function DepartmentQuery() {
	let data = {
		"parameters": [{
			"FormId": `${FromData.ZBFromID}`,
			"FieldKeys": "FName,FNumber,FDEPTID",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FForbidStatus",
				"Compare": "=",
				"Value": "A",
				"Right": ")",
				"Logic": "AND"
			},
			{
				"Left": "(",
				"FieldName": "FDocumentStatus",
				"Compare": "=",
				"Value": "C",
				"Right": ")",
				"Logic": ""
			}
			],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}]
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data: data
	});
}
export function DepartmentQuery_One(FDEPTID) {
	let data = {
		"parameters": [{
			"FormId": `${FromData.ZBFromID}`,
			"FieldKeys": "FName,FNumber,FDEPTID",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FForbidStatus",
				"Compare": "=",
				"Value": "A",
				"Right": ")",
				"Logic": "AND"
			},
			{
				"Left": "(",
				"FieldName": "FDocumentStatus",
				"Compare": "=",
				"Value": "C",
				"Right": ")",
				"Logic": "AND"
			}, {
				"Left": "(",
				"FieldName": "FDEPTID",
				"Compare": "=",
				"Value": `${FDEPTID}`,
				"Right": ")",
				"Logic": ""
			}
			],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}]
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data: data
	});
}
export function DepartmentQueryforData(FDEPTID) {
	let data = {
		"parameters": [{
			"FormId": `${FromData.ZBFromID}`,
			"FieldKeys": "FName,FNumber,FDEPTID",
			"FilterString": [{
				"Left": "(",
				"FieldName": "FForbidStatus",
				"Compare": "=",
				"Value": "A",
				"Right": ")",
				"Logic": "AND"
			},
			{
				"Left": "(",
				"FieldName": "FDocumentStatus",
				"Compare": "=",
				"Value": "C",
				"Right": ")",
				"Logic": "AND"
			}, {
				"Left": "(",
				"FieldName": "FDEPTID",
				"Compare": "=",
				"Value": `${FDEPTID}`,
				"Right": ")",
				"Logic": "AND"
			}
			],
			"OrderString": "",
			"TopRowCount": 0,
			"StartRow": 0,
			"Limit": 2000,
			"SubSystemId": ""
		}]
	}
	return http({
		url: 'k3cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
		method: 'POST',
		requestTime: 5000, //等待5秒
		data: data
	});
}