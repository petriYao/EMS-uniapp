const fs = require('fs')
const path = require('path')
/**--------------复制内容--------------------*/
const fixPath = path.resolve(__dirname, './_freeGlobal.js')
const commonFix = path.resolve(__dirname, '../node_modules/lodash-es/_freeGlobal.js')

//复制文件
fs.writeFileSync(commonFix, fs.readFileSync(fixPath, 'utf8'))
