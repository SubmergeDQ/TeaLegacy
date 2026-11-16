<script setup lang="ts">
import { computed, nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OEmpty from '@/components/oil-ui/OEmpty.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import OSearchBar from '@/components/oil-ui/OSearchBar.vue'
import OSegmented from '@/components/oil-ui/OSegmented.vue'
import OSwitch from '@/components/oil-ui/OSwitch.vue'
import OTag from '@/components/oil-ui/OTag.vue'
import { showToast } from '@/components/oil-ui/toast'
import { useAdminCatalogStore } from '@/catalog/admin'
import type { AdminProduct } from '@/catalog/admin'
import { formatPrice } from '@/utils/format'

// 商品列表：搜索 + 状态筛选（在售 / 下架 / 库存不足）+ 行内上下架。
// 上下架与改价都会写覆盖层，C 端立即跟着变。
const router = useRouter()
const route = useRoute()
const catalog = useAdminCatalogStore()

const keyword = ref('')
const filter = ref('all')

watch(
  () => route.query.filter,
  (value) => {
    if (value === 'low' || value === 'online' || value === 'offline') filter.value = value
  },
  { immediate: true },
)

const all = computed(() => catalog.items)
const counts = computed(() => ({
  all: all.value.length,
  online: all.value.filter((p) => p.online).length,
  offline: all.value.filter((p) => !p.online).length,
  low: all.value.filter((p) => p.online && p.lowStock).length,
}))

const options = computed(() => [
  { value: 'all', label: '全部', count: counts.value.all },
  { value: 'online', label: '在售', count: counts.value.online },
  { value: 'offline', label: '已下架', count: counts.value.offline },
  { value: 'low', label: '库存不足', count: counts.value.low },
])

const filtered = computed(() => {
  const word = keyword.value.trim().toLowerCase()
  return all.value.filter((product) => {
    if (filter.value === 'online' && !product.online) return false
    if (filter.value === 'offline' && product.online) return false
    if (filter.value === 'low' && !(product.online && product.lowStock)) return false
    if (!word) return true
    return `${product.name}${product.sub}${product.tag ?? ''}`.toLowerCase().includes(word)
  })
})

function toggleOnline(product: AdminProduct, online: boolean) {
  catalog.setOnline(product.id, online)
  showToast({ text: `「${product.name}」${online ? '已上架' : '已下架'}` })
}

// —— 行内快捷改价：点价格就地编辑，不必进编辑页 ——
const editingId = ref<number | null>(null)
const priceDraft = ref('')
const priceError = ref('')
const priceInput = ref<HTMLInputElement>()

function setPriceInput(el: Element | ComponentPublicInstance | null) {
  priceInput.value = el instanceof HTMLInputElement ? el : undefined
}

function startEdit(product: AdminProduct) {
  if (editingId.value === product.id) return
  editingId.value = product.id
  priceDraft.value = String(product.price)
  priceError.value = ''
  void nextTick(() => {
    const input = priceInput.value ?? document.querySelector<HTMLInputElement>('.goods__input')
    input?.focus()
    input?.select()
  })
}

function cancelEdit() {
  editingId.value = null
  priceError.value = ''
}

function savePrice(product: AdminProduct) {
  const value = Number(priceDraft.value)
  if (!priceDraft.value.trim() || Number.isNaN(value) || value <= 0 || value > 99999) {
    priceError.value = '价格需大于 0 且不超过 99999'
    return
  }
  catalog.setPrice(product.id, value)
  editingId.value = null
  priceError.value = ''
  showToast({ text: `「${product.name}」已改价 ¥${formatPrice(value)}` })
}

function onCardClick(product: AdminProduct) {
  // 编辑中先收掉输入，避免误进详情页
  if (editingId.value !== null) {
    cancelEdit()
    return
  }
  openProduct(product.id)
}

function resetFilters() {
  keyword.value = ''
  filter.value = 'all'
}

function openProduct(id: number) {
  router.push(`/admin/products/${id}`)
}
</script>

<template>
  <div class="goods">
    <div class="goods__sticky">
      <header class="goods__head">
        <div>
          <h1 class="goods__title">商品管理</h1>
          <p class="goods__sub">共 {{ counts.all }} 款 · {{ counts.online }} 款在售</p>
        </div>
        <span v-if="counts.low > 0" class="goods__warn">{{ counts.low }} 款库存不足</span>
      </header>

      <OSearchBar v-model="keyword" placeholder="搜索商品名、副题或标签" />

      <OSegmented v-model="filter" :options="options" class="goods__seg" />
    </div>

    <ul v-if="filtered.length > 0" class="goods__list">
      <li
        v-for="product in filtered"
        :key="product.id"
        class="goods__card"
        :class="{ 'is-low': product.online && product.lowStock, 'is-editing': editingId === product.id }"
        @click="onCardClick(product)"
      >
        <img class="goods__pic" :src="product.image" :alt="product.name" />

        <div class="goods__main">
          <div class="goods__row">
            <h2 class="goods__name">{{ product.name }}</h2>
            <OTag v-if="!product.online" tone="neutral">已下架</OTag>
            <OTag v-else-if="product.lowStock" tone="warn">库存不足</OTag>
          </div>
          <p class="goods__subline">{{ product.sub }}</p>
          <div class="goods__meta">
            <template v-if="editingId === product.id">
              <span class="goods__edit">
                <span class="goods__currency">¥</span>
                <input
                  :ref="setPriceInput"
                  v-model="priceDraft"
                  class="goods__input"
                  type="text"
                  inputmode="decimal"
                  maxlength="6"
                  aria-label="新价格"
                  @click.stop
                  @keydown.enter.prevent="savePrice(product)"
                  @keydown.esc.prevent="cancelEdit()"
                />
              </span>
              <button
                type="button"
                class="goods__icon-btn is-ok"
                aria-label="保存价格"
                @click.stop="savePrice(product)"
              >
                <OIcon name="check" :size="14" />
              </button>
              <button
                type="button"
                class="goods__icon-btn"
                aria-label="取消改价"
                @click.stop="cancelEdit()"
              >
                <OIcon name="close" :size="14" />
              </button>
            </template>

            <template v-else>
              <button
                type="button"
                class="goods__price"
                aria-label="修改价格"
                @click.stop="startEdit(product)"
              >
                ¥{{ formatPrice(product.price) }}
                <OIcon name="edit" :size="11" class="goods__price-icon" />
              </button>
              <span class="goods__stock" :class="{ 'is-low': product.lowStock }">
                库存 {{ product.stock }}
              </span>
              <span class="goods__unit">{{ product.unit }}</span>
            </template>
          </div>

          <p v-if="editingId === product.id && priceError" class="goods__error" role="alert">
            {{ priceError }}
          </p>
        </div>

        <span class="goods__switch" @click.stop>
          <OSwitch
            :model-value="product.online"
            :label="`${product.name} 上架`"
            @update:model-value="(value) => toggleOnline(product, value)"
          />
        </span>
      </li>
    </ul>

    <OEmpty
      v-else
      icon="box"
      text="没有匹配的商品"
      sub="换个关键词，或把筛选退回全部"
      action="清空筛选"
      @action="resetFilters"
    />
  </div>
</template>

<style scoped lang="scss">
.goods {
  padding-bottom: 1.5rem;
}

// 页头 + 搜索 + 筛选吸顶：滚动长列表时仍能改筛选
.goods__sticky {
  position: sticky;
  top: 0;
  z-index: 15;
  display: grid;
  gap: 0.625rem;
  padding: 0.5rem 1rem 0.75rem;
  background: var(--o-paper);
  border-bottom: 1px solid var(--o-line);
}

.goods__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}

.goods__title {
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.goods__sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

.goods__warn {
  flex-shrink: 0;
  font-size: 0.6875rem;
  color: var(--o-warn);
}

.goods__seg {
  padding-bottom: 0.0625rem;
}

.goods__list {
  display: grid;
  gap: 0.625rem;
  padding: 0.75rem 1rem 0;
}

// —— 商品卡：左侧 3px 朱砂条只在低库存时出现 ——
.goods__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
  cursor: pointer;
  transition: background-color var(--o-dur-press) linear;

  &:active {
    background: rgba(47, 79, 79, 0.03);
  }

  &.is-editing {
    border-color: rgba(47, 79, 79, 0.4);
  }

  &.is-low::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.75rem;
    bottom: 0.75rem;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: var(--o-danger);
  }
}

.goods__pic {
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  border-radius: var(--o-radius-img);
  object-fit: cover;
  background: var(--o-paper);
}

.goods__main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.1875rem;
}

.goods__row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.goods__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--o-title);
}

.goods__subline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.goods__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2rem;
  font-size: 0.6875rem;
  color: var(--o-muted);
}

// 价格本身就是改价入口：茶褐数字 + 小铅笔，虚线示意可编辑
.goods__price {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding-bottom: 1px;
  border-bottom: 1px dashed rgba(107, 66, 38, 0.45);
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--o-primary);
  transition: color var(--o-dur-press) linear;

  &:active {
    color: var(--o-primary-deep);
  }
}

.goods__price-icon {
  color: var(--o-muted);
}

.goods__edit {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}

.goods__currency {
  font-size: 0.75rem;
  color: var(--o-primary);
}

.goods__input {
  width: 4.25rem;
  height: 2rem;
  padding: 0 0.375rem;
  font: inherit;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
  background: var(--o-paper);
  border: 1px solid var(--o-ink);
  border-radius: 0.375rem;
  outline: none;
}

// 保存/取消：可见 28px，触屏点击区扩到 44px
.goods__icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 50%;
  color: var(--o-muted);
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    background-color var(--o-dur-press) linear;

  &::before {
    content: '';
    position: absolute;
    inset: -0.375rem;
  }

  &:active {
    transform: scale(0.92);
  }

  &.is-ok {
    background: var(--o-ink);
    color: var(--o-on-ink);
  }
}

.goods__error {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--o-danger);
}

.goods__stock {
  font-variant-numeric: tabular-nums;

  &.is-low {
    color: var(--o-danger);
  }
}

.goods__unit {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods__switch {
  display: flex;
  flex-shrink: 0;
  margin-right: -0.375rem;
}
</style>
