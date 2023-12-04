<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { AppSetInfoType } from '@/types/commonModel'
import { AppSetInfoApi } from '@/api'

import UniversalPark from '@components/UniversalPark/index.vue'
import noData from '@components/noData/NoData.vue'
import { getSvgURL } from '@/utils'

// 轮播图
const imgObj = ref({} as AppSetInfoType)

const dataObj = [
  {
    title: '产业E家',
    baseList: [
      {
        icon: 'serve_policy_advisory',
        title: '政策咨询'
      },
      {
        icon: 'serve_policy_declare',
        title: '政策申报'
      },
      {
        icon: 'serve_qualification_handling',
        title: '资质办理'
      },
      {
        icon: 'serve_smart_party_building',
        title: '智慧党建'
      },
      {
        icon: 'serve_talent_platform',
        title: '人才平台'
      },
      {
        icon: 'serve_financial_services',
        title: '金融服务'
      },
      {
        icon: 'serve_legal_services',
        title: '法律服务'
      }
    ]
  },
  {
    title: '管家E站',
    baseList: [
      {
        icon: 'serve_visitor_registration',
        title: '访客登记'
      },
      {
        icon: 'serve_parking_payment',
        title: '停车缴费'
      },
      {
        icon: 'serve_report_for_repair',
        title: '报事报修'
      },
      {
        icon: 'serve_travel_traffic',
        title: '出行交通'
      },
      {
        icon: 'serve_park_guide',
        title: '园区导览'
      },
      {
        icon: 'serve_consulting_suggestions',
        title: '咨询建议'
      }
    ]
  },
  {
    title: '智慧生活',
    baseList: [
      {
        icon: 'serve_advertising_image',
        title: '广告图文'
      },
      {
        icon: 'serve_takeaway_delivery',
        title: '外卖快递'
      },
      {
        icon: 'serve_cleaning_service',
        title: '清洁服务'
      },
      {
        icon: 'serve_shared_tea_room',
        title: '共享茶室'
      },
      {
        icon: 'serve_shared_meeting',
        title: '共享会议'
      },
      {
        icon: 'serve_electronic_invoice',
        title: '电子发票'
      },
      {
        icon: 'serve_employees_home',
        title: '员工之家'
      }
    ]
  },
  {
    title: '招商E通',
    baseList: [
      {
        icon: 'serve_viewing_reservation',
        title: '看房预约'
      },
      {
        icon: 'serve_housing_consultation',
        title: '房源咨询'
      }
    ]
  },
  {
    title: '社群E站',
    baseList: [
      {
        icon: 'serve_community_activities',
        title: '社群活动'
      },
      {
        icon: 'serve_Park_ECircle',
        title: '园区E圈'
      }
    ]
  }
]

const getParkProfile = async () => {
  const res = await AppSetInfoApi('serviceCarouselImage')
  if (res.success && res.value) {
    imgObj.value = res.value
  }
}

onMounted(() => {
  getParkProfile()
})
</script>

<template>
  <ContentWrap>
    <Header :isLeftIcon="false" title="服务" />
    <!-- 头部结束 -->
    <template v-for="(item, index) in dataObj" :key="index">
      <view class="bg-white py-10rpx m-20rpx">
        <view class="pl-24rpx mx-40rpx my-20rpx text-32rpx font-600 line">{{ item.title }}</view>
        <view>
          <u-grid :border="false" :col="4">
            <u-grid-item
              v-for="(baseListItem, baseListIndex) in item.baseList"
              :key="baseListIndex"
            >
              <u-icon
                :customStyle="{ paddingTop: 20 + 'rpx' }"
                :name="getSvgURL('serve', baseListItem.icon)"
                :size="22"
              />
              <text class="grid-text">{{ baseListItem.title }}</text>
            </u-grid-item>
          </u-grid>
        </view>
      </view>
      <view
        v-if="index === 1 && (imgObj.content || imgObj.imageArray || imgObj.title)"
        class="h-200rpx mx-20rpx"
      >
        <UniversalPark :data="imgObj" fixedHeightL="200rpx" />
      </view>
    </template>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-swiper) {
  padding-bottom: 0 !important;
  background: #f6f7fb !important;
}
.line {
  position: relative;
}
.line::after {
  position: absolute;
  content: '';
  width: 2px;
  height: 30rpx;
  left: 0;
  top: 8rpx;
  background: #1957e6;
}
.grid-text {
  font-size: 22rpx;
  padding: 20rpx 0 30rpx 0rpx;
  /* #ifndef H5 */
  box-sizing: border-box;
  /* #endif */
}

.p-20rpx {
}

.indicator {
  @include flex(row);
  justify-content: center;

  &__dot {
    height: 8rpx;
    width: 8rpx;
    border-radius: 100px;
    background-color: #cacaca;
    margin: 0 8rpx;
    transition: background-color 0.3s;

    &--active {
      width: 40rpx;
      height: 8rpx;
      background-color: #9d9d9d;
    }
  }
}
.indicator-num {
  padding: 4rpx 0;
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: 200rpx;
  width: 70rpx;
  @include flex;
  justify-content: center;

  &__text {
    color: #ffffff;
    font-size: 24rpx;
  }
}
</style>
