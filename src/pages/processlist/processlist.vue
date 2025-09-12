<template>
  <view class="prductionOrder_body">
    <u-navbar :custom-back="backpage" placeholder title="工序列表" :background="background">
      <template #left>
        <view @click="backpage">
          <u-icon name="arrow-left" size="20" />
        </view>
        <view class="ml-20rpx" @click="ClosePage">
          <u-icon name="close" size="20" />
        </view>
      </template>
    </u-navbar>
    <view class="content">
      <view class="">
        <view class="flex items-center justify-between ml-20rpx my-20rpx">
          <u-search
            placeholder="生产工单号/工序号/条形码"
            :clearabled="true"
            border-color="#cccccc"
            shape="square"
            :show-action="false"
            :focus="searchinput"
            v-model="keyword"
            @search="search"
          />
          <!-- @blur="searchinput=false" -->
          <view class="flex mx-20rpx items-center">
            <image
              @click="Fn_ScanCode"
              src="../../static/process/saoma.png"
              style="width: 60rpx; height: 60rpx"
            />
          </view>
        </view>
      </view>
      <!-- 条件查询布局 -->
      <view class="wrap">
        <view class="flex">
          <view class="w-25%">
            <view class="dropdown_Select_item">
              <checkbox-group @change="checkboxChangeAll">
                <label>
                  <checkbox
                    value="0"
                    :checked="checkedAll"
                    color="black"
                    style="transform: scale(0.7)"
                  />
                  <text style="font-size: 35rpx">全选</text>
                </label>
              </checkbox-group>
            </view>
          </view>
          <view class="w-25%">
            <view class="dropdown_Select_item text-16px">
              <label @click="clickState('状态')">状态</label>
              <u-popup :show="ZTstateShow" @close="ZTstateShow = false">
                <view class="popup-content">
                  <checkbox-group @change="checkboxChange">
                    <label v-for="item in ZhuangTaiData" :key="item.value">
                      <view
                        style="
                          display: flex;
                          flex-flow: row nowrap;
                          place-content: center space-evenly;
                          align-items: center;
                          padding-bottom: 20rpx;
                          flex-direction: row;
                          flex-wrap: nowrap;
                          align-content: center;
                          justify-content: flex-start;
                          margin-left: 40rpx;
                        "
                      >
                        <view>
                          <checkbox
                            :value="item.value"
                            :checked="item.checked"
                            style="transform: scale(0.7)"
                          />
                        </view>
                        <view>
                          <text style="color: #5d5d5d">{{ item.text }}</text>
                        </view>
                      </view>
                    </label>
                  </checkbox-group>
                </view>
                <view
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    margin-bottom: 30rpx;
                  "
                >
                  <view class="FnResettingStyle" @tap="FnResetting('状态')"><text>重置</text></view>
                  <view class="ConditionalSearchStyle" @tap="ConditionalSearch('状态')"
                    ><text>确定</text>
                  </view>
                </view>
              </u-popup>
            </view>
          </view>
          <view class="w-25%">
            <view class="dropdown_Select_item">
              <label @click="clickState('转移')">转移</label>
              <u-popup :show="ZYstateShow" @close="ZYstateShow = false">
                <view class="popup-content">
                  <checkbox-group @change="ZYcheckboxChange">
                    <label v-for="item in ZhuanyiData" :key="item.value">
                      <view
                        style="
                          display: flex;
                          flex-flow: row nowrap;
                          place-content: center space-evenly;
                          align-items: center;
                          padding-bottom: 20rpx;
                          flex-direction: row;
                          flex-wrap: nowrap;
                          align-content: center;
                          justify-content: flex-start;
                          margin-left: 40rpx;
                        "
                      >
                        <view>
                          <checkbox
                            :value="item.value"
                            :checked="item.checked"
                            style="transform: scale(0.7)"
                          />
                        </view>
                        <view>
                          <text style="color: #5d5d5d">{{ item.text }}</text>
                        </view>
                      </view>
                    </label>
                  </checkbox-group>
                </view>
                <view
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    margin-bottom: 30rpx;
                  "
                >
                  <view class="FnResettingStyle" @tap="FnResetting('转移')"><text>重置</text></view>
                  <view class="ConditionalSearchStyle" @tap="ConditionalSearch('转移')"
                    ><text>确定</text>
                  </view>
                </view>
              </u-popup>
            </view>
          </view>
          <view class="w-25%">
            <view class="dropdown_Select_item">
              <label @click="clickState('组别')">组别</label>
              <u-popup :show="ZBstateShow" @close="ZBstateShow = false">
                <view class="popup-content">
                  <scroll-view
                    scroll-top="scrollTop"
                    scroll-y="true"
                    class="scroll-Y"
                    @scroll="scroll"
                  >
                    <checkbox-group @change="ZbiecheckboxChange" width="700">
                      <label v-for="item in ZbieData" :key="item.value">
                        <view
                          style="
                            display: flex;
                            flex-flow: row nowrap;
                            place-content: center space-evenly;
                            align-items: center;
                            padding-bottom: 20rpx;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            align-content: center;
                            justify-content: flex-start;
                            margin-left: 40rpx;
                          "
                        >
                          <view>
                            <checkbox
                              :value="item.value"
                              :checked="item.checked"
                              style="transform: scale(0.7)"
                            />
                          </view>
                          <view>
                            <text style="color: #5d5d5d">{{ item.text }}</text>
                          </view>
                        </view>
                      </label>
                    </checkbox-group>
                  </scroll-view>
                </view>
                <view
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    margin-bottom: 30rpx;
                  "
                >
                  <view class="FnResettingStyle" @tap="FnResetting('组别')"><text>重置</text></view>
                  <view class="ConditionalSearchStyle" @tap="ConditionalSearch('组别')"
                    ><text>确定</text>
                  </view>
                </view>
              </u-popup>
            </view>
          </view>
        </view>
      </view>
      <!-- 内容展示 -->
      <u-empty v-if="PageItemModel.length == 0" text="内容为空" mode="list" />
      <view class="content_list px-10rpx" v-for="(item, index) in PageItemModel" :key="index">
        <view class="flex justify-between py-4rpx">
          <view> 生产单号 </view>
          <view>
            {{ item[0] }}
          </view>
        </view>

        <view class="flex justify-between py-4rpx">
          <view> 生产工单 </view>
          <view>
            {{ item[1] }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx">
          <view> 生产部门 </view>
          <view>
            {{ item[2] }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx">
          <view> 计划开工 </view>
          <view>
            {{ getTime(item[3]) }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx">
          <view> 计划完工 </view>
          <view>
            {{ getTime(item[4]) }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx">
          <view> 物料编码 </view>
          <view>
            {{ item[5] }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx" @click="LookDetail('物料名称', item[8])">
          <view> 物料名称 </view>
          <view>
            {{ Lengthoptimization(item[8]) }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx" @click="LookDetail('规格型号', item[9])">
          <view> 规格型号 </view>
          <view>
            {{ Lengthoptimization(item[9]) }}
          </view>
        </view>
        <view class="flex justify-between py-4rpx">
          <view> 生产数量 </view>
          <view>
            {{ item[6] }}
          </view>
        </view>
      </view>
      <!-- 物料列表 -->
      <view class="material_list">
        <checkbox-group style="font-size: 25rpx" @change="GongxuListcheckboxChange">
          <label v-for="item in GongxuList" :key="item.value">
            <view class="flex bg-#FFF m-10rpx p-10rpx">
              <view class="RowSelectStyle w-50px">
                <checkbox
                  :value="item.value"
                  style="transform: scale(0.7)"
                  :checked="item.checked"
                />
              </view>

              <view class="flex-1">
                <view class="flex justify-between">
                  <view>
                    <view class="">{{ item.ljname }}</view>
                  </view>
                  <view
                    class="text-#FFF px-10rpx py-1rpx"
                    :style="`background-color: ${item.bgcolor}; border-radius: 5rpx;`"
                  >
                    {{ item.fbillstatus }}
                  </view>
                </view>
                <view class="flex">
                  <view class="w-52px">
                    <view style="display: flex; align-items: flex-start">
                      <text class="list_item_text">{{ item.gxname }} </text>
                    </view>
                  </view>
                  <view class="flex-1">
                    <view style="display: flex; align-items: flex-start">
                      <text class="list_item_text">{{ item.gxno }}</text>
                    </view>
                  </view>
                  <view class="w-25%">
                    <view style="display: flex; justify-content: flex-end">
                      <text class="list_item_text">{{ item.banzu }}</text>
                    </view>
                  </view>
                </view>
                <!-- 第三行 -->
                <view class="flex">
                  <view class="w-33.33%">
                    <view
                      style="display: flex; justify-content: flex-start; align-items: flex-start"
                    >
                      <text class="list_item_text">生产数：{{ item.scs }}</text>
                    </view>
                  </view>
                  <view class="w-33.33%">
                    <view>
                      <text class="list_item_text">未完数：{{ item.wws }} </text>
                    </view>
                  </view>
                  <view class="w-33.33%">
                    <view style="display: flex; justify-content: flex-end">
                      <text class="list_item_text"> 待转移：{{ item.dzy }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </label>
        </checkbox-group>
        <view style="height: 130rpx" />
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom_btn_list" v-if="antishake">
        <u-row justify="center">
          <u-col span="2" v-if="UserAuthoritylist.includes('4')">
            <span @tap="startclick('开工')">开工</span>
          </u-col>
          <u-col span="2" v-if="UserAuthoritylist.includes('9')">
            <span @tap="startclick('报工')">报工</span>
          </u-col>
          <u-col span="2" v-if="UserAuthoritylist.includes('6')">
            <span @tap="startclick('转移')">转移</span>
          </u-col>
          <u-col span="3" v-if="UserAuthoritylist.includes('7')">
            <span @tap="startclick('关闭/反关闭')">关闭/反关闭</span>
          </u-col>
        </u-row>
      </view>
      <!-- 提示框 -->

      <u-modal
        :show="msg_popup"
        title="提示"
        contentTextAlign="center"
        @confirm="msg_popup = false"
        :content="msgcontent"
      />

      <u-modal
        :show="zy_popup"
        showCancelButton
        title="提示"
        contentTextAlign="center"
        content="确认提交页面数据？"
        @confirm="zhuanyi_fn"
        @cancel="zy_popup = false"
      />
      <!-- <u-modal v-model="msgshow" :content="msgcontent"></u-modal> -->
      <!-- <u-modal v-model="submittoshow" @confirm="zhuanyi_fn" :show-cancel-button="true" @cancel="submittoFncancel"
				title="提示" content="确认提交页面数据？"></u-modal> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import FromData from '../../common/FromIDs.json'
import OffkeyboardIcon from '@/static/icon/Offkeyboard.png'
import {
  GetProcessList,
  PostExecuteOperation,
  PostPush,
  PushGetProject,
  PostRowClose,
  FBillStatusStatusColor,
  FBillStatusStatusColorTo
} from '@/api/modules/processlist'
import { QueryAssociation } from '@/api/productionorder'
import { ValidataCodeForMsg, RowStatecodeForMsg } from '@/api/modules/CodeValidate'
import { FBillStatusForSearch, GetcodeisNull } from '@/common/ScreenSearch'
import {
  DepartmentQuery,
  DepartmentQueryforData,
  DepartmentQuery_One
} from '@/api/modules/department'
import { GetBarcode, GetBarcodeforFenlu } from '@/common/BarcodeParsing'
import { DraftSubmit, SaveSubmit } from '@/common/Processhandover'
import {
  GetProductionFNumber,
  GetProductionGxAll,
  GetProductionGxAllXX,
  GetBarcodeData
} from '@/api/modules/productionreporting'
import {
  TM_GetBarcodeData,
  TM_GetYuandanData,
  TM_GetSourceBillNoData,
  TM_GetSource_F_SCDNumberData_TOP,
  TM_GetSource_F_SCDNumberData,
  TM_GetSource_F_SCDNumberData_GXH_TOP,
  TM_GetSource_F_SCDNumberData_GXH,
  TM_GetSourceBillNoData_Gxitems,
  TM_LOAD_TOP,
  TM_LOAD_Bottom,
  TM_GetSourceBillNoData_Refresh
} from '@/api/modules/Scantheprocesscode'

// 定义响应式数据
const background = ref({
  backgroundColor: '#55aaff'
})

const keyword = ref('')
const msgshow = ref(false)
const msgcontent = ref('')
const show = ref(false)
const checked = ref(false)
const checkedAll = ref(false)
const selectedOptions = ref([])
const ZYshow = ref(false)
const Zbshow = ref(false)

const ZbieData = ref<any[]>([])
const ZhuanyiData = ref([
  {
    text: '全部',
    checked: true,
    value: 0
  },
  {
    text: '转移数量大于0',
    checked: false,
    value: 1
  }
])

const ZhuangTaiData = ref([
  {
    text: '全部',
    checked: true,
    value: 0
  },
  {
    text: '创建',
    checked: false,
    value: 1
  },
  {
    text: '下达',
    checked: false,
    value: 2
  },
  {
    text: '开工',
    checked: false,
    value: 3
  },
  {
    text: '完工',
    checked: false,
    value: 4
  },
  {
    text: '已关闭',
    checked: false,
    value: 5
  }
])

const GongxuList = ref<any[]>([])
const FieldsList = ref([])
const PageItemModel = ref<any[]>([])
const PageItemList = ref([])
const F_FID = ref('')
const GongxuListLength = ref(0)
const StateColorIndex = ref(0)
const GongxuListUpdate = ref([])
const ScreenSearch = ref([]) //筛选条件列表
const ZYScreenSearch = ref([])
const ZBieScreenSearch = ref([])
const searchinput = ref(false) //搜索框是否获取焦点
const YuanShiFenLu = ref<any[]>([]) //原始分录列表，排序用
const hiddSCGDNo = ref('') //生产工单号
const Scanbarcodestorage = ref<string[]>([]) //扫码集合
const submittoshow = ref(false) //转移提示框
const showIcon = ref(true)
const iconName = ref(OffkeyboardIcon)
const F_DepartmentAll = ref<any[]>([]) //车间名称存储
const GxAllList = ref<any[]>([]) //所有工序内容
const scrollTop = ref(0)
const old = reactive({
  scrollTop: 0
})
const antishake = ref(true) //防抖提交
const checkboxCheckedList = ref<string[]>([]) //选中的分录索引
const UserAuthoritylist = ref<string[]>([]) //权限

// 弹窗引用
const popup = ref()
const popupzy = ref()
const popupzb = ref()
const msg_popup = ref(false)
const zy_popup = ref(false)

// 页面加载
onLoad(async (option: any) => {
  let Fid = option.fid
  keyword.value = '' // option.code;
  F_FID.value = Fid
  const resTop: any = await TM_LOAD_TOP(Fid)
  YuandanGetProess(resTop.data)
  const resBottom: any = await TM_LOAD_Bottom(Fid)
  console.log('res', resBottom)
  dataprocess(resBottom.data)
})

// 页面显示

onShow(() => {
  LoadDepartment()
  GxGetAll()
})
// 挂载后执行
onMounted(() => {
  UserAuthoritylist.value = uni.getStorageSync('UserAuthority')
  switch (uni.getSystemInfoSync().platform) {
    case 'android':
      console.log('运行Android上')
      break
    case 'ios':
      console.log('运行iOS上')
      break
    default:
      console.log('运行在开发者工具上')
      break
  }
})

const scroll = (e: any) => {
  console.log(e)
  old.scrollTop = e.detail.scrollTop
}

const submittoFncancel = () => {
  zy_popup.value = false
  submittoshow.value = false
}

const LookDetail = (title: string, content: string) => {
  msgshow.value = true
  msgcontent.value = content
}

const Lengthoptimization = (str: string) => {
  return str.length > 18 ? str.slice(0, 18) + '...' : str
}

const LoadDepartment = async () => {
  //部门加载
  const { data: res } = await DepartmentQuery()
  F_DepartmentAll.value = res
  let bumen: any[] = []
  if (res.length > 0) {
    res.forEach((item: any, index: number) => {
      bumen.push({
        text: item[0],
        checked: false,
        value: item[1]
      })
    })
  }
  bumen.unshift({
    text: '全部',
    checked: true,
    value: 0
  })
  ZbieData.value = bumen
}

const FnResetting = (str: string) => {
  if (str === '状态') {
    ScreenSearch.value = []
    ZhuangTaiData.value.forEach((item) => {
      item.checked = false
    })
    ZhuangTaiData.value[0].checked = true
    ScreenSearch.value.push(ZhuangTaiData.value[0].value)
    console.log('状态1', ZhuangTaiData.value)
  }
  if (str === '转移') {
    ZYScreenSearch.value = []
    ZhuanyiData.value.forEach((item) => {
      item.checked = false
    })
    ZhuanyiData.value[0].checked = true
    ZYScreenSearch.value.push(ZhuanyiData.value[0].value)
  }
  if (str === '组别') {
    ZBieScreenSearch.value = []
    ZbieData.value.forEach((item) => {
      item.checked = false
    })
    ZbieData.value[0].checked = true
    ZBieScreenSearch.value.push(ZbieData.value[0].value)
  }
}
const ZTstateShow = ref(false)
const ZYstateShow = ref(false)
const ZBstateShow = ref(false)

const clickState = (str: string) => {
  if (str == '状态') {
    ZTstateShow.value = true
  }
  if (str == '转移') {
    ZYstateShow.value = true
  }
  if (str == '组别') {
    ZBstateShow.value = true
  }
}

const ZbieShow = (e: any) => {
  Zbshow.value = true
}

const ZhuanyiShow = (e: any) => {
  ZYshow.value = true
}

const ZhuangtaiShow = (e: any) => {
  show.value = true
}

const changeType = (type: any) => {
  checked.value = !checked.value
}

const ZbiecheckboxChange = (e: any) => {
  //组别筛选条件
  let checklist = e.detail.value
  if (checklist.length > 0) {
    if (checklist.includes(0)) {
      checklist.splice(0, 1)
      ZbieData.value[0].checked = false
    }
    ZBieScreenSearch.value = []
    for (let z = 0; z < ZbieData.value.length; z++) {
      let ditem = ZbieData.value[z]
      ditem.checked = false
    }
    for (let i = 0; i < checklist.length; i++) {
      let item = checklist[i]
      for (let z = 0; z < ZbieData.value.length; z++) {
        let ditem = ZbieData.value[z]
        if (ditem.value == item) {
          ditem.checked = true
          ZBieScreenSearch.value.push(ditem.text)
        }
      }
    }
  } else {
    for (let z = 0; z < ZbieData.value.length; z++) {
      let ditem = ZbieData.value[z]
      ditem.checked = false
    }
    ZbieData.value[0].checked = true
    ZYScreenSearch.value = []
  }
}

const ZYcheckboxChange = (e: any) => {
  //转移筛选条件
  let checklist = e.detail.value
  if (checklist.length > 0) {
    if (checklist.includes(0)) {
      checklist.splice(0, 1)
      ZhuanyiData.value[0].checked = false
    }
    ZYScreenSearch.value = []
    for (let z = 0; z < ZhuanyiData.value.length; z++) {
      let ditem = ZhuanyiData.value[z]
      ditem.checked = false
    }
    for (let i = 0; i < checklist.length; i++) {
      let item = checklist[i]
      for (let z = 0; z < ZhuanyiData.value.length; z++) {
        let ditem = ZhuanyiData.value[z]
        if (ditem.value == item) {
          ditem.checked = true
          ZYScreenSearch.value.push(ditem.value)
        }
      }
    }
  } else {
    for (let z = 0; z < ZhuanyiData.value.length; z++) {
      let ditem = ZhuanyiData.value[z]
      ditem.checked = false
    }
    ZhuanyiData.value[0].checked = true
    ZYScreenSearch.value = []
  }
}

const GongxuListcheckboxChange = (e: any) => {
  var checked = e.detail.value
  checkboxCheckedList.value = checked
}

const checkboxChangeAll = (e: any) => {
  //全选 / 反选操作
  console.log('全选', e)
  let ccall = e.detail.value
  checkboxCheckedList.value = []
  if (ccall.length > 0) {
    //全部选中时
    GongxuList.value.forEach((item: any, index: number) => {
      item.checked = true
      checkboxCheckedList.value.push(item.value)
    })
  } else {
    GongxuList.value.forEach((item: any, index: number) => {
      item.checked = false
    })
  }
}

const ConditionalSearch = (type_s: string) => {
  let Arr: any[] = []
  let newList: any[] = []
  switch (type_s) {
    case '状态':
      Arr = ScreenSearch.value
      //console.log("状态", Arr);
      newList = []
      GongxuList.value = YuanShiFenLu.value
      if (Arr.length == 0 || Arr[0] == 0) {
        GongxuList.value = YuanShiFenLu.value
      } else {
        Arr.forEach((a) => {
          GongxuList.value.forEach((item: any) => {
            if (item.fbillstatus === a) {
              newList.push(item)
            }
          })
        })
        GongxuList.value = newList
      }
      ZTstateShow.value = false
      break
    case '转移':
      Arr = ZYScreenSearch.value
      //console.log("转移", Arr);
      GongxuList.value = YuanShiFenLu.value
      Arr.forEach((a) => {
        if (a > 0) {
          GongxuList.value.forEach((item: any) => {
            if (item.dzy > 0) {
              newList.push(item)
            }
          })
          GongxuList.value = newList
        } else {
          GongxuList.value = YuanShiFenLu.value
        }
      })
      ZYstateShow.value = false
      break
    case '组别':
      Arr = ZBieScreenSearch.value
      //console.log("组别", Arr);
      if (Arr.length > 0) {
        GongxuList.value = YuanShiFenLu.value
        newList = []
        for (var i = 0; i < Arr.length; i++) {
          let a = Arr[i]
          if (a == 0) {
            newList = YuanShiFenLu.value
          } else {
            GongxuList.value.forEach((item: any) => {
              if (item.banzu.includes(a)) {
                newList.push(item)
              }
            })
          }
        }
        GongxuList.value = newList
      } else {
        GongxuList.value = YuanShiFenLu.value
      }
      ZBstateShow.value = false
      break
    default:
      break
  }

  show.value = false
  ZYshow.value = false
  Zbshow.value = false
}

const checkboxChange = (e: any) => {
  console.log('状态选择', e.detail.value)
  let checklist = e.detail.value
  if (checklist.length > 0) {
    if (checklist.includes(0)) {
      checklist.splice(0, 1)
      ZhuangTaiData.value[0].checked = false
    }
    ScreenSearch.value = []
    for (let z = 0; z < ZhuangTaiData.value.length; z++) {
      let ditem = ZhuangTaiData.value[z]
      ditem.checked = false
    }
    for (let i = 0; i < checklist.length; i++) {
      let item = checklist[i]
      for (let z = 0; z < ZhuangTaiData.value.length; z++) {
        let ditem = ZhuangTaiData.value[z]
        if (ditem.value == item) {
          ditem.checked = true
          ScreenSearch.value.push(ditem.text)
        }
      }
    }
  } else {
    for (let z = 0; z < ZhuangTaiData.value.length; z++) {
      let ditem = ZhuangTaiData.value[z]
      ditem.checked = false
    }
    ZhuangTaiData.value[0].checked = true
    ScreenSearch.value = []
  }
}

const search = async (e: any) => {
  console.log('扫码内容E', e)
  let insertVal = ''
  if (e instanceof Object) {
    insertVal = e.value
  } else {
    insertVal = e
  }
  if (insertVal === '') return
  console.log('扫码内容', insertVal)
  if (Scanbarcodestorage.value.includes(insertVal)) {
    msgcontent.value = '扫码重复！'
    msg_popup.value = true
    setTimeout(() => {
      keyword.value = ''
    }, 0)
    return
  } else {
    Scanbarcodestorage.value = []
    Scanbarcodestorage.value.push(insertVal)
  }
  if (insertVal.includes('TM')) {
    //扫描条码列表生成的条码
    const { data: res } = await TM_GetBarcodeData(insertVal)
    let data = res
    if (data.length > 0) {
      //源单内码
      let ydnm = data[0][0]
      const { data: ress } = await TM_GetYuandanData(ydnm)
      if (ress.length == 0) {
        msgcontent.value = '暂无数据！'
        msg_popup.value = true
        setTimeout(() => {
          keyword.value = ''
        }, 0)
        return
      } else {
        Scanbarcodestorage.value = []
        Scanbarcodestorage.value.push(insertVal)
        YuandanGetProess(ress)
      }

      //源单分录号
      let ydflh = data[0][1]
      const { data: ress2 } = await TM_GetSourceBillNoData(ydnm, ydflh)
      if (ress2.length == 0) {
        return
      } else {
        Scanbarcodestorage.value = []
        Scanbarcodestorage.value.push(insertVal)
        dataprocess(ress2)
      }
    }
  } else {
    let JMcode = insertVal.split('*') //[生产工单号*工序号]
    if (JMcode.length > 1) {
      //套打条码解析查询
      console.log('解析参数', JMcode[0], JMcode[1])
      const { data: res } = await TM_GetSource_F_SCDNumberData_GXH_TOP(JMcode[0], JMcode[1])
      if (res.length == 0) {
        msgcontent.value = '暂无数据！'
        msg_popup.value = true
        setTimeout(() => {
          keyword.value = ''
        }, 0)
        return
      } else {
        Scanbarcodestorage.value = []
        Scanbarcodestorage.value.push(insertVal)
        YuandanGetProess(res)
      }
      const { data: ress } = await TM_GetSource_F_SCDNumberData_GXH(JMcode[0], JMcode[1])
      if (ress.length == 0) {
        return
      } else {
        Scanbarcodestorage.value = []
        Scanbarcodestorage.value.push(insertVal)
        dataprocess(ress)
      }
    } else {
      // 条码数据单解析查询
      const { data: res } = await TM_GetSource_F_SCDNumberData_TOP(insertVal)
      if (res.length == 0) {
        msgcontent.value = '暂无数据！'
        msg_popup.value = true
        setTimeout(() => {
          keyword.value = ''
        }, 0)
        return
      } else {
        Scanbarcodestorage.value = []
        Scanbarcodestorage.value.push(insertVal)
        YuandanGetProess(res)
      }

      const { data: ress } = await TM_GetSource_F_SCDNumberData(insertVal)
      if (ress.length == 0) {
        return
      } else {
        Scanbarcodestorage.value = []
        Scanbarcodestorage.value.push(insertVal)
        dataprocess(ress)
      }
    }
  }
  keyword.value = ''
}

const YuandanGetProess = (Arr: any[]) => {
  PageItemModel.value = []
  Arr.forEach(async (item: any, index: number) => {
    F_FID.value = item[7]
    hiddSCGDNo.value = item[0]
    const res: any = await departmentName(item[2])
    item[2] = res.Value
    const materialRes: any = await Getmaterial(item[5])
    item[5] = materialRes
    PageItemModel.value.push(item)
  })
  keyword.value = ''
}

const GxGetAll = async () => {
  const { data: res } = await GetProductionGxAllXX()
  GxAllList.value = res
}

const dataprocess = async (Arr: any[]) => {
  if (GxAllList.value.length == 0) {
    await GxGetAll()
  }
  if (F_DepartmentAll.value.length == 0) {
    await LoadDepartment()
  }
  let gxArr = JSON.parse(JSON.stringify(GxAllList.value))
  let zbss = JSON.parse(JSON.stringify(F_DepartmentAll.value))
  let GongxuListItems: any[] = []
  GongxuList.value = []
  YuanShiFenLu.value = []
  await uni.showLoading({
    title: '数据请求中……',
    mask: true
  })
  try {
    for (var i = 0; i < Arr.length; i++) {
      let item = Arr[i]
      let dataState = await RowStatecodeForMsg(item[12], item[11])
      item[11] = dataState
      let gxElement = gxArr.filter((item_gx: any) => item_gx.includes(item[2]))
      let matchedElement = zbss.filter((items: any) => items.includes(item[6]))
      let colorval = await FBillStatusStatusColorTo(dataState)
      let newitem = {
        ljname: item[3],
        bgcolor: colorval,
        gxname: item[24],
        gxno: gxElement[0][2],
        banzu: matchedElement[0][0],
        scs: item[5],
        wws: item[7],
        dzy: parseFloat(item[23]) - parseFloat(item[13]),
        value: i,
        checked: false,
        fbillstatus: item[11],
        fid: item[9],
        fbillno: item[14],
        closeRowState: item[12],
        fentryID: item[10],
        toGXNo: item[22]
      }
      GongxuListItems.push(newitem)
    }
  } catch (e) {
    await setTimeout(function () {
      uni.hideLoading()
    }, 1000)
    console.log('完犊子', e)
  }
  GongxuList.value = GongxuListItems
  YuanShiFenLu.value = GongxuListItems
  await setTimeout(function () {
    uni.hideLoading()
  }, 1000)
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
  const { data: res } = await QueryAssociation(newdata)
  //console.log(res);
  if (res.Result.Result != null) {
    fulllist = res.Result.Result.Number
  }
  return fulllist
}

const departmentName = async (id: string) => {
  let fulllist: any
  const newdata = {
    FormId: `${FromData.ZBFromID}`,
    data: {
      CreateOrgId: 0,
      Id: `${id}`,
      IsSortBySeq: 'false'
    }
  }
  const res: any = await QueryAssociation(newdata)
  if (res.data.Result.Result != null) {
    fulllist = res.data.Result.Result.Name
  }
  return fulllist[0]
}

const getTime = (time: string) => {
  var date = new Date(time),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
    minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
    second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  month >= 1 && month <= 9 ? (month = '0' + month) : ''
  day >= 0 && day <= 9 ? (day = '0' + day) : ''
  var timer = year + '-' + month + '-' + day //+ ' ' + hour + ':' + minute + ':' +
  second
  return timer
}

const backpage = () => {
  uni.navigateBack({
    url: '/pages/productionorder/productionorder'
  })
}

const startclick = (str: string) => {
  console.log('点击', str)
  if (str === '开工') {
    //把单选或者多选的工序列表从状态"下达"改为"开工"，如果选中的状态为
    //创建、开工、完工、关闭时提示错误"不符合开工条件"
    KaigongFn()
    checkedAll.value = false
  }
  if (str === '报工') {
    //只能单选工序列表进入报工界面 2.9.3，详细参见，如果多选列表、
    //或者选中状态为"创建、下达、完工、关闭"的列表时提示错误"不符合报工条件"。(1:创建,2:下达,3:开工,4:完工)
    let selectedCount: any[] = []
    let stateCode
    let F_FEntryid_one = ''
    for (var i = 0; i < GongxuList.value.length; i++) {
      let item = GongxuList.value[i]
      if (checkboxCheckedList.value.includes(item.value)) {
        stateCode = item.fbillstatus //状态
        F_FEntryid_one = item.fbillno + '*' + item.gxname // 工序id
        selectedCount.push(item)
      }
    }
    if (selectedCount.length > 1) {
      //只能选择一条
      msgcontent.value = '不符合报工条件！'
      msg_popup.value = true
      return false
    }
    if (selectedCount.length == 1) {
      if (
        stateCode === '创建' ||
        stateCode === '下达' ||
        stateCode === '完工' ||
        stateCode === '已关闭'
      ) {
        msgcontent.value = '不符合报工条件！'
        msg_popup.value = true
        return false
      } else {
        //跳转到 生产报工界面  需要传递参数
        //参数 生产单号*工序号
        uni.navigateTo({
          url: `/pages/productionreporting/productionreporting?F_FEntryid_one=${F_FEntryid_one}`
        })
      }
    }
    if (selectedCount.length == 0) {
      msgcontent.value = '未选择任何数据！'
      msg_popup.value = true
      return false
    }
  }
  if (str === '转移') {
    submittoshow.value = true
    zy_popup.value = true
  }
  if (str === '关闭/反关闭') {
    closeOnClose()
    checkedAll.value = false
  }
}

const zhuanyi_fn = async () => {
  zy_popup.value = false
  //把单选或者多选、待转移数量大于 0 的工序列表，自动生成工序交接单，
  //详细生成工序交接单的功能参见 2.7.8.4。如果选中的待转移为"0"的工序列表提示错误"不符合转移条件"
  // 下推 到 生产交接单
  let GXBHarr: any[] = []
  let F_FEntryid_Arr: any[] = []
  let gono = ''
  for (var i = 0; i < GongxuList.value.length; i++) {
    let item = GongxuList.value[i]
    if (checkboxCheckedList.value.includes(item.value)) {
      if (item.dzy == 0) {
        msgcontent.value = '不符合转移条件！'
        msg_popup.value = true
        return false
      }
      if (parseFloat(item.toGXNo) == 0) {
        msgcontent.value = '转入工序号为空请在PC端操作！'
        msg_popup.value = true
        return false
      }
      gono = item.fbillno
      GXBHarr.push(item)
      F_FEntryid_Arr.push(item.fentryID)
    }
  }
  //console.log("GXBHarr", GXBHarr);
  if (GXBHarr.length > 0) {
    antishake.value = false
    const { data: res } = await PostPush(F_FEntryid_Arr.join(','))
    //console.log("下推返回", res);
    let ResultID = res.Result.ResponseStatus.SuccessEntitys[0].Id
    //查询下推后工序交接单内容
    const { data: pushpro } = await PushGetProject(ResultID)
    //console.log("pushpro", pushpro);

    let ResultObjArr = pushpro.Result.Result.FGXJJDEntry
    let canshu: any[] = []
    for (var i = 0; i < ResultObjArr.length; i++) {
      let item = ResultObjArr[i]
      canshu.push({
        FEntryID: item.Id, //分录工序实体主键
        F_Dept: item.F_Dept.Number, //生产组别
        F_GXNumber: item.F_GXNumber.Number, //转出工序编号
        FNumber: item.FNumber.Number, //物料编码
        F_ALMA_ZRGXBH: item.F_ALMA_ZRGXBH.Number, //转入工序编号
        F_ZRGXNO: item.F_ZRGXNO, //转入工序编号
        F_GDSCQty: item.F_GDSCQty, //生产数量
        F_QADV_ZCCJ: item.F_QADV_ZCCJ.Number, //转入车间：
        FSCQty: item.FSCQty, // 待转移数量 = 生产工单的完工数量-转出数量
        F_SCDNumber: item.F_SCDNumber, //生产单号
        F_JJQty: item.F_JJQty, //数量
        F_GXQty: item.F_GXQty, //工序数量
        F_SourceBillType: item.F_SourceBillType, //源单类型
        F_SourceBillNo: item.F_SourceBillNo, //源单编号
        F_SourceEntry: item.F_SourceEntry, //源单行号
        F_SourceEntryID: item.F_SourceEntryID, //源单分录内码
        F_SourceID: item.F_SourceID, //源单内码
        F_SCDNO: item.F_SCDNO, //生产订单编号
        F_SCDEntry: item.F_SCDEntry, //生产订单行号
        FSCGDNumber: item.FSCGDNumber, //生产工单编号
        F_LJName: item.F_LJName, //零件名称
        F_GDSCQty: item.F_GDSCQty, //生产数量 -
        F_GXNO: item.F_GXNO, //转出工序号
        FGYLXBB: item.FGYLXBB, //工艺路线版本
        F_GYLXType: item.F_GYLXType, // 工艺路线类型
        F_GYLX: item.F_GYLX.Number, //工艺路线
        F_Note: item.F_Note, //备注
        FLinkId: item.FGXJJDEntry_Link[0].Id,
        FGXJJDEntry_Link_FRuleId: item.FGXJJDEntry_Link[0].RuleId,
        FGXJJDEntry_Link_FSTableName: item.FGXJJDEntry_Link[0].STableName,
        FGXJJDEntry_Link_FSBillId: item.FGXJJDEntry_Link[0].SBillId, //源单内码
        FGXJJDEntry_Link_FSId: item.FGXJJDEntry_Link[0].SId, //源单分录id
        FGXJJDEntry_Link_FSCQtyOld: item.FGXJJDEntry_Link[0].FSCQtyOld, //原始携带量
        FGXJJDEntry_Link_FSCQty: item.FGXJJDEntry_Link[0].FSCQty //修改携带量
      })
    }
    const isSuccess = await SaveSubmit(ResultID, canshu)
    if (isSuccess) {
      Scanbarcodestorage.value = []
      antishake.value = true
      search(gono)
    }
  } else {
    msgcontent.value = '未选中任何行'
    msg_popup.value = true
    return false
  }
  checkedAll.value = false
}

const closeOnClose = async () => {
  //点击[关闭/反关闭]，状态为创建、下达、开工、完工的分录状态改为"关闭"，
  //状态为关闭的分录改为关闭前的状态（注：生产工单分录"状态"每次更新时、"上一状态"记录 状态更新前的状态）。
  // 调用行关闭APi PostRowClose
  let Fidstr = '' //生产工单内码

  let sArr = GongxuList.value
  let rows = sArr.filter((item: any) => checkboxCheckedList.value.includes(item.value))
  if (rows.length == 0) {
    msgcontent.value = '未选择任何分录内容'
    msg_popup.value = true
    return false
  } else {
    Fidstr = rows[0].fid
    uni.showLoading({
      title: '正在操作中……'
    })
    //获取选中行EntryId
    let wgbEntryIds: any[] = [] //未关闭状态EntryId集合
    let ygbEntryIds: any[] = [] //已关闭状态EntryId集合
    rows.forEach((item: any) => {
      if (item.closeRowState == 1) {
        //未关闭
        wgbEntryIds.push(item.fentryID)
      } else {
        ygbEntryIds.push(item.fentryID)
      }
    })
    console.log(wgbEntryIds, ygbEntryIds)
    //关闭/反关闭  RowClose/FROWClose
    if (wgbEntryIds.length > 0) {
      const res: any = await PostRowClose('RowClose', F_FID.value, wgbEntryIds.join(','))
      let responseCode = res.data.Result.ResponseStatus.MsgCode
      if (responseCode == 0) {
        //提交成功
        //刷新界面
        GongxuList.value.forEach((item: any, index: number) => {
          if (checkboxCheckedList.value.includes(item.value)) {
            item.fbillstatus = '已关闭'
            item.closeRowState = 2
            item.bgcolor = 'defult'
          }
        })
      }
      await setTimeout(function () {
        uni.hideLoading()
      }, 1000)
    }
    if (ygbEntryIds.length > 0) {
      const { data: res } = await PostRowClose('FROWClose', F_FID.value, ygbEntryIds.join(','))
      let responseCode = res.Result.ResponseStatus.MsgCode
      if (responseCode == 0) {
        for (var i = 0; i < ygbEntryIds.length; i++) {
          let itemgx = ygbEntryIds[i]
          const { data: ress } = await TM_GetSourceBillNoData_Gxitems(itemgx)
          GongxuList.value.forEach((item: any, index: number) => {
            if (checkboxCheckedList.value.includes(item.value) && item.fentryID === ress[0][2]) {
              let dataState = RowStatecodeForMsg(ress[0][1], ress[0][0])
              let fbillstatusitem = ress[0][0]
              item.fbillstatus = dataState
              item.closeRowState = 1
              item.bgcolor = FBillStatusStatusColorTo(dataState)
            }
          })
        }
      }
      await setTimeout(function () {
        uni.hideLoading()
      }, 1000)
    }
  }
}

const KaigongFn = async () => {
  let Fidstr = '' //生产工单内码
  let Entry_Ids: any[] = [] //分录内码，工序列表ID
  let f_FBillNo = ''
  //获取所选数据行数，对应的分录信息id
  let rowsData: any[] = [] //选中行数据
  GongxuList.value.forEach((item: any, index: number) => {
    console.log('item', item, checkboxCheckedList.value)
    if (checkboxCheckedList.value.includes(item.value)) {
      Fidstr = item.fid
      f_FBillNo = item.fbillno
      let ch_data = [item.fentryID, item.fbillstatus, item.closeRowState]
      rowsData.push(ch_data) //item[11] 状态，需要判断是否是 下达 状态
    }
  })
  //如果未选择任何行，点击开工后判断
  if (rowsData.length == 0) {
    msgcontent.value = '未选择任何分录内容'
    msg_popup.value = true
    return false
  }
  rowsData.forEach((item) => {
    if (item[2] === '1' && item[1] === '下达') {
      Entry_Ids.push(item[0])
    } else {
      msgcontent.value = '不符合开工条件'
      msg_popup.value = true
      return false
    }
  })
  //判断状态是否关闭 1 未关闭
  //状态必须位下达才执行开工
  let postData = {
    formid: `${FromData.SCGDFromID}`,
    opNumber: 'RowKG',
    data: {
      CreateOrgId: 0,
      Numbers: [],
      Ids: '',
      PkEntryIds: [
        {
          Id: `${Fidstr}`,
          EntryIds: `${Entry_Ids.join(',')}`
        }
      ],
      NetworkCtrl: '',
      IgnoreInterationFlag: ''
    }
  }
  const { data: res } = await PostExecuteOperation(postData)
  let responseCode = res.Result.ResponseStatus.MsgCode
  if (responseCode == 0) {
    //提交成功
    //刷新界面
    const ress: any = await TM_GetSourceBillNoData_Refresh(Fidstr)
    dataprocess(ress.data)
  }
}

const closeDropdown = () => {
  // @ts-ignore
  this.$refs.uDropdown.close()
}

const getScancode = (code: string) => {
  // 有些PDA会自带换行符，trim函数处理下
  code = code.trim()
  //code就是扫描获取的值
  console.log(code)
}

const ClosePage = () => {
  console.log('关闭页面')
  uni.reLaunch({
    url: '/pages/index/index',
    animationType: 'pop-out',
    animationDuration: 200
  })
}

const radioGroupChange = () => {}

const Fn_ScanCode = () => {
  uni.scanCode({
    onlyFromCamera: true,
    success: function (res: any) {
      keyword.value = ''
      keyword.value = res.result
      search(res.result)
    }
  })
}

const onSelected = (res: any) => {}

const dateChange = (d: string) => {
  uni.showToast({
    icon: 'none',
    title: d
  })
}

// 导出给模板使用的属性和方法
defineExpose({
  backpage,
  close,
  confirm,
  scroll,
  submittoFncancel,
  LookDetail,
  Lengthoptimization,
  LoadDepartment,
  FnResetting,
  clickState,
  ZbieShow,
  ZhuanyiShow,
  ZhuangtaiShow,
  changeType,
  ZbiecheckboxChange,
  ZYcheckboxChange,
  GongxuListcheckboxChange,
  checkboxChangeAll,
  ConditionalSearch,
  checkboxChange,
  search,
  YuandanGetProess,
  GxGetAll,
  dataprocess,
  Getmaterial,
  departmentName,
  getTime,
  startclick,
  zhuanyi_fn,
  closeOnClose,
  KaigongFn,
  closeDropdown,
  getScancode,
  ClosePage,
  radioGroupChange,
  Fn_ScanCode,
  onSelected,
  dateChange
})
</script>

<style lang="scss" scoped>
.prductionOrder_body {
  background-color: #f5f5f5;
}

.check-page::v-deep {
  .root {
    .navs {
      color: #cccccc;
    }

    .actNav,
    .actOpt {
      color: #cccccc !important;
      background-color: #cccccc;
    }
  }

  .navs {
    padding: 0 !important;
  }

  .navs > uni-view {
    // padding:0  40rpx;
    padding: 0 20rpx 0 40rpx;
    justify-content: space-between;
  }
}

.checkboxRow {
  max-width: 150rpx;
}

.rowbetween {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: #fff;
}

.RowSelectStyle {
  display: flex;
  flex-direction: column;
  place-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: nowrap;
  justify-content: center;
  height: 60px;
}

.popup-content {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  border-bottom: #fff 0px;
  background-color: #fff;
  overflow: auto;
  height: 450rpx;
}

/*不显示遮罩层*/
// ::v-deep .u-dropdown__content__mask {
// 	opacity: 1;
// }

// ::v-deep .u-cell-item-box {
// 	background-color: #cccccc;
// }
// ::v-deep .u-cell__value {
// 	text-align: left;
// }

// ::v-deep .u-cell__value {
// 	text-align: left;
// }
.ConditionalSearchStyle {
  width: 300rpx;
  height: 100rpx;
  border: #55aaff 1rpx solid;
  background-color: #55aaff;
  border-radius: 5rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.FnResettingStyle {
  width: 300rpx;
  height: 100rpx;
  border: #cccccc 1rpx solid;
  background-color: #d9d9d9;
  border-radius: 5rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu_title {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
  font-size: 30rpx;
}

.slot-wrap {
  display: flex;
  align-items: center;
  /* 如果您想让slot内容占满整个导航栏的宽度 */
  flex: 1;
  /* 如果您想让slot内容与导航栏左右有空隙 */
  padding: 0 30rpx;
}

.select-style {
  font-size: 30rpx;
  color: #333;
  background-color: #fff;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 8rpx 8rpx;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  width: 200rpx;
  /* 设置下拉框宽度 */
  height: 80rpx;
  /* 设置下拉框高度 */
  line-height: 80rpx;
  /* 设置下拉框文本行高 */
}

.row-list-item-left {
  justify-content: center !important;
}

.flex-box {
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.flex-box-item-left {
  display: flex;
  justify-content: flex-start;
  margin-left: 25rpx;
}

.slot-content {
  background-color: white;
}

.content_list {
  margin: 10rpx 10rpx 5rpx 10rpx;
  background-color: white;
  border: solid white 1rpx;
  border-radius: 5rpx;
  font-size: 26rpx;
}

.content_list_row {
  margin-bottom: 10rpx;
}

.material_list {
}

.material_list_item {
  margin-top: 10rpx;
  background-color: white;
  border: solid white 1rpx;
  border-radius: 5rpx;
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

.dropdown_btn {
  width: 80%;
}

.dropdown_Select_item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ZhuangTaiData-list {
  padding: 50rpx;
}

.ZhuangTaiData-item {
  line-height: 60rpx;
  margin-top: 20rpx;
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
  margin-right: 35rpx;
}
</style>
