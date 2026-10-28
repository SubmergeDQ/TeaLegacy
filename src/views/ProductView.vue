<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OBadge from '@/components/oil-ui/OBadge.vue'
import OButton from '@/components/oil-ui/OButton.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import { showToast } from '@/components/oil-ui/toast'
import { getProduct } from '@/mock/mockData'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = computed(() => getProduct(Number(route.params.id)))

// 引言：叙事第一段的首句，压在规格表之前，让首屏有一句只能在此读到的来历
const lead = computed(() => {
  const first = product.value?.story[0] ?? ''
  const cut = first.indexOf('。')
  return cut > 0 ? first.slice(0, cut + 1) : first
})

// 直达无效链接时回商城
watchEffect(() => {
  if (!product.value) router.replace('/shop')
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/shop')
}

function openCart() {
  router.push('/cart')
}

function addToCart() {
  if (!product.value) return
  cart.add(product.value)
  showToast({
    text: `已加购「${product.value.name}」`,
    action: { text: '去看看', handler: openCart },
  })
}
</script>

<template>
  <div v-if="product" class="pd">
    <ONavBar :title="product.category === 'tea' ? '茶品' : '茶器'" back @back="goBack">
      <template #right>
        <button class="pd__cart" aria-label="打开购物车" @click="openCart">
          <OIcon name="bag" :size="21" />
          <OBadge :value="cart.count" class="pd__cart-badge" />
        </button>
      </template>
    </ONavBar>

    <!-- 图版：缩进 + 圆角，让它成为纸面上的一幅器物图，而不是被裁切的通栏 -->
    <div class="pd__hero">
      <img :src="product.image" :alt="product.name" />
    </div>

    <div class="pd__head">
      <h1 class="pd__name">{{ product.name }}</h1>
      <p class="pd__sub">{{ product.sub }} · {{ product.unit }}</p>
      <div class="pd__price">
        <i>¥</i><b>{{ formatPrice(product.price) }}</b>
        <del v-if="product.originalPrice">¥{{ formatPrice(product.originalPrice) }}</del>
      </div>
    </div>

    <!-- 引言：一句话来历，只能在这一件上读到 -->
    <blockquote class="pd__lead">{{ lead }}</blockquote>

    <!-- 器物出处 -->
    <p class="pd__source">{{ product.source }}</p>

    <dl class="pd__specs">
      <div v-for="s in product.specs" :key="s.label" class="pd__spec">
        <dt>{{ s.label }}</dt>
        <dd>{{ s.value }}</dd>
      </div>
    </dl>

    <section class="pd__story">
      <h2>茶品志</h2>
      <p v-for="(para, i) in product.story" :key="i">{{ para }}</p>
    </section>

    <footer class="pd__bar">
      <span class="pd__bar-price">
        <i>¥</i><b>{{ formatPrice(product.price) }}</b>
      </span>
      <OButton size="lg" class="pd__bar-btn" @click="addToCart">加入购物车</OButton>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.pd {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.pd__cart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--o-title);
  transition: transform var(--o-dur-press) var(--o-ease-flow);

  &:active {
    transform: scale(0.92);
  }
}

.pd__cart-badge {
  position: absolute;
  top: 0.3125rem;
  right: 0.1875rem;
}

.pd__hero {
  margin: 0.5rem 1rem 0;
  aspect-ratio: 1 / 1;
  border-radius: var(--o-radius-card);
  overflow: hidden;
  background: var(--o-card);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pd__head {
  padding: 1rem 1rem 0;
}

.pd__name {
  font-family: var(--o-font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.4;
  color: var(--o-title);
}

.pd__sub {
  margin-top: 0.1875rem;
  font-size: 0.8125rem;
  color: var(--o-muted);
}

.pd__price {
  display: flex;
  align-items: baseline;
  margin-top: 0.625rem;
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.875rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
  }

  del {
    margin-left: 0.5rem;
    font-size: 0.8125rem;
    color: var(--o-muted);
  }
}

// 引言：一句话来历，左侧细线是编辑排印的引文标记
.pd__lead {
  margin: 0.875rem 1rem 0;
  padding-left: 0.75rem;
  border-left: 1px solid var(--o-primary);
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--o-title);
}

.pd__source {
  margin: 0.625rem 1rem 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: var(--o-muted);
}

.pd__specs {
  margin: 0.75rem 1rem 0;
  padding: 0.25rem 1rem;
  background: var(--o-card);
  border-radius: var(--o-radius-card);
}

.pd__spec {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
  font-size: 0.8125rem;

  & + & {
    border-top: 1px solid var(--o-line);
  }

  dt {
    color: var(--o-muted);
    flex-shrink: 0;
  }

  dd {
    color: var(--o-text);
    text-align: right;
  }
}

.pd__story {
  padding: 1.25rem 1rem 1.5rem;
  flex: 1;

  h2 {
    font-family: var(--o-font-serif);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--o-title);
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.875rem;
    line-height: 1.75;
    color: var(--o-text);
    text-align: justify;

    & + p {
      margin-top: 0.625rem;
    }
  }
}

.pd__bar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 1rem;
  padding-bottom: calc(0.625rem + env(safe-area-inset-bottom));
  background: var(--o-card);
  border-top: 1px solid var(--o-line);
  z-index: 20;
}

.pd__bar-price {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.875rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.375rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.pd__bar-btn {
  flex-shrink: 0;
  min-width: 9.375rem;
}
</style>
