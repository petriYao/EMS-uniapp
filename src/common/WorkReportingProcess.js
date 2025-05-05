import {
  GetProductionOrderList,
  DraftProduction,
  PushProduction,
  SaveProduction,
  SubmitProduction,
  GetProductionFNumber,
  GetProductionAudit,
  SaveDoNothing,
  DeleteSCHBDProject
} from '@/api/productionreporting.js'
//审核
function PostAudit(result, sqlModel) {
  let AuditModel = result
  GetProductionAudit(AuditModel.Id).then((res) => {
    console.log('审核成功', res)
    if (res.data.Result.ResponseStatus.MsgCode == 0) {
      uni.showToast({
        title: '操作成功',
        icon: 'success',
        duration: 2000
      })
      let SCGDNumber = res.data.Result.ResponseStatus.SuccessEntitys[0].Number
      if (sqlModel.length > 0) {
        sqlModel.forEach((item) => {
          SaveDoNothing(item, SCGDNumber).then((ress) => {
            console.log('扫码记录保存返回', ress)
          })
        })
      }
    } else {
      console.log(res)
    }
  })
}
//提交
function PostSubmit(result, sqlModel) {
  let models = result
  SubmitProduction(models.Id, models.Number).then((res) => {
    console.log('提交结果', res)
    if (res.data.Result.ResponseStatus.MsgCode == 0) {
      let resultAudit = res.data.Result.ResponseStatus.SuccessEntitys
      if (resultAudit.length > 0) {
        //审核
        PostAudit(resultAudit[0], sqlModel)
      }
    } else {
      console.log(res)
    }
  })
}
//保存
export async function SaveSubmit(canshu, Resultid, sqlModel) {
  let isSuccess = false
  const { data: save_res } = await SaveProduction(canshu, Resultid)
  console.log('保存提交结果', save_res)
  if (save_res.Result.ResponseStatus.MsgCode == 0) {
    isSuccess = true
    let result = save_res.Result.ResponseStatus.SuccessEntitys
    if (result.length > 0) {
      PostSubmit(result[0], sqlModel)
    }
  } else {
    isSuccess = false
    let err = save_res.Result.ResponseStatus.Errors
    err.forEach((errmsg) => {
      uni.showModal({
        title: '错误提示',
        content: errmsg.Message,
        showCancel: false,
        confirmText: '确定'
      })
      setTimeout(function () {
        uni.hideLoading()
      }, 1000)
    })
    console.log(save_res)
    DeleteSCHBDProject(Resultid)
  }
  return isSuccess
}

//暂存
export function DraftSubmit(canshu, sqlModel) {
  DraftProduction(canshu).then((res) => {
    //暂存
    console.log('暂存提交结果', res)
    if (res.data.Result.ResponseStatus.MsgCode == 0) {
      //保存更新
      //SaveSubmit(canshu, sqlModel)
    } else {
      console.log(res)
    }
  })
}
