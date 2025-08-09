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
