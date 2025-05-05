import {
	DraftProduction,
	SaveProduction,
	SubmitProduction,
	GetProductionAudit,
	DeleteGXJJDProject
} from '@/api/modules/processlist'
//审核
function PostAudit(result) {
	let AuditModel = result
	GetProductionAudit(AuditModel.Id).then(res => {
		console.log("审核成功", res);
		if (res.data.Result.ResponseStatus.MsgCode == 0) {
			//清空所有数据 
			uni.showToast({
				title: '操作成功',
				icon: 'success',
				duration: 2000
			})
		} else {
			console.log(res);
		}
	})
}
//提交
function PostSubmit(result) {
	let models = result
	SubmitProduction(models.Id, models.Number).then(res => {
		console.log("提交时返回", res);
		if (res.data.Result.ResponseStatus.MsgCode == 0) {
			let resultAudit = res.data.Result.ResponseStatus.SuccessEntitys
			if (resultAudit.length > 0) {
				//审核
				PostAudit(resultAudit[0])
			}
		} else {
			console.log(res);
		}
	})
}
//保存
export async function SaveSubmit(ResultID, canshu) {
	//保存更新
	let isSuccess = false
	await uni.showLoading({
		title: '正在操作中……',
		mask: true
	});
	const {
		data: save_res
	} = await SaveProduction(ResultID, canshu);
	console.log("保存转移后，返回", save_res);
	if (save_res.Result.ResponseStatus.MsgCode == 0) {
		isSuccess = true
		let result = save_res.Result.ResponseStatus.SuccessEntitys
		if (result.length > 0) {
			PostSubmit(result[0])
		}
	} else {
		isSuccess = false
		let err = save_res.Result.ResponseStatus.Errors
		err.forEach(errmsg => {
			uni.showModal({
				title: '错误提示',
				content: errmsg.Message,
				showCancel: false,
				confirmText: '确定'
			});

		})
		console.log("保存：", save_res);
		DeleteGXJJDProject(ResultID)
	}
	await setTimeout(function() {
		uni.hideLoading();
	}, 1000);
	return isSuccess
}
//暂存
export function DraftSubmit(canshu) {
	DraftProduction(canshu[0]).then(res_bc => { //暂存 
		if (res_bc.data.Result.ResponseStatus.MsgCode == 0) {
			//保存更新
			SaveSubmit(canshu[0])
		} else {
			console.log(res_bc);
		}
	});
}