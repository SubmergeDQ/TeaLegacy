<script setup lang="ts">
import { computed } from 'vue'

// 生晒：日头转动，匾里的柑果随日晒收干
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <g :transform="`rotate(${p * 40} 256 56)`">
      <circle class="s-line s-thin" cx="256" cy="56" r="21" fill="#e6c98f" fill-opacity="0.32" />
      <g class="s-line s-thin">
        <path d="M256 24 v -9" />
        <path d="M256 88 v 9" />
        <path d="M224 56 h -9" />
        <path d="M288 56 h 9" />
        <path d="M234 34 l -6 -6" />
        <path d="M278 78 l 6 6" />
        <path d="M278 34 l 6 -6" />
        <path d="M234 78 l -6 6" />
      </g>
    </g>

    <ellipse class="s-paper s-line" cx="146" cy="150" rx="106" ry="46" />
    <ellipse class="s-line s-thin s-faint" cx="146" cy="150" rx="92" ry="37" />
    <g class="s-line s-thin s-faint">
      <path d="M48 138 H244" />
      <path d="M52 162 H240" />
    </g>

    <g
      v-for="(c, i) in [
        { x: 106, y: 142 },
        { x: 146, y: 134 },
        { x: 186, y: 144 },
        { x: 126, y: 166 },
        { x: 168, y: 168 },
      ]"
      :key="`sun${i}`"
      :transform="`translate(${c.x} ${c.y}) scale(${1 - p * 0.1})`"
    >
      <circle class="s-leaf" r="17" />
      <circle class="s-line s-thin" r="6.5" fill="#7a4a28" fill-opacity="0.45" cy="-4" />
    </g>

    <!-- 水气：晒走的那些 -->
    <g class="s-line s-thin" :style="{ opacity: 0.55 * (1 - p) }">
      <circle cx="112" cy="112" r="2.5" />
      <circle cx="148" cy="96" r="2" />
      <circle cx="184" cy="110" r="3" />
      <circle cx="202" cy="88" r="2" />
    </g>
  </svg>
</template>
