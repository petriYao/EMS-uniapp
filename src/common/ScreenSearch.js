export function GetcodeisNull(Fid, getCode) {
  let andwhere = []
  let newgetCode = getCode.split('.')
  if (newgetCode.length == 2) {
    andwhere.push(
      {
        Left: '(',
        FieldName: 'FBillNo',
        Compare: '=',
        Value: `${newgetCode[0]}`,
        Right: ')',
        Logic: 'AND'
      },
      {
        Left: '(',
        FieldName: 'FSCGDEntry_FEntryID',
        Compare: '=',
        Value: `${newgetCode[1]}`,
        Right: ')',
        Logic: ''
      }
    )
  }
  if (newgetCode.length == 1) {
    if (newgetCode[0] != '') {
      andwhere.push({
        Left: '(',
        FieldName: 'FBillNo',
        Compare: '=',
        Value: `${newgetCode[0]}`,
        Right: ')',
        Logic: ''
      })
    } else {
      andwhere.push({
        Left: '(',
        FieldName: 'FID',
        Compare: '=',
        Value: `${Fid}`,
        Right: ')',
        Logic: ''
      })
    }
  }

  return andwhere
}

export function FBillStatusForSearch(ScreenSearch, ZYScreenSearch, ZBieScreenSearch, Fid, getCode) {
  let isAnd = ''
  let newgetCode = getCode.split('.')
  let andwhere = [
    {
      Left: '(',
      FieldName: 'FID',
      Compare: '=',
      Value: `${Fid}`,
      Right: ')',
      Logic: ''
    }
  ]

  if (ZYScreenSearch.length > 0) {
    //转移
    let zydata = ZYScreenSearch[0].Zhuanyi
    for (var i = 0; i < zydata.length; i++) {
      if (zydata[i] > 0) {
        if (newgetCode.length == 2) {
          andwhere = [
            {
              Left: '(',
              FieldName: 'FID',
              Compare: '=',
              Value: `${Fid}`,
              Right: ')',
              Logic: 'AND'
            },
            {
              Left: '(',
              FieldName: 'FSCGDEntry_FEntryID',
              Compare: '=',
              Value: `${newgetCode[1]}`,
              Right: ')',
              Logic: ''
            },
            {
              Left: '(',
              FieldName: 'F_ZCQty',
              Compare: '>',
              Value: 0,
              Right: ')',
              Logic: 'AND'
            }
          ]
        }
        if (newgetCode.length == 1) {
          andwhere = [
            {
              Left: '(',
              FieldName: 'FID',
              Compare: '=',
              Value: `${Fid}`,
              Right: ')',
              Logic: 'AND'
            },
            {
              Left: '(',
              FieldName: 'F_ZCQty',
              Compare: '>',
              Value: 0,
              Right: ')',
              Logic: 'AND'
            }
          ]
        }
      }
    }
  } else if (ZBieScreenSearch.length > 0) {
    //组别
    let zbiearr = ZBieScreenSearch[0].ZuBie
    if (newgetCode.length == 2) {
      andwhere = [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'FSCGDEntry_FEntryID',
          Compare: '=',
          Value: `${newgetCode[1]}`,
          Right: ')',
          Logic: 'AND'
        }
      ]
    }
    if (newgetCode.length == 1) {
      andwhere = [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: 'AND'
        }
      ]
    }
    console.log('zbiearr', zbiearr)
    for (var i = 0; i < zbiearr.length; i++) {
      if (zbiearr[i].length == 1) {
        andwhere.push({
          Left: '(',
          FieldName: 'F_Dept',
          Compare: '=',
          Value: `${zbiearr[i]}`,
          Right: ')',
          Logic: ''
        })
      } else {
        if (i == 0) {
          andwhere.push({
            Left: '(',
            FieldName: 'F_Dept',
            Compare: '=',
            Value: `${zbiearr[i]}`,
            Right: '',
            Logic: 'OR'
          })
        }
        if (i > 0 && i < zbiearr.length - 1) {
          andwhere.push({
            Left: '',
            FieldName: 'F_Dept',
            Compare: '=',
            Value: `${zbiearr[i]}`,
            Right: '',
            Logic: 'OR'
          })
        }
        if (i == zbiearr.length - 1) {
          andwhere.push({
            Left: '',
            FieldName: 'F_Dept',
            Compare: '=',
            Value: `${zbiearr[i]}`,
            Right: ')',
            Logic: ''
          })
        }
      }
    }
  } else if (ScreenSearch.length > 0) {
    //状态
    isAnd = 'or'
    if (newgetCode.length == 2) {
      andwhere = [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: 'AND'
        },
        {
          Left: '(',
          FieldName: 'FSCGDEntry_FEntryID',
          Compare: '=',
          Value: `${newgetCode[1]}`,
          Right: ')',
          Logic: ''
        }
      ]
    }
    if (newgetCode.length == 1) {
      andwhere = [
        {
          Left: '(',
          FieldName: 'FID',
          Compare: '=',
          Value: `${Fid}`,
          Right: ')',
          Logic: 'AND'
        }
      ]
    }

    ScreenSearch.forEach((item) => {
      //判断是否存在 5 关闭
      let result = item.ZhuangTai.some((item) => item === 5)
      let newZT = []
      if (result) {
        //存在5 .将5移除，后面添加
        item.ZhuangTai.length = item.ZhuangTai.length - 1 //删除最后一个元素 5
        newZT = item.ZhuangTai
        console.log('pop-newZT', newZT)
      } else {
        newZT = item.ZhuangTai
        console.log('newZT', newZT)
      }

      for (var i = 0; i < newZT.length; i++) {
        let sta = newZT[i]
        // if (newZT.length >0) {
        // 	if (sta == 5) {
        // 		andwhere.push({
        // 			"Left": "",
        // 			"FieldName": "F_CLoseRowState",
        // 			"Compare": "=",
        // 			"Value": "2", //关闭
        // 			"Right": "",
        // 			"Logic": ""
        // 		})
        // 	} else {
        // 		andwhere.push({
        // 			"Left": "(",
        // 			"FieldName": "FBillStatus",
        // 			"Compare": "=",
        // 			"Value": `${sta}`,
        // 			"Right": ")",
        // 			"Logic": "AND"
        // 		})
        // 	}
        // }
        if (newZT.length > 1) {
          if (i == 0) {
            andwhere.push({
              Left: '(',
              FieldName: 'FBillStatus',
              Compare: '=',
              Value: `${sta}`,
              Right: '',
              Logic: 'OR'
            })
          }
          if (i > 0 && i < newZT.length - 1) {
            andwhere.push({
              Left: '',
              FieldName: 'FBillStatus',
              Compare: '=',
              Value: `${sta}`,
              Right: '',
              Logic: 'OR'
            })
          }
          if (i == newZT.length - 1) {
            if (result) {
              andwhere.push({
                Left: '',
                FieldName: 'FBillStatus',
                Compare: '=',
                Value: `${sta}`,
                Right: '',
                Logic: 'OR'
              })
            } else {
              andwhere.push({
                Left: '',
                FieldName: 'FBillStatus',
                Compare: '=',
                Value: `${sta}`,
                Right: ')',
                Logic: ''
              })
            }
          }
        }
      }
      if (result) {
        if (newZT.length == 1) {
          andwhere.push({
            Left: '(',
            FieldName: 'F_CLoseRowState',
            Compare: '=',
            Value: '2', //关闭
            Right: ')',
            Logic: ''
          })
        } else {
          andwhere.push({
            Left: '',
            FieldName: 'F_CLoseRowState',
            Compare: '=',
            Value: '2', //关闭
            Right: ')',
            Logic: ''
          })
        }
      } else {
        andwhere.push({
          Left: '(',
          FieldName: 'F_CLoseRowState',
          Compare: '=',
          Value: '1', //未关闭
          Right: ')',
          Logic: ''
        })
      }
    })
  } else {
    andwhere = GetcodeisNull(Fid, getCode)
  }
  return andwhere
}
