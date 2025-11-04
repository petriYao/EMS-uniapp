<script setup lang="ts">
import { login, loginPDAUser, loginPDAUserRole, getAuxiliaryMaterials } from '@/api'
import FromData from '@/common/FromIDs.json'
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const reactiveData = reactive({
  username: '',
  password: '',
  checked: [] as string[],
  msgshow: false,
  msgcontent: ''
})

const checkboxChange = () => {
  if (reactiveData.checked.length > 0) {
    uni.removeStorageSync('username')
  }
}
//权限对照
// 1登录
// 2生产工单
// 3生产汇报
// 4开工
// 5报工 --作废，以菜单权限为主
// 6转移
// 7关闭/反关闭
// 8生产工单-菜单
// 9生产报工-菜单
// 10删除
//11 提交
//获取权限
const NavChange = async () => {
  if (reactiveData.checked.length > 0) {
    uni.setStorageSync('username', reactiveData.username)
  }
  if (reactiveData.username.length == 0) {
    reactiveData.msgshow = true
    reactiveData.msgcontent = '请填写用户名！'
    return false
  }
  let newdata = {
    acctID: `${FromData.acctID}`,
    username: reactiveData.username,
    password: reactiveData.password,
    lcid: 2052
  }
  try {
    const { data: res }: any = await login(newdata)
    let userid = 0
    if (res != null) {
      let result = res.LoginResultType

      if (result === 1) {
        // LoginResultType =1 表示登录成功
        userid = res.Context.UserId
        // let token = res.Context.UserToken
        let SessionId = res.Context.SessionId
        uni.setStorageSync('SessionId', SessionId) //cookie的 ASP.NET_SessionId 值，需要用这个值写入cookie进行后续操作。
        let KDSVCSessionId = res.KDSVCSessionId
        uni.setStorageSync('KDSVCSessionId', KDSVCSessionId) // 注释：cookie的 kdservice-sessionid 值，需要用这个值写入cookie，同时写入reqeust的headers， kdservice-sessionid = a7066f3d-f09c-44eb-8fa5-d2a971e109dc 。
        //验证PDA用户信息是否存在
        const { data: res_user }: any = await loginPDAUser(reactiveData.username)
        if (res_user.length > 0) {
          for (var i = 0; i < res_user.length; i++) {
            let item = res_user[i]
            let userFid = item[5]
            if (userid == userFid) {
              const { data: roles }: any = await loginPDAUserRole(item[4])
              if (roles.length > 0) {
                let Filter = ''
                roles.forEach((item: any) => {
                  Filter += `'${item[2].toString()}'`
                  Filter += ','
                })
                //删除最后一个逗号
                Filter = Filter.substring(0, Filter.length - 1)

                const { data: auxRes }: any = await getAuxiliaryMaterials(
                  'FNumber,FDataValue,FMASTERID',
                  `FMASTERID in (${Filter})`
                )
                if (auxRes.length > 0) {
                  let authority = [] as string[]
                  auxRes.forEach((item: any) => {
                    authority.push(item[0])
                  })
                  uni.setStorageSync('UserAuthority', authority)
                  if (uni.getStorageSync('UserAuthority') != null) {
                    uni.switchTab({
                      url: '/pages/index/index'
                    })
                  }
                }
              } else {
                reactiveData.msgshow = true
                reactiveData.msgcontent = '该用户未授权！'
                return false
              }
            } else {
              reactiveData.msgshow = true
              reactiveData.msgcontent = 'PDA用户绑定错误！'
              return false
            }
          }
        }
      } else {
        reactiveData.msgshow = true
        reactiveData.msgcontent = '用户或密码错误'
        return false
      }
    } else {
      reactiveData.msgshow = true
      reactiveData.msgcontent = '用户不存在！'
      return false
    }
  } catch (e) {
    // reactiveData.msgshow = true;
    // reactiveData.msgcontent = "网络异常！";
    // return false
  }
}

onLoad(() => {
  if (uni.getStorageSync('username') != '') {
    reactiveData.username = uni.getStorageSync('username')
    reactiveData.checked = ['1']
  }
})
</script>
<template>
  <view class="w-100%">
    <image src="@/static/login.png" class="image-clz" mode="widthFix" />

    <view class="w-100% my-20rpx">
      <view class="flex items-center px-20rpx mb-20rpx">
        <view class="">账号</view>
        <u-input clearable v-model="reactiveData.username" placeholder="请填写账号" />
      </view>
      <view class="flex items-center px-20rpx mb-20rpx">
        <view>密码</view>
        <u-input
          :password="true"
          clearable
          v-model="reactiveData.password"
          placeholder="请填写密码"
        />
      </view>

      <u-checkbox-group
        v-model="reactiveData.checked"
        style="margin-left: 20rpx"
        @change="checkboxChange"
      >
        <u-checkbox name="1" label="记住账号" size="16px" />
      </u-checkbox-group>
    </view>
    <view class="flex mx-20rpx">
      <u-button type="primary" color="#0789c1" text="登录" @click="NavChange" />
    </view>
    <view class="clearfix" />
    <u-modal
      :show="reactiveData.msgshow"
      title="提示"
      :content="reactiveData.msgcontent"
      contentTextAlign="center"
      @confirm="reactiveData.msgshow = false"
    />
  </view>
</template>
<style lang="scss" scoped>
.image-clz {
  flex-shrink: 0;
  height: 400rpx !important;
  width: 100%;
}
</style>
