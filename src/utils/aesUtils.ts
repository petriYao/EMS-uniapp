import { getDeomeUrl, getVersion } from '@/config/config'
import CryptoJS from 'crypto-js' //引用AES源码js
import { Md5 } from 'ts-md5'
import { getUserIdentity } from '@/hooks/useCache'

//获取密钥
const getOptions = (isPublic: boolean) => {
  let keyStr: string | undefined = ''
  let ivStr: string | undefined = ''
  if (isPublic) {
    const str = 'wx-' + getDeomeUrl() + '-' + getVersion()
    let str_md5 = Md5.hashStr(str)
    for (;;) {
      if (str_md5.length >= 32) {
        break
      }
      str_md5 = str_md5 + str_md5
    }
    keyStr = str_md5.substring(0, 16)
    ivStr = str_md5.substring(16, 32)
  } else {
    const useApp = getUserIdentity()
    keyStr = useApp?.encryptKey as string
    ivStr = useApp?.encryptIv as string
  }

  const key = CryptoJS.enc.Utf8.parse(keyStr)
  const iv = CryptoJS.enc.Utf8.parse(ivStr)
  return {
    key: key,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }
}

// AES加密
export const Encrypt = (word: string, isPublic: boolean) => {
  const options = getOptions(isPublic)
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, options.key, options)
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex)
}

// AES解密
export const Decrypt = (word: string, isPublic: boolean) => {
  const options = getOptions(isPublic)
  const encryptedHexStr = CryptoJS.enc.Hex.parse(word)
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const decrypt = CryptoJS.AES.decrypt(srcs, options.key, options)
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}
