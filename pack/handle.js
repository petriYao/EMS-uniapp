const fs = require('fs')
const path = require('path')

const str = process.argv[2]

/**------------删除文件--------------*/
const imgDir = path.join(__dirname, `../dist/${str}/mp-weixin/static/img`)
const svgDir = path.join(__dirname, `../dist/${str}/mp-weixin/static/svg`)
delDir(imgDir)
delDir(svgDir)

function delDir(path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file) => {
      let curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    })
    fs.rmdirSync(path)
  }
}

// /**--------------复制内容--------------------*/
// const fixPath = path.resolve(__dirname, './fix.js')
// const commonFix = path.resolve(__dirname, `../dist/${str}/mp-weixin/common/fix.js`)
// const commonPath = path.resolve(__dirname, `../dist/${str}/mp-weixin/common/vendor.js`)

// // 新的内容
// const content = 'require("./fix");'

// //复制文件
// copyFile(fixPath, commonFix)

// // 执行
// writeFileToHead(commonPath, Buffer.from(content))

// //拷贝文件
// function copyFile(path, path2) {
//   if (fs.existsSync(path2)) {
//     return
//   }
//   fs.writeFileSync(path2, fs.readFileSync(path, 'utf8'))
// }

// // 把内容写入到文件的头部
// function writeFileToHead(basePath, value) {
//   let data = fs.readFileSync(basePath, 'utf8')
//   let temp = data.slice(13, value.length)
//   if (temp == value) {
//     return
//   }
//   data = data.slice(0, 13) + value + data.slice(13)
//   fs.writeFileSync(basePath, data)
// }
