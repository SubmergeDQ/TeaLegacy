<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import OBadge from '@/components/oil-ui/OBadge.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import { showToast } from '@/components/oil-ui/toast'
import ProductCard from '@/components/shop/ProductCard.vue'
import { banner, getProduct, products } from '@/mock/mockData'
import { useCartStore } from '@/stores/cart'
import { bump, flyToCart } from '@/utils/motion'

const router = useRouter()
const cart = useCartStore()

const cartAnchor = ref<HTMLElement>()
// 首次进场动画只播一次；KeepAlive 下重新激活不重播
const entered = ref(false)
onMounted(() => {
  entered.value = true
})

const [featured, ...rest] = products

function openCart() {
  router.push('/cart')
}

function addToCart(payload: { id: number; from: HTMLElement }) {
  const product = getProduct(payload.id)
  if (!product) return
  cart.add(product)
  if (cartAnchor.value) {
    flyToCart(payload.from, cartAnchor.value, product.image, () =>
      bump(cartAnchor.value as HTMLElement),
    )
  }
  showToast({
    text: `已加购「${product.name}」`,
    action: { text: '去看看', handler: openCart },
  })
}
</script>

<template>
  <div class="shop" :class="{ 'is-entered': entered }">
    <header class="shop__head">
      <div class="shop__brand">
        <h1 class="shop__logo">茶承</h1>
        <span class="shop__seal" aria-hidden="true">普</span>
      </div>
      <button
        ref="cartAnchor"
        class="shop__cart"
        aria-label="打开购物车"
        @click="openCart"
      >
        <OIcon name="bag" :size="22" />
        <OBadge :value="cart.count" class="shop__badge" />
      </button>
    </header>

    <section class="shop__banner" aria-label="馆藏器物">
      <img :src="banner" alt="清·宜兴紫砂壶，克利夫兰艺术博物馆藏" />
      <div class="shop__banner-text">
        <h2>器以载茶</h2>
        <p>一壶一盏，映照普洱茶的非遗技艺</p>
        <cite>清 · 宜兴紫砂壶　克利夫兰艺术博物馆藏</cite>
      </div>
    </section>

    <section class="shop__list">
      <h2 class="shop__section">
        店内茶品
        <span>共 {{ products.length }} 款</span>
      </h2>
      <div class="shop__grid">
        <ProductCard
          :product="featured"
          featured
          :style="{ '--enter-delay': '0ms' }"
          @add="addToCart"
          @open="router.push(`/shop/${$event}`)"
        />
        <ProductCard
          v-for="(p, i) in rest"
          :key="p.id"
          :product="p"
          :style="{ '--enter-delay': `${(i + 1) * 45}ms` }"
          @add="addToCart"
          @open="router.push(`/shop/${$event}`)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.shop {
  padding-bottom: 1.25rem;
}

// 页头吸顶：上滑后购物车入口仍然可达
.shop__head {
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.5rem;
  padding: 0 1rem;
  background: var(--o-paper);
}

.shop__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shop__logo {
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1;
  color: var(--o-title);
}

// 字标旁的方印：克制的品牌标记，不靠拉字距
.shop__seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border: 1px solid var(--o-primary);
  border-radius: 0.1875rem;
  font-family: var(--o-font-serif);
  font-size: 0.5625rem;
  line-height: 1;
  color: var(--o-primary);
}

.shop__cart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-right: -0.25rem;
  color: var(--o-title);
  transition: transform var(--o-dur-press) var(--o-ease-flow);

  &:active {
    transform: scale(0.92);
  }
}

.shop__badge {
  position: absolute;
  top: 0.3125rem;
  right: 0.1875rem;
}

// —— Banner：单幅馆藏器物，左下叠衬线题字与出处 ——
.shop__banner {
  position: relative;
  margin: 0.25rem 1rem 0;
  border-radius: var(--o-radius-card);
  overflow: hidden;
  aspect-ratio: 2 / 1;
  background: var(--o-ink);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 58%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(18, 14, 9, 0.62));
    pointer-events: none;
  }
}

.shop__banner-text {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 0.8125rem;
  z-index: 1;
  color: var(--o-on-ink);
  text-shadow: 0 1px 8px rgba(15, 12, 8, 0.5);

  h2 {
    font-family: var(--o-font-serif);
    font-size: 1.3125rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    line-height: 1.3;
  }

  p {
    margin-top: 0.1875rem;
    font-size: 0.6875rem;
    letter-spacing: 0.08em;
    opacity: 0.9;
  }

  cite {
    display: block;
    margin-top: 0.1875rem;
    font-size: 0.625rem;
    font-style: normal;
    letter-spacing: 0.04em;
    opacity: 0.78;
  }
}

.shop__section {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1.25rem 1rem 0.75rem;
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--o-title);

  span {
    font-family: var(--o-font-sans);
    font-size: 0.6875rem;
    font-weight: 400;
    letter-spacing: 0.06em;
    color: var(--o-muted);
  }
}

// 无卡框后，网格靠更宽的留白分组
.shop__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 0.75rem;
  padding: 0 1rem;
}

// —— 首次进场：卡片按 45ms 间隔淡入上移，总长 < 600ms ——
.shop__grid > * {
  opacity: 0;
}

.is-entered .shop__grid > * {
  animation: card-in 240ms var(--o-ease-flow) both;
  animation-delay: var(--enter-delay);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(0.625rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shop__grid > * {
    opacity: 1;
  }
}
</style>
