import { lowerCamelCase2 } from '@/api/modules/storage'
//推荐仓位
export const getStockLoc = async (MaterialNumber: any, lot: any, FlexNumber: any, StockId: any) => {
  //编码、批号、仓库FlexNumber，StockId
  // console.log('推荐仓位', MaterialNumber, lot, FlexNumber, StockId)

  if (FlexNumber !== '' && FlexNumber) {
    let FilterString = `FMaterialId.Fnumber = '${MaterialNumber}'`
    if (lot !== ' ' && lot !== '') {
      FilterString += ` AND FLot.Fnumber = '${lot}'`
    }
    FilterString += ` AND FStockId.Fnumber = '${StockId}' AND FBaseQty > 0`
    const FieldKeys = `FStockLocId.F${FlexNumber}.FNumber`
    const lowerRes: any = await lowerCamelCase2(FilterString, FieldKeys)
    if (lowerRes && lowerRes.data && lowerRes.data.length > 0) {
      return lowerRes.data.map((item: any) => item[0]).join(',') //推荐仓位
    }
  } else {
    return ''
  }
}
