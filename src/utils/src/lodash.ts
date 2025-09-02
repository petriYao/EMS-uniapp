import { debounce, throttle, cloneDeep, isEmpty, set, isEqual, isString } from 'lodash-es'

const debounceDef = (f: (...args: any) => any) => {
  return debounce(f, 300)
}

const debounceSave = (f: (...args: any) => any) => {
  return debounce(f, 300)
}

const throttleSave = (f: (...args: any) => any, p0?: number) => {
  return throttle(f, 3000)
}
// function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
//   let timer: ReturnType<typeof setTimeout> | null = null
//   return function (this: any, ...args: Parameters<T>) {
//     if (timer) clearTimeout(timer)
//     timer = setTimeout(() => fn.apply(this, args), delay)
//   }
// }
export {
  debounce,
  debounceDef,
  debounceSave,
  throttleSave,
  throttle,
  cloneDeep,
  isEmpty,
  set,
  isEqual,
  isString
}
