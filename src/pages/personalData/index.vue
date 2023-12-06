<script setup lang="ts">
import { getUserInfoApi, updateUserApi, uploadFileApi } from '@/api'
import { UserHeadType, UserInfoType } from '@/types/userModel'
import { onLoad } from '@dcloudio/uni-app'
import { reactive } from 'vue'
import { ref } from 'vue'

const userHead = ref<UserHeadType>()
const userInfo = ref<UserInfoType>()
//当前点击单元格信息
const sheet = reactive({
  show: false,
  title: '',
  value: '',
  parameter: ''
})

//当前修改性别信息
const sheetSex = reactive({
  show: false,
  title: '',
  value: '',
  parameter: '',
  list: [] as any[]
})

/**获取当前用户信息 */
const getUserInfo = async () => {
  const res = await getUserInfoApi()
  if (res.success) {
    userHead.value = res.value?.userHead
    userInfo.value = res.value?.userInfo
  }
}

/**上传图片 */
const uploadImg = async (tempFile: any) => {
  const res = await uploadFileApi('avatar', tempFile, tempFile?.path)
  if (res.success) {
    sheet.value = res.value.id
    sheet.parameter = 'avatarId'
    onSave()
  }
}

/**点击单元格 */
const onCell = (title: string) => {
  switch (title) {
    case '头像':
      uni.chooseImage({
        count: 1, // 最多可选择的图片数量
        sourceType: ['album', 'camera'], // 图片选择的来源，可选相册或相机
        success: (res) => {
          const tempFiles = res.tempFiles as any
          uploadImg(tempFiles[0])
        },
        fail: (_err) => {}
      })
      break
    case '昵称':
      sheet.title = title
      sheet.value = userInfo.value?.userNickname ?? ''
      sheet.parameter = 'userNickname'
      sheet.show = true
      break
    case '性别':
      sheetSex.parameter = 'sex'
      sheetSex.list = [
        {
          name: '男'
        },
        {
          name: '女'
        },
        {
          name: '保密'
        }
      ]
      sheetSex.show = true
      break
    case 'QQ':
      sheet.title = title
      sheet.value = userInfo.value?.qq ?? ''
      sheet.parameter = 'qq'
      sheet.show = true
      break
    case '邮箱':
      sheet.title = title
      sheet.value = userInfo.value?.email ?? ''
      sheet.parameter = 'email'
      sheet.show = true
      break
    case '手机号码':
      sheet.title = title
      sheet.value = userInfo.value?.userPhoneNumber ?? ''
      sheet.parameter = 'userPhoneNumber'
      sheet.show = true
      break
    default:
      break
  }
}

/**修改信息 */
const onSave = async (isSex?: boolean, valSex?: { name: string }) => {
  let data = {} as any
  if (isSex) {
    data[sheetSex.parameter] = valSex?.name === '男' ? 1 : valSex?.name === '女' ? 2 : 0
  } else {
    data[sheet.parameter] = sheet.value
  }
  const res = await updateUserApi(data)
  if (res.success) {
    getUserInfo()
    sheet.show = false
    sheetSex.show = false
  }
}

onLoad(() => {
  getUserInfo()
})
</script>

<template>
  <ContentWrap>
    <XWAHeader title="个人资料" />
    <!-- 头部 -->
    <view class="m-30rpx p-30rpx bg-#FFF rounded-20rpx">
      <view class="flex-rows">
        <view class="mr-30rpx">
          <u-avatar :src="userHead?.avatarImage.listUrl" size="100rpx" />
        </view>
        <view class="flex flex-col justify-between h-120rpx">
          <view class="text-30rpx">{{ userHead?.title }}</view>
          <view class="text-24rpx text-#999999">{{ userHead?.content }}</view>
          <view class="flex-rows">
            <view v-for="(item, index) in userHead?.tags" :key="index" class="mr-10rpx">
              <u-tag
                :text="item.title"
                :plain="item.isPlain === 1"
                :color="item.color"
                :bgColor="item.background"
                :borderColor="item.background"
              />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 单元格 -->
    <view class="bg-[#F6F7FB] p-30rpx box position-relative z-1">
      <view class="table bg-#FFF py-10rpx rounded-20rpx">
        <view
          class="table-item flex-rows justify-between px-40rpx py-30rpx"
          @click="onCell('头像')"
        >
          <view>
            <view class="flex-rows">
              <view class="text-28rpx">头像</view>
            </view>
          </view>
          <view class="flex-rows">
            <image
              class="rounded-999"
              :src="userInfo?.avatarImage?.listUrl"
              mode="aspectFill"
              style="width: 60rpx; height: 60rpx"
            />
            <u-icon name="arrow-right" size="34rpx" />
          </view>
        </view>
        <view
          class="table-item flex-rows justify-between px-40rpx py-30rpx"
          @click="onCell('昵称')"
        >
          <view class="flex-rows">
            <view class="text-28rpx">昵称</view>
          </view>
          <view class="flex-rows">
            <view class="text-#999999">{{ userInfo?.userNickname }}</view>
            <u-icon name="arrow-right" size="34rpx" />
          </view>
        </view>
        <view
          class="table-item flex-rows justify-between px-40rpx py-30rpx"
          @click="onCell('性别')"
        >
          <view class="flex-rows">
            <view class="text-28rpx">性别</view>
          </view>
          <view class="flex-rows">
            <view class="text-#999999">{{
              userInfo?.sex === 0 ? '保密' : userInfo?.sex === 1 ? '男' : '女'
            }}</view>
            <u-icon name="arrow-right" size="34rpx" />
          </view>
        </view>
        <view class="table-item flex-rows justify-between px-40rpx py-30rpx" @click="onCell('QQ')">
          <view class="flex-rows">
            <view class="text-28rpx">QQ</view>
          </view>
          <view class="flex-rows">
            <view class="text-#999999">{{ userInfo?.qq }}</view>
            <u-icon name="arrow-right" size="34rpx" />
          </view>
        </view>
        <view
          class="table-item flex-rows justify-between px-40rpx py-30rpx"
          @click="onCell('手机号码')"
        >
          <view class="flex-rows">
            <view class="text-28rpx">手机号码</view>
          </view>
          <view class="flex-rows">
            <view class="text-#999999">{{ userInfo?.userPhoneNumber }}</view>
            <u-icon name="arrow-right" size="34rpx" />
          </view>
        </view>
        <view
          class="table-item flex-rows justify-between px-40rpx py-30rpx"
          @click="onCell('邮箱')"
        >
          <view class="flex-rows">
            <view class="text-28rpx">邮箱</view>
          </view>
          <view class="flex-rows">
            <view class="text-#999999">{{ userInfo?.email }}</view>
            <u-icon name="arrow-right" size="34rpx" />
          </view>
        </view>
      </view>
    </view>
    <u-action-sheet
      :actions="sheetSex.list"
      :show="sheetSex.show"
      cancelText="取消"
      @select="onSave(true, $event)"
      @close="sheetSex.show = false"
    />
    <u-action-sheet :show="sheet.show" @close="sheet.show = false" :round="10">
      <view class="flex-rows px-60rpx mt-30rpx position-relative">
        <view>{{ sheet.title }}:</view>
        <view class="input">
          <u-input placeholder="请输入内容" v-model="sheet.value" clearable focus autoBlur />
        </view>
      </view>
      <view class="bg-#1c59e6 m-60rpx p-10rpx rounded-full" @click="onSave(false)">
        <view class="text-#fff">保存</view>
      </view>
    </u-action-sheet>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-tag--medium) {
  height: unset !important;
  line-height: normal !important;
  padding: 0 6rpx !important;
}
:deep(.u-tag__text--medium) {
  font-size: 24rpx !important;
  line-height: normal !important;
}
.table-item {
  position: relative;
  &:not(:last-child):after {
    /* 绝对定位到父元素低端，可以通过left/right的值控制边框长度或者定义width:100%;*/
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    /* 初始化边框 */
    content: '';
    box-sizing: border-box;
    height: 1px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    /* 以上代码，实现了一个边框为1px的元素，下面实现0.5px边框*/
    transform: scaleY(0.5); // 元素Y方向缩小为原来的0.5
    transform-origin: 0 0; // CSS属性让你更改一个元素变形的原点
  }
}
.input {
  flex: 1;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.2);
}

:deep(.u-action-sheet__item-wrap__item) {
  padding: 30rpx !important;
}
</style>
