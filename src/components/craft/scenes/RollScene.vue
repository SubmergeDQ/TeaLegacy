<script setup lang="ts">
import { computed } from 'vue'

// 揉捻：竹席上的茶团随推揉收紧
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <rect class="s-paper s-line" x="56" y="88" width="208" height="100" rx="8" />
    <!-- 竹席只画竹条：横向几道微弯，不做网格 -->
    <g class="s-line s-thin s-faint">
      <path d="M62 106 Q160 112 258 106" />
      <path d="M60 124 Q160 130 260 124" />
      <path d="M60 142 Q160 148 260 142" />
      <path d="M60 160 Q160 166 260 160" />
      <path d="M62 178 Q160 184 258 178" />
    </g>

    <g :transform="`translate(160 140) scale(${1 - p * 0.16}) translate(-160 -140)`">
      <path
        class="s-tea-wash s-line"
        d="M158 108 c 24 -3 43 13 44 30 c 1 17 -19 30 -45 30 c -26 0 -44 -13 -43 -30 c 1 -17 20 -33 44 -30 z"
      />
      <g class="s-line s-thin" opacity="0.32">
        <path d="M128 126 q16 -8 34 -5" />
        <path d="M132 144 q18 9 38 2" />
        <path d="M146 116 q12 7 22 3" />
        <path d="M140 158 q14 5 30 1" />
      </g>
    </g>

    <!-- 来回推揉：两侧短弧 + 速度线，比整圈箭头更接近手上的动作 -->
    <g class="s-line s-thin" :style="{ opacity: 0.4 + p * 0.5 }">
      <path d="M98 124 q-10 16 2 32" />
      <path d="M222 124 q10 16 -2 32" />
      <path d="M92 168 h -12" />
      <path d="M228 168 h 12" />
    </g>
  </svg>
</template>
