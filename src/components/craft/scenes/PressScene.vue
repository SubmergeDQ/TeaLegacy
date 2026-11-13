<script setup lang="ts">
import { computed } from 'vue'

// 蒸压：石磨落下，茶饼随压力定形
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <g :transform="`translate(0 ${p * 60})`">
      <circle class="s-paper s-line" cx="160" cy="66" r="42" />
      <circle class="s-line s-thin" cx="160" cy="66" r="9" />
      <path class="s-line s-thin" d="M202 66 h18" />
      <path class="s-line s-thin" d="M114 46 l -12 -10" />
      <path class="s-line s-thin" d="M114 86 l -12 10" />
    </g>

    <g
      class="s-line s-thin"
      :style="{ opacity: 0.2 + p * 0.6, transform: `translateY(${(1 - p) * 8}px)` }"
    >
      <path d="M126 150 C 118 140 134 134 126 122" />
      <path d="M196 150 C 188 140 204 134 196 122" />
    </g>

    <ellipse class="s-paper s-line" cx="160" cy="180" :rx="66 - p * 4" :ry="24 - p * 7" />
    <path class="s-line s-thin s-faint" d="M104 178 q56 12 112 0" />
    <path class="s-line s-thin s-faint" d="M58 206 H262" />
  </svg>
</template>
