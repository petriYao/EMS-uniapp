declare interface Fn<T = any> {
  (...arg: T[]): T
}

declare type Recordable<T = any, K extends string | number | symbol = string> = Record<
  K extends null | undefined ? string : K,
  T
>

declare type ContentWrap = Element

// declare module "第三方库"
declare module 'uview-plus'

// declare module 'html2text'
