import { PDAAppupdate } from '@/api'
//检查系统版本号实现更新
export async function UpdateInstallApp() {
  const { data: res } = await PDAAppupdate()
  console.log('检测更新', res)
  plus.runtime.getProperty(plus.runtime.appid, function (widgetinfo) {
    let version = widgetinfo.version //用户当前手机安装版本号
    uni.setStorageSync('Appversion', version)
    // uni.showToast({
    // 	title: `版本号${version}`,
    // 	icon: 'success',
    // 	duration: 2000
    // })
    let versionnumber = res[0][0] //服务器维护版本号
    let updateUrl = res[0][1]
    if (parseFloat(versionnumber) > parseFloat(version)) {
      uni.downloadFile({
        url: updateUrl,
        success: (download) => {
          console.log('download', download)
          if (download.statusCode == 200) {
            plus.runtime.install(
              download.tempFilePath,
              {
                force: false
              },
              () => {
                plus.runtime.restart() //更新成功启动
              },
              (err) => {
                //若没下载成功还是去下载
                uni.showToast({
                  title: '更新失败,请联系管理员!',
                  icon: 'none',
                  duration: 2000
                })
              }
            )
          }
        }
      })
    }
  })
  // plus.runtime.getProperty(plus.runtime.appid, function(widgetinfo) {
  // 	let version = widgetinfo.version; //用户当前手机安装版本号
  // 	console.log("version - AppServerversion",version,versionnumber);
  // 	console.log("updateUrl",updateUrl);
  // 	if (parseFloat(versionnumber) > parseFloat(version)) {
  // 		console.log("准备更新");
  // 		//开始更新

  // 		uni.showModal({
  // 			title: "更新提示",
  // 			confirmText: "立即升级",
  // 			content: "发现新版本,建议立即更新!",
  // 			success: (src) => {
  // 				console.log("src", src);
  // 				if (src.confirm) {
  // 					uni.showLoading({
  // 						title: "正在更新",
  // 						mask: true
  // 					})
  // 					uni.downloadFile({
  // 						url: updateUrl,
  // 						success: (download) => {
  // 							console.log("download", download);
  // 							if (download.statusCode == 200) {
  // 								plus.runtime.install(download.tempFilePath, {
  // 									force: false
  // 								}, () => {
  // 									uni.hideLoading();
  // 									plus.runtime.restart(); //更新成功启动
  // 								}, (err) => { //若没下载成功还是去下载
  // 									uni.hideLoading();
  // 									uni.showToast({
  // 										title: "更新失败,请联系管理员!",
  // 										icon: "none",
  // 										duration: 2000
  // 									})
  // 								})
  // 								setTimeout(function() {
  // 									plus.runtime.openURL(updateUrl);
  // 								}, 2000)
  // 							}
  // 						}
  // 					})
  // 				} else if (res.cancel) {
  // 					console.log('用户点击取消');
  // 					uni.showToast({
  // 						title: "无法继续使用低版本MESAPP,请先升级",
  // 						icon: "none",
  // 						duration: 2000
  // 					})
  // 					//退出app
  // 					setTimeout(function() {
  // 						plus.runtime.quit();
  // 					}, 2000)
  // 				}
  // 			},
  // 			fail: () => {
  // 				uni.hideLoading();
  // 			}
  // 		})
  // 	}
  // })
}
