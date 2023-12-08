<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import {
  getCustomDateColumn,
  getInputColumn,
  getSelectColumn,
  getTextareaColumn,
  getUploadPicturesColumn
} from '@/utils'
import { useAppStore } from '@/store'
import debounce, { isEmpty } from '@/utils/toolUtils'
import router from '@/router'
import { ReportRepairsAddApi, ReportRepairsInfoApi } from '@/api'
import { ReportRepairsInfoType } from '@/types/reportRepairsModel'

import BottomButton from '@/components/BottomButton/index.vue'
import FormPartItem from '@/components/Form/FormPart.vue'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')

const headerTitle = ref('添加报事报修')
const butTitle = ref('立即提交')
const infoData = ref({
  position: '', //所在位置
  content: '', //问题描述
  imageIdArray: '', //图片
  reportRepairsType: 20, //所属分类
  reservationAt: '' //预约时间
} as ReportRepairsInfoType)
const formDataRef = ref()
const reactiveData = reactive({
  formData: [] as any[], //基础信息
  rules: {} as any,
  editData: [] as any,
  contactName: '' as string,
  contactPhone: '' as number | string,
  reportRepairsId: undefined as undefined | number,
  disabled: false
})

//提交
const saveClick = () => {
  debounce(async () => {
    const edit = formDataRef.value.saveClick()
    Object.assign(reactiveData.editData, edit)

    const data = {
      ...reactiveData.editData,
      contactName: reactiveData.contactName,
      contactPhone: reactiveData.contactPhone
    }
    const res = await ReportRepairsAddApi(data, reactiveData.reportRepairsId)
    if (res.success) {
      router.back()
    }
  })
}

const onFormData = () => {
  reactiveData.formData = [
    getInputColumn('位置', 'position', '请输入产品名称', { columnStyle: 'column-style' }),
    getTextareaColumn('请输入问题描述', 'content', '', {
      columnStyle: 'column-style',
      inputStyle: 'input-style'
    }),
    getUploadPicturesColumn('上传图片', 'imageArray', 'imageIdArray', 9, 'reportRepairs', {
      columnStyle: 'column-style-img'
    }),
    getSelectColumn(
      '问题所属分类',
      'reportRepairsType',
      [
        [
          { label: '报事', value: 1 },
          { label: '报修/其他', value: 20 }
        ]
      ],
      '请选择分类',
      {
        columnStyle: 'column-style-select',
        inputStyle: 'input-style-select'
      }
    ),
    getCustomDateColumn('期望服务时间', 'reservationAt', '请选择时间', {
      columnStyle: 'column-style-select',
      inputStyle: 'input-style-select'
    })
  ]
  reactiveData.rules = {
    position: {
      type: 'string',
      required: true,
      message: '位置不能为空',
      trigger: []
    },
    content: {
      type: 'string',
      required: true,
      message: '问题描述不能为空',
      trigger: []
    },
    reportRepairsType: {
      type: 'string',
      required: true,
      message: '问题分类不能为空',
      trigger: []
    },
    contactName: {
      type: 'string',
      required: true,
      message: '联系人不能为空',
      trigger: []
    },
    contactPhone: {
      type: 'string',
      required: true,
      message: '联系人号码不能为空',
      trigger: []
    }
  }
  reactiveData.editData.position = infoData.value.position
  reactiveData.editData.content = infoData.value.content
  reactiveData.editData.imageArray = infoData.value.imageArray
  reactiveData.editData.imageIdArray = infoData.value.imageIdArray
  reactiveData.editData.reportRepairsType = infoData.value.reportRepairsType
  reactiveData.editData.reservationAt = infoData.value.reservationAt
  reactiveData.contactName = infoData.value.contactName
  reactiveData.contactPhone = infoData.value.contactPhone
}

const onGetInfo = async (id: number) => {
  const res = await ReportRepairsInfoApi(id)
  if (res.success && res.value) {
    infoData.value = res.value
    infoData.value.imageIdArray = ''
    if (res.value.imageArray) {
      const ar = [] as number[]
      for (const item of res.value.imageArray) {
        ar.push(item.id)
      }
      infoData.value.imageIdArray = JSON.stringify(ar)
    }

    onFormData()
  }
}

onLoad((val: any) => {
  if (isEmpty(val)) {
    onFormData()
  } else {
    if (val.id || val.id === 0) {
      headerTitle.value = '编辑报事报修'
      reactiveData.reportRepairsId = val.id
    }
    if (val.status >= 20) {
      const status = val.status === 20 ? '已分配' : '已完成'
      headerTitle.value = `查看报事报修(${status})`
      butTitle.value = `${status}无法修改`
      reactiveData.disabled = true
    }
    onGetInfo(val.id)
  }
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader :title="headerTitle" />
    <!-- 头部结束 -->

    <scroll-view scroll-y :style="`height:calc(100vh - 120rpx - 44px - ${marginHeight})`">
      <view class="w-100vw h-100% absolute z-999" v-if="reactiveData.disabled" />
      <view v-if="reactiveData.formData">
        <FormPartItem
          ref="formDataRef"
          category=""
          :formData="reactiveData.formData"
          :rules="reactiveData.rules"
          :editData="reactiveData.editData"
          labelPosition="top"
          :borderBottom="false"
          formStyle="form-style"
        />
      </view>
      <view class="column-style-select p-20rpx my-20rpx">
        <view class="font-600">查看收费说明</view>
        <view class="mr-20rpx">
          <u-icon name="arrow-right" color="#909399" size="18" />
        </view>
      </view>
      <view class="p-20rpx bg-#FFF info">
        <view class="pb-15rpx font-600 flex items-center"
          >提交人信息 <text class="text-[#f87171]">*</text></view
        >
        <view class="flex flex-row items-center justify-between">
          <view class="py-15rpx text-#808080">联系人</view>
          <view class="mr-20rpx">
            <u-input placeholder="请输入联系人" border="none" v-model="reactiveData.contactName" />
          </view>
        </view>
        <view class="flex flex-row items-center justify-between">
          <view class="py-15rpx text-#808080">联系电话</view>
          <view class="mr-20rpx">
            <u-input
              placeholder="请输入联系电话"
              border="none"
              v-model="reactiveData.contactPhone"
            />
          </view>
        </view>
      </view>
      <view class="h-20rpx" />
    </scroll-view>
    <BottomButton>
      <view class="px-20rpx">
        <u-button
          :text="butTitle"
          color="#466BF3"
          @click="saveClick"
          :disabled="reactiveData.disabled"
        />
      </view>
    </BottomButton>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.title-color {
  color: #282828;
  font-size: 28rpx;
  font-weight: 600;
}
.content-color {
  color: #c0c0c0;
}

::v-deep .u-textarea {
  background-color: #f4f5f7 !important;
  min-height: 80rpx !important;
  border-radius: 10rpx !important;
}
::v-deep .form-style {
  background: #f4f5f7;
}
::v-deep .column-style {
  background: #fff;
  padding: 20rpx 20rpx;
  margin-top: 20rpx;
  /* #ifdef H5 */
  width: 100%;
  /* #endif */
}
::v-deep .column-style-img {
  background: #fff;
  padding: 20rpx 20rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  width: 100%;
}

::v-deep .column-style-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  /* #ifdef H5 */
  width: 100%;
  /* #endif */
}
::v-deep .input-style-select {
  margin: 0;
  background: #fff;
  .u-input__content__field-wrapper__field {
    text-align: right !important;
  }
}
::v-deep .column-style-explain {
  margin: 20rpx 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}
::v-deep .info {
  .u-input__content__field-wrapper__field {
    text-align: right !important;
  }
}
::v-deep .u-form-item__body {
  padding: 0 !important;
}
</style>
