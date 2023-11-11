<script setup lang="ts">
import TreeEdit from '../TreeEdit.vue'
import { reactive, ref, PropType, watch } from 'vue'
import companyApi from '@/api/modules/company'
import { useEmitt } from '@/hooks/useEmitt'
import { debounceSave } from '@/utils'
import TreeIcon from '@/components/treeIcon/index.vue'

const props = defineProps({
  treeData: {
    type: Array as any,
    default: () => []
  },
  treeIndex: {
    type: Number as PropType<any>,
    default: 0 as Number
  },
  show: {
    type: Boolean as PropType<any>,
    default: true
  }
})

const { emitter } = useEmitt()
const myShow = ref(true)
const selectData = reactive({
  dialogShow: false,
  type: '',
  val: {} as any,
  valueInput: ''
})
const onCloseDialog = () => {
  selectData.dialogShow = false
}
const getUserInfoDialog = debounceSave(async () => {
  if (selectData.type === '添加') {
    const res = await companyApi.departmentAdd(selectData.valueInput, selectData.val.departmentId)
    if (res && res.success) {
      emitter.emit('update:DepartmentList')
    }
  } else {
    const res = await companyApi.departmentUpdate(
      selectData.valueInput,
      selectData.val.departmentId,
      selectData.val.departmentPid
    )
    if (res && res.success) {
      emitter.emit('update:DepartmentList')
    }
  }
})
const addClick = async (item: any, type: string) => {
  switch (type) {
    case '添加成员':
      break
    case '添加组':
      selectData.type = '添加'
      selectData.val = item
      selectData.valueInput = ''
      selectData.dialogShow = true
      break
    case '修改':
      selectData.type = '修改'
      selectData.val = item
      selectData.valueInput = item.departmentName
      selectData.dialogShow = true
      break
    case '删除':
      const res = await companyApi.departmentDelete(item.departmentId)
      if (res && res.success) {
        emitter.emit('update:DepartmentList')
      }
      break
  }
}
watch(
  () => props.show,
  (val) => {
    myShow.value = val
  },
  {
    immediate: true
  }
)
</script>

<template>
  <view class="font-size-six">
    <view
      @tap="myShow = !myShow"
      class="p-20rpx border-t-1 border-#F7F8F7 flex items-center"
      :style="`padding-left:${20 * props.treeIndex}rpx`"
    >
      <view class="text-0 pr-20rpx">
        <TreeIcon :treeIndex="treeIndex" />
      </view>
      <view>{{ props.treeData.departmentName }}</view>
      <view class="flex flex-1 justify-end">
        <view class="mr-20rpx" v-if="props.treeIndex < 5">
          <u-tag
            @click.stop="addClick(props.treeData, '添加组')"
            bgColor="#E7F0FF"
            borderColor="#E7F0FF"
            color="#196CFF"
            text=" 添加 "
            size="mini"
          />
        </view>
        <view class="mr-20rpx">
          <u-tag
            @click.stop="addClick(props.treeData, '修改')"
            bgColor="#E7F0FF"
            borderColor="#E7F0FF"
            color="#196CFF"
            text=" 修改 "
            size="mini"
          />
        </view>
        <view class="mr-20rpx">
          <u-tag
            @click.stop="addClick(props.treeData, '删除')"
            bgColor="#FEE7E7"
            borderColor="#FEE7E7"
            color="#F31818"
            text=" 删除 "
            size="mini"
          />
        </view>
        <view v-if="treeIndex !== 5" class="flex items-center">
          <van-icon name="arrow-up" v-if="!myShow" size="24rpx" />
          <van-icon name="arrow-down" v-else size="24rpx" />
        </view>
        <view v-else class="w-24rpx">&nbsp;</view>
      </view>
    </view>
    <view v-show="myShow">
      <TreeEdit
        :parent-name="treeData?.departmentName"
        :parent-data="props.treeData"
        :treeData="treeData.children"
        :tree-index="props.treeIndex + 1"
      />
    </view>
  </view>
  <van-dialog
    use-slot
    title="添加组"
    :show="selectData.dialogShow"
    show-cancel-button
    confirm-button-open-type="getUserInfo"
    transition="fade"
    confirm-button-color="#196CFF"
    @close="onCloseDialog"
    @getuserinfo="getUserInfoDialog"
  >
    <view class="h-100rpx flex items-center">
      <u-input placeholder="请输入组名" v-model="selectData.valueInput" />
    </view>
  </van-dialog>
</template>
