<script setup lang="ts">
import AppList from '@/pages/appList/index.vue'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const title = ref('招商政策')
const name = ref('investmentPolicies')

onLoad((val: any) => {
  console.log(val)
  title.value = val.title
  name.value = val.name
})
</script>

<template>
  <AppList :title="title" :name="name" />
</template>

<style lang="scss" scoped></style>
