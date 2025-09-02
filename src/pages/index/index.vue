<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { getPushCK } from '@/api/modules/saleOrder'
// import TestInput from './TestInput.vue'
import router from '@/router'
import { UpdateInstallApp } from '@/common/AppUpdate.js'
//报工
const crmList = ref([] as any)

//入库
const crmList2 = ref([] as any)

//销售出库
const crmList3 = ref([] as any)
//库存管理
const crmList4 = ref([] as any)
//领料
const crmList5 = ref([] as any)

//退库退料
const crmList6 = ref([] as any)

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
  //更新
  //UpdateInstallApp()

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
      /*入库*********************************/
      case '12':
        crmList2.value.push({
          name: '生产入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'storage/storage?type=生产入库'
        })
        break
      case '16':
        crmList2.value.push({
          name: '简单入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'storage/storage?type=简单入库'
        })
        break
      case '20':
        crmList2.value.push({
          name: '采购入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'purchaseStockIn/Index'
        })
        break
      case '24':
        crmList2.value.push({
          name: '其他入库',
          icon: '/static/index/Reportingforwork.png',
          src: 'otherInbound/Index'
        })
        break
      /*出库*********************************/
      case '28':
        crmList3.value.push({
          name: '销售出库',
          icon: '/static/index/Reportingforwork.png',
          src: 'lowerCamelCase/PascalCase'
        })
        break
      case '29':
        crmList3.value.push({
          name: '出库撤销',
          icon: '/static/index/Reportingforwork.png',
          src: 'cancelOutbound/Index'
        })
        break

      case '30':
        crmList4.value.push({
          name: '条码库存',
          icon: '/static/index/Reportingforwork.png',
          src: 'barCodeStock/Index'
        })
        break
      case '31':
        crmList4.value.push({
          name: '调拨',
          icon: '/static/index/Reportingforwork.png',
          src: 'transferOrder/Index'
        })
        break
      case '40':
        crmList4.value.push({
          name: '库存查询',
          icon: '/static/index/Reportingforwork.png',
          src: 'stockQuery/Index'
        })
        break
      case '41':
        crmList4.value.push({
          name: '盘点',
          icon: '/static/index/Reportingforwork.png',
          src: 'inventory/Index'
        })
        break
      /*退库退料*********************************/
      case '32':
        crmList6.value.push({
          name: '采购退货',
          icon: '/static/index/Reportingforwork.png',
          src: 'returnMaterial/purchaseReturn/Index'
        })
        break
      case '35':
        crmList6.value.push({
          name: '销售退货',
          icon: '/static/index/Reportingforwork.png',
          src: 'salesReturn/Index'
        })
        break

      /**领料 */
      case '37':
        crmList5.value.push({
          name: '生产领料',
          icon: '/static/index/Reportingforwork.png',
          src: 'materialWithdrawal/production/Index'
        })
        break
      case '38':
        crmList5.value.push({
          name: '简单领料', //SP_PickMtrl
          icon: '/static/index/Reportingforwork.png',
          src: 'materialWithdrawal/simple/Index'
        })
        break
      case '39':
        crmList5.value.push({
          name: '委外领料', //SUB_PickMtrl
          icon: '/static/index/Reportingforwork.png',
          src: 'materialWithdrawal/outsourced/Index'
        })
        break
      case '36':
        crmList5.value.push({
          name: '其他出库',
          icon: '/static/index/Reportingforwork.png',
          src: 'returnMaterial/otherOutbound/Index'
        })
        break
      // case '33':
      //   crmList6.value.push({
      //     name: '生产退库',
      //     icon: '/static/index/Reportingforwork.png',
      //     src: 'returnMaterial/returnStorage/Index'
      //   })
      //   break
      // case '34':
      //   crmList6.value.push({
      //     name: '简单退库',
      //     icon: '/static/index/Reportingforwork.png',
      //     src: 'returnMaterial/returnStorage/Index'
      //   })
      //   break
    }
  }
  // console.log('reactiveData.1', crmList.value)
  // console.log('reactiveData.2', crmList2.value)
})
</script>
<template>
  <!-- <TestInput /> -->
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
    <view class="flex">
      <view class="bg-#FFF mt-20px py-20rpx mx-20px w-100% rounded-6px">
        <view class="ml-20px mb-20px">领料</view>

        <view class="flex flex-wrap">
          <view
            v-for="(item, index) in crmList5"
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
        <view class="ml-20px mb-20px">退库退料</view>

        <view class="flex flex-wrap">
          <view
            v-for="(item, index) in crmList6"
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
        <view class="ml-20px mb-20px">销售</view>

        <view class="flex flex-wrap">
          <view
            v-for="(item, index) in crmList3"
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
        <view class="ml-20px mb-20px">库存管理</view>

        <view class="flex flex-wrap">
          <view
            v-for="(item, index) in crmList4"
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
    <view class="h-100px">&nbsp;</view>
  </view>
  <view
    class="toShoppingCart bg-#409DF4 border-2 border-#F7F8F7 rounded-100rpx"
    v-if="false"
    @tap="scanCode"
  >
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
