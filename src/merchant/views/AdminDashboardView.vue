<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import OChartLine from '@/components/oil-ui/charts/OChartLine.vue'
import OEmpty from '@/components/oil-ui/OEmpty.vue'
import OStatCard from '@/components/oil-ui/OStatCard.vue'
import OTag from '@/components/oil-ui/OTag.vue'
import { showToast } from '@/components/oil-ui/toast'
import {
  computeKpi,
  computeTop,
  computeTrend,
  useAdminCatalogStore,
  useAdminOrdersStore,
  useAdminShopStore,
} from '@/catalog/admin'
import { formatPrice } from '@/utils/format'
import { delay } from '@/utils/motion'
import { usePullRefresh } from '@/composables/usePullRefresh'

// 概览：今日 KPI + 近 7 日趋势 + 待办 + 热销 Top5。
// 数字全部由订单聚合算出（改单即变数），没有一张写死的图。
const router = useRouter()
const ordersStore = useAdminOrdersStore()
const catalog = useAdminCatalogStore()
const shop = useAdminShopStore()

const kpi = computed(() => computeKpi(ordersStore.orders))
const trend = computed(() => computeTrend(ordersStore.orders))
const top = computed(() => computeTop(ordersStore.orders))
const trendPoints = computed(() => trend.value.map((p) => ({ label: p.label, value: p.sales })))
const trendTotal = computed(() => trend.value.reduce((sum, p) => sum + p.sales, 0))
const lowStock = computed(() => catalog.items.filter((p) => p.lowStock && p.online))
const pendingPay = computed(() => ordersStore.orders.filter((o) => o.status === 'pending').length)
// 待发货的入口已由上方 KPI 卡承担，这里只放它没覆盖的待办，避免重复
const hasTodo = computed(() => pendingPay.value > 0 || lowStock.value.length > 0)
const peak = computed(() => {
  const points = trend.value
  const max = points.reduce((best, point) => (point.sales > best.sales ? point : best), points[0])
  return max && max.sales > 0 ? max : null
})

const todayText = computed(() => {
  const d = new Date()
  const week = '日一二三四五六'[d.getDay()]
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${week}`
})

const { distance, active, progress, label } = usePullRefresh(async () => {
  await delay(600)
  showToast({ text: '数据已刷新' })
})

function goPending() {
  router.push({ path: '/admin/orders', query: { status: 'paid' } })
}

function goPendingPay() {
  router.push({ path: '/admin/orders', query: { status: 'pending' } })
}

function goLowStock() {
  router.push('/admin/inventory')
}
</script>

<template>
  <div class="dash">
    <div
      class="dash__pull"
      :class="{ 'is-active': active }"
      :style="{ height: `${distance}px`, opacity: progress }"
      aria-hidden="true"
    >
      <span>{{ label }}</span>
    </div>

    <header class="dash__head">
      <div>
        <p class="dash__shop">{{ shop.profile.name }}</p>
        <h1 class="dash__title">概览</h1>
      </div>
      <div class="dash__head-side">
        <OTag :tone="shop.profile.open ? 'success' : 'neutral'">
          {{ shop.profile.open ? '营业中' : '已打烊' }}
        </OTag>
        <p class="dash__date">{{ todayText }}</p>
      </div>
    </header>

    <section class="dash__kpis" aria-label="今日经营指标">
      <OStatCard
        label="今日销售额"
        :value="`¥${formatPrice(kpi.salesToday)}`"
        :delta="kpi.deltaSales || undefined"
        hint="较昨日同时段"
        tone="primary"
      />
      <OStatCard label="今日订单" :value="`${kpi.ordersToday}`" hint="不含已取消" />
      <button
        type="button"
        class="dash__kpi-link"
        aria-label="查看待发货订单"
        @click="goPending"
      >
        <OStatCard
          label="待发货"
          :value="`${kpi.pendingShip}`"
          :hint="kpi.pendingShip > 0 ? '点开去发货' : '已清空'"
          :tone="kpi.pendingShip > 0 ? 'ink' : 'plain'"
        />
      </button>
      <OStatCard
        label="客单价"
        :value="`¥${formatPrice(kpi.avgTicket)}`"
        hint="销售额 ÷ 订单数"
      />
    </section>

    <section class="dash__card">
      <header class="dash__card-head">
        <h2 class="dash__card-title">近 7 日成交</h2>
        <p class="dash__card-num">¥{{ formatPrice(trendTotal) }}</p>
      </header>
      <OChartLine v-if="trendTotal > 0" :points="trendPoints" height="7.5rem" />
      <p v-if="peak" class="dash__peak">
        单日最高 ¥{{ formatPrice(peak.sales) }} · {{ peak.label }}
      </p>
      <OEmpty v-else icon="chart" text="还没有成交" sub="近 7 日没有计入销售额的订单" />
    </section>

    <section v-if="hasTodo" class="dash__todo-card" aria-label="待处理">
      <p class="dash__todo-title">待处理</p>
      <div class="dash__chips">
        <button
          v-if="pendingPay > 0"
          type="button"
          class="dash__chip"
          @click="goPendingPay"
        >
          待付款 <b>{{ pendingPay }}</b>
        </button>
        <button
          v-if="lowStock.length > 0"
          type="button"
          class="dash__chip dash__chip--warn"
          @click="goLowStock"
        >
          库存不足 <b>{{ lowStock.length }}</b>
        </button>
      </div>
    </section>

    <section class="dash__card">
      <header class="dash__card-head">
        <h2 class="dash__card-title">热销 Top5</h2>
        <p class="dash__card-sub">近 7 日 · 按件数</p>
      </header>

      <ol v-if="top.length > 0" class="dash__top">
        <li v-for="(item, index) in top" :key="item.productId">
          <button
            type="button"
            class="dash__top-row"
            @click="router.push(`/admin/products/${item.productId}`)"
          >
            <span class="dash__rank">{{ index + 1 }}</span>
            <span class="dash__top-name">{{ item.name }}</span>
            <span class="dash__top-qty">{{ item.qty }} 件</span>
            <span class="dash__top-amount">¥{{ formatPrice(item.amount) }}</span>
          </button>
        </li>
      </ol>

      <OEmpty v-else icon="chart" text="还没有销量" sub="有成交后这里会按件数排出前五" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.dash {
  padding: 0 1rem 1.5rem;
}

// —— 下拉刷新指示器：占位高度随手指位移，松开后回落 ——
.dash__pull {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  height: 0;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
  transition: height 240ms var(--o-ease-flow);

  &.is-active {
    transition: none;
  }

  span {
    padding-bottom: 0.375rem;
  }
}

.dash__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0 1rem;
}

.dash__shop {
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--o-muted);
}

.dash__title {
  margin-top: 0.125rem;
  font-family: var(--o-font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.3;
  color: var(--o-title);
}

.dash__head-side {
  display: grid;
  justify-items: end;
  gap: 0.375rem;
  padding-top: 0.25rem;
}

.dash__date {
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

.dash__kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

// 待发货卡本身就是入口：点一下直接进"待发货"筛选
.dash__kpi-link {
  display: block;
  width: 100%;
  text-align: left;
  border-radius: var(--o-radius-card);
  transition: transform var(--o-dur-press) var(--o-ease-flow);

  &:active {
    transform: scale(0.985);
  }
}

.dash__card {
  margin-top: 0.875rem;
  padding: 0.875rem 1rem 1rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.dash__card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.dash__card-title {
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.dash__card-num {
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--o-primary);
}

.dash__card-sub {
  font-size: 0.6875rem;
  color: var(--o-muted);
}

// —— 待处理：一条汇总，几种待办各自可点 ——
.dash__todo-card {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding: 0.75rem 0.875rem 0.8125rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.dash__todo-title {
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.dash__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dash__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--o-line);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--o-text);
  transition:
    background-color var(--o-dur-press) linear,
    border-color var(--o-dur-press) linear;

  b {
    font-size: 0.8125rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--o-ink);
  }

  &:active {
    background: rgba(47, 79, 79, 0.05);
    border-color: var(--o-disabled);
  }

  &--warn {
    color: var(--o-warn);
    border-color: rgba(168, 119, 40, 0.3);
    background: rgba(168, 119, 40, 0.06);

    b {
      color: var(--o-warn);
    }
  }
}

// 折线下面补一行读数参照：没有 y 轴刻度，也能判断峰值量级
.dash__peak {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

// —— 热销榜：序号用衬线，数字右对齐 ——
.dash__top {
  display: grid;
}

.dash__top-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 2.75rem;
  text-align: left;

  & + & {
    border-top: 1px solid var(--o-line);
  }

  &:active .dash__top-name {
    color: var(--o-primary);
  }
}

.dash__rank {
  width: 1.125rem;
  flex-shrink: 0;
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--o-muted);
  text-align: center;
}

.dash__top-row:first-child .dash__rank {
  color: var(--o-primary);
}

.dash__top-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  color: var(--o-title);
  transition: color var(--o-dur-press) linear;
}

.dash__top-qty {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.dash__top-amount {
  width: 4.5rem;
  flex-shrink: 0;
  text-align: right;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-text);
}
</style>
