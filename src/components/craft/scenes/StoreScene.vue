<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01, easeOut, lerp, window01 } from './scene-utils'

// 分级仓储：分级好的茶与压好的形制，一层层收进仓架。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const form = computed<CraftForm>(() => props.form ?? 'brick')

/** 下层形制从架外滑入：一件件归位，进度落在每一件自己的窗口里 */
const items = computed(() => {
  // 砖可以两块垫底、一块压上；饼与沱圆，排成一列更稳
  const targets =
    form.value === 'brick'
      ? [
          { x: 118, y: 177, d: 0 },
          { x: 196, y: 177, d: 0.12 },
          { x: 157, y: 151, d: 0.26 },
        ]
      : [
          { x: 90, y: form.value === 'cake' ? 163 : 174, d: 0 },
          { x: 160, y: form.value === 'cake' ? 163 : 174, d: 0.12 },
          { x: 230, y: form.value === 'cake' ? 163 : 174, d: 0.26 },
        ]
  return targets.map((t) => {
    const k = easeOut(window01(p.value, t.d, t.d + 0.34))
    return {
      ...t,
      x: lerp(t.x + 34, t.x, k),
      y: lerp(236, t.y, k),
      k,
    }
  })
})
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <radialGradient id="storeWarm" cx="50%" cy="54%" r="64%">
        <stop offset="0%" stop-color="#c07a34" stop-opacity="0.1" />
        <stop offset="58%" stop-color="#6b4226" stop-opacity="0.07" />
        <stop offset="100%" stop-color="#6b4226" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 仓里的暖意：径向淡出，四周都不留硬边 -->
    <rect x="0" y="0" width="320" height="240" fill="url(#storeWarm)" />

    <!-- 仓架 -->
    <path class="s-line" d="M46 210 V 56 M274 210 V 56" />
    <path class="s-line s-thin" d="M42 62 H278" />
    <path class="s-paper s-line" d="M38 124 H282 V 132 H38 Z" />
    <path class="s-paper s-line" d="M38 190 H282 V 198 H38 Z" />
    <path class="s-line s-thin s-faint" d="M58 132 V 190 M262 132 V 190" />

    <!-- 上层：三只竹匾，盛着分好级的茶 -->
    <g v-for="(x, i) in [86, 160, 234]" :key="`basket${i}`">
      <path class="s-line s-thin" :d="`M${x - 24} 110 a 24 24 0 0 1 48 0`" />
      <path
        class="s-paper s-line s-thin"
        :d="`M${x - 24} 110 h48 l-5 14 h-38 z`"
      />
      <path
        class="s-tea"
        :d="`M${x - 22} 110 Q${x} ${96 - i * 2} ${x + 22} 110 Z`"
      />
      <path class="s-line s-thin s-faint" :d="`M${x - 14} 108 q14 -6 28 0`" />
    </g>

    <!-- 下层：压好的形制，滑进架位 -->
    <g
      v-for="(it, i) in items"
      :key="`item${i}`"
      :transform="`translate(${it.x} ${it.y})`"
      :style="{ opacity: it.k }"
    >
      <template v-if="form === 'brick'">
        <rect class="s-tea" x="-28" y="-13" width="56" height="26" rx="3" />
        <path class="s-line s-thin" d="M-20 -6 H20" opacity="0.4" />
      </template>
      <template v-else-if="form === 'cake'">
        <circle class="s-tea" r="27" />
        <circle class="s-line s-thin" r="5" opacity="0.4" />
        <path class="s-line s-thin" d="M-18 8 q18 6 36 0" opacity="0.35" />
      </template>
      <template v-else-if="form === 'tuo'">
        <path class="s-tea" d="M-30 16 A 30 32 0 0 1 30 16 Z" />
        <ellipse class="s-paper s-line s-thin" cy="-10" rx="13" ry="4" />
        <path class="s-line s-thin" d="M-20 12 q20 6 40 0" opacity="0.35" />
      </template>
      <template v-else>
        <path class="s-tea" d="M-30 14 Q0 -22 30 14 Z" />
      </template>
    </g>

    <!-- 仓里的静气交给暖光，不再点浮尘，免得落在茶面上像杂点 -->

    <path class="s-line s-thin s-faint" d="M28 214 H292" />
  </svg>
</template>
