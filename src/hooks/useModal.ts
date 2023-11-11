import { useModalStore } from '@/store'
import { clearUserIdentity } from './useCache'

//显示加载
export const showLoading = (title = '') => {
  const useModal = useModalStore()
  if (useModal.show) {
    return
  }
  useModal.setData({ type: 0, show: true, title, content: '' })
}

//隐藏加载
export const hideLoading = () => {
  const useModal = useModalStore()
  if (useModal.show && useModal.type == 0) {
    useModal.setData({ type: 0, show: false, title: '', content: '' })
    return
  }
}

//显示错误
export const showError = (message?: string) => {
  const useModal = useModalStore()
  if (useModal.show && useModal.type == 2) {
    return
  }
  useModal.setData({ type: 1, show: true, title: '错误', content: message ?? '错误' })
}

//显示未登录
export const showNoLogin = (message: string, isNotClear?: boolean) => {
  if (!isNotClear) clearUserIdentity()
  const title = message.indexOf('未绑定') === 0 ? '未绑定' : '未登录'
  const useModal = useModalStore()
  useModal.setData({
    type: 2,
    show: true,
    title,
    content: message ?? '未登录，是否登录？'
  })
}

//使用加载
export const showLoaded = (f: () => void, title = '') => {
  showLoading(title)
  try {
    f()
  } finally {
    hideLoading()
  }
}
