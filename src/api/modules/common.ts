import { Decrypt } from '@/utils/aesUtils'
import { getUploadUrl } from '@/config/config'
import { getHttpHeader } from '@/utils/httpUtils'

export const uploadFileApi = async (
  category: string,
  file?: File,
  filePath?: string,
  duration?: number
): Promise<any> => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: getUploadUrl(), // 替换为你的服务器接口地址
      header: getHttpHeader(),
      formData: {
        category: category,
        duration: duration
      },
      name: 'file', // 服务器接收文件的字段名
      file: file,
      filePath: filePath,
      success: function (uploadRes) {
        const data = JSON.parse(uploadRes.data)
        if (data.success) {
          if (data.encrypted && data.code === 1) {
            const value = Decrypt(data.encrypted, false)
            data.value = JSON.parse(value)
          }
        }
        resolve(data)
        // 处理上传成功的逻辑
      },
      fail: function (error) {
        reject(error)
        // 处理上传失败的逻辑
      }
    })
  })
}
