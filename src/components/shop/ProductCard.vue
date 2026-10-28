<script setup lang="ts">
import type { Product } from '@/mock/mockData'
import OIcon from '@/components/oil-ui/OIcon.vue'
import { formatPrice } from '@/utils/format'

const props = withDefaults(
  defineProps<{ product: Product; featured?: boolean }>(),
  { featured: false },
)

const emit = defineEmits<{
  add: [payload: { id: number; from: HTMLElement }]
  open: [id: number]
}>()

function onAdd(event: MouseEvent) {
  const from = event.currentTarget as HTMLElement
  emit('add', { id: props.product.id, from })
}
</script>

<template>
  <article
    class="p-card"
    :class="{ 'p-card--featured': featured }"
    @click="emit('open', product.id)"
  >
    <div class="p-card__pic">
      <img
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        :class="{ 'is-warm': product.tone === 'warm' }"
      />
    </div>

    <div class="p-card__body">
      <p v-if="featured" class="p-card__feature">本期主推</p>
      <p v-if="product.tag" class="p-card__meta">
        <span class="p-card__tag">{{ product.tag }}</span>
        <span class="p-card__sub">{{ product.sub }}</span>
      </p>
      <p v-else class="p-card__meta p-card__sub">{{ product.sub }}</p>

      <h3 class="p-card__name">{{ product.name }}</h3>

      <div class="p-card__row">
        <span class="p-card__price">
          <i>¥</i><b>{{ formatPrice(product.price) }}</b>
        </span>
        <button
          class="p-card__add"
          :aria-label="`将${product.name}加入购物车`"
          @click.stop="onAdd"
        >
          <OIcon name="plus" :size="16" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
// 无卡框：图与字直接落在宣纸底上，靠留白分组
.p-card {
  display: flex;
  flex-direction: column;
  touch-action: manipulation;

  &:active .p-card__pic img {
    transform: scale(1.015);
  }
}

.p-card__pic {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: var(--o-radius-img);
  overflow: hidden;
  background: #efeade;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 480ms var(--o-ease-flow);
  }

  // 现代包装照与茶色调的温差，用降饱和与暖化收一点
  img.is-warm {
    filter: saturate(0.78) contrast(0.97) brightness(1.02);
  }
}

.p-card__body {
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;
}

// 编辑标记：本期在推哪一件，首屏一眼可读
.p-card__feature {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.3125rem;
  font-family: var(--o-font-serif);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--o-primary);

  &::before {
    content: '';
    width: 0.75rem;
    height: 1px;
    background: currentColor;
    flex-shrink: 0;
  }
}

.p-card__meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

// 标签回到文字区：细字小号，不用彩色胶囊
.p-card__tag {
  flex-shrink: 0;
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  color: var(--o-primary);
  padding-right: 0.375rem;
  border-right: 1px solid var(--o-line);
}

.p-card__sub {
  font-size: 0.6875rem;
  color: var(--o-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.p-card__name {
  margin-top: 0.1875rem;
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--o-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.p-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.3125rem;
}

.p-card__price {
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.75rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.125rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
  }
}

.p-card__add {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--o-primary);
  color: #fdfbf6;
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    background-color var(--o-dur-press) linear;

  // 可见 32px，触屏点击区扩到 44px
  &::before {
    content: '';
    position: absolute;
    inset: -0.375rem;
    border-radius: 50%;
  }

  &:active {
    transform: scale(0.88);
    background: var(--o-primary-deep);
  }
}

// —— 本期主推：出血到屏幕两端的淡茶专题带，构图上一眼可分 ——
.p-card--featured {
  grid-column: 1 / -1;
  flex-direction: row;
  gap: 0.75rem;
  margin: 0 -1rem;
  padding: 0.75rem 1rem;
  background: #f0e9da;
  border-radius: 0;

  .p-card__pic {
    width: calc(50% - 0.375rem);
    flex-shrink: 0;
  }

  .p-card__body {
    flex: 1;
    min-width: 0;
    padding-top: 0;
    justify-content: center;
    gap: 0.125rem;
  }

  .p-card__name {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 1.0625rem;
    margin-top: 0.1875rem;
  }

  .p-card__row {
    margin-top: 0.25rem;
  }

  .p-card__price b {
    font-size: 1.25rem;
  }
}
</style>
