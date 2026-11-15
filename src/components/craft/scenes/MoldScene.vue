<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 称茶入模：茶料落进方形模具，铺平到边角。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const fillY = computed(() => 186 - p.value * 52)
const scraperX = computed(() => 112 + Math.max(0, (p.value - 0.72) / 0.28) * 96)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <clipPath id="moldCavity">
        <rect x="116" y="128" width="88" height="58" rx="2" />
      </clipPath>
    </defs>

    <!-- 落下的茶 -->
    <path class="s-line s-thin" :style="{ opacity: 0.25 + p * 0.5 }" d="M160 64 V 124" />
    <g fill="#6b4226" :style="{ opacity: 0.35 + p * 0.6 }">
      <ellipse cx="154" cy="78" rx="2.2" ry="1.8" />
      <ellipse cx="166" cy="92" rx="1.8" ry="1.5" />
      <ellipse cx="157" cy="106" rx="2.4" ry="1.7" />
      <ellipse cx="165" cy="118" rx="1.6" ry="1.3" />
    </g>

    <!-- 上方的竹勺 -->
    <g :transform="`rotate(${-10 + p * 8} 160 32)`">
      <path class="s-wood s-line s-thin" d="M126 26 q34 -14 68 0 q-8 18 -34 18 q-26 0 -34 -18 z" />
      <path class="s-line s-thin" d="M194 32 l 18 -8" />
    </g>

    <!-- 模具里的茶 -->
    <g clip-path="url(#moldCavity)">
      <rect x="116" :y="fillY" width="88" height="186" fill="#7a4a28" fill-opacity="0.55" />
      <g fill="#4a2f19" opacity="0.35">
        <circle cx="132" cy="174" r="1.8" />
        <circle cx="154" cy="166" r="1.6" />
        <circle cx="182" cy="172" r="1.8" />
        <circle cx="142" cy="152" r="1.5" />
        <circle cx="176" cy="148" r="1.6" />
      </g>
      <g class="s-line s-thin" :style="{ opacity: 0.4 }">
        <path d="M122 180 q20 -6 38 -2" />
        <path d="M156 170 q20 5 38 1" />
        <path d="M128 158 q18 -5 34 -1" />
      </g>
    </g>

    <!-- 木模：evenodd 挖出中间的空腔 -->
    <path
      class="s-wood s-line"
      fill-rule="evenodd"
      d="M108 118 H212 V194 H108 Z M116 128 H204 V186 H116 Z"
    />
    <path class="s-line s-thin s-faint" d="M112 122 V 190 M208 122 V 190" />
    <path class="s-line s-thin" d="M100 126 v 62 M220 126 v 62" />
    <path class="s-line s-thin" d="M96 126 h 8 M216 126 h 8 M96 188 h 8 M216 188 h 8" />

    <!-- 模具落在木托上，木托再有两条腿落到地面 -->
    <rect class="s-wood s-line s-thin" x="96" y="194" width="128" height="8" rx="2" />
    <rect class="s-wood s-line s-thin" x="102" y="202" width="8" height="14" rx="1" />
    <rect class="s-wood s-line s-thin" x="210" y="202" width="8" height="14" rx="1" />

    <!-- 刮平：竹片从模口刮过 -->
    <g :style="{ opacity: p > 0.72 ? 1 : 0 }">
      <path class="s-line s-thin" :d="`M${scraperX - 18} 130 H${scraperX + 18}`" />
      <path class="s-line s-thin" :d="`M${scraperX - 18} 130 v -8 M${scraperX + 18} 130 v -8`" />
    </g>

    <path class="s-line s-thin s-faint" d="M36 216 H284" />
  </svg>
</template>
