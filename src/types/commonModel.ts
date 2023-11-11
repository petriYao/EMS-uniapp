export type imageDimType = {
  height: number
  width: number
}

export type productImageType = {
  duration: number //时间长度秒
  id: number //文件标识
  imageDim: imageDimType
  listUrl: number //列表图片
  name: string //文件名称
  previewUrl: string //预览图片
  url: string //原文件
}
