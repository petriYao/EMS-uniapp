<template>
  <view class="prductionOrder_body">
    <u-navbar :custom-back="backpage" title="工序列表" :background="background">
      <view class="slot-wrap">
        <u-icon
          @click="ClosePage"
          name="close"
          color="rgb(96, 98, 102)"
          size="35"
          style="margin-left: 30rpx"
        />
      </view>
      <view solt="right" />
    </u-navbar>
    <view class="content">
      <view class="">
        <u-row>
          <u-col span="10">
            <u-search
              placeholder="生产工单号/工序号/条形码"
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
          </u-col>
          <u-col span="1">
            <image
              @click="Fn_ScanCode"
              src="../../static/process/saoma.png"
              style="width: 60rpx; height: 60rpx"
            />
          </u-col>
        </u-row>
      </view>
      <!-- 条件查询布局 -->
      <view class="wrap">
        <u-row gutter="8">
          <u-col span="3">
            <view class="demo-layout bg-purple-light dropdown_Select_item">
              <!-- <u-checkbox-group>
								<u-checkbox style="margin-left: 20rpx;" v-model="checkedAll" label-size="35"
									@change="checkboxChangeAll">全选</u-checkbox>
							</u-checkbox-group> -->
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
          </u-col>
          <u-col span="3">
            <view class="demo-layout bg-purple-light dropdown_Select_item">
              <label @click="clickState('状态')">状态</label>
              <uni-popup background-color="#fff" ref="popup" type="top">
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
              </uni-popup>
            </view>
          </u-col>
          <u-col span="3">
            <view class="demo-layout bg-purple-light dropdown_Select_item">
              <label @click="clickState('转移')">转移</label>
              <uni-popup background-color="#fff" ref="popupzy" type="top">
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
              </uni-popup>
            </view>
          </u-col>
          <u-col span="2">
            <view class="demo-layout bg-purple-light dropdown_Select_item">
              <label @click="clickState('组别')">组别</label>
              <uni-popup background-color="#fff" ref="popupzb" type="top">
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
              </uni-popup>
            </view>
          </u-col>
        </u-row>
      </view>
      <!-- 内容展示 -->
      <u-empty v-if="PageItemModel.length == 0" text="内容为空" mode="list" />
      <view class="content_list" v-for="(item, index) in PageItemModel" :key="index">
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 生产单号 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ item[0] }}
            </view>
          </u-col>
        </u-row>
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 生产工单 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ item[1] }}
            </view>
          </u-col>
        </u-row>
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 生产部门 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ item[2] }}
            </view>
          </u-col>
        </u-row>
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 计划开工 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ getTime(item[3]) }}
            </view>
          </u-col>
        </u-row>
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 计划完工 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ getTime(item[4]) }}
            </view>
          </u-col>
        </u-row>
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 物料编码 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ item[5] }}
            </view>
          </u-col>
        </u-row>
        <u-row gutter="16" class="content_list_row" @click="LookDetail('物料名称', item[8])">
          <view class="container">
            <view class="left">物料名称</view>
            <view class="right">{{ Lengthoptimization(item[8]) }}</view>
          </view>
        </u-row>
        <u-row gutter="16" class="content_list_row" @click="LookDetail('规格型号', item[9])">
          <view class="container">
            <view class="left">规格型号</view>
            <view class="right">{{ Lengthoptimization(item[9]) }}</view>
          </view>
        </u-row>
        <u-row gutter="16" class="content_list_row">
          <u-col span="6">
            <view class="demo-layout bg-purple"> 生产数量 </view>
          </u-col>
          <u-col span="5">
            <view class="demo-layout bg-purple-light" style="text-align: right">
              {{ item[6] }}
            </view>
          </u-col>
        </u-row>
      </view>
      <!-- 物料列表 -->
      <view class="material_list">
        <checkbox-group style="font-size: 25rpx" @change="GongxuListcheckboxChange">
          <label v-for="item in GongxuList" :key="item.value">
            <uni-row class="material_list_item">
              <uni-col :span="3">
                <view class="RowSelectStyle">
                  <checkbox
                    :value="item.value"
                    style="transform: scale(0.7)"
                    :checked="item.checked"
                  />
                </view>
              </uni-col>
              <uni-col :span="20">
                <view>
                  <uni-row>
                    <uni-col :span="18">
                      <view class="demo-layout bg-purple"
                        ><text class="list_item_text">{{ item.ljname }}</text></view
                      >
                    </uni-col>
                    <uni-col :span="6">
                      <view style="display: flex; justify-content: flex-end">
                        <uni-tag
                          :text="item.fbillstatus"
                          :type="item.bgcolor"
                          :border-color="item.bgcolor"
                          :bg-color="item.bgcolor"
                          color="#ffffff"
                          size="small"
                          style="text-align: center"
                        />
                      </view>
                    </uni-col>
                  </uni-row>
                  <uni-row>
                    <uni-col :span="4">
                      <view style="display: flex; align-items: flex-start">
                        <text class="list_item_text">{{ item.gxname }} </text>
                      </view>
                    </uni-col>
                    <uni-col :span="14">
                      <view style="display: flex; align-items: flex-start">
                        <text class="list_item_text">{{ item.gxno }}</text>
                      </view>
                    </uni-col>
                    <uni-col :span="6">
                      <view style="display: flex; justify-content: flex-end">
                        <text class="list_item_text">{{ item.banzu }}</text>
                      </view>
                    </uni-col>
                  </uni-row>
                  <uni-row justify="space-between" style="text-align: left">
                    <uni-col :span="8">
                      <view
                        style="display: flex; justify-content: flex-start; align-items: flex-start"
                      >
                        <text class="list_item_text">生产数：{{ item.scs }}</text>
                      </view>
                    </uni-col>
                    <uni-col :span="8">
                      <view>
                        <text class="list_item_text">未完数：{{ item.wws }} </text>
                      </view>
                    </uni-col>
                    <uni-col :span="8">
                      <view style="display: flex; justify-content: flex-end">
                        <text class="list_item_text"> 待转移：{{ item.dzy }}</text>
                      </view>
                    </uni-col>
                  </uni-row>
                </view>
              </uni-col>
            </uni-row>
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
      <uni-popup ref="msg_popup" type="dialog">
        <uni-popup-dialog
          mode="base"
          :content="msgcontent"
          :duration="2000"
          :before-close="true"
          @close="close"
          @confirm="confirm"
        />
      </uni-popup>
      <uni-popup ref="zy_popup" type="dialog">
        <uni-popup-dialog
          mode="base"
          content="确认提交页面数据?"
          :duration="2000"
          :before-close="true"
          @close="submittoFncancel"
          @confirm="zhuanyi_fn"
        />
      </uni-popup>
      <!-- <u-modal v-model="msgshow" :content="msgcontent"></u-modal> -->
      <!-- <u-modal v-model="submittoshow" @confirm="zhuanyi_fn" :show-cancel-button="true" @cancel="submittoFncancel"
				title="提示" content="确认提交页面数据？"></u-modal> -->
    </view>
  </view>
</template>

<script>
import FromData from '@/common/FromIDs.json'
import {
  GetProcessList,
  PostExecuteOperation,
  PostPush,
  PushGetProject,
  PostRowClose,
  FBillStatusStatusColor,
  FBillStatusStatusColorTo
} from '@/api'
import { QueryAssociation } from '@/api'
import { ValidataCodeForMsg, RowStatecodeForMsg } from '@/api'
import { FBillStatusForSearch, GetcodeisNull } from '@/common/ScreenSearch.js'
import { DepartmentQuery, DepartmentQueryforData, DepartmentQuery_One } from '@/api'
import { GetBarcode, GetBarcodeforFenlu } from '@/common/BarcodeParsing.js'
import { DraftSubmit, SaveSubmit } from '@/common/Processhandover.js'
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
} from '@/api'
export default {
  data() {
    return {
      Keyboardswitch_SCGD: false,
      UserAuthoritylist: [], //权限
      background: {
        backgroundColor: '#55aaff'
      },
      keyword: '',
      msgshow: false,
      msgcontent: '',
      show: false,
      checked: false,
      checkedAll: false,
      selectedOptions: [],
      ZYshow: false,
      Zbshow: false,
      ZbieData: [],
      ZhuanyiData: [
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
      ],
      ZhuangTaiData: [
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
      ],
      GongxuList: [],
      FieldsList: [],
      PageItemModel: [],
      PageItemList: [],
      F_FID: '',
      GongxuListLength: 0,
      StateColorIndex: 0,
      GongxuListUpdate: [],
      ScreenSearch: [], //筛选条件列表
      ZYScreenSearch: [],
      ZBieScreenSearch: [],
      searchinput: false, //搜索框是否获取焦点
      YuanShiFenLu: [], //原始分录列表，排序用
      hiddSCGDNo: '', //生产工单号
      Scanbarcodestorage: [], //扫码集合
      submittoshow: false, //转移提示框
      showIcon: true,
      iconName: require('@/static/icon/Offkeyboard.png'),
      F_DepartmentAll: [], //车间名称存储
      GxAllList: [], //所有工序内容
      scrollTop: 0,
      old: {
        scrollTop: 0
      },
      antishake: true, //防抖提交
      checkboxCheckedList: [] //选中的分录索引
    }
  },
  async onLoad(option) {
    let Fid = option.fid
    this.keyword = '' // option.code;
    this.F_FID = Fid
    await TM_LOAD_TOP(Fid).then((res) => {
      this.YuandanGetProess(res.data)
    })
    await TM_LOAD_Bottom(Fid).then((res) => {
      console.log('res', res)
      this.dataprocess(res.data)
    })
  },
  onUnload() {},
  onHide() {},
  onShow() {
    this.LoadDepartment()
    this.GxGetAll()
  },
  mounted() {
    this.UserAuthoritylist = uni.getStorageSync('UserAuthority')
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
  },
  methods: {
    close() {
      this.$refs.msg_popup.close()
    },
    confirm() {
      this.$refs.msg_popup.close()
    },
    scroll: function (e) {
      console.log(e)
      this.old.scrollTop = e.detail.scrollTop
    },
    submittoFncancel() {
      this.$refs.zy_popup.close()
      this.submittoshow = false
    },
    LookDetail(title, content) {
      this.msgshow = true
      this.msgtitle = title
      this.msgcontent = content
    },
    Lengthoptimization(str) {
      return str.length > 18 ? str.slice(0, 18) + '...' : str
    },
    async LoadDepartment() {
      //部门加载
      const { data: res } = await DepartmentQuery()
      this.F_DepartmentAll = res
      let bumen = []
      if (res.length > 0) {
        res.forEach((item, index) => {
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
      this.ZbieData = bumen
    },
    FnResetting(str) {
      if (str === '状态') {
        this.ScreenSearch = []
        this.ZhuangTaiData.forEach((item) => {
          item.checked = false
        })
        this.ZhuangTaiData[0].checked = true
        this.ScreenSearch.push(this.ZhuangTaiData[0].value)
        console.log('状态1', this.ZhuangTaiData)
      }
      if (str === '转移') {
        this.ZYScreenSearch = []
        this.ZhuanyiData.forEach((item) => {
          item.checked = false
        })
        this.ZhuanyiData[0].checked = true
        this.ZYScreenSearch.push(this.ZhuanyiData[0].value)
      }
      if (str === '组别') {
        this.ZBieScreenSearch = []
        this.ZbieData.forEach((item) => {
          item.checked = false
        })
        this.ZbieData[0].checked = true
        this.ZBieScreenSearch.push(this.ZbieData[0].value)
      }
    },
    clickState(str) {
      if (str == '状态') {
        this.$refs.popup.open('bottom')
      }
      if (str == '转移') {
        this.$refs.popupzy.open('bottom')
      }
      if (str == '组别') {
        this.$refs.popupzb.open('bottom')
      }
    },
    ZbieShow(e) {
      this.Zbshow = true
    },
    ZhuanyiShow(e) {
      this.ZYshow = true
    },
    ZhuangtaiShow(e) {
      this.show = true
    },
    changeType: function (type) {
      this.checked = !this.checked
    },
    ZbiecheckboxChange(e) {
      //组别筛选条件
      let checklist = e.detail.value
      if (checklist.length > 0) {
        if (checklist.includes(0)) {
          checklist.splice(0, 1)
          this.ZbieData[0].checked = false
        }
        this.ZBieScreenSearch = []
        for (let z = 0; z < this.ZbieData.length; z++) {
          let ditem = this.ZbieData[z]
          ditem.checked = false
        }
        for (let i = 0; i < checklist.length; i++) {
          let item = checklist[i]
          for (let z = 0; z < this.ZbieData.length; z++) {
            let ditem = this.ZbieData[z]
            if (ditem.value == item) {
              ditem.checked = true
              this.ZBieScreenSearch.push(ditem.text)
            }
          }
        }
      } else {
        for (let z = 0; z < this.ZbieData.length; z++) {
          let ditem = this.ZbieData[z]
          ditem.checked = false
        }
        this.ZbieData[0].checked = true
        this.ZYScreenSearch = []
      }
    },
    ZYcheckboxChange(e) {
      //转移筛选条件
      let checklist = e.detail.value
      if (checklist.length > 0) {
        if (checklist.includes(0)) {
          checklist.splice(0, 1)
          this.ZhuanyiData[0].checked = false
        }
        this.ZYScreenSearch = []
        for (let z = 0; z < this.ZhuanyiData.length; z++) {
          let ditem = this.ZhuanyiData[z]
          ditem.checked = false
        }
        for (let i = 0; i < checklist.length; i++) {
          let item = checklist[i]
          for (let z = 0; z < this.ZhuanyiData.length; z++) {
            let ditem = this.ZhuanyiData[z]
            if (ditem.value == item) {
              ditem.checked = true
              this.ZYScreenSearch.push(ditem.value)
            }
          }
        }
      } else {
        for (let z = 0; z < this.ZhuanyiData.length; z++) {
          let ditem = this.ZhuanyiData[z]
          ditem.checked = false
        }
        this.ZhuanyiData[0].checked = true
        this.ZYScreenSearch = []
      }
    },
    GongxuListcheckboxChange(e) {
      var checked = e.target.value
      this.checkboxCheckedList = checked
    },
    checkboxChangeAll(e) {
      //全选 / 反选操作
      let ccall = e.target.value
      this.checkboxCheckedList = []
      if (ccall.length > 0) {
        //全部选中时
        this.GongxuList.forEach((item, index) => {
          item.checked = true
          this.checkboxCheckedList.push(item.value)
        })
      } else {
        this.GongxuList.forEach((item, index) => {
          item.checked = false
        })
      }
    },
    ConditionalSearch(type_s) {
      let Arr = []
      let newList = []
      switch (type_s) {
        case '状态':
          Arr = this.ScreenSearch
          //console.log("状态", Arr);
          newList = []
          this.GongxuList = this.YuanShiFenLu
          if (Arr.length == 0 || Arr[0] == 0) {
            this.GongxuList = this.YuanShiFenLu
          } else {
            Arr.forEach((a) => {
              this.GongxuList.forEach((item) => {
                if (item.fbillstatus === a) {
                  newList.push(item)
                }
              })
            })
            this.GongxuList = newList
          }
          this.$refs.popup.close()
          break
        case '转移':
          Arr = this.ZYScreenSearch
          //console.log("转移", Arr);
          this.GongxuList = this.YuanShiFenLu
          Arr.forEach((a) => {
            if (a > 0) {
              this.GongxuList.forEach((item) => {
                if (item.dzy > 0) {
                  newList.push(item)
                }
              })
              this.GongxuList = newList
            } else {
              this.GongxuList = this.YuanShiFenLu
            }
          })
          this.$refs.popupzy.close()
          break
        case '组别':
          Arr = this.ZBieScreenSearch
          //console.log("组别", Arr);
          if (Arr.length > 0) {
            this.GongxuList = this.YuanShiFenLu
            newList = []
            for (var i = 0; i < Arr.length; i++) {
              let a = Arr[i]
              if (a == 0) {
                newList = this.YuanShiFenLu
              } else {
                this.GongxuList.forEach((item) => {
                  if (item.banzu.includes(a)) {
                    newList.push(item)
                  }
                })
              }
            }
            this.GongxuList = newList
          } else {
            this.GongxuList = this.YuanShiFenLu
          }
          this.$refs.popupzb.close()
          break
        default:
          break
      }

      this.show = false
      this.ZYshow = false
      this.Zbshow = false
    },
    checkboxChange(e) {
      console.log('状态选择', e.detail.value)
      let checklist = e.detail.value
      if (checklist.length > 0) {
        if (checklist.includes(0)) {
          checklist.splice(0, 1)
          this.ZhuangTaiData[0].checked = false
        }
        this.ScreenSearch = []
        for (let z = 0; z < this.ZhuangTaiData.length; z++) {
          let ditem = this.ZhuangTaiData[z]
          ditem.checked = false
        }
        for (let i = 0; i < checklist.length; i++) {
          let item = checklist[i]
          for (let z = 0; z < this.ZhuangTaiData.length; z++) {
            let ditem = this.ZhuangTaiData[z]
            if (ditem.value == item) {
              ditem.checked = true
              this.ScreenSearch.push(ditem.text)
            }
          }
        }
      } else {
        for (let z = 0; z < this.ZhuangTaiData.length; z++) {
          let ditem = this.ZhuangTaiData[z]
          ditem.checked = false
        }
        this.ZhuangTaiData[0].checked = true
        this.ScreenSearch = []
      }
    },
    async search(e) {
      console.log('扫码内容E', e)
      let insertVal = ''
      if (e instanceof Object) {
        insertVal = e.value
      } else {
        insertVal = e
      }
      if (insertVal === '') return
      console.log('扫码内容', insertVal)
      if (this.Scanbarcodestorage.includes(insertVal)) {
        this.msgcontent = '扫码重复！'
        this.$refs.msg_popup.open()
        this.$nextTick(() => {
          this.keyword = ''
        })
        return
      } else {
        this.Scanbarcodestorage = []
        this.Scanbarcodestorage.push(insertVal)
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
            this.msgcontent = '暂无数据！'
            this.$refs.msg_popup.open()
            this.$nextTick(() => {
              this.keyword = ''
            })
            return
          } else {
            this.Scanbarcodestorage = []
            this.Scanbarcodestorage.push(insertVal)
            this.YuandanGetProess(ress)
          }

          //源单分录号
          let ydflh = data[0][1]
          const { data: ress2 } = await TM_GetSourceBillNoData(ydnm, ydflh)
          if (ress2.length == 0) {
            return
          } else {
            this.Scanbarcodestorage = []
            this.Scanbarcodestorage.push(insertVal)
            this.dataprocess(ress2)
          }
        }
      } else {
        let JMcode = insertVal.split('*') //[生产工单号*工序号]
        if (JMcode.length > 1) {
          //套打条码解析查询
          console.log('解析参数', JMcode[0], JMcode[1])
          const { data: res } = await TM_GetSource_F_SCDNumberData_GXH_TOP(JMcode[0], JMcode[1])
          if (res.length == 0) {
            this.msgcontent = '暂无数据！'
            this.$refs.msg_popup.open()
            this.$nextTick(() => {
              this.keyword = ''
            })
            return
          } else {
            this.Scanbarcodestorage = []
            this.Scanbarcodestorage.push(insertVal)
            this.YuandanGetProess(res)
          }
          const { data: ress } = await TM_GetSource_F_SCDNumberData_GXH(JMcode[0], JMcode[1])
          if (ress.length == 0) {
            return
          } else {
            this.Scanbarcodestorage = []
            this.Scanbarcodestorage.push(insertVal)
            this.dataprocess(ress)
          }
        } else {
          // 条码数据单解析查询
          const { data: res } = await TM_GetSource_F_SCDNumberData_TOP(insertVal)
          if (res.length == 0) {
            this.msgcontent = '暂无数据！'
            this.$refs.msg_popup.open()
            this.$nextTick(() => {
              this.keyword = ''
            })
            return
          } else {
            this.Scanbarcodestorage = []
            this.Scanbarcodestorage.push(insertVal)
            this.YuandanGetProess(res)
          }

          const { data: ress } = await TM_GetSource_F_SCDNumberData(insertVal)
          if (ress.length == 0) {
            return
          } else {
            this.Scanbarcodestorage = []
            this.Scanbarcodestorage.push(insertVal)
            this.dataprocess(ress)
          }
        }
      }
      this.keyword = ''
    },
    YuandanGetProess(Arr) {
      this.PageItemModel = []
      Arr.forEach(async (item, index) => {
        this.F_FID = item[7]
        this.hiddSCGDNo = item[0]
        await this.departmentName(item[2]).then((res) => {
          item[2] = res.Value
        })
        await this.Getmaterial(item[5]).then((res) => {
          item[5] = res
        })
        this.PageItemModel.push(item)
      })
      this.keyword = ''
    },
    async GxGetAll() {
      const { data: res } = await GetProductionGxAllXX()
      this.GxAllList = res
    },
    async dataprocess(Arr) {
      if (this.GxAllList.length == 0) {
        await this.GxGetAll()
      }
      if (this.F_DepartmentAll.length == 0) {
        await this.LoadDepartment()
      }
      let gxArr = JSON.parse(JSON.stringify(this.GxAllList))
      let zbss = JSON.parse(JSON.stringify(this.F_DepartmentAll))
      let GongxuListItems = []
      this.GongxuList = []
      this.YuanShiFenLu = []
      await uni.showLoading({
        title: '数据请求中……',
        mask: true
      })
      try {
        for (var i = 0; i < Arr.length; i++) {
          let item = Arr[i]
          let dataState = await RowStatecodeForMsg(item[12], item[11])
          item[11] = dataState
          let gxElement = gxArr.filter((item_gx) => item_gx.includes(item[2]))
          let matchedElement = zbss.filter((items) => items.includes(item[6]))
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
      this.$nextTick(() => {
        this.GongxuList = GongxuListItems
      })
      this.YuanShiFenLu = GongxuListItems
      await setTimeout(function () {
        uni.hideLoading()
      }, 1000)
    },
    async Getmaterial(id) {
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
    },
    async departmentName(id) {
      let fulllist
      const newdata = {
        FormId: `${FromData.ZBFromID}`,
        data: {
          CreateOrgId: 0,
          Id: `${id}`,
          IsSortBySeq: 'false'
        }
      }
      await QueryAssociation(newdata).then((res) => {
        if (res.data.Result.Result != null) {
          fulllist = res.data.Result.Result.Name
        }
      })
      return fulllist[0]
    },
    getTime: function (time) {
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
    },
    backpage() {
      uni.navigateBack({
        url: '/pages/productionorder/productionorder'
      })
    },
    startclick(str) {
      if (str === '开工') {
        //把单选或者多选的工序列表从状态“下达”改为“开工”，如果选中的状态为
        //“创建、开工、完工、关闭”时提示错误“不符合开工条件”
        this.KaigongFn()
        this.checkedAll = false
      }
      if (str === '报工') {
        //只能单选工序列表进入报工界面 2.9.3，详细参见，如果多选列表、
        //或者选中状态为“创建、下达、完工、关闭”的列表时提示错误“不符合报工条件”。(1:创建,2:下达,3:开工,4:完工)
        let selectedCount = []
        let stateCode
        let F_FEntryid_one = ''
        for (var i = 0; i < this.GongxuList.length; i++) {
          let item = this.GongxuList[i]
          if (this.checkboxCheckedList.includes(item.value)) {
            stateCode = item.fbillstatus //状态
            F_FEntryid_one = item.fbillno + '*' + item.gxname // 工序id
            selectedCount.push(item)
          }
        }
        if (selectedCount.length > 1) {
          //只能选择一条
          this.msgcontent = '不符合报工条件！'
          this.$refs.msg_popup.open()
          return false
        }
        if (selectedCount.length == 1) {
          if (
            stateCode === '创建' ||
            stateCode === '下达' ||
            stateCode === '完工' ||
            stateCode === '已关闭'
          ) {
            this.msgcontent = '不符合报工条件！'
            this.$refs.msg_popup.open()
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
          this.msgcontent = '未选择任何数据！'
          this.$refs.msg_popup.open()
          return false
        }
      }
      if (str === '转移') {
        this.submittoshow = true
        this.$refs.zy_popup.open()
      }
      if (str === '关闭/反关闭') {
        this.closeOnClose()
        this.checkedAll = false
      }
    },
    async zhuanyi_fn() {
      this.$refs.zy_popup.close()
      //把单选或者多选、待转移数量大于 0 的工序列表，自动生成工序交接单，
      //详细生成工序交接单的功能参见 2.7.8.4。如果选中的待转移为“0”的工序列表提示错误“不符合转移条件”
      // 下推 到 生产交接单
      let GXBHarr = []
      let F_FEntryid_Arr = []
      let gono = ''
      for (var i = 0; i < this.GongxuList.length; i++) {
        let item = this.GongxuList[i]
        if (this.checkboxCheckedList.includes(item.value)) {
          if (item.dzy == 0) {
            this.msgcontent = '不符合转移条件！'
            this.$refs.msg_popup.open()
            return false
          }
          if (parseFloat(item.toGXNo) == 0) {
            this.msgcontent = '转入工序号为空请在PC端操作！'
            this.$refs.msg_popup.open()
            return false
          }
          gono = item.fbillno
          GXBHarr.push(item)
          F_FEntryid_Arr.push(item.fentryID)
        }
      }
      //console.log("GXBHarr", GXBHarr);
      if (GXBHarr.length > 0) {
        this.antishake = false
        const { data: res } = await PostPush(F_FEntryid_Arr.join(','))
        //console.log("下推返回", res);
        let ResultID = res.Result.ResponseStatus.SuccessEntitys[0].Id
        //查询下推后工序交接单内容
        const { data: pushpro } = await PushGetProject(ResultID)
        //console.log("pushpro", pushpro);

        let ResultObjArr = pushpro.Result.Result.FGXJJDEntry
        let canshu = []
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
        const isSuccess = SaveSubmit(ResultID, canshu)
        if (isSuccess) {
          this.Scanbarcodestorage = []
          this.antishake = true
          this.search(gono)
        }
      } else {
        this.msgcontent = '未选中任何行'
        this.$refs.msg_popup.open()
        return false
      }
      this.checkedAll = false
    },
    async closeOnClose() {
      //点击[关闭/反关闭]，状态为创建、下达、开工、完工的分录状态改为“关闭”，
      //状态为关闭的分录改为关闭前的状态（注：生产工单分录“状态”每次更新时、“上一状态”记录 状态更新前的状态）。
      // 调用行关闭APi PostRowClose
      let Fidstr = '' //生产工单内码

      let sArr = this.GongxuList
      let rows = sArr.filter((item) => this.checkboxCheckedList.includes(item.value))
      if (rows.length == 0) {
        this.msgcontent = '未选择任何分录内容'
        this.$refs.msg_popup.open()
        return false
      } else {
        Fidstr = rows[0].fid
        uni.showLoading({
          title: '正在操作中……'
        })
        //获取选中行EntryId
        let wgbEntryIds = [] //未关闭状态EntryId集合
        let ygbEntryIds = [] //已关闭状态EntryId集合
        rows.forEach((item) => {
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
          await PostRowClose('RowClose', this.F_FID, wgbEntryIds.join(',')).then((res) => {
            let responseCode = res.data.Result.ResponseStatus.MsgCode
            if (responseCode == 0) {
              //提交成功
              //刷新界面
              this.GongxuList.forEach((item, index) => {
                if (this.checkboxCheckedList.includes(item.value)) {
                  item.fbillstatus = '已关闭'
                  item.closeRowState = 2
                  item.bgcolor = 'defult'
                }
              })
            }
          })
          await setTimeout(function () {
            uni.hideLoading()
          }, 1000)
        }
        if (ygbEntryIds.length > 0) {
          const { data: res } = await PostRowClose('FROWClose', this.F_FID, ygbEntryIds.join(','))
          let responseCode = res.Result.ResponseStatus.MsgCode
          if (responseCode == 0) {
            for (var i = 0; i < ygbEntryIds.length; i++) {
              let itemgx = ygbEntryIds[i]
              const { data: ress } = await TM_GetSourceBillNoData_Gxitems(itemgx)
              this.GongxuList.forEach((item, index) => {
                if (this.checkboxCheckedList.includes(item.value) && item.fentryID === ress[0][2]) {
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
    },
    async KaigongFn() {
      let Fidstr = '' //生产工单内码
      let Entry_Ids = [] //分录内码，工序列表ID
      let f_FBillNo = ''
      //获取所选数据行数，对应的分录信息id
      let rowsData = [] //选中行数据
      this.GongxuList.forEach((item, index) => {
        if (this.checkboxCheckedList.includes(item.value)) {
          Fidstr = item.fid
          f_FBillNo = item.fbillno
          let ch_data = [item.fentryID, item.fbillstatus, item.closeRowState]
          rowsData.push(ch_data) //item[11] 状态，需要判断是否是 下达 状态
        }
      })
      //如果未选择任何行，点击开工后判断
      if (rowsData.length == 0) {
        this.msgcontent = '未选择任何分录内容'
        this.$refs.msg_popup.open()
        return false
      }
      rowsData.forEach((item) => {
        if (item[2] === '1' && item[1] === '下达') {
          Entry_Ids.push(item[0])
        } else {
          this.msgcontent = '不符合开工条件'
          this.$refs.msg_popup.open()
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
        TM_GetSourceBillNoData_Refresh(Fidstr).then((ress) => {
          this.dataprocess(ress.data)
        })
      }
    },
    closeDropdown() {
      this.$refs.uDropdown.close()
    },
    getScancode(code) {
      // 有些PDA会自带换行符，trim函数处理下
      code = code.trim()
      //code就是扫描获取的值
      console.log(code)
    },
    ClosePage() {
      uni.reLaunch({
        url: '/pages/index/index',
        animationType: 'pop-out',
        animationDuration: 200
      })
    },
    radioGroupChange() {},
    Fn_ScanCode() {
      const that = this
      uni.scanCode({
        onlyFromCamera: true,
        success: function (res) {
          that.keyword = ''
          that.keyword = res.result
          that.search(res.result)
        }
      })
    },
    onSelected(res) {},
    dateChange(d) {
      uni.showToast({
        icon: 'none',
        title: d
      })
    }
  },

  options: {
    styleIsolation: 'shared'
  }
}
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
// /deep/ .u-dropdown__content__mask {
// 	opacity: 1;
// }

// /deep/ .u-cell-item-box {
// 	background-color: #cccccc;
// }
// /deep/ .u-cell__value {
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
