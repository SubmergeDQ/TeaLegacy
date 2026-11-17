<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import OEmpty from '@/components/oil-ui/OEmpty.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import OSegmented from '@/components/oil-ui/OSegmented.vue'
import OTag from '@/components/oil-ui/OTag.vue'
import {
  ORDER_STATUS_TEXT,
  countByStatus,
  formatShortTime,
  useAdminOrdersStore,
  type Order,
  type OrderStatus,
} from '@/catalog/admin'
import ShipSheet from '@/merchant/components/ShipSheet.vue'
import BatchShipSheet from '@/merchant/components/BatchShipSheet.vue'
import { formatPrice } from '@/utils/format'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { delay } from '@/utils/motion'

// 订单列表：六段状态筛选 + 每页 10 条上拉加载。
// 卡片上直接发货（待发货态），省掉"进详情再返回"的一步。
const route = useRoute()
const router = useRouter()
const store = useAdminOrdersStore()

const PAGE_SIZE = 10
const STATUS_KEYS: OrderStatus[] = ['pending', 'paid', 'shipped', 'done', 'canceled']

const filter = ref('all')
const visibleCount = ref(PAGE_SIZE)

watch(
  () => route.query.status,
  (value) => {
    if (typeof value === 'string' && STATUS_KEYS.includes(value as OrderStatus)) {
      filter.value = value
    }
  },
  { immediate: true },
)

watch(filter, (value) => {
  visibleCount.value = PAGE_SIZE
  // 批量发货只在待发货里有意义，切走就退出选择
  if (selecting.value && value !== 'paid') exitSelect()
  const current = typeof route.query.status === 'string' ? route.query.status : 'all'
  if (current === value) return
  void router.replace({ query: value === 'all' ? {} : { status: value } })
})

const counts = computed(() => countByStatus(store.orders))

const options = computed(() => [
  { value: 'all', label: '全部', count: counts.value.all },
  ...STATUS_KEYS.map((key) => ({
    value: key,
    label: ORDER_STATUS_TEXT[key],
    count: counts.value[key],
  })),
])

const filtered = computed(() =>
  filter.value === 'all'
    ? store.orders
    : store.orders.filter((order) => order.status === filter.value),
)

const displayed = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => displayed.value.length < filtered.value.length)

const { setSentinel, loading } = useInfiniteScroll(
  async () => {
    // 只留很短的加载反馈：演示数据是本地的，太快反而像没加载
    await delay(140)
    visibleCount.value += PAGE_SIZE
  },
  () => hasMore.value,
)

function statusTone(status: OrderStatus) {
  if (status === 'done') return 'success'
  if (status === 'shipped') return 'info'
  if (status === 'pending' || status === 'paid') return 'warn'
  return 'neutral'
}

function totalQty(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.qty, 0)
}

function itemsPreview(order: Order): string {
  const head = order.items
    .slice(0, 2)
    .map((item) => `${item.name} ×${item.qty}`)
    .join('、')
  return order.items.length > 2 ? `${head} 等 ${order.items.length} 款` : head
}

const shipOpen = ref(false)
const shipNo = ref('')

// —— 批量发货：在待发货里多选，一个承运商一次发完 ——
const selecting = ref(false)
const selected = ref<string[]>([])
const batchOpen = ref(false)

const selectable = computed(() => filtered.value.filter((order) => order.status === 'paid'))
const allSelected = computed(
  () =>
    selectable.value.length > 0 &&
    selectable.value.every((order) => selected.value.includes(order.no)),
)
const selectedOrders = computed(() =>
  filtered.value.filter((order) => selected.value.includes(order.no)),
)

function startBatch() {
  selected.value = []
  filter.value = 'paid'
  selecting.value = true
}

function exitSelect() {
  selecting.value = false
  selected.value = []
}

function toggleSelect(no: string) {
  selected.value = selected.value.includes(no)
    ? selected.value.filter((item) => item !== no)
    : [...selected.value, no]
}

function toggleAll() {
  selected.value = allSelected.value ? [] : selectable.value.map((order) => order.no)
}

function openBatch() {
  if (selected.value.length === 0) return
  batchOpen.value = true
}

function afterBatch() {
  exitSelect()
}

function onCardClick(order: Order) {
  if (selecting.value) {
    toggleSelect(order.no)
    return
  }
  openOrder(order.no)
}

function openShip(no: string) {
  shipNo.value = no
  shipOpen.value = true
}

function openOrder(no: string) {
  router.push(`/admin/orders/${no}`)
}

function resetFilter() {
  filter.value = 'all'
}
</script>

<template>
  <div class="orders">
    <div class="orders__sticky">
      <header class="orders__head">
        <div>
          <h1 class="orders__title">订单</h1>
          <p class="orders__sub">
            {{
              selecting
                ? '选择要发货的订单'
                : `共 ${counts.all} 单 · ${counts.paid} 单待发货`
            }}
          </p>
        </div>
        <button
          v-if="!selecting && counts.paid > 0"
          type="button"
          class="orders__batch-btn"
          @click="startBatch"
        >
          批量发货
        </button>
        <button
          v-else-if="selecting"
          type="button"
          class="orders__batch-btn"
          @click="exitSelect"
        >
          取消
        </button>
      </header>

      <OSegmented v-model="filter" :options="options" :columns="3" />
    </div>

    <ul v-if="displayed.length > 0" class="orders__list">
      <li v-for="order in displayed" :key="order.no">
        <article
          class="order"
          :class="{
            'is-selecting': selecting,
            'is-selected': selecting && selected.includes(order.no),
          }"
          @click="onCardClick(order)"
        >
          <header class="order__head">
            <span class="order__no">{{ order.no }}</span>
            <span class="order__head-end">
              <OTag :tone="statusTone(order.status)">
                {{ ORDER_STATUS_TEXT[order.status] }}
              </OTag>
              <span
                v-if="selecting"
                class="order__check"
                :class="{ 'is-on': selected.includes(order.no) }"
                aria-hidden="true"
              >
                <OIcon v-if="selected.includes(order.no)" name="check" :size="12" />
              </span>
            </span>
          </header>

          <p class="order__meta">
            {{ formatShortTime(order.at) }} · 共 {{ totalQty(order) }} 件
          </p>
          <p class="order__items">{{ itemsPreview(order) }}</p>

          <p v-if="order.tracking" class="order__tracking">
            <OIcon name="truck" :size="14" />
            {{ order.tracking.company }} {{ order.tracking.no }}
          </p>

          <footer class="order__foot">
            <span class="order__total">¥{{ formatPrice(order.total) }}</span>
            <span class="order__buyer">{{ order.buyer.name }}</span>
            <OButton
              v-if="!selecting && order.status === 'paid'"
              class="order__action"
              @click.stop="openShip(order.no)"
            >
              发货
            </OButton>
          </footer>
        </article>
      </li>
    </ul>

    <OEmpty
      v-else
      icon="receipt"
      :text="filter === 'all' ? '还没有订单' : '没有这类订单'"
      sub="C 端模拟下单后会实时出现在这里"
      action="查看全部"
      @action="resetFilter"
    />

    <div :ref="setSentinel" class="orders__sentinel" aria-hidden="true" />

    <div v-if="loading" class="orders__skeletons" aria-hidden="true">
      <div v-for="i in 2" :key="i" class="skeleton" />
    </div>

    <p v-else-if="!hasMore && displayed.length > 0" class="orders__end">已经到底了</p>

    <footer v-if="selecting" class="orders__batchbar">
      <button type="button" class="orders__selectall" @click="toggleAll">
        {{ allSelected ? '取消全选' : '全选' }}
      </button>
      <span class="orders__selected">已选 {{ selected.length }} 单</span>
      <OButton :disabled="selected.length === 0" @click="openBatch">批量发货</OButton>
    </footer>

    <ShipSheet v-model="shipOpen" :order-no="shipNo" />
    <BatchShipSheet v-model="batchOpen" :orders="selectedOrders" @shipped="afterBatch" />
  </div>
</template>

<style scoped lang="scss">
.orders {
  padding-bottom: 1.5rem;
}

.orders__sticky {
  position: sticky;
  top: 0;
  z-index: 15;
  display: grid;
  gap: 0.625rem;
  padding: 0.5rem 1rem 0.75rem;
  background: var(--o-paper);
  border-bottom: 1px solid var(--o-line);
}

.orders__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}

.orders__title {
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.orders__sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

// 批量入口停在页头右侧，不占内容高度
.orders__batch-btn {
  flex-shrink: 0;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--o-ink);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--o-ink);
  transition: background-color var(--o-dur-press) linear;

  &:active {
    background: rgba(47, 79, 79, 0.06);
  }
}

.orders__list {
  display: grid;
  gap: 0.625rem;
  padding: 0.75rem 1rem 0;
}

.order {
  display: grid;
  gap: 0.375rem;
  padding: 0.8125rem 0.875rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
  cursor: pointer;
  transition: background-color var(--o-dur-press) linear;

  &:active {
    background: rgba(47, 79, 79, 0.03);
  }

  &.is-selecting {
    cursor: default;
  }

  &.is-selected {
    border-color: rgba(47, 79, 79, 0.45);
    background: rgba(47, 79, 79, 0.04);
  }
}

.order__head-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// 选择态复选框：可见 20px，触控区由整张卡承担
.order__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--o-disabled);
  border-radius: 50%;
  color: var(--o-on-ink);
  transition:
    background-color var(--o-dur-press) linear,
    border-color var(--o-dur-press) linear;

  &.is-on {
    border-color: var(--o-ink);
    background: var(--o-ink);
  }
}

.order__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.order__no {
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--o-text);
}

.order__meta {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.order__items {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--o-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 已发货的单直接把物流摊在卡上，不必逐个点进详情查
.order__tracking {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);

  svg {
    color: var(--o-info);
  }
}

.order__foot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.order__total {
  font-family: var(--o-font-sans);
  font-size: 1.0625rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--o-primary);
}

.order__buyer {
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.order__action {
  margin-left: auto;
  min-width: 4.5rem;
}

.orders__sentinel {
  height: 1px;
}

.orders__skeletons {
  display: grid;
  gap: 0.625rem;
  padding: 0.75rem 1rem 0;
}

.skeleton {
  height: 5.5rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: linear-gradient(
    100deg,
    rgba(252, 250, 245, 0.9) 30%,
    rgba(231, 224, 210, 0.55) 50%,
    rgba(252, 250, 245, 0.9) 70%
  );
  background-size: 300% 100%;
  animation: skeleton-sweep 1.2s linear infinite;
}

@keyframes skeleton-sweep {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

.orders__end {
  padding: 1rem;
  text-align: center;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--o-disabled);
}

// —— 选择态底栏：全选、已选数量、批量发货 ——
.orders__batchbar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  padding-bottom: calc(0.625rem + var(--o-safe-bottom));
  background: var(--o-card);
  border-top: 1px solid var(--o-line);
  z-index: 20;
}

.orders__selectall {
  min-height: 2.5rem;
  font-size: 0.8125rem;
  color: var(--o-ink);
}

.orders__selected {
  margin-left: auto;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}
</style>
