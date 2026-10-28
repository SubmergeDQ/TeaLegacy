<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import ODialog from '@/components/oil-ui/ODialog.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import OStepper from '@/components/oil-ui/OStepper.vue'
import { showToast } from '@/components/oil-ui/toast'
import CartSettleBar from '@/components/shop/CartSettleBar.vue'
import type { Product } from '@/mock/mockData'
import { formatPrice } from '@/utils/format'
import { delay } from '@/utils/motion'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cart = useCartStore()

const paying = ref(false)
const payShow = ref(false)
const paidAmount = ref(0)

function goBack() {
  // 支持直达链接：没有历史记录时回商城
  if (window.history.length > 1) router.back()
  else router.replace('/shop')
}

/**
 * 模拟结算：请求期间防重复提交；成功时立即清空购物车，
 * 弹窗只是结果展示（关掉弹窗也不会留下"已支付但商品还在"的矛盾状态）
 */
async function settle() {
  if (paying.value || cart.isEmpty) return
  paying.value = true
  await delay(900)
  paidAmount.value = cart.total
  cart.clear()
  paying.value = false
  payShow.value = true
}

/** 移除商品：直接执行，提供撤销 */
function removeLine(line: { product: Product; qty: number }) {
  cart.remove(line.product.id)
  showToast({
    text: `已移除「${line.product.name}」`,
    action: {
      text: '撤销',
      handler: () => cart.restore(line.product, line.qty),
    },
  })
}
</script>

<template>
  <div class="cart">
    <ONavBar title="购物车" back @back="goBack" />

    <ul v-if="!cart.isEmpty" class="cart__list">
      <li v-for="line in cart.detailed" :key="line.product.id" class="cart__line">
        <img
          class="cart__pic"
          :src="line.product.image"
          :alt="line.product.name"
          @click="router.push(`/shop/${line.product.id}`)"
        />
        <div class="cart__info">
          <div class="cart__title-row">
            <h3 class="cart__name" @click="router.push(`/shop/${line.product.id}`)">
              {{ line.product.name }}
            </h3>
            <button
              class="cart__remove"
              :aria-label="`移除${line.product.name}`"
              @click="removeLine(line)"
            >
              <OIcon name="trash" :size="17" />
            </button>
          </div>
          <p class="cart__spec">{{ line.product.unit }}</p>
          <div class="cart__row">
            <span class="cart__price">
              <i>¥</i><b>{{ formatPrice(line.product.price) }}</b>
            </span>
            <OStepper
              :model-value="line.qty"
              @update:model-value="(q) => cart.setQty(line.product.id, q)"
            />
          </div>
        </div>
      </li>
    </ul>

    <div v-else class="cart__empty">
      <OIcon name="bag" :size="40" class="cart__empty-icon" />
      <p class="cart__empty-title">购物车还是空的</p>
      <p class="cart__empty-sub">去商城挑一饼有来历的茶吧</p>
      <OButton @click="router.replace('/shop')">去商城逛逛</OButton>
    </div>

    <CartSettleBar
      v-if="!cart.isEmpty"
      :count="cart.count"
      :total="cart.total"
      :loading="paying"
      @settle="settle"
    />

    <!-- 支付成功：棉纸票签式的确认时刻，不可点遮罩关闭 -->
    <ODialog v-model="payShow" :close-on-mask="false">
      <div class="pay">
        <svg class="pay__seal" viewBox="0 0 64 64" aria-hidden="true">
          <circle class="pay__ring" cx="32" cy="32" r="27" />
          <path class="pay__tick" d="M21 33.5 28.5 41 43.5 25" />
        </svg>
        <h3 class="pay__title">支付成功</h3>
        <p class="pay__amount">
          <i>¥</i><b>{{ formatPrice(paidAmount) }}</b>
        </p>
        <div class="pay__actions">
          <OButton block @click="payShow = false">好的</OButton>
        </div>
      </div>
    </ODialog>
  </div>
</template>

<style scoped lang="scss">
.cart {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.cart__list {
  flex: 1;
  padding: 0.25rem 1rem 1.25rem;
}

.cart__line {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 0;
  position: relative;

  & + & {
    border-top: 1px solid var(--o-line);
  }
}

.cart__pic {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--o-radius-img);
  object-fit: cover;
  background: var(--o-card);
  flex-shrink: 0;
}

.cart__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cart__title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.cart__name {
  flex: 1;
  min-width: 0;
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--o-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 删除图标与右侧数字步进器共用同一条右锚线
.cart__remove {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin: -0.125rem -0.125rem 0 0;
  color: var(--o-muted);
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    color var(--o-dur-press) linear;

  // 可见 24px，触屏点击区扩到 44px
  &::before {
    content: '';
    position: absolute;
    inset: -0.625rem;
  }

  &:active {
    transform: scale(0.9);
    color: var(--o-primary-deep);
  }
}

.cart__spec {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.cart__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.4375rem;
}

.cart__price {
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.75rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.0625rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

// 增删的来路：离开的行滑出，留下的行滑到新位置
.cart-line-leave-active {
  position: absolute;
  width: 100%;
  transition:
    transform var(--o-dur-state) var(--o-ease-flow),
    opacity var(--o-dur-state) linear;
  z-index: 0;
}

.cart-line-leave-to {
  opacity: 0;
  transform: translateX(-1rem);
}

.cart-line-enter-active {
  transition:
    transform var(--o-dur-state) var(--o-ease-flow),
    opacity var(--o-dur-state) linear;
}

.cart-line-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}

.cart-line-move {
  transition: transform var(--o-dur-state) var(--o-ease-flow);
}

// —— 空状态：说明原因 + 直接开始的动作 ——
.cart__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 2rem 3rem;
  text-align: center;
}

.cart__empty-icon {
  color: var(--o-disabled);
  margin-bottom: 0.5rem;
}

.cart__empty-title {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--o-title);
}

.cart__empty-sub {
  margin-bottom: 1.25rem;
  font-size: 0.8125rem;
  color: var(--o-muted);
}

// —— 支付成功票签 ——
.pay {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pay__seal {
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.75rem;

  circle {
    fill: none;
    stroke: var(--o-primary);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 170;
    stroke-dashoffset: 170;
    transform: rotate(-90deg);
    transform-origin: center;
    animation: pay-draw 400ms var(--o-ease-flow) forwards;
  }

  .pay__tick {
    fill: none;
    stroke: var(--o-primary);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 32;
    stroke-dashoffset: 32;
    animation: pay-draw 260ms var(--o-ease-flow) 360ms forwards;
  }
}

@keyframes pay-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.pay__title {
  font-family: var(--o-font-serif);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--o-title);
}

.pay__amount {
  margin-top: 0.375rem;
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.875rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.75rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.pay__actions {
  width: 100%;
  margin-top: 1.5rem;
}
</style>
