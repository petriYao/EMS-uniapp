<script setup lang="ts">
import { reactive, computed, watch, getCurrentInstance, nextTick } from 'vue'
import { set, isEqual } from '@/utils'

const props = defineProps({
  value: {
    // 值
    type: Array,
    default: [] as any[]
  },
  column: {
    // 列的数量
    type: Number,
    default: 2
  },
  maxColumn: {
    // 最大列数
    type: Number,
    default: 5
  },
  columnSpace: {
    // 列之间的间距 百分比
    type: Number,
    default: 2
  },
  imageKey: {
    // 图片key
    type: [String],
    default: 'image'
  },
  hideImageKey: {
    // 隐藏图片key
    type: [String],
    default: 'hide'
  },
  seat: {
    // 文本的位置，1图片之上 2图片之下
    type: [String, Number],
    default: 2
  },
  listStyle: {
    // 单个展示项的样式：eg:{'background':'red'}
    type: Object
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'wapperClick', modelValue: any): void
  (e: 'imageClick', modelValue: any): void
  (e: 'loaded'): void
}>()

const instance = getCurrentInstance()

const reactiveData = reactive({
  data: {
    list: props.value ? props.value : ([] as any[]),
    column: props.column < 2 ? 2 : props.column,
    columnSpace: props.columnSpace <= 5 ? props.columnSpace : 5,
    imageKey: props.imageKey,
    seat: props.seat
  } as any,
  msg: 0,
  listInitStyle: {
    'border-radius': '12rpx',
    'margin-bottom': '20rpx',
    'background-color': '#fff'
  },
  adds: [] as any[], //预置数据
  isLoaded: true,
  curIndex: 0,
  isRefresh: true,
  flag: false,
  refreshDatas: [] as any[]
})

const w = computed(() => {
  const column_rate = `${100 / reactiveData.data.column - +reactiveData.data.columnSpace}%`
  return column_rate
})
// 计算margin
const m = computed(() => {
  const column_margin = `${
    (100 -
      ((100 / reactiveData.data.column - +reactiveData.data.columnSpace) as any).toFixed(5) *
        reactiveData.data.column) /
    (reactiveData.data.column - 1)
  }%`
  return column_margin
})
// list样式
const s1 = computed(() => {
  return { ...reactiveData.listInitStyle, ...props.listStyle }
})

// 预加载图片
// const loadImages = (idx = 0) => {
//   let count = 0
//   const newList = reactiveData.data.list.filter((_item: any, index: number) => index >= idx)
//   for (let i = 0; i < newList.length; i++) {
//     // #ifndef APP-PLUS
//     uni.getImageInfo({
//       src: `${newList[i][props.imageKey]}.jpg`,
//       complete: (_res) => {
//         count++
//         if (count == newList.length) initValue(idx)
//       }
//     })
//     // #endif
//     // #ifdef APP-PLUS
//     plus.io.getImageInfo({
//       src: `${newList[i][props.imageKey]}.jpg`,
//       complete: (_res) => {
//         count++
//         if (count == newList.length) initValue(idx)
//       }
//     })
//     // #endif
//   }
// }
// 刷新
const refresh = () => {
  if (!reactiveData.isLoaded) {
    reactiveData.refreshDatas = props.value
    return false
  }
  setTimeout(() => {
    reactiveData.refreshDatas = []
    reactiveData.isRefresh = true
    reactiveData.adds = []
    reactiveData.data.list = props.value ? props.value : []
    reactiveData.data.column =
      props.column < 2 ? 2 : props.column >= props.maxColumn ? props.maxColumn : props.column
    reactiveData.data.columnSpace = props.columnSpace <= 5 ? props.columnSpace : 5
    reactiveData.data.imageKey = props.imageKey
    reactiveData.data.seat = props.seat
    reactiveData.curIndex = 0
    // 每列的数据初始化
    for (let i = 1; i <= reactiveData.data.column; i++) {
      reactiveData.data[`column_${i}_values`] = []
      reactiveData.msg++
    }
    nextTick(() => {
      initValue(reactiveData.curIndex, 'refresh==>')
    })
  }, 1)
}
const columnValue = (index: number) => {
  return reactiveData.data[`column_${index + 1}_values`]
}
const change = (newValue: any) => {
  for (let i = 0; i < reactiveData.data.list.length; i++) {
    const cv = reactiveData.data[`column_${reactiveData.data.list[i].column}_values`]
    if (cv && cv.length > 0) {
      for (let j = 0; j < cv.length; j++) {
        if (newValue[i] && i === cv[j].index) {
          reactiveData.data[`column_${reactiveData.data.list[i].column}_values`][j] = Object.assign(
            cv[j],
            newValue[i]
          )
          reactiveData.msg++
          break
        }
      }
    }
  }
}
const getMin = (a: any, s: any) => {
  let m = a[0][s]
  let mo = a[0]
  for (var i = a.length - 1; i >= 0; i--) {
    if (a[i][s] < m) {
      m = a[i][s]
    }
  }
  mo = a.filter((i: any) => i[s] == m)
  return mo[0]
}
// 计算每列的高度
const getMinColumnHeight = () => {
  return new Promise((resolve) => {
    const heightArr = [] as any[]
    for (let i = 1; i <= reactiveData.data.column; i++) {
      const query = uni.createSelectorQuery().in(instance)
      query
        .select(`#waterfalls_flow_column_${i}`)
        .boundingClientRect((data: any) => {
          heightArr.push({ column: i, height: data.height })
        })
        .exec(() => {
          if (reactiveData.data.column <= heightArr.length) {
            resolve(getMin(heightArr, 'height'))
          }
        })
    }
  })
}
const initValue = async (i: any, _from?: any) => {
  reactiveData.isLoaded = false
  if (i >= reactiveData.data.list.length || reactiveData.refreshDatas.length) {
    reactiveData.msg++
    loaded()
    return false
  }
  const minHeightRes = (await getMinColumnHeight()) as any
  const c = reactiveData.data[`column_${minHeightRes.column}_values`]
  reactiveData.data.list[i].column = minHeightRes.column
  c.push({ ...reactiveData.data.list[i], cIndex: c.length, index: i, o: 0 })
  reactiveData.msg++
}

// 图片加载完成
const imgLoad = (item: any, c: any) => {
  const i = item.index
  item.o = 1
  set(reactiveData.data[`column_${c}_values`], item.cIndex, JSON.parse(JSON.stringify(item)))
  initValue(i + 1)
}

// 图片加载失败
const imgError = (item: any, c: any) => {
  const i = item.index
  item.o = 1
  item[reactiveData.data.imageKey] = null
  set(reactiveData.data[`column_${c}_values`], item.cIndex, JSON.parse(JSON.stringify(item)))
  initValue(i + 1)
}

// 渲染结束
const loaded = () => {
  if (reactiveData.refreshDatas.length) {
    reactiveData.isLoaded = true
    refresh()
    return false
  }
  reactiveData.curIndex = reactiveData.data.list.length
  if (reactiveData.adds.length) {
    reactiveData.data.list = reactiveData.adds[0]
    reactiveData.adds.splice(0, 1)
    initValue(reactiveData.curIndex)
  } else {
    if (reactiveData.data.list.length) emit('loaded')
    reactiveData.isLoaded = true
    reactiveData.isRefresh = false
  }
}

// 单项点击事件
const wapperClick = (item: any) => {
  emit('wapperClick', item)
}

// 图片点击事件
const imageClick = (item: any) => {
  emit('imageClick', item)
}

watch(
  () => props.value,
  (newValue: any, oldValue: any) => {
    const isEditList = isEqual(newValue[0], oldValue[0])
    if (!isEditList || !newValue || newValue.length === 0) {
      refresh()
      return
    }
    setTimeout(() => {
      nextTick(() => {
        if (reactiveData.isRefresh) return false
        if (reactiveData.isLoaded) {
          // if (newValue.length <= this.curIndex) return this.refresh();
          if (newValue?.length <= reactiveData.curIndex) return change(newValue)
          reactiveData.data.list = newValue
          nextTick(() => {
            initValue(reactiveData.curIndex, 'watch==>')
          })
        } else {
          reactiveData.adds.push(newValue)
        }
      })
    }, 10)
  },
  { deep: true }
)

watch(
  () => props.column,
  () => {
    refresh()
  },
  {
    immediate: true
  }
)

defineExpose({
  refresh
})
</script>

<template>
  <view class="waterfalls-flow">
    <view
      v-for="(item, index) in reactiveData.data.column"
      :key="index"
      class="waterfalls-flow-column"
      :id="`waterfalls_flow_column_${index + 1}`"
      :msg="reactiveData.msg"
      :style="{ width: w, 'margin-left': index == 0 ? 0 : m }"
    >
      <view
        :class="['column-value', { 'column-value-show': item2.o }]"
        v-for="(item2, index2) in columnValue(index)"
        :key="index2"
        :style="[s1]"
        @click.stop="wapperClick(item2)"
      >
        <view class="inner" v-if="reactiveData.data.seat == 1">
          <slot :name="`slot${item2.index}`"></slot>
        </view>
        <image
          :class="[
            'img',
            { 'img-hide': item2[hideImageKey] == true || item2[hideImageKey] == 1 },
            { 'img-error': !item2[reactiveData.data.imageKey] }
          ]"
          :src="item2['productImage']['listUrl']"
          mode="widthFix"
          @load="imgLoad(item2, index + 1)"
          @error="imgError(item2, index + 1)"
          @click.stop="imageClick(item2)"
        />
        <view class="inner" v-if="reactiveData.data.seat == 2">
          <slot :name="`slot${item2.index}`"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.waterfalls-flow {
  overflow: hidden;

  &-column {
    float: left;
  }
}

.column-value {
  width: 100%;
  font-size: 0;
  overflow: hidden;
  transition: opacity 0.4s;
  opacity: 0;
  padding: 20rpx;
  box-sizing: border-box;
  &-show {
    opacity: 1;
  }

  .inner {
    font-size: 30rpx;
  }

  .img {
    width: 100%;
    border-radius: 10rpx;

    &-hide {
      display: none;
    }
    &-error {
      background: #f2f2f2;
    }
    // &-error {
    //   background: #f2f2f2
    //     url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAiAQMAAAAatXkPAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAAIZJREFUCNdlzjEKwkAUBNAfEGyCuYBkLyLuxRYW2SKlV1JSeA2tUiZg4YrLjv9PGsHqNTPMSAQuyAJgRDHSyvBPwtZoSJXakeJI9iuRLGDygdl6V0yKDtyMAeMPZySj8yfD+UapvRPj2JOwkyAooSV5IwdDjPdCPspe8LyTl9IKJvDETKKRv6vnlUasgg0fAAAAAElFTkSuQmCC)
    //     no-repeat center center;
    // }
  }
}
</style>
