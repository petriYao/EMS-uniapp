export function ValidataCodeForMsg(code) {
	const Validate = [{
			"code": 0,
			"msg": "操作成功" //默认
		},
		{
			"code": 1,
			"msg": "上下文丢失"
		},
		{
			"code": 2,
			"msg": "没有权限"
		},
		{
			"code": 3,
			"msg": "操作标识为空"
		},
		{
			"code": 4,
			"msg": "异常"
		},
		{
			"code": 5,
			"msg": "单据标识为空"
		},
		{
			"code": 6,
			"msg": "数据库操作失败"
		},
		{
			"code": 7,
			"msg": "许可错误"
		},
		{
			"code": 8,
			"msg": "参数错误"
		},
		{
			"code": 9,
			"msg": "指定字段/值不存在"
		},
		{
			"code": 10,
			"msg": "未找到对应数据"
		},
		{
			"code": 11,
			"msg": "验证失败"
		},
		{
			"code": 12,
			"msg": "不可操作"
		},
		{
			"code": 13,
			"msg": "网控冲突"
		},
		{
			"code": 14,
			"msg": "调用限制"
		},
		{
			"code": 15,
			"msg": "禁止管理员登录"
		}
	]
	let resmsg
	Validate.forEach(item => {
		if (code === item.code) {
			resmsg = item.msg
		}
	})
	return resmsg
}
//行状态
export function RowStatecodeForMsg(CLoseRowStatecode, FBillStatuscode) {
	const FBillStatus = [{
			"code": 1,
			"msg": "创建"
		},
		{
			"code": 2,
			"msg": "下达"
		},
		{
			"code": 3,
			"msg": "开工"
		},
		{
			"code": 4,
			"msg": "完工"
		}
	]
	const CLoseRowState = [{
			"code": 1,
			"msg": "未关闭"
		},
		{
			"code": 2,
			"msg": "已关闭"
		}
	]

	let resmsg
	if (CLoseRowStatecode == 1) {
		for (var z = 0; z < FBillStatus.length; z++) {
			if (FBillStatuscode == FBillStatus[z].code) {
				resmsg = FBillStatus[z].msg
				return resmsg
			}
		}
	} else {
		resmsg = "已关闭"
		return resmsg
	}

}