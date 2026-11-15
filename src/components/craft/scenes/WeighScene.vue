<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01, rad } from './scene-utils'

// 称茶：茶入左盘，砝码一件件加上去，横梁慢慢端平。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const beam = computed(() => {
  // 先左沉，加够砝码后回正；回正过程带一点小摆动
  const angle = -7 * (1 - p.value) + Math.sin(p.value * Math.PI * 3) * 1.6 * (1 - p.value)
  const theta = rad(angle)
  const cy = 92
  const turn = (x: number) => ({
    x: 160 + (x - 160) * Math.cos(theta),
    y: cy + (x - 160) * Math.sin(theta),
  })
  const left = turn(98)
  const right = turn(222)
  return {
    angle,
    left,
    right,
    leftPan: { x: left.x, y: left.y + 30 },
    rightPan: { x: right.x, y: right.y + 30 },
  }
})

const teaHeight = computed(() => 4 + p.value * 7)
const weights = computed(() =>
  [0, 1, 2].map((i) => {
    const show = clamp01((p.value - (0.28 + i * 0.18)) / 0.12)
    return {
      i,
      show,
      x: beam.value.rightPan.x - 14,
      y: beam.value.rightPan.y - 8 - i * 7,
    }
  }),
)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 秤座与立柱 -->
    <path class="s-line" d="M160 206 V 92" />
    <path class="s-line s-thin" d="M118 208 H202" />
    <path class="s-line s-thin" d="M138 208 q22 -8 44 0" />
    <circle class="s-paper s-line s-thin" cx="160" cy="92" r="6" />

    <!-- 横梁 -->
    <g :transform="`rotate(${beam.angle} 160 92)`">
      <path class="s-line" d="M98 92 H222" />
      <path class="s-line s-thin" d="M98 92 v 6 M222 92 v 6" />
    </g>

    <!-- 指针：横梁平了，针就正 -->
    <path
      class="s-line s-thin"
      :d="`M160 92 L${160 + Math.sin(rad(beam.angle)) * 26} ${92 - Math.cos(rad(beam.angle)) * 26}`"
    />

    <!-- 吊绳与左右秤盘 -->
    <path
      class="s-line s-thin"
      :d="`M${beam.left.x} ${beam.left.y} V ${beam.leftPan.y} M${beam.right.x} ${beam.right.y} V ${beam.rightPan.y}`"
    />

    <!-- 左盘：茶 -->
    <ellipse class="s-paper s-line" :cx="beam.leftPan.x" :cy="beam.leftPan.y" rx="27" ry="7" />
    <path
      class="s-tea-deep"
      :d="`M${beam.leftPan.x - 23} ${beam.leftPan.y - 2} Q${beam.leftPan.x} ${beam.leftPan.y - 2 - teaHeight * 2} ${beam.leftPan.x + 23} ${beam.leftPan.y - 2} Z`"
    />
    <g class="s-line s-thin s-faint">
      <path :d="`M${beam.leftPan.x - 14} ${beam.leftPan.y - 8} q14 -5 28 0`" />
    </g>

    <!-- 右盘：砝码 -->
    <ellipse class="s-paper s-line" :cx="beam.rightPan.x" :cy="beam.rightPan.y" rx="27" ry="7" />
    <g v-for="w in weights" :key="`w${w.i}`" :style="{ opacity: w.show }">
      <rect
        class="s-ink-block"
        :x="w.x"
        :y="w.y"
        width="28"
        height="6"
        rx="1.5"
        fill="#efe4cd"
        stroke="var(--o-ink)"
        stroke-width="1.1"
      />
      <path class="s-line s-thin s-faint" :d="`M${w.x + 6} ${w.y + 3} h 16`" />
    </g>

    <!-- 添茶：从左上方的竹勺落进左盘 -->
    <g :transform="`rotate(${-12 + p * 10} 78 46)`">
      <path class="s-wood s-line s-thin" d="M44 40 q26 -12 50 2 q-6 16 -24 14 q-20 -2 -26 -16 z" />
      <path class="s-line s-thin" d="M94 46 l 16 -8" />
    </g>
    <path
      class="s-line s-thin"
      :style="{ opacity: 0.35 + p * 0.3 }"
      :d="`M${88} 62 Q${(88 + beam.leftPan.x) / 2} ${beam.leftPan.y - 60} ${beam.leftPan.x - 4} ${beam.leftPan.y - 18}`"
      stroke-dasharray="3 6"
    />
    <g fill="#6b4226" :style="{ opacity: 0.5 + p * 0.4 }">
      <circle cx="94" cy="82" r="1.8" />
      <circle :cx="beam.leftPan.x - 8" cy="106" r="1.6" />
      <circle :cx="beam.leftPan.x + 4" cy="114" r="1.4" />
    </g>

    <path class="s-line s-thin s-faint" d="M34 218 H286" />
  </svg>
</template>
