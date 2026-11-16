<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import OEmpty from '@/components/oil-ui/OEmpty.vue'
import OFormItem from '@/components/oil-ui/OFormItem.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import OSegmented from '@/components/oil-ui/OSegmented.vue'
import OSheet from '@/components/oil-ui/OSheet.vue'
import OTag from '@/components/oil-ui/OTag.vue'
import { showToast } from '@/components/oil-ui/toast'
import { useAdminCatalogStore } from '@/catalog/admin'
import type { AdminProduct } from '@/catalog/admin'
import { formatShortTime } from '@/catalog/admin/time'

// 库存总览：低库存排在前，入库/出库就地处理，流水写在下面。
const router = useRouter()
const catalog = useAdminCatalogStore()

const filter = ref('all')

const products = computed(() =>
  [...catalog.items].sort((a, b) => {
    const aLow = a.lowStock && a.online ? 1 : 0
    const bLow = b.lowStock && b.online ? 1 : 0
    return bLow - aLow || a.stock - b.stock
  }),
)

const lowCount = computed(() => products.value.filter((p) => p.lowStock && p.online).length)
const onlineCount = computed(() => products.value.filter((p) => p.online).length)

const filtered = computed(() =>
  filter.value === 'all' ? products.value : products.value.filter((p) => p.lowStock && p.online),
)

// 调整后就近高亮：重排后视线还能跟住这一行
const highlightedId = ref<number | null>(null)
let highlightTimer: number | undefined

function highlight(id: number) {
  highlightedId.value = id
  window.clearTimeout(highlightTimer)
  highlightTimer = window.setTimeout(() => {
    highlightedId.value = null
  }, 1800)
}

const options = computed(() => [
  { value: 'all', label: '全部', count: products.value.length },
  { value: 'low', label: '库存不足', count: lowCount.value },
])

const logs = computed(() => catalog.stockLogs.slice(0, 8))

function productName(id: number): string {
  return catalog.items.find((p) => p.id === id)?.name ?? '未知商品'
}

const sheetOpen = ref(false)
const target = ref<AdminProduct | null>(null)
const mode = ref('in')
const amount = ref('10')
const error = ref('')

const sheetTitle = computed(() =>
  target.value ? `调整库存 · ${target.value.name}` : '调整库存',
)

function openAdjust(product: AdminProduct, nextMode: 'in' | 'out') {
  target.value = product
  mode.value = nextMode
  amount.value = '10'
  error.value = ''
  sheetOpen.value = true
}

function submit() {
  if (!target.value) return
  const qty = Number(amount.value)
  if (!Number.isInteger(qty) || qty <= 0 || qty > 999) {
    error.value = '数量需为 1–999 的整数'
    return
  }
  const before = target.value.stock
  const delta = mode.value === 'in' ? qty : -qty
  const next = catalog.adjustStock(target.value.id, delta, mode.value === 'in' ? 'restock' : 'manual')
  const actual = next - before
  sheetOpen.value = false
  highlight(target.value.id)
  if (actual === 0) {
    showToast({ text: '库存已经是 0，未做调整' })
    return
  }
  showToast({
    text: `${actual > 0 ? '入库' : '出库'} ${Math.abs(actual)} 件，当前库存 ${next}`,
  })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/admin/shop')
}
</script>

<template>
  <div class="inv">
    <ONavBar title="库存总览" back @back="goBack" />

    <div class="inv__body">
      <section class="inv__summary">
        <div class="inv__sum">
          <p class="inv__sum-label">在售商品</p>
          <p class="inv__sum-value">{{ onlineCount }}<span> 款</span></p>
        </div>
        <div class="inv__sum">
          <p class="inv__sum-label">库存不足</p>
          <p class="inv__sum-value" :class="{ 'is-warn': lowCount > 0 }">
            {{ lowCount }}<span> 款</span>
          </p>
        </div>
      </section>

      <OSegmented v-model="filter" :options="options" class="inv__seg" />

      <ul v-if="filtered.length > 0" class="inv__list">
        <li
          v-for="product in filtered"
          :key="product.id"
          class="inv__row"
          :class="{ 'is-updated': highlightedId === product.id }"
        >
          <img class="inv__pic" :src="product.image" :alt="product.name" />

          <div class="inv__main">
            <div class="inv__name-row">
              <h2 class="inv__name">{{ product.name }}</h2>
              <OTag v-if="!product.online" tone="neutral">已下架</OTag>
              <OTag v-else-if="product.lowStock" tone="warn">库存不足</OTag>
            </div>
            <p class="inv__meta">
              库存 <b :class="{ 'is-warn': product.lowStock }">{{ product.stock }}</b> 件 ·
              {{ product.unit }}
            </p>
          </div>

          <div class="inv__actions">
            <button
              type="button"
              class="inv__btn"
              :aria-label="`${product.name} 入库`"
              @click="openAdjust(product, 'in')"
            >
              <OIcon name="plus" :size="12" />
              入库
            </button>
            <button
              type="button"
              class="inv__btn inv__btn--out"
              :aria-label="`${product.name} 出库`"
              @click="openAdjust(product, 'out')"
            >
              <OIcon name="minus" :size="12" />
              出库
            </button>
          </div>
        </li>
      </ul>

      <OEmpty
        v-else
        icon="stock"
        text="没有低库存商品"
        sub="所有在售商品都高于预警线"
        action="看全部库存"
        @action="filter = 'all'"
      />

      <section class="inv__logs">
        <h2 class="inv__section">最近流水</h2>

        <ul v-if="logs.length > 0" class="inv__log-list">
          <li v-for="log in logs" :key="log.id" class="inv__log">
            <span class="inv__log-name">{{ productName(log.productId) }}</span>
            <span class="inv__log-dir">{{ log.delta > 0 ? '入库' : '出库' }}</span>
            <span class="inv__log-delta" :class="log.delta > 0 ? 'is-in' : 'is-out'">
              {{ log.delta > 0 ? `+${log.delta}` : log.delta }}
            </span>
            <span v-if="log.balance !== undefined" class="inv__log-balance">
              结存 {{ log.balance }}
            </span>
            <span class="inv__log-time">{{ formatShortTime(log.at) }}</span>
          </li>
        </ul>

        <p v-else class="inv__log-empty">还没有库存调整记录，从上面的入库/出库开始。</p>
      </section>
    </div>

    <OSheet v-model="sheetOpen" :title="sheetTitle">
      <div v-if="target" class="adjust">
        <p class="adjust__now">
          当前库存 <b>{{ target.stock }}</b> 件 · {{ target.unit }}
        </p>

        <OSegmented
          v-model="mode"
          :options="[
            { value: 'in', label: '入库' },
            { value: 'out', label: '出库' },
          ]"
        />

        <OFormItem label="数量" required :error="error">
          <div class="adjust__affix">
            <input
              v-model="amount"
              class="adjust__input"
              type="text"
              inputmode="numeric"
              @input="error = ''"
            />
            <span class="adjust__suffix">件</span>
          </div>
        </OFormItem>
      </div>

      <template #footer>
        <OButton block size="lg" @click="submit">
          {{ mode === 'in' ? '确认入库' : '确认出库' }}
        </OButton>
      </template>
    </OSheet>
  </div>
</template>

<style scoped lang="scss">
.inv {
  min-height: 100%;
}

.inv__body {
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem 1rem 1.5rem;
}

.inv__summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.inv__sum {
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.inv__sum-label {
  font-size: 0.75rem;
  color: var(--o-muted);
}

.inv__sum-value {
  margin-top: 0.125rem;
  font-size: 1.375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);

  span {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--o-muted);
  }

  &.is-warn {
    color: var(--o-warn);
  }
}

.inv__list {
  display: grid;
  gap: 0.625rem;
}

.inv__row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
  transition:
    border-color var(--o-dur-state) linear,
    background-color var(--o-dur-state) linear;

  // 调整后短暂高亮：重排后还能跟住刚才那一行
  &.is-updated {
    border-color: rgba(63, 107, 74, 0.45);
    background: rgba(63, 107, 74, 0.06);
  }
}

.inv__pic {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  object-fit: cover;
  background: var(--o-paper);
}

.inv__main {
  flex: 1;
  min-width: 0;
  display: grid;
  // 单列显式压到容器宽度：否则 auto 列会按 max-content 撑开，
  // 长商品名 + 标签会越过右边界、压到入库/出库按钮上
  grid-template-columns: minmax(0, 1fr);
  gap: 0.1875rem;
}

.inv__name-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.inv__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--o-title);
}

.inv__meta {
  font-size: 0.6875rem;
  color: var(--o-muted);

  b {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--o-text);

    &.is-warn {
      color: var(--o-danger);
    }
  }
}

.inv__actions {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
}

.inv__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  height: 2.75rem;
  padding: 0 0.5rem;
  border: 1px solid var(--o-line);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--o-ink);
  transition:
    background-color var(--o-dur-press) linear,
    border-color var(--o-dur-press) linear;

  &:active {
    background: rgba(47, 79, 79, 0.06);
    border-color: var(--o-ink);
  }

  &--out {
    color: var(--o-muted);

    &:active {
      color: var(--o-danger);
      border-color: rgba(165, 70, 58, 0.5);
      background: rgba(165, 70, 58, 0.05);
    }
  }
}

.inv__logs {
  margin-top: 0.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.inv__section {
  margin-bottom: 0.625rem;
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.inv__log-list {
  display: grid;
  gap: 0.5rem;
}

.inv__log {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: baseline;
  column-gap: 0.5rem;
  row-gap: 0.125rem;
  font-size: 0.6875rem;
  color: var(--o-muted);

  & + & {
    padding-top: 0.5rem;
    border-top: 1px dashed var(--o-line);
  }
}

.inv__log-time {
  grid-column: 1 / -1;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.inv__log-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--o-text);
}

.inv__log-dir {
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

.inv__log-delta {
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  &.is-in {
    color: var(--o-success);
  }

  &.is-out {
    color: var(--o-danger);
  }
}

.inv__log-balance {
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.inv__log-empty {
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--o-muted);
}

.adjust {
  display: grid;
  gap: 1rem;
}

.adjust__now {
  font-size: 0.75rem;
  color: var(--o-muted);

  b {
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--o-title);
  }
}

.adjust__affix {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.adjust__input {
  width: 100%;
  height: 2.75rem;
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
  background: var(--o-paper);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  outline: none;

  &:focus {
    border-color: var(--o-ink);
  }
}

.adjust__suffix {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--o-muted);
}
</style>
