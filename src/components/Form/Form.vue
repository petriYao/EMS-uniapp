<script setup lang="ts">
import FormPart from './FormPart.vue'
import { PropType } from 'vue'

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    default: {} as any
  }
})
</script>
<template>
  <div class="distanceHeader">
    <FormPart
      v-for="o of props.data"
      :key="o.category"
      :hidden="o.hidden"
      :category="o.category"
      :items="o.items"
    />
  </div>
</template>
