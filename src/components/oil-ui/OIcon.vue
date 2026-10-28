<script setup lang="ts">
import { computed } from 'vue'

import { icons } from './icons'

// 尺寸以 rem 传入，随根字号缩放，与整体 UI 比例一致
const props = withDefaults(defineProps<{ name: string; size?: number }>(), {
  size: 24,
})

const html = computed(() => icons[props.name] ?? '')
const box = computed(() => `${props.size / 16}rem`)
</script>

<template>
  <svg
    class="o-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    :style="{ width: box, height: box }"
    v-html="html"
  />
</template>

<style scoped lang="scss">
.o-icon {
  display: block;
  flex-shrink: 0;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
