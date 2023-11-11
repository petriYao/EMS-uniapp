<script setup lang="ts">
// import TreeVue from 'Tree.vue'
import Draggable from './Draggable.vue'
import { reactive, ref } from 'vue'
import TreeIcon from '@/components/treeIcon/index.vue'
import router from '@/router'

interface Tree {
  name?: string
  childrenName?: string
  children?: Tree[]
}

defineProps<{
  data?: Tree[]
  treeIndex: number
}>()

//上拉菜单
const actionSheetData = reactive({
  actions: [{ name: '分组管理' }, { name: '取消' }],
  show: false
})

const show = ref(false)
const clickStop = ref(true)
const bindlongpress = () => {
  clickStop.value = false
  actionSheetData.show = true
  setTimeout(() => {
    clickStop.value = true
  }, 500)
}
//上拉菜单选择时关闭
const onSelect = (e: any) => {
  actionSheetData.show = false
  if (e.detail.name == '分组管理') {
    router.push({
      url: '/packageCompany/customerManagement/GroupingManagement',
      events: {
        fnFefresh: function (_data: any) {}
      }
    })
  }
}

//上拉菜单点击遮罩层时关闭
const onClose = () => {
  actionSheetData.show = false
}

//點擊去客戶詳情
const toClientInfo = () => {
  router.push({
    url: '/packageCompany/customerManagement/ClientInfo'
  })
}
</script>

<template>
  <!-- <view @tap="show = true">显示</view> -->

  <view>
    <view v-for="(item, index) in data" :key="index">
      <view v-if="item.name && item.name.length > 0">
        <view
          class="p-20rpx border-t-1 border-#F7F8F7"
          :style="`padding-left:${40 * treeIndex}rpx`"
          @tap="toClientInfo"
        >
          {{ item.name }}
        </view>
      </view>

      <view v-if="item?.childrenName">
        <view
          @tap="clickStop ? (show = !show) : ''"
          @longtap.stop="bindlongpress"
          class="p-20rpx border-t-1 border-#F7F8F7 flex items-center"
          :style="`padding-left:${40 * treeIndex}rpx`"
        >
          <view class="text-0 pr-20rpx">
            <TreeIcon :treeIndex="treeIndex" />
          </view>
          <view>{{ item?.childrenName }}</view>

          <view class="flex-1 text-end">
            <van-icon name="arrow" v-if="!show" />
            <van-icon name="arrow-down" v-else />
          </view>
        </view>
        <view v-if="show">
          <Tree :data="item.children" :tree-index="treeIndex + 1" />
        </view>
      </view>
    </view>
  </view>
  <Draggable :controlsList="data" :controlsSize="{ width: 187, height: 90 }" v-show="false">
    <template #content="{ item }">
      <view v-if="item.name">
        <view
          class="p-20rpx border-t-1 border-#F7F8F7"
          :style="`padding-left:${40 * treeIndex}rpx`"
        >
          {{ item.name }}
        </view>
      </view>
      <view v-if="item?.childrenName">
        <view
          @tap="clickStop ? (show = !show) : ''"
          @longtap.stop="bindlongpress"
          class="p-20rpx border-t-1 border-#F7F8F7 flex justify-between"
          :style="`padding-left:${40 * treeIndex}rpx`"
        >
          <view>{{ item?.childrenName }}</view>

          <view>
            <van-icon name="arrow" v-if="!show" />
            <van-icon name="arrow-down" v-else />
          </view>
        </view>
        <view v-if="show">
          <Tree :data="item.children" :tree-index="treeIndex + 1" />
        </view>
      </view>
    </template>
  </Draggable>

  <van-action-sheet
    :show="actionSheetData.show"
    :actions="actionSheetData.actions"
    @select="onSelect"
    @close="onClose"
  />
</template>
