<script setup lang="ts">
import { ref } from 'vue'
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { initCacheIamge, initApp, getHomeIndex } from '@/hooks/useApp'

const isLaunch = ref(false)

//APP实例，打开小程序的时候运行
onLaunch(async () => {
  initCacheIamge()
  await initApp()
})

onShow(() => {
  //统计数据
  if (isLaunch.value) getHomeIndex()
  isLaunch.value = true
})
</script>
<style lang="scss">
@import 'uview-plus/theme.scss';
</style>
