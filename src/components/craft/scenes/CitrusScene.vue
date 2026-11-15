<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01, easeOut } from './scene-utils'

// 小青柑的五幕：选柑、晒壳、填茶、烘干 / 生晒、静置陈放。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

/** 选中的那颗柑：从三颗里浮出来一点，其余退到后面；第一下就开始动 */
const picked = computed(() => easeOut(clamp01((p.value - 0.05) / 0.9)))

const fillLevel = computed(() => 3 + p.value * 6)
const mound = computed(() => Math.max(0, (p.value - 0.55) / 0.45))

const drying = computed(() => 1 - p.value * 0.05)
const cloth = computed(() => easeOut(clamp01((p.value - 0.05) / 0.9)))

/** 选柑：三颗果的果柄都接到上面的横枝，选中时只抬果子，不抬果柄 */
const pickFruits = [
  { x: 88, y: 150, r: 31, stemTo: 71 },
  { x: 160, y: 142, r: 38, stemTo: 78 },
  { x: 232, y: 152, r: 31, stemTo: 78 },
]

/** 枝梢的叶：叶基就落在枝梢端点上，不留缝 */
const twigTips = [
  { x: 100, y: 36 },
  { x: 170, y: 46 },
  { x: 242, y: 44 },
]

function stemPath(f: { x: number; y: number; r: number; stemTo: number }) {
  return `M${f.x} ${f.y - f.r + 2} C ${f.x - 2} ${f.y - f.r - 8} ${f.x + 2} ${f.stemTo + 8} ${f.x} ${f.stemTo}`
}

</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- ================= 选柑 ================= -->
    <template v-if="scene === 'citrusPick'">
      <path class="s-line" d="M28 74 C 82 58 156 96 292 70" />
      <path class="s-line s-thin" d="M90 68 C 88 54 92 44 100 36" />
      <path class="s-line s-thin" d="M160 84 C 158 68 162 56 170 46" />
      <path class="s-line s-thin" d="M232 76 C 230 62 234 52 242 44" />
      <g v-for="(t, i) in twigTips" :key="`leaf${i}`">
        <path class="s-leaf" :d="`M${t.x} ${t.y} q14 -12 28 -10 q-4 14 -28 10 z`" />
      </g>

      <!-- 果柄先画：从果子接到横枝，选中时不会跟着果子一起浮走 -->
      <path
        v-for="(f, i) in pickFruits"
        :key="`stem${i}`"
        class="s-line s-thin"
        :d="stemPath(f)"
      />

      <!-- 三颗青柑：中间一颗被选中，选中只靠抬起与放大的反馈 -->
      <g
        v-for="(f, i) in pickFruits"
        :key="`fruit${i}`"
        :style="{
          opacity: i === 1 ? 1 : 1 - picked * 0.6,
        }"
        :transform="i === 1 ? `translate(${f.x} ${f.y}) translate(0 ${-picked * 5}) scale(${1 + picked * 0.06}) translate(${-f.x} ${-f.y})` : ''"
      >
        <circle class="s-citrus" :cx="f.x" :cy="f.y" :r="f.r" />
        <path class="s-leaf" :d="`M${f.x + 2} ${f.y - f.r - 10} q16 -12 30 -10 q-4 14 -30 10 z`" />
        <g fill="#2f4f4f" opacity="0.16">
          <circle :cx="f.x - f.r * 0.5" :cy="f.y + f.r * 0.2" r="1.8" />
          <circle :cx="f.x - f.r * 0.2" :cy="f.y + f.r * 0.55" r="2" />
          <circle :cx="f.x + f.r * 0.25" :cy="f.y + f.r * 0.6" r="1.7" />
          <circle :cx="f.x + f.r * 0.55" :cy="f.y + f.r * 0.15" r="1.9" />
          <circle :cx="f.x + f.r * 0.1" :cy="f.y + f.r * 0.1" r="1.6" />
        </g>
      </g>

      <path class="s-line s-thin s-faint" d="M42 210 H278" />
    </template>

    <!-- ================= 晒柑壳 ================= -->
    <template v-else-if="scene === 'peelDry'">
      <g :transform="`rotate(${p * 40} 258 56)`">
        <circle class="s-line s-thin" cx="258" cy="56" r="20" fill="#e6c98f" fill-opacity="0.32" />
        <g class="s-line s-thin">
          <path d="M258 26 v -9" />
          <path d="M258 86 v 9" />
          <path d="M228 56 h -9" />
          <path d="M288 56 h 9" />
          <path d="M237 35 l -6 -6" />
          <path d="M279 77 l 6 6" />
          <path d="M279 35 l 6 -6" />
          <path d="M237 77 l -6 6" />
        </g>
      </g>

      <ellipse class="s-paper s-line" cx="150" cy="168" rx="106" ry="40" />
      <ellipse class="s-line s-thin s-faint" cx="150" cy="168" rx="92" ry="32" />
      <g class="s-line s-thin s-faint">
        <path d="M54 158 H246" />
        <path d="M58 178 H242" />
      </g>

      <!-- 三只挖空的柑壳：留出壳与壳之间的缝，不互相压线 -->
      <g
        v-for="(f, i) in [
          { x: 80, y: 158 },
          { x: 150, y: 150 },
          { x: 220, y: 158 },
        ]"
        :key="`peel${i}`"
        :transform="`translate(${f.x} ${f.y}) scale(${drying}) translate(${-f.x} ${-f.y})`"
      >
        <path
          class="s-citrus"
          :d="`M${f.x - 30} ${f.y + 8} C ${f.x - 33} ${f.y - 28} ${f.x + 33} ${f.y - 28} ${f.x + 30} ${f.y + 8} Z`"
        />
        <ellipse class="s-paper s-line s-thin" :cx="f.x" :cy="f.y - 12" rx="23" ry="7" />
        <ellipse :cx="f.x" :cy="f.y - 12" rx="17" ry="4.6" fill="#7a4a28" fill-opacity="0.25" />
        <g fill="#2f4f4f" opacity="0.15">
          <circle :cx="f.x - 16" :cy="f.y + 2" r="1.6" />
          <circle :cx="f.x + 12" :cy="f.y + 4" r="1.8" />
          <circle :cx="f.x" :cy="f.y + 8" r="1.4" />
        </g>
      </g>

      <path class="s-line s-thin s-faint" d="M32 210 H286" />
    </template>

    <!-- ================= 填茶 ================= -->
    <template v-else-if="scene === 'citrusFill'">
      <!-- 填茶的竹勺 -->
      <path class="s-wood s-line s-thin" d="M126 46 q34 -12 68 0 q-6 18 -34 18 q-28 0 -34 -18 z" />
      <path class="s-line s-thin" d="M192 50 l 18 -10" />
      <path class="s-line s-thin" :style="{ opacity: 0.5 + p * 0.5 }" d="M160 64 V 114" stroke-dasharray="3 6" />

      <!-- 落下的茶 -->
      <g :style="{ opacity: 0.25 + p * 0.7 }">
        <ellipse v-for="(d, i) in [
          { x: 154, y: 76, r: 2.2 },
          { x: 166, y: 88, r: 1.8 },
          { x: 158, y: 98, r: 2.4 },
          { x: 165, y: 108, r: 1.6 },
          { x: 159, y: 114, r: 1.5 },
        ]" :key="`drop${i}`" :cx="d.x" :cy="d.y + Math.sin(p * Math.PI * 4 + i) * 2" :r="d.r" fill="#6b4226" />
      </g>

      <!-- 地线先画：柑坐在桌面前，线不会压过果底 -->
      <path class="s-line s-thin s-faint" d="M44 216 H276" />

      <!-- 柑壳 -->
      <circle class="s-citrus" cx="160" cy="160" r="58" />
      <g fill="#2f4f4f" opacity="0.16">
        <circle cx="130" cy="176" r="2" />
        <circle cx="146" cy="196" r="2.2" />
        <circle cx="172" cy="200" r="2" />
        <circle cx="192" cy="182" r="2.2" />
        <circle cx="202" cy="162" r="2" />
        <circle cx="122" cy="160" r="1.8" />
      </g>
      <path class="s-line s-thin" d="M160 102 v -12" />
      <!-- 叶子长在果柄左侧，不挡住中间的落茶线 -->
      <path class="s-leaf" d="M158 94 C 144 78 126 74 116 76 C 122 92 140 98 158 94 Z" />

      <ellipse class="s-paper s-line" cx="160" cy="118" rx="34" ry="10" />
      <ellipse :cx="160" :cy="118" rx="28" :ry="fillLevel" fill="#6b4226" fill-opacity="0.78" />
      <path
        class="s-tea-deep"
        :style="{ opacity: mound }"
        :d="`M132 118 Q160 ${116 - mound * 18} 188 118 Z`"
      />
      <g fill="#4a2f19" :style="{ opacity: 0.4 + p * 0.4 }">
        <circle cx="148" cy="116" r="1.5" />
        <circle cx="166" cy="114" r="1.7" />
        <circle cx="176" cy="118" r="1.4" />
      </g>
    </template>

    <!-- ================= 烘干 / 生晒 ================= -->
    <template v-else-if="scene === 'citrusDry'">
      <defs>
        <radialGradient id="dryHeat" cx="50%" cy="100%" r="72%">
          <stop offset="0%" stop-color="#c07a34" stop-opacity="0.42" />
          <stop offset="100%" stop-color="#c07a34" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g :transform="`rotate(${p * 36} 52 58)`">
        <circle class="s-line s-thin" cx="52" cy="58" r="19" fill="#e6c98f" fill-opacity="0.32" />
        <g class="s-line s-thin">
          <path d="M52 30 v -8" />
          <path d="M52 86 v 8" />
          <path d="M24 58 h -8" />
          <path d="M80 58 h 8" />
          <path d="M32 38 l -6 -6" />
          <path d="M72 78 l 6 6" />
          <path d="M72 38 l 6 -6" />
          <path d="M32 78 l -6 6" />
        </g>
      </g>

      <!-- 低温的热：只在竹架下铺一层暖光 -->
      <ellipse cx="160" cy="206" rx="106" ry="34" fill="url(#dryHeat)" :style="{ opacity: 0.45 + p * 0.45 }" />

      <ellipse class="s-paper s-line" cx="160" cy="168" rx="108" ry="36" />
      <g class="s-line s-thin s-faint">
        <path d="M60 158 H260" />
        <path d="M66 178 H254" />
      </g>

      <g
        v-for="(f, i) in [
          { x: 104, y: 150, r: 24 },
          { x: 160, y: 142, r: 26 },
          { x: 216, y: 150, r: 24 },
        ]"
        :key="`dryfruit${i}`"
        :transform="`translate(${f.x} ${f.y}) scale(${drying}) translate(${-f.x} ${-f.y})`"
      >
        <circle class="s-citrus" :cx="f.x" :cy="f.y" :r="f.r" />
        <path class="s-line s-thin" :d="`M${f.x} ${f.y - f.r} v -10`" />
        <path class="s-leaf" :d="`M${f.x + 2} ${f.y - f.r - 8} q12 -10 24 -8 q-4 12 -24 8 z`" />
        <g fill="#2f4f4f" opacity="0.15">
          <circle :cx="f.x - 10" :cy="f.y + 4" r="1.5" />
          <circle :cx="f.x + 8" :cy="f.y + 8" r="1.6" />
          <circle :cx="f.x + 2" :cy="f.y - 6" r="1.4" />
        </g>
      </g>

      <!-- 热与湿都在暖光和太阳里，不再画从果身漏出的线和无归属的空心圆 -->
      <path class="s-line s-thin s-faint" d="M30 216 H288" />
    </template>

    <!-- ================= 静置陈放 ================= -->
    <template v-else>
      <!-- 一弯月：时间在走 -->
      <path class="s-line s-thin" d="M266 44 a 20 20 0 1 0 14 30 a 16 16 0 1 1 -14 -30 z" fill="#e6c98f" fill-opacity="0.34" />

      <!-- 竹篮与三颗柑：篮底留一道浅影 -->
      <ellipse cx="160" cy="203" rx="70" ry="6" fill="#2f4f4f" opacity="0.06" />
      <ellipse class="s-paper s-line" cx="160" cy="160" rx="74" ry="26" />
      <path class="s-paper s-line" d="M86 160 h148 l-10 38 a 12 12 0 0 1 -12 10 h-104 a 12 12 0 0 1 -12 -10 z" />
      <path class="s-line s-thin s-faint" d="M96 174 h128 M102 190 h116" />
      <path class="s-line s-thin" d="M104 154 a 56 52 0 0 1 112 0" />
      <g
        v-for="(f, i) in [
          { x: 118, y: 146, r: 18 },
          { x: 160, y: 138, r: 20 },
          { x: 202, y: 146, r: 18 },
        ]"
        :key="`restfruit${i}`"
      >
        <circle class="s-citrus" :cx="f.x" :cy="f.y" :r="f.r" />
        <path class="s-line s-thin" :d="`M${f.x} ${f.y - f.r} v -8`" />
        <g fill="#2f4f4f" opacity="0.14">
          <circle :cx="f.x - 8" :cy="f.y + 2" r="1.4" />
          <circle :cx="f.x + 7" :cy="f.y + 5" r="1.5" />
        </g>
      </g>

      <!-- 盖上棉布：从右边慢慢搭过来，最后盖住柑果 -->
      <g :style="{ opacity: 1 }">
        <path
          class="s-cloth"
          d="M88 158 Q104 118 160 108 Q216 118 232 158 Q236 180 216 188 Q188 196 160 194 Q132 196 104 188 Q84 180 88 158 Z"
          :transform="`translate(${(1 - cloth) * 118} ${(1 - cloth) * -10}) rotate(${(1 - cloth) * 8} 160 170)`"
        />
        <g
          class="s-line s-thin"
          :style="{ opacity: cloth }"
          :transform="`translate(${(1 - cloth) * 118} ${(1 - cloth) * -10}) rotate(${(1 - cloth) * 8} 160 170)`"
        >
          <path d="M112 164 q20 8 48 4" />
          <path d="M160 146 q18 8 38 6" />
          <path d="M150 122 q14 10 26 4" />
          <path d="M184 176 q16 -2 28 -8" />
        </g>
      </g>

      <!-- 柑香茶味：慢慢蕴化 -->
      <g class="s-line s-thin" :style="{ opacity: 0.35 + cloth * 0.4, transform: `translateY(${cloth * -6}px)` }">
        <path d="M122 130 C 114 118 128 110 122 96" />
        <path d="M160 120 C 152 108 166 100 160 86" />
        <path d="M198 130 C 190 118 204 110 198 96" />
      </g>
      <path class="s-line s-thin s-faint" d="M40 216 H280" />
    </template>
  </svg>
</template>
