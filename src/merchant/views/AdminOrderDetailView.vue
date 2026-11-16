<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import ODialog from '@/components/oil-ui/ODialog.vue'
import OEmpty from '@/components/oil-ui/OEmpty.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import OSheet from '@/components/oil-ui/OSheet.vue'
import OTag from '@/components/oil-ui/OTag.vue'
import OTimeline from '@/components/oil-ui/OTimeline.vue'
import { showToast } from '@/components/oil-ui/toast'
import {
  ORDER_STATUS_TEXT,
  formatDateTime,
  getAdminProduct,
  useAdminOrdersStore,
} from '@/catalog/admin'
import ShipSheet from '@/merchant/components/ShipSheet.vue'
import { formatPrice } from '@/utils/format'

// 订单详情：商品行、金额、收货信息、时间轴，底部按状态给主操作。
const route = useRoute()
const router = useRouter()
const store = useAdminOrdersStore()

const orderNo = computed(() => String(route.params.no))
const order = computed(() => store.find(orderNo.value))

const shipOpen = ref(false)
const remarkOpen = ref(false)
const remarkText = ref('')
const cancelOpen = ref(false)

watch(remarkOpen, (open) => {
  if (open) remarkText.value = order.value?.remark ?? ''
})

const statusHint = computed(() => {
  const value = order.value
  if (!value) return ''
  if (value.status === 'pending') return '等待买家付款'
  if (value.status === 'paid') return '买家已付款，等待你发货'
  if (value.status === 'shipped') return `已交给${value.tracking?.company ?? '快递'}`
  if (value.status === 'done') return '买家已签收，交易完成'
  return '订单已取消，库存未变动'
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/admin/orders')
}

function productImage(productId: number): string {
  return getAdminProduct(productId)?.image ?? ''
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToast({ text: `已复制${label}` })
  } catch {
    showToast({ text: '当前环境不支持复制' })
  }
}

function saveRemark() {
  if (!order.value) return
  store.remark(order.value.no, remarkText.value)
  remarkOpen.value = false
  showToast({ text: '备注已保存' })
}

function confirmCancel() {
  if (!order.value) return
  const ok = store.cancel(order.value.no)
  cancelOpen.value = false
  showToast({ text: ok ? '订单已取消' : '当前状态不能取消' })
}
</script>

<template>
  <div class="detail">
    <ONavBar title="订单详情" back @back="goBack" />

    <template v-if="order">
      <div class="detail__body">
        <section class="detail__status">
          <div>
            <h1 class="detail__status-text">{{ ORDER_STATUS_TEXT[order.status] }}</h1>
            <p class="detail__status-hint">{{ statusHint }}</p>
          </div>
          <OTag tone="neutral">
            {{ order.source === 'cart' ? 'C 端下单' : '演示单' }}
          </OTag>
        </section>

        <p class="detail__meta">
          单号 {{ order.no }} · {{ formatDateTime(order.at) }}
        </p>

        <section class="detail__card">
          <h2 class="detail__section">商品</h2>
          <ul class="detail__items">
            <li v-for="item in order.items" :key="item.productId" class="detail__item">
              <img
                v-if="productImage(item.productId)"
                class="detail__pic"
                :src="productImage(item.productId)"
                :alt="item.name"
              />
              <div class="detail__item-main">
                <p class="detail__item-name">{{ item.name }}</p>
                <p class="detail__item-price">
                  ¥{{ formatPrice(item.price) }} × {{ item.qty }}
                </p>
              </div>
              <span class="detail__item-subtotal">
                ¥{{ formatPrice(item.price * item.qty) }}
              </span>
            </li>
          </ul>

          <dl class="detail__amounts">
            <div>
              <dt>商品合计</dt>
              <dd>¥{{ formatPrice(order.goodsAmount) }}</dd>
            </div>
            <div>
              <dt>运费</dt>
              <dd>{{ order.shippingFee === 0 ? '免运费' : `¥${formatPrice(order.shippingFee)}` }}</dd>
            </div>
            <div class="is-total">
              <dt>实付</dt>
              <dd>¥{{ formatPrice(order.total) }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail__card">
          <header class="detail__card-head">
            <h2 class="detail__section">收货信息</h2>
            <button
              type="button"
              class="detail__copy"
              @click="copy(`${order.buyer.name} ${order.buyer.phone} ${order.buyer.address}`, '收货信息')"
            >
              <OIcon name="copy" :size="14" />
              复制
            </button>
          </header>
          <p class="detail__buyer">
            <span>{{ order.buyer.name }}</span>
            <span class="detail__phone">{{ order.buyer.phone }}</span>
          </p>
          <p class="detail__address">{{ order.buyer.address }}</p>
        </section>

        <section v-if="order.tracking" class="detail__card">
          <h2 class="detail__section">物流</h2>
          <div class="detail__tracking">
            <span>{{ order.tracking.company }}</span>
            <span class="detail__tracking-no">{{ order.tracking.no }}</span>
            <button
              type="button"
              class="detail__copy detail__copy--inline"
              @click="copy(order.tracking.no, '运单号')"
            >
              复制
            </button>
          </div>
        </section>

        <section class="detail__card">
          <header class="detail__card-head">
            <h2 class="detail__section">备注</h2>
            <button type="button" class="detail__copy" @click="remarkOpen = true">
              编辑
            </button>
          </header>
          <p class="detail__remark">{{ order.remark || '暂无备注' }}</p>
        </section>

        <section class="detail__card">
          <h2 class="detail__section">时间轴</h2>
          <OTimeline :items="order.timeline" />
        </section>

        <button
          v-if="order.status === 'paid' || order.status === 'pending'"
          type="button"
          class="detail__cancel"
          @click="cancelOpen = true"
        >
          取消这张订单
        </button>
      </div>

      <footer
        v-if="order.status === 'paid' || order.status === 'shipped'"
        class="detail__bar"
      >
        <OButton type="outline" class="detail__bar-btn" @click="remarkOpen = true">
          备注
        </OButton>
        <OButton
          v-if="order.status === 'paid'"
          class="detail__bar-btn detail__bar-btn--primary"
          @click="shipOpen = true"
        >
          发货
        </OButton>
      </footer>

      <ShipSheet v-model="shipOpen" :order-no="order.no" />

      <OSheet v-model="remarkOpen" title="备注">
        <textarea
          v-model="remarkText"
          class="detail__textarea"
          rows="4"
          maxlength="60"
          placeholder="给这张订单记一笔，如打包方式、改地址说明"
        />
        <template #footer>
          <OButton block size="lg" @click="saveRemark">保存备注</OButton>
        </template>
      </OSheet>

      <ODialog v-model="cancelOpen">
        <div class="cancel">
          <h3 class="cancel__title">取消这张订单？</h3>
          <p class="cancel__text">
            取消后订单状态变为「已取消」，演示数据不可恢复，只能重置演示数据。
          </p>
          <div class="cancel__actions">
            <OButton type="outline" block @click="cancelOpen = false">再想想</OButton>
            <OButton block @click="confirmCancel">确认取消此订单</OButton>
          </div>
        </div>
      </ODialog>
    </template>

    <OEmpty
      v-else
      icon="receipt"
      text="找不到这张订单"
      sub="演示数据可能已重置"
      action="回订单列表"
      @action="goBack"
    />
  </div>
</template>

<style scoped lang="scss">
.detail {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.detail__body {
  flex: 1;
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem 1rem 1.25rem;
}

.detail__status {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.25rem 0 0;
}

.detail__status-text {
  font-family: var(--o-font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--o-title);
}

.detail__status-hint {
  margin-top: 0.1875rem;
  font-size: 0.75rem;
  color: var(--o-muted);
}

.detail__meta {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.detail__card {
  display: grid;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.detail__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.detail__section {
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.detail__items {
  display: grid;
  gap: 0.625rem;
}

.detail__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.detail__pic {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  object-fit: cover;
  background: var(--o-paper);
}

.detail__item-main {
  flex: 1;
  min-width: 0;
}

.detail__item-name {
  font-size: 0.8125rem;
  color: var(--o-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail__item-price {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.detail__item-subtotal {
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-text);
}

.detail__amounts {
  display: grid;
  gap: 0.375rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--o-line);

  div {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--o-muted);
  }

  dd {
    font-variant-numeric: tabular-nums;
  }

  .is-total {
    margin-top: 0.125rem;
    color: var(--o-title);

    dt {
      font-size: 0.8125rem;
    }

    dd {
      font-family: var(--o-font-sans);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--o-primary);
    }
  }
}

.detail__copy {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2rem;
  font-size: 0.6875rem;
  color: var(--o-muted);

  &:active {
    color: var(--o-primary);
  }
}

.detail__copy--inline {
  min-height: 1.5rem;
  margin-left: auto;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.detail__buyer {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--o-title);
}

.detail__phone {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.detail__address {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--o-text);
}

.detail__tracking {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--o-text);
}

.detail__tracking-no {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.detail__remark {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--o-text);
}

.detail__cancel {
  justify-self: start;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  color: var(--o-danger);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

.detail__bar {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  padding-bottom: calc(0.625rem + var(--o-safe-bottom));
  background: var(--o-card);
  border-top: 1px solid var(--o-line);
  z-index: 20;
}

.detail__bar-btn {
  flex: 1;
}

// 主操作（发货）占更大宽度，和"备注"拉开主次
.detail__bar-btn--primary {
  flex: 2;
}

.detail__textarea {
  width: 100%;
  min-height: 5.5rem;
  padding: 0.625rem 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--o-title);
  background: var(--o-paper);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  outline: none;
  resize: vertical;

  &:focus {
    border-color: var(--o-ink);
  }
}

.cancel {
  display: grid;
  gap: 0.5rem;
}

.cancel__title {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--o-title);
}

.cancel__text {
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--o-muted);
}

.cancel__actions {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
