let main
let filter
let receiver
let tag = false
/**
 * 开始广播监听扫码
 */
const start = () => {
  /* #ifdef APP-PLUS */
  main.registerReceiver(receiver, filter)
  /* #endif */
}

/**
 * 停止广播监听扫码
 * that：传this；
 */
const stop = () => {
  /* #ifdef APP-PLUS */
  main.unregisterReceiver(receiver)
  /* #endif */
}

/**  剩余下个变量已经做了全局变量
 *
 * 定义广播
 * that：传this；
 */
const init = (onReceive) => {
  /* #ifdef APP-PLUS */
  //获取activity
  main = plus.android.runtimeMainActivity()
  const IntentFilter = plus.android.importClass('android.content.IntentFilter')
  filter = new IntentFilter()
  // 扫描设置的广播名称A(上面指代了）
  filter.addAction('android.intent.ACTION_DECODE_DATA')
  receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
    onReceive: function (context, intent) {
      plus.android.importClass(intent)
      // 扫描设置的标签名称B(上面指代了）
      const code = intent.getStringExtra('barcode_string')
      if (tag) return
      tag = true
      setTimeout(function () {
        tag = false
      }, 150)
      //到这里扫描成功了，可以调用自己的业务逻辑，code就是扫描的结果    return出code进行业务处理
      onReceive && onReceive(code)
    }
  })
  /* #endif */
}

export const broadcastScan = {
  init,
  start,
  stop
}
