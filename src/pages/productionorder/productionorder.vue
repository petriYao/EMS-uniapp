<template>
  <view>
    <u-navbar :custom-back="backpage" title="生产工单" placeholder :background="background" />
    <view class="content">
      <view class="mx-20rpx flex">
        <u-search
          placeholder="生产单号/生产工单号"
          :clearabled="true"
          border-color="#cccccc"
          margin="20rpx 10rpx"
          shape="square"
          :show-action="false"
          :focus="searchinput"
          v-model="keyword"
          @search="search"
        />
        <!-- @blur="searchinput=false" -->
        <view class="flex ml-10rpx items-center">
          <image
            @click="Fn_ScanCode"
            src="@/static/process/saoma.png"
            style="width: 60rpx; height: 60rpx"
          />
        </view>
      </view>
      <u-empty v-if="PageItemList.length == 0" text="暂无数据" mode="list" />
      <view
        class="work_order_list"
        @tap="() => GotoProcess(item[0], item[1], item[9])"
        v-for="(item, index) in PageItemList"
        :key="index"
      >
        <view class="flex justify-between mt-20rpx mx-20rpx">
          <view class="text-20px" style="font-weight: bold">
            {{ item[1] }}
          </view>
          <view class="">
            <view
              class="bg-#FFF-light"
              style="display: flex; justify-content: flex-end; align-items: flex-end"
            >
              <u-tag
                :text="item[0]"
                :border-color="item[11].bgcolor"
                :bg-color="item[11].bgcolor"
                color="#ffffff"
              />
            </view>
          </view>
        </view>
        <u-line class="mt-20rpx mb-10rpx" margin="" />
        <view class="wrap">
          <view class="flex">
            <view class="flex-1 mx-20rpx mb-10rpx">
              <view class="flex justify-between">
                <view class="min-w-70px"> 单据日期 </view>
                <view>
                  {{ getTime(item[2]) }}
                </view>
              </view>

              <view class="flex justify-between">
                <view class="min-w-70px"> 生产车间 </view>
                <view class="">
                  {{ item[6] }}
                </view>
              </view>

              <view class="flex justify-between">
                <view class="min-w-70px"> 产品编码 </view>
                <view class="">
                  {{ item[4] }}
                </view>
              </view>
              <view class="flex justify-between">
                <view class="min-w-70px">产品名称</view>
                <view class="">{{ Lengthoptimization(item[7]) }}</view>
              </view>

              <view class="flex justify-between">
                <view class="min-w-70px">规格型号</view>
                <view class="">{{ Lengthoptimization(item[10]) }}</view>
              </view>
              <view class="flex justify-between">
                <view class="min-w-70px"> 生产数量 </view>
                <view class="">
                  {{ item[3] }}
                </view>
              </view>
            </view>
            <view class="flex items-center mr-40rpx">
              <view class="demo-layout bg-#FFF-dark card-content-arrow">
                <u-icon name="arrow-right" />
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 提示框 -->
      <u-toast ref="uToast" />
      <u-modal
        :show="msgshow"
        title="提示"
        contentTextAlign="center"
        @confirm="ConfirmationInformation"
        :content="msgcontent"
      />
    </view>
  </view>
</template>
<script setup lang="ts">
import FromData from '../../common/FromIDs.json'
import {
  loadList,
  DocumentType,
  QueryAssociation,
  FDocumentStatusColor
} from '@/api/productionorder.js'
import { ref, onMounted } from 'vue'

// Data
const keyword = ref('')
const msgshow = ref(false)
const msgcontent = ref('')
const background = ref({
  backgroundColor: '#55aaff'
})
const documentList = ref<any[]>([])
const PageItemList = ref<any[]>([])
const FieldsList = ref<any[]>([])
const FullNames = ref<any[]>([]) //所有部门
const searchinput = ref(false) //搜索框是否获取焦点
const Keyboardswitch = ref(false)
const showIcon = ref(true)
// const iconName = ref(require('@/static/icon/Offkeyboard.png'))
const iconName = ref('')

// Methods
const ConfirmationInformation = () => {
  keyword.value = ''
  msgshow.value = false
}

const Lengthoptimization = (str: string) => {
  return str.length > 18 ? str.slice(0, 18) + '...' : str
}

const search = (e: string) => {
  loadList2(e)
}

const Getmaterial = async (id: string) => {
  let fulllist = ''
  const newdata = {
    FormId: `${FromData.MATERIAL}`,
    data: {
      CreateOrgId: 0,
      Number: '',
      Id: `${id}`,
      IsSortBySeq: 'false'
    }
  }
  await QueryAssociation(newdata).then((res: any) => {
    if (res.data.Result.Result != null) {
      fulllist = res.data.Result.Result.Number
    }
  })
  return fulllist
}

const Getpline = async (id: string) => {
  let fulllist = ''
  const newdata = {
    FormId: `${FromData.ALMAJCGYLX}`,
    data: {
      CreateOrgId: 0,
      Number: '',
      Id: `${id}`,
      IsSortBySeq: 'false'
    }
  }
  await QueryAssociation(newdata).then((res: any) => {
    if (res.data.Result.Result != null) {
      fulllist = res.data.Result.Result.Name
    }
  })
  return fulllist[0]
}

const departmentName = async (id: string) => {
  let fulllist = ''
  const newdata = {
    FormId: `${FromData.ZBFromID}`,
    data: {
      CreateOrgId: 0,
      Id: `${id}`,
      IsSortBySeq: 'false'
    }
  }
  await QueryAssociation(newdata).then((res: any) => {
    if (res.data.Result.Result != null) {
      fulllist = res.data.Result.Result.Name
    }
  })
  return fulllist[0]
}

const YuanData = async () => {
  let newdata = {
    parameters: [
      {
        FormId: `${FromData.SCGDFromID}`
      }
    ]
  }
  const { data: res } = await DocumentType(newdata)
  if (res != null) {
    if (res.Result.NeedReturnData == undefined) return
    let Fields = res.Result.NeedReturnData.Entrys[0].Fields
    FieldsList.value = Fields
  }
}

const resuleCaption = (itemKey: string, imCaptionName: string) => {
  let stateName = ''
  FieldsList.value.forEach((item) => {
    if (item.Key === itemKey) {
      //单据状态
      let Extends = item.Extends
      Extends.forEach((im: any) => {
        if (im.Value === imCaptionName) {
          stateName = im.Caption
        }
      })
    }
  })
  return stateName
}

const loadList2 = async (Fbillno: string) => {
  let list = PageItemList.value
  let isgo = false
  for (var i = 0; i < list.length; i++) {
    if (list[i].includes(Fbillno)) {
      isgo = true
    }
  }
  if (isgo) {
    msgcontent.value = `重复扫码！`
    msgshow.value = true
    keyword.value = ''
  } else {
    //条码规则解析
    await GetCodeForList(Fbillno)
  }
}

const GetCodeForList = async (getCode: string) => {
  let FbillnoParameter = []
  FbillnoParameter = [
    {
      Left: '(',
      FieldName: 'F_SCDNumber',
      Compare: '=',
      Value: `${getCode}`,
      Right: '',
      Logic: 'OR'
    },
    {
      Left: '',
      FieldName: 'FBillNo',
      Compare: '=',
      Value: `${getCode}`,
      Right: ')',
      Logic: ''
    }
  ]

  let newdata = {
    parameters: [
      {
        FormId: `${FromData.SCGDFromID}`,
        FieldKeys:
          'FDocumentStatus,F_SCDNumber,F_Date,F_Qty,F_Number,FSCType,FWorkShopID,FRouteId,FBILLNO,FID,F_Model',
        FilterString: FbillnoParameter,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }

  const { data: res } = await loadList(newdata)
  if (res.length == 0) {
    msgcontent.value = `暂无数据！`
    msgshow.value = true
  } else {
    documentList.value = []
    let douctmentArr = res
    for (const item of douctmentArr) {
      let dataState = resuleCaption('FDocumentStatus', item[0])
      item[0] = dataState
      //添加状态标签颜色
      item.push({
        bgcolor: FDocumentStatusColor(dataState)
      })
      await departmentName(item[6]).then((res: any) => {
        item[6] = res.Value
      })
      await Getpline(item[7]).then((res: any) => {
        item[7] = res.Value
      })
      await Getmaterial(item[4]).then((res: any) => {
        item[4] = res
      })
      documentList.value.push(item)
      PageItemList.value.unshift(item)
    }
  }
  keyword.value = ''
}

const getTime = (time: string | number | Date) => {
  var date = new Date(time),
    year = date.getFullYear(),
    month: any = date.getMonth() + 1,
    day: any = date.getDate()
  // hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
  // minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
  // second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 0 && day <= 9) {
    day = '0' + day
  }
  var timer = year + '-' + month + '-' + day
  return timer
}

const backpage = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

const GotoProcess = (Status: string, code: string, fid: string) => {
  if (Status === '已审核') {
    console.log('已审核跳转 已审核 138486 2025-06-01', Status, fid, code)
    uni.navigateTo({
      url: `/pages/processlist/processlist?fid=${fid}&code=${code}`
    })
  } else {
    msgcontent.value = `【${Status}】无法进行操作！`
    msgshow.value = true
  }
}

const ClosePage = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

//调用摄像头进行扫码
const Fn_ScanCode = () => {
  uni.scanCode({
    onlyFromCamera: true,
    success: function (res) {
      let getCode = res.result
      keyword.value = getCode
      loadList2(getCode)
    }
  })
}

onMounted(() => {
  YuanData()
})

// 暴露
defineExpose({
  keyword,
  msgshow,
  msgcontent,
  background,
  documentList,
  PageItemList,
  FieldsList,
  FullNames,
  searchinput,
  Keyboardswitch,
  showIcon,
  iconName,
  ConfirmationInformation,
  Lengthoptimization,
  search,
  getTime,
  backpage,
  GotoProcess,
  ClosePage,
  Fn_ScanCode
})
</script>

<style scoped lang="scss">
/* 原有样式保持不变 */
</style>

<style scoped lang="scss">
.slot-wrap {
  display: flex;
  align-items: center;
  /* 如果您想让slot内容占满整个导航栏的宽度 */
  flex: 1;
  /* 如果您想让slot内容与导航栏左右有空隙 */
  padding: 0 30rpx;
}

.prductionOrder_body {
  background-color: #f5f5f5;
}

.work_order_list {
  background-color: #ffffff;
  border: solid 0.6rpx #cccccc;
  margin: 10rpx 20rpx 10rpx 20rpx;
  border-radius: 10rpx;
}

.card-content {
  margin-top: -20rpx;
  font-size: 24rpx;
  margin-right: -80rpx;
  font-size: 26rpx;
}

.card-content-arrow {
  display: flex;
  justify-content: flex-end;
  margin-right: -30rpx;
}

.card-content-head {
  font-size: 35rpx;
  font-weight: bold;
  margin-left: 20rpx;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40rpx;
  overflow: hidden;
}

.left,
.right {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 28rpx;
}

.left {
  text-align: left;
  margin-left: 5rpx;
}

.right {
  text-align: right;
  margin-right: 30rpx;
}
</style>
