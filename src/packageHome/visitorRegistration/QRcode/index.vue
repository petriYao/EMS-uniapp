<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { getImageURL } from '@/utils'
import { ref } from 'vue'
import { myQrcode } from '@/packageHome/utils/wxbarcode'

const imagePath = ref('') // 二维码
const savePath = ref('') //界面
const editClick = () => {
  wx.showShareImageMenu({
    path: savePath.value,
    success: function () {},
    fail: function () {}
  })
}

//保存图片
const saveImageToAlbum = () => {
  wx.authorize({
    scope: 'scope.writePhotosAlbum',
    success() {
      // 用户已授权，可以进行保存图片操作
      saveImage()
    },
    fail() {
      // 用户拒绝授权
      wx.showModal({
        title: '请求权限',
        content: '我们需要获取您的相册权限来保存图片',
        success(res) {
          if (res.confirm) {
            wx.openSetting({
              success(settingdata) {
                if (settingdata.authSetting['scope.writePhotosAlbum']) {
                  // 用户已授权，可以进行保存图片操作
                } else {
                  // 用户拒绝授权
                }
              }
            })
          }
        }
      })
    }
  })
}
const saveImage = () => {
  wx.saveImageToPhotosAlbum({
    filePath: savePath.value,
    success: function (_res) {
      // 可以在这里弹出一个提示框，告诉用户保存成功
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    fail: function (error) {
      // 可以在这里弹出一个提示框，告诉用户保存失败
      wx.showToast({
        title: `保存失败${error}`,
        icon: 'none'
      })
    }
  })
}

onShow(async () => {
  myQrcode('canvasId', 'shu-xiao-bao-YYDS', 420, 420)
  setTimeout(() => {
    wx.canvasToTempFilePath({
      canvasId: 'canvasId',
      success: function (res) {
        imagePath.value = res.tempFilePath
        screenshot()
      },
      fail: function (_res) {}
    })
  }, 500)
})

const screenshot = () => {
  //绘制本页图片
  const canvasWidth = wx.getSystemInfoSync().windowWidth
  const canvasHeight = wx.getSystemInfoSync().windowHeight
  let myTitle = '访客预约二维码'
  let lines = []
  while (myTitle.length > 8) {
    lines.push(myTitle.slice(0, 8))
    myTitle = myTitle.slice(8)
  }
  lines.push(myTitle)

  // 开始绘图
  const ctx = uni.createCanvasContext('screenshot')
  //绘制背景图
  ctx.drawImage(getImageURL('visitorRegistration', 'bg'), 0, 0, canvasWidth, 200)
  // 设置背景颜色
  ctx.setFillStyle('#F6F7FB') // 设置背景颜色为#F6F7FB
  ctx.fillRect(0, 200, canvasWidth, 600) // 填充画板的剩余部分为指定颜色

  // 绘制文字
  ctx.setFontSize(14)
  ctx.setTextAlign('center')
  ctx.setFillStyle('#FFFFFF')
  ctx.fillText('访客预约二维码', canvasWidth / 2, 30)

  // 绘制矩形
  const rectWidth = canvasWidth - 40 // 屏幕宽度减去左右各20rpx
  const rectHeight = 400 // 矩形高度
  const rectX = 20 // 距离屏幕左边20rpx
  const rectY = 60 // 文字下方20px处
  const cornerRadius = 5 // 圆角
  ctx.setFillStyle('#FFFFFF')
  ctx.beginPath()
  ctx.moveTo(rectX + cornerRadius, rectY)
  ctx.lineTo(rectX + rectWidth - cornerRadius, rectY)
  ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius, cornerRadius)
  ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius)
  ctx.arcTo(
    rectX + rectWidth,
    rectY + rectHeight,
    rectX + rectWidth - cornerRadius,
    rectY + rectHeight,
    cornerRadius
  )
  ctx.lineTo(rectX + cornerRadius, rectY + rectHeight)
  ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - cornerRadius, cornerRadius)
  ctx.lineTo(rectX, rectY + cornerRadius)
  ctx.arcTo(rectX, rectY, rectX + cornerRadius, rectY, cornerRadius)
  ctx.closePath()
  ctx.fill()

  // 在矩形内绘制文字
  const text = '该二维码用于来访身份证'
  const textX = ctx.measureText(text).width - 30 // 距离左边距
  const textY = rectY + 30 // 距离上边距10px

  ctx.setFontSize(14)
  ctx.setFillStyle('#196cff')
  ctx.fillText(text, textX, textY)

  // 绘制图片
  const imgSize = canvasWidth - 6 * 20 // 图片的大小为矩形的宽度减去左右边距
  const imgX = (canvasWidth - imgSize) / 2 // 图片的x坐标为矩形的x坐标加上左边距
  const imgY = textY // 图片的y坐标为上一个文字的y坐标加上30px
  // 绘制图片
  ctx.drawImage(imagePath.value, imgX, imgY, imgSize, imgSize) // 替换为你的图片URL

  // 绘制文字
  const text2 = '默认来访日期一天内'
  const textWidth2 = canvasWidth / 2
  const textY2 = imgY + canvasWidth - 6 * 20 + 10 // 文字距离上一张图片10px
  ctx.setFillStyle('#808080') // 设置文字颜色为#808080
  ctx.fillText(text2, textWidth2, textY2)

  const text3 = '有效超过一天后，无法正常出入大门'
  const textY3 = textY2 + 20 // 文字距离上一张图片10px
  ctx.setFillStyle('#808080') // 设置文字颜色为#808080
  ctx.fillText(text3, textWidth2, textY3)

  const text4 = '需要重新申请'
  const textY4 = textY3 + 20 // 文字距离上一张图片10px
  ctx.setFillStyle('#808080') // 设置文字颜色为#808080
  ctx.fillText(text4, textWidth2, textY4)

  ctx.draw(false, () => {
    // 将canvas转换为图片
    wx.canvasToTempFilePath({
      canvasId: 'screenshot',
      success(res) {
        console.log('绘制成功', res.tempFilePath)
        savePath.value = res.tempFilePath
      }
    })
  })
}
</script>

<template>
  <ContentWrap>
    <canvas
      canvas-id="screenshot"
      class="share__canvas"
      style="width: 100%; height: 100%; position: absolute; left: 9999px; z-index: -12"
    >
    </canvas>
    <!-- 头部开始 -->
    <canvas canvas-id="myCanvas" style="width: 100vw; height: 100vh">
      <XWAHeader title="访客预约二维码" leftColor="#FFF" />
      <view class="fixed top-0 w-100%">
        <u-image :src="getImageURL('visitorRegistration', 'bg')" width="100%" height="400rpx" />
      </view>
      <!-- 头部结束 -->
      <view class="bg-[#FFF] rounded-10rpx p-20rpx box relative z-11 mx-40rpx mt-60rpx">
        <view class="text-[#196cff] text-[24rpx] p-20rpx pb-0">该二维码用于来访身份证</view>
        <view class="flex justify-center py-40rpx">
          <canvas canvas-id="canvasId" style="width: 420rpx; height: 420rpx"></canvas>
        </view>
        <view class="flex justify-center flex-col pb-20rpx text-[#808080] text-[28rpx]">
          <view class="flex justify-center">默认来访日期一天内</view>
          <view class="flex justify-center">有效超过一天后，无法正常出入大门</view>
          <view class="flex justify-center">需要重新申请</view>
        </view>
      </view>

      <view class="h-120rpx" />
      <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx flex z-999">
        <view
          class="w-[50%] bg-[#1957E6] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center mr-10rpx"
          hover-class="button-spread"
          @click="saveImageToAlbum"
          >保存</view
        >
        <view
          class="w-[50%] bg-[#1957E6] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center ml-10rpx"
          hover-class="button-spread"
          @click="editClick"
          >分享</view
        >
      </view>
    </canvas>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-navbar__content) {
  background-color: transparent !important;
  color: #fff !important;
}
:deep(.u-status-bar) {
  background-color: transparent !important;
}
.box {
  box-shadow: 6px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
