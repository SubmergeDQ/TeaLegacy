<script setup lang="ts">
import { computed, nextTick, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CraftControl from '@/components/craft/CraftControl.vue'
import CraftScene from '@/components/craft/CraftScene.vue'
import OButton from '@/components/oil-ui/OButton.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import { showToast } from '@/components/oil-ui/toast'
import { getCraftTea } from '@/catalog/craft'
import { getProduct } from '@/catalog/shop'
import { useCartStore } from '@/stores/cart'
import { useCraftStore } from '@/stores/craft'
import { formatPrice } from '@/utils/format'

// 制作页：一步一互动，走完五步就是成茶票签。
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

const root = ref<HTMLElement>()
const index = ref(0)
const progress = ref(0)
const phase = ref<'making' | 'done'>('making')
const pickedFlavors = ref<string[]>([])
const advancing = ref(false)

const step = computed(() => tea.value?.steps[index.value])
const total = computed(() => tea.value?.steps.length ?? 0)
const stepNo = computed(() => String(index.value + 1).padStart(2, '0'))
const totalNo = computed(() => String(total.value).padStart(2, '0'))

/** 成茶风味：茶样自带 + 每一步选择的结果 */
const flavors = computed(() => [
  ...new Set([...(tea.value?.baseFlavors ?? []), ...pickedFlavors.value]),
])

function segScale(i: number): number {
  if (i < index.value) return 1
  if (i === index.value) return Math.max(progress.value, 0.05)
  return 0
}

async function scrollTop() {
  await nextTick()
  const body = root.value?.closest('.app-body')
  if (body instanceof HTMLElement) body.scrollTop = 0
}

/** 一步做完：留半拍看完成的落定，再进下一步 */
function onDone(line: string[]) {
  if (advancing.value || !tea.value) return
  advancing.value = true
  if (line.length) {
    pickedFlavors.value = [...new Set([...pickedFlavors.value, ...line])]
  }
  window.setTimeout(() => {
    advancing.value = false
    if (!tea.value) return
    if (index.value >= tea.value.steps.length - 1) {
      craft.finish(tea.value.id, flavors.value)
      phase.value = 'done'
    } else {
      index.value += 1
      progress.value = 0
    }
    void scrollTop()
  }, 520)
}

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
</script>

<template>
  <div v-if="tea" ref="root" class="make">
    <ONavBar :title="phase === 'done' ? '成茶' : '制茶'" back @back="goBack" />

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

      <div class="make__stage">
        <Transition name="scene" mode="out-in">
          <CraftScene
            :key="step.key"
            :scene="step.scene"
            :step="step.key"
            :progress="progress"
          />
        </Transition>
      </div>

      <div class="make__copy">
        <p class="make__caption">{{ step.caption }}</p>
        <p class="make__detail">{{ step.detail }}</p>
      </div>

      <div class="make__control">
        <CraftControl
          :key="step.key"
          :action="step.action"
          @update:progress="progress = $event"
          @done="onDone"
        />
      </div>
    </template>

    <!-- ================= 成茶 ================= -->
    <div v-else class="result">
      <p class="result__eyebrow">成茶 · {{ total }} 步已毕</p>

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

      <!-- 工序回顾：这五步是自己一步一步走完的 -->
      <ol class="result__steps">
        <li v-for="(s, i) in tea.steps" :key="s.key">
          <span class="result__step-no">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="result__step-name">{{ s.title }}</span>
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
          <button @click="again">再做一款</button>
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

// —— 工序头：步名 + 五段进度 ——
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

// —— 工序图版：方形版心，虚线是图版的边框而不是插画的一部分 ——
.make__stage {
  position: relative;
  aspect-ratio: 1 / 1;
  max-height: 26rem;
  margin: auto 1rem 0;
  border-radius: var(--o-radius-card);
  background: linear-gradient(180deg, #fbf7ee 0%, #f3ecdc 100%);
  overflow: hidden;

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

// 落款：不另盖一枚印（饼上已有），只留一行交代来处
.result__sign {
  margin-top: 0.375rem;
  font-family: var(--o-font-serif);
  font-size: 0.625rem;
  letter-spacing: 0.24em;
  color: var(--o-muted);
  text-align: right;
  opacity: 0.8;
}

// 工序回顾：五步一条窄带，数字是走过的顺序
.result__steps {
  display: flex;
  width: 100%;
  margin-top: 1rem;
  border-top: 1px solid var(--o-line);
  border-bottom: 1px solid var(--o-line);
}

.result__steps li {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.5rem 0 0.4375rem;

  &:not(:first-child) {
    border-left: 1px solid var(--o-line);
  }
}

.result__step-no {
  font-family: var(--o-font-serif);
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  color: var(--o-primary);
  opacity: 0.75;
}

.result__step-name {
  font-family: var(--o-font-serif);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--o-text);
}

.result__price {
  display: flex;
  align-items: baseline;
  margin-top: 1.25rem;
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

// 次要动作降为文字链：一屏之内只有一个实底按钮
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
