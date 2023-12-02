export function isEmpty(value: any) {
  if (value === null || value === undefined) {
    return true
  }
  if (typeof value === 'string' && (value === '' || value.trim().length === 0)) {
    return true
  }
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true
  }
  return false
}

/**
 * 防抖
 * */
let timer: any = null
function debounce(fn: any, delay = 300) {
  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
  timer = setTimeout(fn, delay)
}
export default debounce
