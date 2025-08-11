<template>
  <view>
    <view style="margin-top: 300rpx; width: 100%; text-align: center"
      >当前版本号：{{ Appversion }}</view
    >
    <view style="margin-top: 500rpx">
      <button type="primary" style="width: 90%" @click="NavChange">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      Appversion: ''
    }
  },
  mounted() {
    this.Appversion = uni.getStorageSync('Appversion')
  },
  methods: {
    NavChange() {
      //删除存储认证信息
      uni.removeStorageSync('SessionId')
      uni.removeStorageSync('KDSVCSessionId')
      uni.removeStorageSync('username')
      uni.removeStorageSync('UserAuthority')
      uni.removeStorageSync('productionreporting_showIcon')
      uni.removeStorageSync('productionorder_showIcon')
      uni.removeStorageSync('processlist_showIcon')
      uni.removeStorageSync('F_WOMW__JJType') //报工类型
      uni.removeStorageSync('Appversion') //报工类型
      //uni.removeStorageSync('thisPageData'); //生成工单列表清空
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }
  }
}
</script>

<style></style>
