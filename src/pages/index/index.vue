<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue'
import { getPushCK } from '@/api/modules/saleOrder'
import router from '@/router'

const reactiveData = reactive({
  UserAuthoritylist: [] as any
})

//报工
const crmList = ref([] as any)

//入库
const crmList2 = ref([
  {
    name: '生产入库',
    icon: 'https://cdn.uviewui.com/uview/album/1.jpg',
    src: 'storage/storage?type=生产入库'
  },
  {
    name: '简单生产入库',
    icon: 'https://cdn.uviewui.com/uview/album/1.jpg',
    src: 'storage/storage?type=简单生产入库'
  },
  {
    name: '采购入库',
    icon: 'https://cdn.uviewui.com/uview/album/1.jpg',
    src: 'storage/storage?type=采购入库'
  },
  {
    name: '其他入库',
    icon: 'https://cdn.uviewui.com/uview/album/1.jpg',
    src: 'storage/storage?type=其他入库'
  }
] as any)

const NavChange = (pages: any) => {
  console.log('pages', pages)
  uni.navigateTo({
    url: `/pages/${pages}`
  })
}

//扫描条形码
const scanCode = async () => {
  console.log('条码类型点击:')
  const saleRes: any = await getPushCK('XSDD000001')
  console.log('saleRes', saleRes.data.Result.ResponseStatus.SuccessEntitys[0].Id)
  router.push({
    url: `/pages/saleOrder/OutboundOrder?id=${saleRes.data.Result.ResponseStatus.SuccessEntitys[0].Id}`
  })

  return
  uni.scanCode({
    onlyFromCamera: true,
    success: async function (res: any) {
      console.log('条码类型:' + res.scanType)
      console.log('条码内容:' + res.result)
      //跳转并传参
      //1.下推
      const saleRes: any = await getPushCK(res.result)
      console.log('saleRes', saleRes)
      //2.带参跳转
      router.push({
        url: `/pages/saleOrder/OutboundOrder?id=${saleRes.data.Result.ResponseStatus.SuccessEntitys[0].Id}`
      })
    }
  })
}

onBeforeMount(() => {
  let UserAuthority = uni.getStorageSync('UserAuthority')
  crmList.value = []
  crmList2.value = []
  for (const item of UserAuthority) {
    switch (item) {
      case '8':
        crmList.value.push({
          name: '生产工单',
          icon: '/static/index/workorder.png',
          src: 'productionorder/productionorder'
        })
        break
      case '9':
        crmList.value.push({
          name: '生产报工',
          icon: '/static/index/Reportingforwork.png',
          src: 'productionreporting/productionreporting'
        })
        break
      case '12':
        crmList2.value.push({
          name: '生产入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'storage/storage?type=生产入库'
        })
        break
      case '16':
        crmList2.value.push({
          name: '简单生产入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'storage/storage?type=简单生产入库'
        })
        break
      case '20':
        crmList2.value.push({
          name: '采购入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'storage/storage?type=采购入库'
        })
        break
      case '24':
        crmList2.value.push({
          name: '其他入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'storage/storage?type=其他入库'
        })
        break
    }
  }
  console.log('reactiveData.1', crmList.value)
  console.log('reactiveData.2', crmList2.value)
})
</script>
<template>
  <view class="text-14px">
    <view class="flex">
      <view class="bg-#FFF py-20rpx mx-20px w-100% rounded-6px">
        <view class="ml-20px mb-20px">报工</view>

        <view class="flex flex-wrap">
          <view
            v-for="(item, index) in crmList"
            :key="index"
            class="w-25%"
            @click="NavChange(item.src)"
          >
            <view class="flex justify-center">
              <u-image :src="item.icon" mode="scaleToFill" width="80rpx" height="80rpx" />
            </view>
            <view class="flex justify-center">{{ item.name }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="flex">
      <view class="bg-#FFF mt-20px py-20rpx mx-20px w-100% rounded-6px">
        <view class="ml-20px mb-20px">入库</view>

        <view class="flex flex-wrap">
          <view
            v-for="(item, index) in crmList2"
            :key="index"
            class="w-25%"
            @click="NavChange(item.src)"
          >
            <view class="flex justify-center">
              <u-image :src="item.icon" mode="scaleToFill" width="80rpx" height="80rpx" />
            </view>
            <view class="flex justify-center">{{ item.name }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <view class="toShoppingCart bg-#409DF4 border-2 border-#F7F8F7 rounded-100rpx" @tap="scanCode">
    <u-icon name="plus" size="30px" color="#FFFFFF" />
  </view>
</template>

<style lang="less" scoped>
.toShoppingCart {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 140rpx;
  right: 40rpx;
  width: 50px;
  height: 50px;
  box-shadow: -6rpx 7px 13rpx 1px rgba(43, 42, 42, 0.196);
}
</style>
