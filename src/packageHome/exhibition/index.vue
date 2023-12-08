<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const center = ref({
  lng: 119.25033152103425,
  lat: 26.11648445651557
})

const title = ref('园区导览')
onLoad((val: any) => {
  if (val.title) {
    title.value = val.title
  }
})
</script>
<template>
  <XWAHeader :title="title" />

  <view class="w-100% fixed">
    <map
      id="myMap"
      :longitude="center.lng"
      :latitude="center.lat"
      :scale="18"
      :enable-3D="true"
      :enable-overlooking="true"
      :enable-building="true"
      :enable-rotate="true"
      class="w-100% h-100vh"
    ></map>
  </view>

  <!-- <map
      id="myMap"
      :longitude="lng"
      :latitude="lat"
      :scale="17"
      :enable-3D="true"
      :enable-satellite="true"
      class="w-100% h-100vh"
    ></map> -->
</template>
