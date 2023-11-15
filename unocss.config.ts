import presetWeapp from 'unocss-preset-weapp'
import { defineConfig } from 'unocss'
import { transformerAttributify, transformerClass } from 'unocss-preset-weapp/transformer'

export default defineConfig({
  presets: [
    // https://github.com/MellowCo/unocss-preset-weapp
    //引入unocss-preset-weapp预设，该预设提供了一些适用于微信小程序的样式类和样式属性。
    presetWeapp()
  ],
  theme: {},
  //在 CSS 中使用这些快捷方式来快速定义样式
  shortcuts: [
    {
      /**flex布局 */
      'flex-rows': 'flex flex-row items-center',
      'flex-column': 'flex flex-col items-center',
      'flex-center': 'flex flex-row items-center justify-center',

      'border-base': 'border border-gray-500_10',
      'text-c1': 'color-#000/85',
      'text-c2': 'color-#000/65',
      'text-c3': 'color-#000/45',
      'text-c4': 'color-#000/25'
    }
  ],
  transformers: [
    // https://github.com/MellowCo/unocss-preset-weapp/tree/main/src/transformer/transformerAttributify
    //将 HTML 中的属性转换为样式类，例如将  style="color: red;"  转换为  class="color-red"
    transformerAttributify(),
    // https://github.com/MellowCo/unocss-preset-weapp/tree/main/src/transformer/transformerClass
    //将 CSS 中的类名转换为样式，例如将  .color-red { color: red; }  转换为  style="color: red;"
    transformerClass()
  ]
})
