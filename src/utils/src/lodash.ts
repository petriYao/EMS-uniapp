import { debounce, throttle, cloneDeep, isEmpty, set, isEqual, isString } from 'lodash-es'

const debounceDef = (f: (...args: any) => any) => {
  return debounce(f, 300)
}

const debounceSave = (f: (...args: any) => any) => {
  return debounce(f, 300)
}

export { debounce, debounceDef, debounceSave, throttle, cloneDeep, isEmpty, set, isEqual, isString }
