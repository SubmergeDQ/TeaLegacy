<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type { CraftAction, CraftChoice } from '@/catalog/craft/types'

// ============================================================
// 一步一动作：轻点 / 按住 / 拖动 / 选择，四种互动共用一条控制面。
// 进度只上报 0–1，场景据此变化；完成后 emit done，由页面推进下一步。
// 长按按毫秒、拖动按像素增量，两者都不因松手而清零——
// 做茶是可以慢慢来的，不该因为手抖从头开始。
// ============================================================

const props = defineProps<{ action: CraftAction }>()

const emit = defineEmits<{
  'update:progress': [value: number]
  done: [flavors: string[]]
}>()

const type = computed(() => props.action.type)
const target = computed(() => Math.max(1, props.action.target))

const count = ref(0)
const ratio = ref(0)
const holding = ref(false)
const dragging = ref(false)
const chosen = ref('')

const done = computed(() => ratio.value >= 1)

const valueText = computed(() => {
  if (done.value) return '完成'
  if (type.value === 'hold') return `${Math.round(ratio.value * 100)}%`
  if (type.value === 'choose') return ''
  return `${count.value} / ${target.value}`
})

const hint = computed(() => {
  switch (type.value) {
    case 'hold':
      return '按住不放，直到走完'
    case 'swipe':
      return '左右拖动；也可以连续轻点'
    case 'tap':
      return '连续轻点'
    default:
      return '选一个，风味就此定下'
  }
})

let raf = 0
let lastTime = 0
let lastX = 0
let travelled = 0
let accum = 0

// 一次「推揉」需要拖过的像素：短到不费劲，长到不像误触
const STROKE = 42

function report() {
  emit('update:progress', ratio.value)
}

function settle(flavors: string[] = []) {
  ratio.value = 1
  report()
  emit('done', flavors)
}

/** 计一次动作（点、或一次推揉） */
function oneStroke() {
  if (done.value) return
  count.value += 1
  ratio.value = Math.min(1, count.value / target.value)
  report()
  if (count.value >= target.value) settle()
}

// —— 轻点 ——
function onTap() {
  if (type.value !== 'tap') return
  oneStroke()
}

// —— 按住 ——
function startHold() {
  if (type.value !== 'hold' || done.value || holding.value) return
  holding.value = true
  lastTime = performance.now()
  const tick = (now: number) => {
    if (!holding.value) return
    const dt = now - lastTime
    lastTime = now
    ratio.value = Math.min(1, ratio.value + dt / target.value)
    report()
    if (ratio.value >= 1) {
      holding.value = false
      settle()
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function stopHold() {
  if (!holding.value) return
  holding.value = false
  cancelAnimationFrame(raf)
}

// —— 拖动 ——
function startDrag(event: PointerEvent) {
  if (type.value !== 'swipe' || done.value) return
  dragging.value = true
  lastX = event.clientX
  travelled = 0
  accum = 0
  const el = event.currentTarget as HTMLElement
  el.setPointerCapture?.(event.pointerId)
}

function moveDrag(event: PointerEvent) {
  if (!dragging.value) return
  const dx = event.clientX - lastX
  lastX = event.clientX
  travelled += Math.abs(dx)
  accum += Math.abs(dx)
  while (accum >= STROKE && !done.value) {
    accum -= STROKE
    oneStroke()
  }
}

function endDrag() {
  if (!dragging.value) return
  dragging.value = false
  // 位移太小：按一次轻点算，鼠标与键盘也能走完
  if (travelled < 6) oneStroke()
}

// —— 选择 ——
function choose(choice: CraftChoice) {
  if (done.value) return
  chosen.value = choice.key
  settle(choice.flavors)
}

// —— 事件分发 ——
function onClick(event: MouseEvent) {
  if (type.value === 'tap') onTap()
  // 键盘（detail = 0）在拖动型控件上等同一次推揉；鼠标点击已由 pointerup 计过
  else if (type.value === 'swipe' && event.detail === 0) oneStroke()
}

function onPointerDown(event: PointerEvent) {
  if (type.value === 'hold') startHold()
  else if (type.value === 'swipe') startDrag(event)
}

function onPointerMove(event: PointerEvent) {
  if (type.value === 'swipe') moveDrag(event)
}

function onPointerUp() {
  if (type.value === 'hold') stopHold()
  else if (type.value === 'swipe') endDrag()
}

function onKeydown(event: KeyboardEvent) {
  if (type.value !== 'hold') return
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  startHold()
}

function onKeyup(event: KeyboardEvent) {
  if (type.value !== 'hold') return
  if (event.key !== ' ' && event.key !== 'Enter') return
  stopHold()
}

onMounted(() => window.addEventListener('pointerup', stopHold))
onBeforeUnmount(() => {
  window.removeEventListener('pointerup', stopHold)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="ctl">
    <!-- 选择型：两个选项并排，一个决定风味 -->
    <div v-if="type === 'choose'" class="ctl__choices">
      <button
        v-for="c in action.choices ?? []"
        :key="c.key"
        class="ctl__choice"
        :class="{ 'is-on': chosen === c.key }"
        @click="choose(c)"
      >
        <span class="ctl__choice-label">{{ c.label }}</span>
        <span class="ctl__choice-note">{{ c.note }}</span>
      </button>
    </div>

    <!-- 轻点 / 按住 / 拖动：同一条控制面，底部一条细线走完就是成了 -->
    <button
      v-else
      class="ctl__bar"
      :class="{ 'is-holding': holding, 'is-done': done }"
      :aria-label="`${action.verb}，${hint}`"
      @click="onClick"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
      @keyup="onKeyup"
    >
      <span class="ctl__label">{{ action.verb }}</span>
      <span class="ctl__value">{{ valueText }}</span>
      <span class="ctl__track" aria-hidden="true">
        <i :style="{ transform: `scaleX(${ratio})` }" />
      </span>
    </button>

    <p class="ctl__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.ctl {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

// —— 控制面 ——
.ctl__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  height: 3.25rem;
  padding: 0 1rem;
  border-radius: var(--o-radius-btn);
  background: var(--o-primary);
  color: #fdfbf6;
  overflow: hidden;
  // 拖动时不带出页面滚动
  touch-action: none;
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    background-color var(--o-dur-state) linear;

  &:active {
    transform: scale(0.985);
  }

  &.is-holding {
    background: var(--o-primary-deep);
  }

  &.is-done {
    background: var(--o-ink);
  }
}

.ctl__label {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.ctl__value {
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  opacity: 0.82;
}

.ctl__track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0.125rem;
  background: rgba(253, 251, 246, 0.22);
  overflow: hidden;
}

.ctl__track i {
  display: block;
  height: 100%;
  background: #f3eee3;
  transform-origin: left center;
  transition: transform 120ms linear;
}

.ctl__hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--o-muted);
  text-align: center;
}

// —— 选择型 ——
.ctl__choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.ctl__choice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  padding: 0.6875rem 0.75rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  background: var(--o-card);
  text-align: left;
  transition:
    border-color var(--o-dur-state) linear,
    background-color var(--o-dur-state) linear,
    transform var(--o-dur-press) var(--o-ease-flow);

  &:active {
    transform: scale(0.98);
  }

  &.is-on {
    border-color: var(--o-primary);
    background: rgba(107, 66, 38, 0.07);
  }
}

.ctl__choice-label {
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--o-title);
}

.ctl__choice-note {
  font-size: 0.6875rem;
  line-height: 1.45;
  color: var(--o-muted);
}
</style>
