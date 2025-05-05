<template>
  <view class="prductionOrder_body">
    <u-navbar :custom-back="backpage" title="生产报工" placeholder :background="background">
      <view class="slot-wrap" slot="left">
        <u-icon
          @click="ClosePage"
          name="close"
          color="rgb(96, 98, 102)"
          size="35"
          style="margin-left: 30rpx"
        />
      </view>
      <view slot="right">
        <u-icon
          style="margin-right: 30rpx"
          @click="Fnseeting"
          name="setting-fill"
          color="rgb(96, 98, 102)"
          size="50"
        />
      </view>
    </u-navbar>
    <view class="content">
      <!-- 正文内容 -->
      <u-popup v-model="show" mode="top">
        <view>
          <u-card title="设置报工类型">
            <view class="" slot="body">
              <view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0">
                <u-radio-group v-model="JTypevalue" :wrap="true" @change="radioGroupChange">
                  <u-radio name="1">个人计件</u-radio>
                  <u-radio name="2">团体计件</u-radio>
                  <u-radio name="3">仅报工</u-radio>
                </u-radio-group>
              </view>
            </view>
          </u-card>
        </view>
      </u-popup>
      <view class="search-container">
        <view class="search-box">
          <u-search
            ref="txtsearchinput"
            placeholder="生产工单号/工序号/条形码"
            :clearabled="true"
            border-color="#cccccc"
            margin="5rpx 5rpx"
            shape="square"
            :show-action="false"
            v-model="keyword"
            :focus="searchinput"
            @search="handleInput"
            @focus="GuangBiaoThis('searchinput')"
            @blur="searchinput = false"
          />
        </view>
        <view class="scan-box">
          <image
            @click="Fn_ScanCode"
            src="@/static/process/saoma.png"
            style="width: 60rpx; height: 60rpx"
          />
        </view>
      </view>
      <!-- 内容展示 -->
      <u-empty v-if="selectedRow.length == 0" text="暂无数据" mode="list" />
      <view class="content_list" v-if="selectedRow.length > 0">
        <view class="content-row">
          <view class="content-col">
            <view class="demo-layout bg-purple">
              {{ selectedRow[2] }}
            </view>
          </view>
          <view class="content-col">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ selectedRow[3] }}
            </view>
          </view>
          <view class="content-col">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              <u-tag
                :text="selectedRow[0]"
                :border-color="selectedRow.length > 0 ? selectedRow[StateColorIndex].bgcolor : ''"
                :bg-color="selectedRow.length > 0 ? selectedRow[StateColorIndex].bgcolor : ''"
                color="#ffffff"
              />
            </view>
          </view>
        </view>

        <view class="content-row">
          <view class="content-col">
            <view class="demo-layout bg-purple"> 物料编码 </view>
          </view>
          <view class="content-col">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ selectedRow[5] }}
            </view>
          </view>
        </view>

        <view class="content-row" @click="LookDetail('物料名称', selectedRow[6])">
          <view class="container_list">
            <view class="left">物料名称</view>
            <view class="right">{{ Lengthoptimization(selectedRow[6]) }}</view>
          </view>
        </view>
        <view class="content-row" @click="LookDetail('规格型号', selectedRow[7])">
          <view class="container_list">
            <view class="left">规格型号</view>
            <view class="right">{{ Lengthoptimization(selectedRow[7]) }}</view>
          </view>
        </view>

        <view class="content-row">
          <view class="content-col">
            <view class="container_list">
              <view class="left" style="margin-left: -2rpx">生产数量</view>
              <view style="display: flex; justify-content: flex-end; right: 0">
                {{ selectedRow[11] }}
              </view>
            </view>
          </view>
          <view class="content-col">
            <view class="container_list">
              <view class="leftwg">未完工数量</view>
              <view style="display: flex; justify-content: flex-end; right: 0">
                {{ selectedRow[12] }}
              </view>
            </view>
          </view>
        </view>

        <view class="content-row content_list_row_teshu" style="margin-top: 20rpx">
          <view class="content-col">
            <view class="demo-layout bg-purple"> 生产组别 </view>
          </view>
          <view class="content-col">
            <view style="display: flex">
              <view
                style="
                  flex: 1 1 0%;
                  display: flex;
                  justify-content: center;
                  flex-direction: column;
                  flex-wrap: nowrap;
                  align-content: flex-start;
                "
              >
                <label @click="SCZBshow = true" style="font-size: 26rpx">{{
                  selectedRow[BSYIndex].SCZBText == '' ? '请选择' : selectedRow[BSYIndex].SCZBText
                }}</label>
              </view>
              <view style="flex: 0 0 200rpx">
                <u-search
                  right-icon="scan"
                  @blur="testandverify('ZB', $event)"
                  class="field_zb"
                  label-width="0"
                  placeholder="请输入"
                  :clearable="false"
                  :focus="SCZBNoFocus"
                  @input="onInputChange('SCZBNo', $event)"
                  v-model="selectedRow[BSYIndex].SCZBNo"
                  @focus="GuangBiaoThis('SCZBNoFocus')"
                  input-align="right"
                  confirm-type="search"
                  @confirm="doTab"
                />
              </view>
            </view>
          </view>
        </view>
        <view class="content-row content_list_row_teshu">
          <view class="container_list">
            <view class="left">报工数量</view>
            <view style="display: flex; justify-content: flex-end; right: 0">
              <u-search
                right-icon="scan"
                type="number"
                :focus="BaoGongnumberFocus"
                label-width="0"
                placeholder="请输入"
                @input="onInputChange('BaoGongnumber', $event)"
                v-model="selectedRow[BSYIndex].BaoGongnumber"
                :clearable="false"
                @focus="GuangBiaoThis('BaoGongnumberFocus')"
                style="width: 175rpx; margin-right: 14rpx"
                input-align="right"
                confirm-type="search"
                @confirm="doTab"
              />
            </view>
          </view>
        </view>

        <view class="content-row content_list_row_teshu" v-if="isShowDisplay">
          <view class="content-col">
            <view class="demo-layout bg-purple"> 员工 </view>
          </view>
          <view class="content-col">
            <view style="display: flex">
              <view
                style="
                  flex: 1 1 0%;
                  display: flex;
                  justify-content: center;
                  flex-direction: column;
                  flex-wrap: nowrap;
                  align-content: flex-start;
                "
              >
                <label @click="YGshow = !YGNoDisabled" style="font-size: 26rpx">{{
                  selectedRow[BSYIndex].YGText == '' ? '请选择' : selectedRow[BSYIndex].YGText
                }}</label>
              </view>
              <view style="flex: 0 0 200rpx">
                <u-search
                  right-icon="scan"
                  @blur="testandverify('YG', $event)"
                  class="field_zb"
                  @input="onInputChange('YGNo', $event)"
                  label-width="0"
                  placeholder="请输入"
                  :focus="YGNoFocus"
                  :clearable="false"
                  v-model="selectedRow[BSYIndex].YGNo"
                  :disabled="YGNoDisabled"
                  @focus="GuangBiaoThis('YGNoFocus')"
                  input-align="right"
                  confirm-type="search"
                  @confirm="doTab"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 物料列表 -->
      <view class="material_list">
        <view
          v-for="(item, index) in SaoMaList"
          :key="index"
          :class="{ RowSelectStyle: index === SaoMaListRowIndex }"
        >
          <view class="Fl_items_list">
            <view style="width: 8%">
              <u-checkbox-group style="margin-left: 10rpx">
                <u-checkbox
                  @change="checkboxChange"
                  v-model="item[CheckIndex].checked"
                  :name="index"
                />
              </u-checkbox-group>
            </view>
            <view
              @click="GetRowsData(index, 'click')"
              :style="{
                width: AppscreenWidth + 'px',
                display: 'flex',
                'flex-direction': 'column',
                'flex-wrap': 'wrap',
                'align-content': 'stretch',
                'justify-content': 'center',
                'align-items': 'stretch'
              }"
            >
              <view style="display: flex; height: 45rpx">
                <view class="item_list_left">{{ item[2] }}</view>
                <view class="item_list_right">
                  {{ item[8] }}
                </view>
              </view>
              <view style="display: flex; height: 45rpx">
                <view class="item_list_left_max">{{ item[27] }} {{ item[9] }}</view>
                <view class="item_list_right_max">
                  {{ JTypevalue === '1' ? '个人计件' : JTypevalue === '2' ? '团体计件' : '仅报工' }}
                </view>
              </view>
              <view style="display: flex; height: 45rpx">
                <view class="item_list_left_3">报工数量：{{ item[BSYIndex].BaoGongnumber }}</view>
                <view class="item_list_center">{{ item[BSYIndex].SCZBText }}</view>
                <view class="item_list_right_3" v-if="JTypevalue === '1'"
                  >员工：{{ item[BSYIndex].YGText }}
                </view>
              </view>
            </view>
          </view>
        </view>
        <view style="height: 130rpx" />
      </view>
      <!-- 底部操作按钮 -->
      <view class="bottom-btn-container" v-if="antishake">
        <view class="btn-wrapper">
          <view
            class="btn-item"
            v-if="UserAuthoritylist.includes('10')"
            @tap="startclick('delete')"
          >
            <span>删除</span>
          </view>
          <view
            class="btn-item"
            v-if="UserAuthoritylist.includes('11')"
            @tap="startclick('submit')"
          >
            <span>提交</span>
          </view>
        </view>
      </view>
    </view>
    <u-toast ref="uToast" />
    <u-modal
      v-model="msgshow"
      :title="msgtitle"
      @confirm="ConfirmationInformation"
      :content="msgcontent"
    />
    <u-modal
      v-model="deleteshow"
      @confirm="deleteFn"
      :show-cancel-button="true"
      @cancel="deleteFncancel"
      title="提示"
      content="是否删除选中行内容？"
    />
    <u-modal
      v-model="submittoshow"
      @confirm="submittoFn"
      :show-cancel-button="true"
      @cancel="submittoFncancel"
      title="提示"
      content="确认提交页面数据？"
    />
    <!-- 选择组别 -->
    <u-picker
      v-model="SCZBshow"
      mode="selector"
      :range="SCZBList"
      range-key="label"
      @confirm="SCZBconfirm"
    />
    <!-- 选择员工 -->
    <u-picker
      v-model="YGshow"
      mode="selector"
      :range="YGList"
      range-key="label"
      @confirm="YGconfirm"
    />
  </view>
</template>

<script setup lang="ts">
import FromData from '@/common/FromIDs.json'
import {
  GetProductionOrderList,
  PushProduction,
  PushGetProject,
  GetProductionFNumber,
  GetBarcodeData
} from '@/api/modules/productionreporting'
import { SaveSubmit } from '@/common/WorkReportingProcess.js'
import { QueryAssociation } from '@/api/modules/productionorder'
import { DepartmentQuery, GetZubieForFid } from '@/api/modules/department'
import { FBillStatusStatusColor } from '@/api/modules/processlist'
import { RowStatecodeForMsg } from '@/api/modules/CodeValidate'
import { PDA_GetBarcodeData, PDA_GetTMcodeData } from '@/api/modules/PDAScanCodeQuery'
import { Listprocess } from '@/common/Entrypushdown.js'
import { ref, onMounted, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const Keyboardswitch_BG = ref(false)
const UserAuthoritylist = ref<Array<any>>([]) //权限
const background = ref({
  backgroundColor: '#55aaff'
})
const msgtitle = ref('提示')
const msgshow = ref(false)
const msgcontent = ref('')
const show = ref(false)
const checked = ref(false)
const JTypevalue = ref('1') //个人计件
const BaoGongnumber = ref('')
const keyword = ref('')
const PageList = ref<Array<any>>([]) // 列表数据
const SaoMaList = ref<Array<any>>([]) //存储多条扫码内容
const Listindexs = ref<Array<any>>([]) // 多选列表选中数据
const SCZBshow = ref(false)
const SCZBNo = ref('')
const SCZBText = ref('选组别')
const SCZBList = ref<Array<any>>([]) //生产组别数据
const YGshow = ref(false)
const YGNoDisabled = ref(false) //员工输入框是否启用
const YGNo = ref('')
const YGText = ref('选员工')
const YGList = ref<Array<any>>([]) //员工数据
const GetYGList = ref<Array<any>>([]) //员工表查询原始数据
const StateColorIndex = ref(0)
const CheckIndex = ref(0)
const FEntryid_one = ref<Array<any>>([]) // 工单分录实体主键
const searchinput = ref(false) //搜索框焦点事件
const BaoGongnumberFocus = ref(false) //报工数量
const SCZBNoFocus = ref(false) //生产组别
const YGNoFocus = ref(false) //员工
const Unfinishedquantity = ref(0) //未完工数量
const BarcodedataState = ref(false)
const Scanbarcodestorage = ref<Array<any>>([]) //扫码记录存储，验证是否重复扫码
const BSYIndex = ref(0) //分录中报工数量，组别，员工 所在的索引位置
const SaoMaListRowIndex = ref(0) //选中分录行
const barcodeIndex = ref(0) //每次扫码条码存储所在行索引
const GuangbiaoState = ref('') //记录光标最近一次停留地址
const isShowDisplay = ref(true) //团体计件时，隐藏员工录入行
const deleteshow = ref(false) //删除行内容提示框
const submittoshow = ref(false) //报工提交提示框
const DepartmentList = ref<Array<any>>([]) //部门列表
const selectedRow = ref<Array<any>>([])
const requestQueue = ref<Array<any>>([]) // 定义一个请求队列
const timer_ppg = ref(null) //定时器名称
const showIcon = ref(true)
const iconName = ref('@/static/icon/Offkeyboard.png')
const rowsTMBaoGongnumber = ref(0)
const antishake = ref(true) //防抖提交
const AppscreenWidth = ref(0) //设备屏幕度
const FieldsList = ref<any>(null)
const isGetBarcodeDataProcessing = ref(false) // 定义一个标识符，用于判断请求是否已结束

// Methods
const getscreenWidth = () => {
  let result = 0
  uni.getSystemInfo({
    success: function (res) {
      console.log(res.windowHeight) // print 610
      result = uni.upx2px(res.windowHeight) + 200 // 这里加200或者加100为了看测试效果
      // 不加200默认 return 292
    }
  })
  return result
}

const doTab = () => {
  SCZBNoFocus.value = false
  BaoGongnumberFocus.value = false
  YGNoFocus.value = false
  searchinput.value = false
  nextTick(() => {
    if (selectedRow.value[BSYIndex.value].SCZBNo === '') {
      SCZBNoFocus.value = true
    }
    if (selectedRow.value[BSYIndex.value].BaoGongnumber === '') {
      BaoGongnumberFocus.value = true
    }
    if (selectedRow.value[BSYIndex.value].YGNo === '') {
      YGNoFocus.value = true
    }
    if (keyword.value === '') {
      searchinput.value = true
    }
  })
}

const ConfirmationInformation = () => {
  nextTick(() => {
    keyword.value = ''
  })
}

const testandverify = (str: string, e: any) => {
  let strvalue = e.detail.value
  if (str === 'ZB') {
    let isc = false
    SCZBList.value.forEach((item, index) => {
      if (strvalue.length > 0) {
        if (strvalue.toUpperCase() == item.value.toUpperCase()) {
          isc = true
        }
      } else {
        isc = true
      }
    })
    if (!isc) {
      nextTick(() => {
        selectedRow.value[BSYIndex.value].SCZBNo = ''
        selectedRow.value[BSYIndex.value].SCZBText = '选组别'
        SCZBNoFocus.value = true
      })
      uni.showToast({
        title: '不存在该组别！',
        icon: 'error',
        duration: 2000
      })
    }
  }
  if (str === 'YG') {
    let isc = false
    if (strvalue === '') return
    for (var i = 0; i < YGList.value.length; i++) {
      let item = YGList.value[i]
      if (strvalue.toUpperCase() == item.value.toUpperCase()) {
        isc = true
      }
    }
    if (!isc) {
      nextTick(() => {
        selectedRow.value[BSYIndex.value].YGNo = ''
        selectedRow.value[BSYIndex.value].YGText = '选员工'
        YGNoFocus.value = true
      })
      uni.showToast({
        title: '员工不存在！',
        icon: 'error',
        duration: 2000
      })
    }
  }
}

const Lengthoptimization = (str: string) => {
  if (str != undefined) {
    return str.length > 18 ? str.slice(0, 18) + '...' : str
  }
}

const LookDetail = (title: string, content: string) => {
  msgshow.value = true
  msgtitle.value = title
  msgcontent.value = content
}

const GuangBiaoThis = (state: string) => {
  if (state === 'BaoGongnumberFocus') {
    GuangbiaoState.value = 'BaoGongnumberFocus'
  }
  if (state === 'SCZBNoFocus') {
    GuangbiaoState.value = 'SCZBNoFocus'
  }
  if (state === 'YGNoFocus') {
    GuangbiaoState.value = 'YGNoFocus'
  }
  if (state === 'searchinput') {
    GuangbiaoState.value = 'searchinput'
  }
}

const handleInput = (e: string) => {
  //监听搜索框内容输入进行搜索
  let JMcode = e.split('*')
  if (JMcode.length > 1) {
    Getchromatographyprinting(e) //套打条码解析查询
  } else {
    GetTMScanCode(e) // 条码数据单解析查询
  }
}

const Getchromatographyprinting = async (val: string) => {
  if (val.length === 0) return
  YGNo.value = ''
  YGText.value = ''
  let pdaCode = val
  let Dannumber = ''
  let Gxh = ''
  let Gxcount = ''
  let GxYGName = ''
  BaoGongnumber.value = ''
  GuangbiaoState.value = ''

  let JMcode = pdaCode.split('*')
  if (JMcode.length === 2) {
    ;[Dannumber, Gxh] = JMcode
    GuangbiaoState.value = 'BaoGongnumberFocus'
  }
  if (JMcode.length === 3) {
    ;[Dannumber, Gxh, Gxcount] = JMcode
    GuangbiaoState.value = 'YGNoFocus'
    BaoGongnumber.value = Gxcount
  }
  if (JMcode.length === 4) {
    ;[Dannumber, Gxh, Gxcount, GxYGName] = JMcode
    GuangbiaoState.value = 'YGNoFocus'
    BaoGongnumber.value = Gxcount
    YGList.value.forEach((item) => {
      if (GxYGName.toUpperCase() === item.value) {
        YGNo.value = item.value
        YGText.value = item.label
      }
    })
  }
  const { data: pdares } = await PDA_GetBarcodeData(Dannumber, Gxh)
  let newdocument = pdares
  //console.log("newdocument", newdocument);
  if (newdocument.length === 0) {
    uni.showToast({
      title: '暂无数据！',
      icon: 'error',
      duration: 2000
    })
    searchinput.value = false
    nextTick(() => {
      keyword.value = ''
      searchinput.value = true
    })
    return
  }
  for (let i = 0; i < newdocument.length; i++) {
    let item = newdocument[i]
    let statename = RowStatecodeForMsg(item[1], item[0])
    item[0] = statename
    item[5] = await Getmaterial(item[5])
    const { data: zb } = await GetZubieForFid(item[26])
    SCZBText.value = zb[0][0]
    SCZBNo.value = zb[0][1]
    const resss = await GetProductionFNumber(item[10])
    //console.log("resss", resss);
    let ressdata = resss.data
    if (ressdata.length > 0) {
      item[10] = ressdata[0][0]
      item[9] = ressdata[0][1]
    }
    const res2 = await departmentName(item[4])
    item[4] = res2.Value
    item.push(
      {
        barcode: keyword.value
      },
      {
        BaoGongnumber: Gxcount.length == 0 ? '' : Gxcount,
        SCZBNo: zb[0][1],
        SCZBText: SCZBText.value,
        YGNo: YGNo.value,
        YGText: YGText.value
      },
      {
        bgcolor: FBillStatusStatusColor(statename)
      },
      {
        checked: false
      }
    )
    SaoMaList.value.unshift(item)
  }
  StateColorIndex.value = newdocument[0].length - 2
  CheckIndex.value = newdocument[0].length - 1
  BSYIndex.value = newdocument[0].length - 3
  barcodeIndex.value = newdocument[0].length - 4
  Unfinishedquantity.value = newdocument[0][12]
  SaoMaListRowIndex.value = 0
  // 采用 requestAnimationFrame 代替 setTimeout
  await setTimeout(() => {
    GetRowsData(0, 'show')
  }, 100)
}

const GuangbiaoInsert = async (typestr: string) => {
  //console.log("光标定位判断", typestr);
  SCZBNoFocus.value = false
  BaoGongnumberFocus.value = false
  YGNoFocus.value = false
  searchinput.value = false
  //光标定位
  await nextTick(() => {
    if (selectedRow.value[BSYIndex.value].SCZBNo === '') {
      SCZBNoFocus.value = true
    }
    if (selectedRow.value[BSYIndex.value].BaoGongnumber === '') {
      BaoGongnumberFocus.value = true
    } else {
      if (JTypevalue.value === '1') {
        if (selectedRow.value[BSYIndex.value].YGNo === '') {
          YGNoFocus.value = true
        }
      }
    }

    if (keyword.value === '') {
      searchinput.value = true
    }
  })
}

const GetTMScanCode = async (val: string) => {
  if (val.length == 0) return
  let hid = 0
  // 判断上一次请求是否已结束，如果没结束，将当前请求放入请求队列
  if (isGetBarcodeDataProcessing.value) {
    requestQueue.value.push(val)
    return
  }
  // 设置标识符为 true
  isGetBarcodeDataProcessing.value = true
  const { data: res } = await GetBarcodeData(val)
  // 设置标识符为 false
  isGetBarcodeDataProcessing.value = false
  if (res.length > 0) {
    if (Scanbarcodestorage.value.includes(val)) {
      uni.showToast({
        title: '重复扫码',
        icon: 'error',
        duration: 2000
      })
      searchinput.value = false
      await nextTick(() => {
        keyword.value = ''
        searchinput.value = true
      })
      return
    } else {
      Scanbarcodestorage.value.push(val)
    }
    hid = res[0][1]
    // 班组，员工姓名，报工数量 反��
    Get_TM_dataSetData(res)
    if (res[0][2] == 0) {
      //条码表信息查询后数量为0 表示已经完成扫码
      uni.showToast({
        title: '重复扫码',
        icon: 'error',
        duration: 2000
      })
      searchinput.value = false
      await nextTick(() => {
        keyword.value = ''
        searchinput.value = true
      })
      return
    } else {
      pageloadData(hid)
    }
  } else {
    uni.showToast({
      title: '暂无数据',
      icon: 'error',
      duration: 2000
    })
    searchinput.value = false
    await nextTick(() => {
      keyword.value = ''
      searchinput.value = true
    })
    return
  }
  // 当请求结束后，检查请求队列，执行缓存的请求
  if (requestQueue.value.length > 0) {
    let nextRequest = requestQueue.value.shift()
    GetTMScanCode(nextRequest)
  }
}

const Get_TM_dataSetData = async (res: any[]) => {
  if (res.length > 0) {
    let bgnumber = res[0][2]
    BaoGongnumber.value = bgnumber
    let ygnumber = res[0][3]
    let zbnumber = res[0][4]
    //对应值获取
    if (ygnumber == 0) {
      YGNo.value = ''
      YGText.value = '选员工'
    } else {
      GetYGList.value.forEach((item) => {
        if (item[2] == ygnumber) {
          YGNo.value = item[1]
          YGText.value = item[0]
        }
      })
    }

    //console.log("生产组别", zbnumber);
    const { data: zblist } = await GetZubieForFid(zbnumber)
    //console.log("看看情况", zblist);
    zblist.forEach((zb) => {
      SCZBText.value = zb[0]
      SCZBNo.value = zb[1]
    })
  }
}

//********************************************生产组别  开始
const SCZBconfirm = (e: any) => {
  const selectedItem = SCZBList.value[e.index]
  selectedRow.value[BSYIndex.value].SCZBNo = selectedItem.value
  selectedRow.value[BSYIndex.value].SCZBText = selectedItem.label
  // 同步修改数据列表中的数据
  Object.assign(SaoMaList.value[SaoMaListRowIndex.value], selectedRow.value)
}

const GetSCZB = async () => {
  //查询生产组别
  const { data: res } = await DepartmentQuery()
  DepartmentList.value = res
  let newres = [] as any

  //加工数据
  res.forEach((item, index) => {
    newres.push({
      label: item[0],
      value: item[1]
    })
  })
  SCZBList.value = newres
}
//********************************************生产组别  结束

//********************************************员工  开始
const YGconfirm = (e: any) => {
  const selectedItem = YGList.value[e.index]
  selectedRow.value[BSYIndex.value].YGNo = selectedItem.value
  selectedRow.value[BSYIndex.value].YGText = selectedItem.label
  // 同步修改数据列表中的数据
  Object.assign(SaoMaList.value[SaoMaListRowIndex.value], selectedRow.value)
}

const GetYG = async () => {
  //查询员工
  let qudata = {
    data: {
      FormId: `${FromData.Empinfo}`,
      FieldKeys: 'FName,FNumber,FID'
    }
  }
  const { data: res } = await GetProductionOrderList(qudata)
  GetYGList.value = res
  let newres = [] as any
  //加工数据
  res.forEach((item, index) => {
    newres.push({
      label: item[0],
      value: item[1]
    })
  })
  YGList.value = newres
}
//********************************************员工  结束

const checkboxChange = (e: any) => {
  if (e.value) {
    if (Listindexs.value.length > 0) {
      for (var i = 0; i < Listindexs.value.length; i++) {
        if (Listindexs.value[i].name != e.name) {
          Listindexs.value.push(e)
          break
        }
      }
    } else {
      Listindexs.value.push(e)
    }
  } else {
    Listindexs.value.forEach((item, index) => {
      if (e.name == item.name) {
        Listindexs.value.splice(index, 1)
      }
    })
  }
}

const submittoFn = async () => {
  let SaoMaList_new = JSON.parse(JSON.stringify(SaoMaList.value))
  //下推时，非TM 需要证 如果工单号，分录ID，组别，员工一致时，合并数据，累加报工数量，进行否超额验证。
  let arr: any[] = [] //需要分组的数据
  let containTM: any[] = [] //TM表数
  if (SaoMaList_new.length == 0) {
    msgshow.value = true
    msgtitle.value = '提示'
    msgcontent.value = '页面没有任何可提交数据！'
    return false
  } else {
    //数组分离。需要把TM数据单独分离出来不做数据分组操作
    for (var i = 0; i < SaoMaList_new.length; i++) {
      let item = SaoMaList_new[i]
      if (item[0] === '开工') {
        if (item[barcodeIndex.value].barcode.search('TM') == -1) {
          //不存在TM
          arr.push(item)
        } else {
          containTM.push(item)
        }
      } else {
        msgshow.value = true
        msgtitle.value = '提示'
        msgcontent.value = '只有【开工】状态数据才可以报工！'
        return false
      }
    }
    let result: any[] = []
    for (let i = 0; i < arr.length; i++) {
      const groupKey = [arr[i][3], arr[i][19], arr[i][26], arr[i][BSYIndex.value].YGNo].join('-')
      const foundIndex = result.findIndex((x) => x.groupKey === groupKey)
      if (foundIndex === -1) {
        let bgs =
          arr[i][BSYIndex.value].BaoGongnumber.length > 0
            ? arr[i][BSYIndex.value].BaoGongnumber
            : '0'
        arr[i][BSYIndex.value].BaoGongnumber = parseFloat(bgs)
        result.push({
          groupKey,
          ...arr[i]
        })
      } else {
        let bgs =
          arr[i][BSYIndex.value].BaoGongnumber.length > 0
            ? arr[i][BSYIndex.value].BaoGongnumber
            : '0'
        const sum =
          parseFloat(bgs) +
          parseFloat(
            result[foundIndex][BSYIndex.value].BaoGongnumber == ''
              ? '0'
              : result[foundIndex][BSYIndex.value].BaoGongnumber
          )
        result[foundIndex][BSYIndex.value].BaoGongnumber = sum
      }
    }
    result = result.map((x) => Object.values(x))

    // 将结果从对象转换为数组
    if (containTM.length > 0) {
      containTM.forEach((item) => {
        result.push(item)
      })
    }
    //let FenLuIDs = []
    for (var i = 0; i < result.length; i++) {
      let item = result[i]
      if (item[BSYIndex.value].BaoGongnumber == 0) {
        uni.showToast({
          title: `报工数量必填`,
          icon: 'error',
          duration: 2000
        })
        selectedRow.value[BSYIndex.value].BaoGongnumber = ''
        BaoGongnumberFocus.value = false
        nextTick(() => {
          BaoGongnumberFocus.value = true
        })
        return
      } else {
        if (parseFloat(item[12]) >= parseFloat(item[BSYIndex.value].BaoGongnumber)) {
          //FenLuIDs.push(item[19])
        } else {
          uni.showToast({
            title: `报工数量不能大于未完工数量`,
            icon: 'error',
            duration: 2000
          })
          selectedRow.value[BSYIndex.value].BaoGongnumber = ''
          BaoGongnumberFocus.value = false
          nextTick(() => {
            BaoGongnumberFocus.value = true
          })
          return
        }
      }
      console.log('this.JTypevalue', JTypevalue.value)
      if (JTypevalue.value === '1') {
        if (item[BSYIndex.value].YGNo.length == 0) {
          uni.showToast({
            title: `员工选项必填!`,
            icon: 'error',
            duration: 2000
          })
          YGNoFocus.value = false
          nextTick(() => {
            YGNoFocus.value = true
          })
          return
        }
      }

      if (item[BSYIndex.value].SCZBNo.length == 0) {
        uni.showToast({
          title: `产品组别必填!`,
          icon: 'error',
          duration: 2000
        })
        SCZBNoFocus.value = false
        nextTick(() => {
          SCZBNoFocus.value = true
        })
        return
      }
    }

    if (JTypevalue.value == '') {
      uni.showToast({
        title: `计件类型为空，请选择!`,
        icon: 'error',
        duration: 2000
      })
      return
    }
    //分录ID处理
    const okarr = Listprocess(result) //分类
    let fenlulist = Object.keys(okarr) //获取分类key列表，请求下推
    //Object.keys(groupedList)
    //报工总数是否大于未完工数量
    for (var i = 0; i < fenlulist.length; i++) {
      let obg = fenlulist[i]
      let item = okarr[obg]
      let zongshu = 0
      //console.log("item", item);
      for (var z = 0; z < item.length; z++) {
        let items = item[z]
        let baogNu = items[BSYIndex.value].BaoGongnumber
        zongshu += parseFloat(baogNu)
      }
      //console.log("zongshu", zongshu);
      if (zongshu > parseFloat(item[0][12])) {
        uni.showToast({
          title: `累计汇报数量大于工序数量`,
          icon: 'error',
          duration: 2000
        })
        return
      }
    }
    //console.log("okarr", okarr);
    //console.log("groupedList", Object.keys(okarr));
    //下推思密达
    const { data: respush } = await PushProduction(fenlulist.join(','))
    let ResultID = respush.Result.ResponseStatus.SuccessEntitys[0].Id
    const { data: getdata } = await PushGetProject(ResultID)
    //console.log("原始信息", getdata);
    //获取单据体
    let danjubody = JSON.parse(JSON.stringify(getdata))
    //console.log("danjubody", danjubody);
    let bodylist = danjubody.Result.Result.FSCHBDEntry
    //console.log("bodylist", bodylist);
    //匹配单据体内包含分录的数据行，进行复制替换
    let newSaveBody: any[] = []
    for (var i = 0; i < bodylist.length; i++) {
      let item = bodylist[i]
      //console.log("item", item);
      let FEID = item.Id
      // 计算元素个数
      //let count = result.filter(itemz => itemz[19] === item.F_SourceEntryID).length;
      for (var j = 0; j < result.length; j++) {
        let itemj = result[j]
        if (itemj[19] == item.F_SourceEntryID) {
          let itemnew = JSON.parse(JSON.stringify(item))
          if (FEID == 0) {
            itemnew.F_BGType = JTypevalue.value //计件类型
            itemnew.FNumber = {
              FNUMBER: itemj[5]
            }
            itemnew.F_GXNumber = {
              FNUMBER: itemj[10]
            }
            itemnew.FSCQty = itemj[BSYIndex.value].BaoGongnumber //报工数量，汇报数量
            itemnew.F_Dept = {
              FNUMBER: itemj[BSYIndex.value].SCZBNo
            } //生产组别
            if (JTypevalue.value === '1') {
              itemnew.FYGNumber = {
                FSTAFFNUMBER: itemj[BSYIndex.value].YGNo
              }
            }
            itemnew.F_ZDJJGX = itemnew.F_ZDJJGX
            itemnew.F_Quantity = itemj[28] //itemnew.F_Quantity;
            itemnew.F_GYLX = {
              FNUMBER: itemnew.F_GYLX.Number
            }
            itemnew.F_QADV_GYAmount =
              parseFloat(itemj[BSYIndex.value].BaoGongnumber) * parseFloat(itemnew.F_BZPrice) //原始金额 原始金额 =汇报数量*工艺单价
            itemnew.FSCHBDEntry_Link = [
              {
                FSCHBDEntry_Link_FRuleId: itemnew.FSCHBDEntry_Link[0].RuleId,
                FSCHBDEntry_Link_FSTableName: itemnew.FSCHBDEntry_Link[0].STableName,
                FSCHBDEntry_Link_FSBillId: itemnew.FSCHBDEntry_Link[0].SBillId,
                FSCHBDEntry_Link_FSId: itemnew.FSCHBDEntry_Link[0].SId
              }
            ]
            newSaveBody.push(itemnew)
          } else {
            if (JTypevalue.value === '1') {
              newSaveBody.push({
                FEntryID: FEID, //需要处理多条重复分录id时问题
                F_BGType: JTypevalue.value, //计件类型
                FSCQty: itemj[BSYIndex.value].BaoGongnumber,
                F_Dept: {
                  FNUMBER: `${itemj[BSYIndex.value].SCZBNo}`
                },
                FYGNumber: {
                  FSTAFFNUMBER: `${itemj[BSYIndex.value].YGNo}`
                },
                F_QADV_GYAmount:
                  parseFloat(itemj[BSYIndex.value].BaoGongnumber) * parseFloat(itemj[20])
              })
            } else {
              newSaveBody.push({
                FEntryID: FEID, //需要处理多条重复分录id时问题
                F_BGType: JTypevalue.value, //计件类型
                FSCQty: itemj[BSYIndex.value].BaoGongnumber,
                F_Dept: {
                  FNUMBER: `${itemj[BSYIndex.value].SCZBNo}`
                },
                F_QADV_GYAmount:
                  parseFloat(itemj[BSYIndex.value].BaoGongnumber) * parseFloat(itemj[20])
              })
            }

            FEID = 0
          }
        }
      }
    }

    //console.log("newSaveBody", newSaveBody);
    let sqlModel: any[] = []
    let FSCHBDEntry_Arr = result
    for (var i = 0; i < FSCHBDEntry_Arr.length; i++) {
      let item = FSCHBDEntry_Arr[i]
      let Notype = (item[barcodeIndex.value].barcode.search('TM') != -1) == true ? 1 : 0
      sqlModel.push({
        FID: 0,
        F_WOMW_SCGDBHfFID: item[14], //F_WOMW_SCGDBHfFID 生产工单编号FID内码
        F_ENTRYID: item[19], //F_ENTRYID    分录ID
        F_WOMW_Text: item[barcodeIndex.value].barcode, //F_WOMW_Text 扫码后解析的条码内容
        F_SF_SCTM: Notype, //SF_SCTM  TM=1 ,非Tm 0
        F_ALMA_Qty: item[BSYIndex.value].BaoGongnumber, //F_ALMA_Qty 报工数量
        F_SCGDDBillNo: item[2], //F_SCGDDBillNo 生产工单单号
        F_GXH: item[27] //F_GXH 工序号
      })
    }

    const isSuccess = await SaveSubmit(newSaveBody, ResultID, sqlModel)
    antishake.value = false
    await uni.showLoading({
      title: '正在操作中……',
      mask: true
    })
    if (isSuccess) {
      selectedRow.value = []
      SaoMaList.value = []
      Scanbarcodestorage.value = []
      antishake.value = true
      await setTimeout(function () {
        uni.hideLoading()
      }, 1000)
    }
    searchinput.value = false
    nextTick(() => {
      searchinput.value = true
    })
  }
}

const deleteFn = async () => {
  let checkedArr: any[] = []
  if (SaoMaList.value.length > 0) {
    SaoMaList.value.forEach((item) => {
      if (item[CheckIndex.value].checked == true) {
        let code = item[barcodeIndex.value].barcode
        let newcodelist: any[] = []
        Scanbarcodestorage.value.forEach((co) => {
          if (co != code) {
            newcodelist.push(co)
          }
        })
        Scanbarcodestorage.value = newcodelist
      }
      if (item[CheckIndex.value].checked == false) {
        checkedArr.push(item)
      }
    })
  }
  SaoMaList.value = checkedArr
  if (checkedArr.length == 0) {
    selectedRow.value = []
  } else {
    GetRowsData(0, 'click') //默认选中索引0的数据展示
  }
}

const submittoFncancel = () => {
  submittoshow.value = false
}

const deleteFncancel = () => {
  deleteshow.value = false
}

const startclick = (str: string) => {
  if (str === 'delete') {
    let deleteitem: any[] = []
    SaoMaList.value.forEach((item) => {
      if (item[CheckIndex.value].checked == true) {
        deleteitem.push(item)
      }
    })
    if (deleteitem.length === 0) {
      msgshow.value = true
      msgtitle.value = '警告'
      msgcontent.value = '页面没有任何可以删除的数据！'
      return false
    } else {
      deleteshow.value = true
    }
  }
  if (str === 'submit') {
    submittoshow.value = true
  }
}

const onInputChange = async (name: string, e: any) => {
  // 修改选中行的数据
  if (name === 'BaoGongnumber') {
    let wwgnumber = selectedRow.value[12] //未完工数量
    let isTmDate = selectedRow.value[43].barcode
    if (isTmDate.includes('TM')) {
      if (rowsTMBaoGongnumber.value < parseFloat(e)) {
        uni.showToast({
          title: `数量不能大于条码数量`,
          icon: 'error',
          duration: 2000
        })
        selectedRow.value[BSYIndex.value].BaoGongnumber = ''
        nextTick(() => {
          selectedRow.value[BSYIndex.value].BaoGongnumber = rowsTMBaoGongnumber.value
        })
        return
      }
    } else {
      if (e.length == 0) return
      if (parseFloat(wwgnumber) >= parseFloat(e)) {
        selectedRow.value[BSYIndex.value].BaoGongnumber = e
      } else {
        selectedRow.value[BSYIndex.value].BaoGongnumber = ''
        BaoGongnumberFocus.value = false
        nextTick(() => {
          BaoGongnumberFocus.value = true
        })
        uni.showToast({
          title: `报工数量不能大于未完工数量`,
          icon: 'error',
          duration: 2000
        })
        return
      }
    }
  }
  if (name === 'SCZBNo') {
    selectedRow.value[BSYIndex.value].SCZBNo = e
  }
  if (name === 'YGNo') {
    selectedRow.value[BSYIndex.value].YGNo = e
    YGList.value.forEach((item, index: any) => {
      if (e.toUpperCase() == item.value.toUpperCase()) {
        selectedRow.value[BSYIndex.value].YGNo = item.value
        selectedRow.value[BSYIndex.value].YGText = item.label
      }
    })
  }
  // 同步修改数据列表中的数据
  await Object.assign(SaoMaList.value[SaoMaListRowIndex.value], selectedRow.value)
}

const GetRowsData = async (index: number, typestr: string) => {
  //index 数据行索引
  SaoMaListRowIndex.value = index
  selectedRow.value = []
  selectedRow.value = Object.assign([], SaoMaList.value[index])
  if (selectedRow.value[43].barcode.includes('TM')) {
    rowsTMBaoGongnumber.value = parseFloat(selectedRow.value[BSYIndex.value].BaoGongnumber)
  } else {
    rowsTMBaoGongnumber.value = 0
  }
  nextTick(() => {
    keyword.value = ''
    searchinput.value = false
  })

  //光标定位
  await GuangbiaoInsert(typestr)
}

const departmentName = async (id: string) => {
  // 查询生产车间
  let fulllist
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
  return fulllist ? fulllist[0] : null
}

const Getmaterial = async (id: string) => {
  let fulllist
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
    //console.log(res);
    if (res.data.Result.Result != null) {
      fulllist = res.data.Result.Result.Number
    }
  })
  return fulllist
}

const pageloadData = async (FEntryid: string) => {
  const { data: res } = await PDA_GetTMcodeData(FEntryid)
  selectedRow.value = []
  if (res[0].length == 0) {
    SaoMaList.value = []
    uni.showToast({
      title: '暂无数据',
      icon: 'error',
      duration: 2000
    })
    keyword.value = ''
    return
  }
  let newdocument = res
  for (let i = 0; i < newdocument.length; i++) {
    let item = newdocument[i]
    let statename = RowStatecodeForMsg(item[1], item[0])
    item[0] = statename
    item[5] = await Getmaterial(item[5])
    const resss: any = await GetProductionFNumber(item[10])
    let ressdata = resss.data
    if (ressdata.length > 0) {
      item[10] = ressdata[0][0]
      item[9] = ressdata[0][1]
    }
    const res2 = await departmentName(item[4])
    item[4] = res2.Value
    item.push(
      {
        barcode: keyword.value
      },
      {
        BaoGongnumber: BaoGongnumber.value,
        SCZBNo: SCZBNo.value, //zb[0][1],
        SCZBText: SCZBText.value,
        YGNo: YGNo.value,
        YGText: YGText.value
      },
      {
        bgcolor: FBillStatusStatusColor(statename)
      },
      {
        checked: false
      }
    )
    SaoMaList.value.unshift(item)
  }
  StateColorIndex.value = newdocument[0].length - 2
  CheckIndex.value = newdocument[0].length - 1
  BSYIndex.value = newdocument[0].length - 3
  barcodeIndex.value = newdocument[0].length - 4
  Unfinishedquantity.value = newdocument[0][12]
  SaoMaListRowIndex.value = 0
  // 采用 requestAnimationFrame 代替 setTimeout
  setTimeout(() => {
    GetRowsData(0, 'show')
  }, 100)
}

const Fnseeting = () => {
  show.value = !show.value
}

const backpage = () => {
  uni.reLaunch({
    url: '/pages/index/index',
    animationType: 'pop-out',
    animationDuration: 200
  })
}

// 选中任一radio时，由radio-group触发
const radioGroupChange = (e: any) => {
  show.value = !show.value
  //存储报工类型数据状态
  JTypevalue.value = e
  uni.setStorageSync('F_WOMW__JJType', e)
  if (JTypevalue.value !== '1') {
    YGNoDisabled.value = true //不可编辑员工
    isShowDisplay.value = false
    YGNo.value = ''
  } else {
    YGNoDisabled.value = false //可编辑员工
    isShowDisplay.value = true
  }
  GuangbiaoInsert('show')
}

//调用摄像头进行扫码
const Fn_ScanCode = () => {
  uni.scanCode({
    onlyFromCamera: true,
    success: function (res) {
      let ccdata = res.result
      let state = GuangbiaoState.value
      if (state === 'BaoGongnumberFocus') {
        onInputChange('BaoGongnumber', ccdata)
        GuangbiaoInsert('show')
      } else if (state === 'SCZBNoFocus') {
        onInputChange('SCZBNo', ccdata)
        GuangbiaoInsert('show')
      } else if (state === 'YGNoFocus') {
        onInputChange('YGNo', ccdata)
        GuangbiaoInsert('show')
      } else if (state === 'searchinput') {
        keyword.value = ccdata
        handleInput(ccdata)
      }
    }
  })
}

const ClosePage = () => {
  uni.reLaunch({
    url: '/pages/index/index',
    animationType: 'pop-out',
    animationDuration: 200
  })
}

const getTime = function (time: any) {
  var date = new Date(time),
    year = date.getFullYear(),
    month: any = date.getMonth() + 1,
    day: any = date.getDate(),
    hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
    minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
    second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  month >= 1 && month <= 9 ? (month = '0' + month) : ''
  day >= 0 && day <= 9 ? (day = '0' + day) : ''
  var timer = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  return timer
}

// Lifecycle hooks
onLoad((option: any) => {
  FieldsList.value = uni.getStorageSync('FieldsList')
  if (option.F_FEntryid_one != undefined) {
    handleInput(option.F_FEntryid_one)
  }
  if (option.FEntryid != undefined && option.FEntryid != '') {
    FEntryid_one.value.push(option.FEntryid)
    pageloadData(option.FEntryid)
  }
  AppscreenWidth.value = getscreenWidth()
})

onMounted(() => {
  UserAuthoritylist.value = uni.getStorageSync('UserAuthority')
  //加载生产组别数据
  GetSCZB()
  //加载员工数据
  GetYG()
  searchinput.value = true
  //加载报工类型
  console.log("uni.getStorageSync('F_WOMW__JJType')：", uni.getStorageSync('F_WOMW__JJType'))
  if (uni.getStorageSync('F_WOMW__JJType') != '') {
    JTypevalue.value = uni.getStorageSync('F_WOMW__JJType')
  } else {
    JTypevalue.value = '1' //默认个人计件
  }
  //初始化界面
  //报工类型] 1 为"个人计件"时，操作员工为必录项，未录入保存提示错误"个人计件操作员不为空"
  //[报工类型]2 为"团体计件"时，操作员工锁定不可编辑，必录"生产组别"，未录入保存提示错误"团体计件生产组别不为空"
  //[报工类型]3 为"仅报工"时，操作员工锁定不可编辑，生产组别可编辑、非必录
  if (JTypevalue.value !== '1') {
    YGNoDisabled.value = true //不可编辑员工
    isShowDisplay.value = false
    YGNo.value = ''
  } else {
    YGNoDisabled.value = false //可编辑员工
    isShowDisplay.value = true
  }
})
</script>

<style lang="less" scoped>
.slot-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 30rpx;
}

.work_reporting_type {
  padding-top: 100rpx;
  padding-left: 60rpx;
  line-height: 80rpx;
}

:deep(.u-radio) {
  line-height: 2.8;
}

:deep(.uni-input-input) {
  font-size: 25rpx;
}

.prductionOrder_body {
  background-color: #f5f5f5;
}

.content_list {
  margin: 10rpx 10rpx 5rpx 10rpx;
  background-color: white;
  border: solid white 1rpx;
  border-radius: 5rpx;
  font-size: 26rpx;
}

.content_list_row {
  margin-bottom: 1rpx;
}

.material_list {
  .RowSelectStyle {
    background-color: #ebebeb;
  }
}

.material_list_item {
  margin: 10rpx 10rpx 5rpx 10rpx;
  background-color: white;
  border: solid white 1rpx;
  border-radius: 5rpx;
}

.content_list_row_teshu {
  margin-bottom: 16rpx;
}

.bottom_btn_list {
  border-top: #cccccc 1rpx solid;
  width: 100%;
  position: fixed;
  bottom: 0rpx;
  background-color: white;
  height: 120rpx;
  line-height: 120rpx;
}

.container {
  display: flex;
  justify-content: space-between;
}

.box {
  flex: 1;
  text-align: left;
  margin-bottom: 5rpx;
}

.box_right {
  display: flex;
  text-align: left;
  margin-bottom: 5rpx;
}

.container_list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40rpx;
  overflow: hidden;
}

.Fl_items_list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
  font-size: 25rpx;
  margin-top: 10rpx;
}

.item_list_left_max {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: flex-start;
  width: 75%;
}

.item_list_right_max {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: flex-end;
  align-items: flex-end;
  width: 20%;
}

.item_list_left {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: flex-start;
  width: 20%;
}

.item_list_right {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: flex-end;
  align-items: flex-end;
  width: 75%;
}

.item_list_left_3 {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: flex-start;
  width: 30%;
}

.item_list_center {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  width: 30%;
  justify-content: center;
}

.item_list_right_3 {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: flex-end;
  align-items: flex-end;
  width: 35%;
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

.leftwg {
  text-align: left;
  margin-left: 60rpx;
}

.right {
  text-align: right;
  margin-right: 35rpx;
}

.field_zb {
  height: 15rpx;
  width: 190rpx;
  line-height: 15rpx;
  margin-top: -25rpx;
  margin-right: -30rpx;
}

.search-container {
  display: flex;
  padding: 10rpx;

  .search-box {
    flex: 1;
    margin-right: 10rpx;
  }

  .scan-box {
    width: 60rpx;
  }
}

.content-row {
  display: flex;
  margin: 10rpx;

  .content-col {
    &:nth-child(1) {
      flex: 6;
    }

    &:nth-child(2) {
      flex: 3;
    }

    &:nth-child(3) {
      flex: 2;
    }
  }
}

.bottom-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1rpx solid #cccccc;

  .btn-wrapper {
    display: flex;
    justify-content: center;
    padding: 20rpx;

    .btn-item {
      flex: 1;
      max-width: 200rpx;
      text-align: center;
      margin: 0 20rpx;

      span {
        display: inline-block;
        padding: 10rpx 30rpx;
      }
    }
  }
}
</style>
