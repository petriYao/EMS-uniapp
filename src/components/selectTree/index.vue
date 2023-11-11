<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  industryLists: {
    type: Array as any,
    default: [] as any
  }
})

const industryList = ref([] as any)

const ejectionHeight = ref('800rpx')

interface active {
  one: number
  two: number
  three: number
}

const active = reactive({
  one: 0,
  two: 0,
  three: 0,
  twoList: [] as any,
  threeList: [] as any
})

//点击
const oneActiveClick = (index: number, type: string) => {
  switch (type) {
    case 'one':
      active.one = index
      active.two = 0
      active.three = 0
      break
    case 'two':
      active.two = index
      active.three = 0
      break
    case 'three':
      active.three = index
      break
  }
  return
  if (industryList.value[active.one].children[active.two].children) {
    active.twoList = industryList.value[active.one].children[active.two].children
    if (industryList.value[active.one].children[active.two].children.length > 0) {
      active.threeList =
        industryList.value[active.one].children[active.two].children[active.three].children
    } else {
      active.threeList = []
    }
  }
}
//监听
const onChange = (item: any) => {
  item.checked = !item.checked
  item.possess = item.checked
  // if(!item.checked){}
  editChecked(item.children, item.checked)
  possess()
}
//显示横杠
const possess = () => {
  // possess为true的时候显示
  return
  if (
    industryList.value[active.one].children[active.two].children[active.three].children &&
    industryList.value[active.one].children[active.two].children[active.three].children.length > 0
  ) {
    let a3 = 0 //全部显示的时候为0，有一个不显示都为1
    let b3 = 0 //全部不显示的时候为0，有一个显示都为1
    for (const item of industryList.value[active.one].children[active.two].children[active.three]
      .children) {
      if (item.checked) {
        b3 = 1
      } else {
        a3 = 1
      }
    }

    if (a3 > 0) {
      industryList.value[active.one].children[active.two].children[active.three].checked = false
      //在全部都不显示的情况下关掉--
      if (b3 == 0) {
        industryList.value[active.one].children[active.two].children[active.three].possess = false
      } else {
        industryList.value[active.one].children[active.two].children[active.three].possess = true
      }
    } else {
      industryList.value[active.one].children[active.two].children[active.three].possess = true
      // industryList.value[active.one].children[active.two].children[active.three].checked = true
      if (b3 == 0) {
        industryList.value[active.one].children[active.two].children[active.three].checked = false
      } else {
        industryList.value[active.one].children[active.two].children[active.three].checked = true
      }
    }
  }
  setTimeout(() => {
    if (
      industryList.value[active.one].children[active.two].children &&
      industryList.value[active.one].children[active.two].children.length > 0
    ) {
      // possess为true的时候显示
      let a2 = 0 //全部显示的时候为0，有一个不显示都为1
      let b2 = 0 //全部不显示的时候为0，有一个显示都为1
      for (const item of industryList.value[active.one].children[active.two].children) {
        if (item.possess) {
          b2 = 1
        } else {
          a2 = 1
        }
      }
      if (a2 > 0) {
        industryList.value[active.one].children[active.two].checked = false
        //在全部都不显示的情况下关掉--
        if (b2 == 0) {
          industryList.value[active.one].children[active.two].possess = false
        } else {
          industryList.value[active.one].children[active.two].possess = true
        }
      } else {
        industryList.value[active.one].children[active.two].possess = true
        if (b2 == 0) {
          industryList.value[active.one].children[active.two].checked = false
        } else {
          industryList.value[active.one].children[active.two].checked = true
        }
      }
    }
  }, 100)
  setTimeout(() => {
    if (
      industryList.value[active.one].children &&
      industryList.value[active.one].children.length > 0
    ) {
      // possess为true的时候显示
      let a1 = 0 //全部显示的时候为0，有一个不显示都为1
      let b1 = 0 //全部不显示的时候为0，有一个显示都为1
      for (const item of industryList.value[active.one].children) {
        if (item.possess) {
          b1 = 1
        } else {
          a1 = 1
        }
      }
      if (a1 > 0) {
        industryList.value[active.one].checked = false
        //在全部都不显示的情况下关掉--
        if (b1 == 0) {
          industryList.value[active.one].possess = false
        } else {
          industryList.value[active.one].possess = true
        }
      } else {
        industryList.value[active.one].possess = true
        if (b1 == 0) {
          industryList.value[active.one].checked = false
        } else {
          industryList.value[active.one].checked = true
        }
      }
    }
  }, 200)
}

//给子赋值
const editChecked = (data: any, checked: boolean) => {
  if (data && data.length > 0) {
    for (const item of data) {
      item.checked = checked
      item.possess = checked
      editChecked(item.children, checked)
    }
  }
}
//重置
const reset = (val: any) => {
  for (const industry of val) {
    industry.checked = false
    industry.possess = false
    if (industry.children && industry.children.length > 0) {
      reset(industry.children)
    }
  }
}
const resetData = () => {
  reset(industryList.value)
}

watch(
  () => props.industryLists,
  () => {
    industryList.value = props.industryLists
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  resetData
})
</script>

<template>
  <view class="flex" v-if="industryList.length > 0">
    <!-- 一级 -->
    <scroll-view scroll-y class="w-25%" :style="`height:${ejectionHeight}`">
      <view
        v-for="(item, index) of industryList"
        :key="index"
        class="border-b-1 border-#F7F8F7 flex items-center"
        :style="active.one === index ? 'background: #E0E0E0;' : ''"
        @tap="oneActiveClick(index, 'one')"
      >
        <view>
          <view
            v-if="!item.checked && item.possess"
            @tap="onChange(item)"
            class="mr-10rpx ml-10rpx"
          >
            <van-icon name="minus" />
          </view>
          <view v-else class="edit-icon">
            <van-checkbox
              checked-color="#196cff"
              :value="item.checked"
              @change="onChange(item)"
              shape="square"
            />
          </view>
        </view>
        <view class="px-8rpx py-20rpx font-size-six">
          {{ item.industryName }}
        </view>
      </view>
    </scroll-view>
    <!-- 二级 -->
    <scroll-view scroll-y class="w-25% bg-#F0F0F0" :style="`height:${ejectionHeight}`">
      <view
        v-for="(item, index) of industryList[active.one]?.children"
        :key="index"
        class="border-b-1 border-#F7F8F7 flex items-center"
        :style="active.two === index ? 'background: #E0E0E0;' : ''"
        @tap="oneActiveClick(index, 'two')"
      >
        <view>
          <view
            v-if="!item.checked && item.possess"
            @tap="onChange(item)"
            class="mr-10rpx ml-10rpx"
          >
            <van-icon name="minus" />
          </view>
          <view v-else class="edit-icon">
            <van-checkbox
              checked-color="#196cff"
              :value="item.checked"
              @change="onChange(item)"
              shape="square"
            />
          </view>
        </view>

        <view class="px-8rpx py-20rpx font-size-six">
          {{ item.industryName }}
        </view>
      </view>
    </scroll-view>
    <!-- 三级 -->
    <scroll-view scroll-y class="w-25% bg-#E8E8E8" :style="`height:${ejectionHeight}`">
      <view
        v-for="(item, index) of active.twoList"
        :key="index"
        class="border-b-1 border-#F7F8F7 flex items-center"
        :style="active.three === index ? 'background: #E0E0E0;' : ''"
        @tap.stop="oneActiveClick(index, 'three')"
      >
        <view>
          <view
            v-if="!item.checked && item.possess"
            @tap="onChange(item)"
            class="mr-10rpx ml-10rpx"
          >
            <van-icon name="minus" />
          </view>
          <view v-else class="edit-icon">
            <van-checkbox
              checked-color="#196cff"
              :value="item.checked"
              @change="onChange(item)"
              shape="square"
            />
          </view>
        </view>
        <view class="px-8rpx py-20rpx font-size-six">
          {{ item.industryName }}
        </view>
      </view>
    </scroll-view>
    <!-- 四级 -->
    <scroll-view scroll-y class="w-25% bg-#E0E0E0" :style="`height:${ejectionHeight}`">
      <view
        v-for="(item, index) of active.threeList"
        :key="index"
        class="border-b-1 border-#F7F8F7 flex items-center"
      >
        <view class="edit-icon">
          <van-checkbox
            checked-color="#196cff"
            :value="item.checked"
            @change="onChange(item)"
            shape="square"
          />
        </view>
        <view class="px-8rpx py-20rpx font-size-six">
          {{ item.industryName }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="less" scoped>
::v-deep ::-webkit-scrollbar {
  display: none;
}

.edit-icon {
  margin-right: -10rpx;
  margin-left: 10rpx;
}
</style>
