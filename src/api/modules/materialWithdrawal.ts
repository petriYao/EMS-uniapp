import { executeBillQueryApi, viewApi } from '@/api/commonHttp'

//查看生产领料单
export function lookPickMtrl(Number: any) {
  const data = {
    FormId: `PRD_PickMtrl`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//生产领料单单据查询
export function transferOrder(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `PRD_PickMtrl`,
        FieldKeys: 'FID,FPOOrderEntry_FEntryID',
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

//查看简单生产领料单
export function lookSimple(Number: any) {
  const data = {
    FormId: `SP_PickMtrl`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//委外生产领料单
export function lookOutsourcing(Number: any) {
  const data = {
    FormId: `SUB_PickMtrl`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//查看生产退料单
export function lookReturn(Number: any) {
  const data = {
    FormId: `PRD_ReturnMtrl`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//查看简单生产退料单
export function lookSimpleReturn(Number: any) {
  const data = {
    FormId: `SP_ReturnMtrl`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//查看委外生产退料单
export function lookOutsourcingReturn(Number: any) {
  const data = {
    FormId: `SUB_RETURNMTRL`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
