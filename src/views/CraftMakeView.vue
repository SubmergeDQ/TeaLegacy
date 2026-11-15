<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CraftControl from '@/components/craft/CraftControl.vue'
import CraftScene from '@/components/craft/CraftScene.vue'
import OButton from '@/components/oil-ui/OButton.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import { showToast } from '@/components/oil-ui/toast'
import { getCraftTea } from '@/catalog/craft'
import { actionForStep } from '@/catalog/craft/actions'
import { getProduct } from '@/catalog/shop'
import { useCartStore } from '@/stores/cart'
import { useCraftStore } from '@/stores/craft'
import { formatPrice } from '@/utils/format'

// 制作页：一步一互动，走完一款茶的工序就是成茶票签。
// 每一幕的图版只读 progress（0–1），由手上的动作推进：
// 采、摊、揉、炒、搓、提模连续轻点；晒、压、渥堆按住。
// 成茶后可以买同款，也可以退回去换一款——不逼着人做完才能逛。

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const craft = useCraftStore()

const tea = computed(() => getCraftTea(String(route.params.id)))
const product = computed(() => (tea.value ? getProduct(tea.value.productId) : undefined))

// 无效链接回选茶页
watchEffect(() => {
  if (!tea.value) router.replace('/craft')
})

const index = ref(0)
const progress = ref(0)
const phase = ref<'making' | 'done'>('making')
const advancing = ref(false)
const pressing = ref(false)
const controlRef = ref<InstanceType<typeof CraftControl> | null>(null)

const step = computed(() => tea.value?.steps[index.value])
const total = computed(() => tea.value?.steps.length ?? 0)
const stepNo = computed(() => String(Math.min(index.value + 1, total.value)).padStart(2, '0'))
const totalNo = computed(() => String(total.value).padStart(2, '0'))
const action = computed(() => (step.value ? actionForStep(step.value) : undefined))

// 连续轻点的进度是跳着走的（1/6、2/6……）。
// 这里把每次点击补成一段 300ms 的缓出，图版才会真的"动"起来。
const TWEEN_MS = 300
let tweenRaf = 0
let tweenFrom = 0
let tweenStart = 0

function cancelTween() {
  cancelAnimationFrame(tweenRaf)
  tweenRaf = 0
}

function tweenTo(target: number) {
  cancelTween()
  const from = progress.value
  const delta = target - from
  if (Math.abs(delta) < 0.001) {
    progress.value = target
    return
  }
  tweenFrom = from
  tweenStart = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - tweenStart) / TWEEN_MS)
    const eased = 1 - Math.pow(1 - t, 3)
    progress.value = tweenFrom + delta * eased
    if (t < 1) tweenRaf = requestAnimationFrame(tick)
    else tweenRaf = 0
  }
  tweenRaf = requestAnimationFrame(tick)
}

function onProgress(value: number) {
  // 按住本身就是逐帧连续的，直接用；轻点补动画
  if (action.value?.type === 'hold') {
    cancelTween()
    progress.value = value
  } else {
    tweenTo(value)
  }
}

// —— 图版直接操作：轻点画面等同点一次，按住画面等同按住控制条 ——
function onStageTap() {
  controlRef.value?.tap()
}

function onStageDown(event: PointerEvent) {
  if (action.value?.type !== 'hold') return
  event.preventDefault()
  pressing.value = true
  controlRef.value?.holdStart()
}

function onStageUp() {
  if (action.value?.type !== 'hold') return
  pressing.value = false
  controlRef.value?.holdStop()
}

/** 成茶风味：茶样自带 */
const flavors = computed(() => tea.value?.baseFlavors ?? [])

function segScale(i: number): number {
  if (i < index.value) return 1
  if (i === index.value) return progress.value
  return 0
}

async function scrollTop() {
  await nextTick()
  const body = document.body.querySelector('.app-body')
  if (body instanceof HTMLElement) body.scrollTop = 0
}

/** 一步做完：留半拍看完成的落定，再进下一步 */
let advanceTimer = 0

function onDone() {
  if (advancing.value || !tea.value) return
  advancing.value = true
  advanceTimer = window.setTimeout(() => {
    advancing.value = false
    pressing.value = false
    if (!tea.value) return
    if (index.value >= tea.value.steps.length - 1) {
      craft.finish(tea.value.id, tea.value.baseFlavors)
      phase.value = 'done'
    } else {
      index.value += 1
      cancelTween()
      progress.value = 0
    }
    void scrollTop()
  }, 520)
}

onBeforeUnmount(() => {
  window.clearTimeout(advanceTimer)
  cancelTween()
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/craft')
}

function buy() {
  const p = product.value
  if (!p) return
  cart.add(p)
  showToast({
    text: `已加购「${p.name}」`,
    action: { text: '去看看', handler: () => router.push('/cart') },
  })
}

function openProduct() {
  if (tea.value) router.push(`/shop/${tea.value.productId}`)
}

function again() {
  router.replace('/craft')
}

function replay() {
  phase.value = 'making'
  index.value = 0
  pressing.value = false
  cancelTween()
  progress.value = 0
  void scrollTop()
}

/** 开发核对用：?frame=3:0.5 定格在第四幕的一半，不影响正式用户 */
function readFrame() {
  if (!import.meta.env.DEV) return
  const raw =
    (typeof route.query.frame === 'string' ? route.query.frame : undefined) ??
    new URLSearchParams(window.location.search).get('frame') ??
    undefined
  if (!raw) return
  const [s, t] = raw.split(':')
  const si = Number(s)
  const pp = Number(t)
  if (tea.value && Number.isFinite(si)) {
    index.value = Math.min(tea.value.steps.length - 1, Math.max(0, Math.floor(si)))
  }
  if (Number.isFinite(pp)) progress.value = Math.min(1, Math.max(0, pp))
}

onMounted(readFrame)
</script>

<template>
  <div v-if="tea" class="make">
    <ONavBar :title="phase === 'done' ? '成茶' : tea.name" back @back="goBack" />

    <!-- ================= 工序 ================= -->
    <template v-if="phase === 'making' && step">
      <div class="make__rail">
        <div class="make__rail-head">
          <h1 class="make__title">{{ step.title }}</h1>
          <span class="make__no">
            {{ stepNo }}<i>/ {{ totalNo }}</i>
          </span>
        </div>
        <div class="make__segs" aria-hidden="true">
          <span
            v-for="(s, i) in tea.steps"
            :key="s.key"
            :class="{ 'is-past': i < index }"
          >
            <i :style="{ transform: `scaleX(${segScale(i)})` }" />
          </span>
        </div>
      </div>

      <div
        class="make__stage"
        :class="{ 'is-hold': action?.type === 'hold', 'is-pressing': pressing }"
        @click="onStageTap"
        @pointerdown="onStageDown"
        @pointerup="onStageUp"
        @pointercancel="onStageUp"
        @pointerleave="onStageUp"
        @contextmenu.prevent
      >
        <Transition name="scene" mode="out-in">
          <CraftScene
            :key="step.key"
            :scene="step.scene"
            :form="step.form"
            :progress="progress"
          />
        </Transition>
        <span class="make__stage-no" aria-hidden="true">{{ stepNo }}</span>
      </div>

      <Transition name="copy" mode="out-in">
        <div :key="step.key" class="make__copy">
          <p class="make__caption">{{ step.caption }}</p>
          <p class="make__detail">{{ step.detail }}</p>
        </div>
      </Transition>

      <div class="make__control">
        <CraftControl
          v-if="action"
          ref="controlRef"
          :key="step.key"
          :action="action"
          @update:progress="onProgress"
          @done="onDone"
        />
      </div>
    </template>

    <!-- ================= 成茶 ================= -->
    <div v-else class="result">
      <p class="result__eyebrow">茶样票签 · {{ total }} 步已毕</p>

      <div class="result__art">
        <img :src="tea.art" :alt="tea.name" />
      </div>

      <h1 class="result__name">{{ tea.name }}</h1>
      <p class="result__sub">{{ tea.sub }}<template v-if="product"> · {{ product.unit }}</template></p>

      <div class="result__flavors">
        <span v-for="f in flavors" :key="f">{{ f }}</span>
      </div>

      <div class="result__note">
        <p class="result__verdict">{{ tea.verdict }}</p>
        <p class="result__sign">茶承 · 手制</p>
      </div>

      <!-- 工序回顾：这几步是自己一步一步走完的 -->
      <ol class="result__steps">
        <li v-for="(s, i) in tea.steps" :key="s.key">
          <i>{{ String(i + 1).padStart(2, '0') }}</i>{{ s.title }}
        </li>
      </ol>

      <div class="result__price">
        <i>¥</i><b>{{ formatPrice(product?.price ?? 0) }}</b>
      </div>

      <div class="result__actions">
        <OButton block size="lg" @click="buy">{{ tea.cta }}</OButton>
        <div class="result__links">
          <button @click="openProduct">查看茶品</button>
          <span aria-hidden="true">·</span>
          <button @click="replay">再做一遍</button>
          <span aria-hidden="true">·</span>
          <button @click="again">换一款</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.make {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

// —— 工序头：步名 + 分段进度 ——
.make__rail {
  padding: 0.75rem 1rem 0;
}

.make__rail-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.make__title {
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.3;
  color: var(--o-title);
}

.make__no {
  font-family: var(--o-font-serif);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.6875rem;
    color: var(--o-muted);
  }
}

.make__segs {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5625rem;
}

.make__segs span {
  flex: 1;
  height: 0.125rem;
  background: var(--o-line);
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    background: var(--o-primary);
    transform-origin: left center;
    transition: transform 140ms linear;
  }
}

// —— 图版：方形版心，虚线是图版的边框而不是插画的一部分 ——
.make__stage {
  position: relative;
  aspect-ratio: 1 / 1;
  max-height: 26rem;
  margin: 0.75rem 1rem 0;
  border-radius: var(--o-radius-card);
  background: linear-gradient(180deg, #fbf7ee 0%, #f3ecdc 100%);
  overflow: hidden;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 160ms var(--o-ease-flow);

  &.is-hold {
    touch-action: none;
  }

  &.is-pressing {
    transform: scale(0.994);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0.625rem;
    border: 1px dashed var(--o-ink);
    border-radius: 0.5rem;
    opacity: 0.16;
    pointer-events: none;
  }
}

.make__stage-no {
  position: absolute;
  top: 0.5rem;
  right: 0.875rem;
  font-family: var(--o-font-serif);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--o-primary);
  opacity: 0.14;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.scene-enter-active {
  transition:
    opacity 260ms var(--o-ease-flow),
    transform 260ms var(--o-ease-flow);
}

.scene-leave-active {
  transition:
    opacity 160ms linear,
    transform 160ms linear;
}

.scene-enter-from {
  opacity: 0;
  transform: translateY(0.375rem) scale(0.99);
}

.scene-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

// —— 一句指引 + 一句工艺 ——
.make__copy {
  padding: 0.875rem 1.5rem 0;
  text-align: center;
}

.copy-enter-active {
  transition:
    opacity 260ms var(--o-ease-flow),
    transform 260ms var(--o-ease-flow);
}

.copy-leave-active {
  transition:
    opacity 140ms linear,
    transform 140ms linear;
}

.copy-enter-from {
  opacity: 0;
  transform: translateY(0.25rem);
}

.copy-leave-to {
  opacity: 0;
}

.make__caption {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  color: var(--o-title);
}

.make__detail {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  line-height: 1.65;
  color: var(--o-muted);
}

// —— 控制面 ——
.make__control {
  margin-top: auto;
  padding: 0.875rem 1rem calc(1rem + var(--o-safe-bottom));
}

// —— 成茶票签 ——
.result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem calc(1.25rem + var(--o-safe-bottom));
  text-align: center;
}

.result__eyebrow {
  font-size: 0.6875rem;
  letter-spacing: 0.3em;
  color: var(--o-primary);
}

.result__art {
  width: 8.5rem;
  margin-top: 0.5rem;
  animation: art-in 520ms var(--o-ease-flow) both;

  img {
    width: 100%;
    display: block;
  }
}

@keyframes art-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.result__name {
  margin-top: 0.375rem;
  font-family: var(--o-font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.4;
  color: var(--o-title);
}

.result__sub {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: var(--o-muted);
}

.result__flavors {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.625rem;
  margin-top: 0.625rem;
}

.result__flavors span {
  position: relative;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--o-ink);

  &:not(:first-child) {
    padding-left: 0.625rem;

    &::before {
      content: '·';
      position: absolute;
      left: 0;
      color: var(--o-muted);
    }
  }
}

.result__note {
  width: 100%;
  max-width: 16rem;
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--o-line);
}

.result__verdict {
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--o-text);
}

.result__sign {
  margin-top: 0.375rem;
  font-family: var(--o-font-serif);
  font-size: 0.6875rem;
  letter-spacing: 0.24em;
  color: var(--o-muted);
  text-align: right;
  opacity: 0.8;
}

// 工序回顾：编号领起，八步也能自然折行
.result__steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 0.75rem;
  width: 100%;
  margin-top: 0.875rem;
  padding: 0.625rem 0;
  border-top: 1px solid var(--o-line);
  border-bottom: 1px solid var(--o-line);
}

.result__steps li {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--o-font-serif);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--o-text);

  i {
    font-style: normal;
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    color: var(--o-primary);
    opacity: 0.8;
  }
}

.result__price {
  display: flex;
  align-items: baseline;
  margin-top: 1.125rem;
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.9375rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.625rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.result__actions {
  width: 100%;
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result__links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.25rem;

  button {
    padding: 0.375rem 0.25rem;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: var(--o-muted);

    &:active {
      color: var(--o-primary);
    }
  }

  span {
    font-size: 0.75rem;
    color: var(--o-line);
  }
}
</style>
