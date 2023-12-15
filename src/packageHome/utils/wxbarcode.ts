import api from './wxbarcode/qrcode'

function convert_length(length: any) {
  return Math.round((wx.getSystemInfoSync().windowWidth * length) / 750)
}

export function myQrcode(id: any, code: any, width: any, height: any) {
  api.draw(code, {
    ctx: uni.createCanvasContext(id),
    width: convert_length(width),
    height: convert_length(height)
  })
}
