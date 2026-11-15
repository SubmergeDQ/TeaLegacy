<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 备料三态：拣剔、拼配、回潮。都是茶与竹器，不画人手。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

/** 备料与拼配、回潮的形态都落在这几条曲线上 */
const prepMound = computed(() => `M52 170 Q120 ${170 - 44 - p.value * 6} 188 170 Z`)
const blendLeft = computed(() => 46 * (1 - p.value))
const blendRight = computed(() => 46 * (1 - p.value))
const blendCenter = computed(() => 20 + p.value * 36)
const blendCenterPath = computed(
  () => `M104 176 Q160 ${176 - blendCenter.value * 2} 216 176 Z`,
)

const droplets = computed(() =>
  [0, 1, 2, 3, 4].map((i) => {
    const t = ((p.value * 1.8 + i * 0.19) % 1)
    return {
      x: 204 - t * 26,
      y: 108 + t * 44,
      r: 1.4 + (i % 2) * 0.7,
      opacity: Math.sin(Math.PI * t) * 0.8,
    }
  }),
)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- ================= 备料 ================= -->
    <template v-if="scene === 'prep'">
      <!-- 竹匾与茶堆 -->
      <ellipse class="s-paper s-line" cx="120" cy="170" rx="88" ry="40" />
      <ellipse class="s-line s-thin s-faint" cx="120" cy="170" rx="74" ry="32" />
      <path class="s-tea-deep" :d="prepMound" />
      <path class="s-line s-thin" :d="prepMound.replace(' Z', '')" />
      <g class="s-line s-thin" stroke="#c9b48c" :style="{ opacity: 0.45 + p * 0.25 }">
        <path d="M62 160 q18 -12 38 -14" />
        <path d="M84 166 q22 -14 46 -12" />
        <path d="M108 158 q20 -10 40 -8" />
        <path d="M130 166 q18 -12 38 -6" />
        <path d="M82 144 q16 -8 32 -8" />
        <path d="M122 140 q18 -8 34 -2" />
      </g>
      <g class="s-line s-thin" stroke="#3d2412" :style="{ opacity: 0.3 + p * 0.3 }">
        <path d="M70 168 q20 -8 40 -6" />
        <path d="M116 172 q20 -8 40 -4" />
        <path d="M146 154 q16 -6 30 -2" />
      </g>

      <!-- 竹勺：压在茶堆右上，带起一点茶 -->
      <g :transform="`rotate(${-10 + p * 14} 170 136)`">
        <path class="s-wood s-line s-thin" d="M140 134 q32 -10 60 2 q-8 16 -30 14 q-22 -2 -30 -16 z" />
        <path class="s-line s-thin" d="M200 138 l 22 -8" />
        <path class="s-line s-thin s-faint" d="M148 138 q18 -5 36 0" />
      </g>
      <g fill="#6b4226" :style="{ opacity: 0.25 + p * 0.55 }">
        <ellipse cx="160" cy="154" rx="2" ry="1.5" />
        <ellipse cx="176" cy="158" rx="1.8" ry="1.3" />
        <ellipse cx="168" cy="164" rx="2.2" ry="1.5" />
      </g>

      <!-- 挑出去的梗片：落在竹匾旁的小碟里 -->
      <ellipse class="s-paper s-line s-thin" cx="250" cy="199" rx="30" ry="9" />
      <g :style="{ opacity: 0.35 + p * 0.5 }">
        <path class="s-line s-thin" d="M236 196 q10 -4 20 -1" stroke="#6b4226" />
        <path class="s-line s-thin" d="M242 202 q11 -3 22 0" stroke="#6b4226" />
        <path class="s-line s-thin" d="M234 206 q9 -2 18 1" stroke="#6b4226" />
      </g>

      <path class="s-line s-thin s-faint" d="M30 210 H290" />
    </template>

    <!-- ================= 拼配 ================= -->
    <template v-else-if="scene === 'blend'">
      <ellipse class="s-paper s-line" cx="160" cy="180" rx="112" ry="30" />
      <g class="s-line s-thin s-faint">
        <path d="M58 172 H262" />
        <path d="M66 188 H254" />
      </g>

      <!-- 两边的料向中间收，中央一堆最后盖上，遮住两侧压过来的轮廓 -->
      <path
        class="s-tea"
        :d="`M62 176 Q104 ${176 - blendLeft * 2} 146 176 Z`"
      />
      <path
        class="s-tea-deep"
        :d="`M174 176 Q216 ${176 - blendRight * 2} 258 176 Z`"
      />
      <!-- 中央一堆用实色，免得透出后面两侧的边 -->
      <path
        :d="blendCenterPath"
        fill="#86583a"
        stroke="var(--o-ink)"
        stroke-width="1.2"
      />

      <!-- 拼配的翻拌：竹勺随进度压进中央茶堆 -->
      <g :transform="`translate(0 ${-18 + p * 28}) rotate(${-16 + p * 30} 160 108)`">
        <path class="s-wood s-line s-thin" d="M132 104 q28 -12 56 2 q-8 16 -28 14 q-22 -2 -28 -16 z" />
        <path class="s-line s-thin" d="M188 110 l 18 -8" />
        <g fill="#6b4226" :style="{ opacity: 0.4 + p * 0.4 }">
          <ellipse cx="150" cy="130" rx="2" ry="1.4" />
          <ellipse cx="168" cy="136" rx="1.8" ry="1.2" />
          <ellipse cx="158" cy="144" rx="2" ry="1.4" />
        </g>
      </g>

      <path class="s-line s-thin s-faint" d="M34 204 H286" />
    </template>

    <!-- ================= 回潮 ================= -->
    <template v-else>
      <!-- 茶堆：遇水颜色沉下去 -->
      <ellipse class="s-paper s-line" cx="160" cy="188" rx="98" ry="28" />
      <path class="s-tea" :d="`M76 184 Q160 ${184 - 52} 244 184 Z`" />
      <path
        class="s-tea-deep"
        :d="`M76 184 Q160 ${184 - 52} 244 184 Z`"
        :style="{ opacity: p * 0.55 }"
      />
      <g class="s-line s-thin s-faint">
        <path d="M110 170 q22 -8 46 -2" />
        <path d="M158 164 q26 8 46 2" />
      </g>

      <!-- 水壶：壶身、壶盖、提梁，壶嘴从壶身左侧伸出去，加水时壶身前倾 -->
      <g :transform="`rotate(${-p * 12} 246 84)`">
        <path class="s-paper s-line" d="M224 84 q0 -22 22 -24 q22 2 22 24 q0 18 -22 24 q-22 -6 -22 -24 z" />
        <path class="s-line s-thin" d="M234 60 q12 -6 24 0" />
        <circle class="s-line s-thin" cx="246" cy="56" r="3" />
        <path class="s-line s-thin" d="M263 72 q16 2 12 18 q-2 9 -10 11" />
        <path class="s-line s-thin s-faint" d="M234 88 q12 8 24 2" />
        <path class="s-line" d="M226 80 q-14 4 -20 20" />
        <path class="s-line s-thin" d="M226 94 q-10 4 -14 12" />
      </g>

      <!-- 落下的水滴 -->
      <g fill="#2f4f4f">
        <circle
          v-for="(d, i) in droplets"
          :key="`drop${i}`"
          :cx="d.x"
          :cy="d.y"
          :r="d.r"
          :style="{ opacity: d.opacity }"
        />
      </g>

      <!-- 水汽：落在茶堆上又散开 -->
      <g class="s-line s-thin" :style="{ opacity: 0.4 * p }">
        <path d="M110 138 C 104 128 114 122 110 112" />
        <path d="M160 126 C 154 116 164 110 160 100" />
        <path d="M210 138 C 204 128 214 122 210 112" />
      </g>

      <path class="s-line s-thin s-faint" d="M34 212 H286" />
    </template>
  </svg>
</template>
