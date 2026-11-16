<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import ODialog from '@/components/oil-ui/ODialog.vue'
import OEmpty from '@/components/oil-ui/OEmpty.vue'
import OFormItem from '@/components/oil-ui/OFormItem.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import ONavBar from '@/components/oil-ui/ONavBar.vue'
import OSwitch from '@/components/oil-ui/OSwitch.vue'
import { showToast } from '@/components/oil-ui/toast'
import { getAdminProduct, useAdminCatalogStore } from '@/catalog/admin'
import type { AdminProduct } from '@/catalog/admin'
import { formatShortTime } from '@/catalog/admin/time'

// 商品编辑：文案、价格、库存、规格、简介、上下架。
// 保存写覆盖层（不改只读源），C 端商城与详情立即跟着变。
const route = useRoute()
const router = useRouter()
const catalog = useAdminCatalogStore()

const id = computed(() => Number(route.params.id))
const product = computed(() => getAdminProduct(id.value))

interface SpecRow {
  label: string
  value: string
}

const form = reactive({
  name: '',
  sub: '',
  unit: '',
  tag: '',
  price: '',
  stock: '',
  specs: [] as SpecRow[],
  story: '',
  online: true,
})

const errors = reactive<{ name: string; price: string; stock: string; specs: string }>({
  name: '',
  price: '',
  stock: '',
  specs: '',
})

const initializedId = ref<number | null>(null)
const snapshot = ref('')

function serialize(): string {
  return JSON.stringify({
    name: form.name,
    sub: form.sub,
    unit: form.unit,
    tag: form.tag,
    price: form.price,
    stock: form.stock,
    specs: form.specs.map((row) => ({ label: row.label, value: row.value })),
    story: form.story,
    online: form.online,
  })
}

function fill(source: AdminProduct): void {
  form.name = source.name
  form.sub = source.sub
  form.unit = source.unit
  form.tag = source.tag ?? ''
  form.price = String(source.price)
  form.stock = String(source.stock)
  form.specs = source.specs.map((row) => ({ label: row.label, value: row.value }))
  form.story = source.story.join('\n')
  form.online = source.online
  snapshot.value = serialize()
}

watch(
  product,
  (value) => {
    if (!value) return
    if (initializedId.value === value.id) return
    initializedId.value = value.id
    fill(value)
  },
  { immediate: true },
)

const dirty = computed(() => snapshot.value !== '' && serialize() !== snapshot.value)

const recentLogs = computed(() =>
  catalog.stockLogs.filter((log) => log.productId === id.value).slice(0, 3),
)

function clearErrors() {
  errors.name = ''
  errors.price = ''
  errors.stock = ''
  errors.specs = ''
}

function validate(): boolean {
  clearErrors()
  const name = form.name.trim()
  if (name.length < 2 || name.length > 20) errors.name = '名称需为 2–20 个字'

  const price = Number(form.price)
  if (!form.price.trim() || Number.isNaN(price) || price <= 0 || price > 99999) {
    errors.price = '价格需大于 0 且不超过 99999'
  }

  const stock = Number(form.stock)
  if (!form.stock.trim() || !Number.isInteger(stock) || stock < 0 || stock > 9999) {
    errors.stock = '库存需为 0–9999 的整数'
  }

  const partial = form.specs.some(
    (row) => (row.label.trim() === '') !== (row.value.trim() === ''),
  )
  if (partial) errors.specs = '规格行需要同时填写名称与内容'

  return !errors.name && !errors.price && !errors.stock && !errors.specs
}

function addSpec() {
  if (form.specs.length >= 6) return
  form.specs.push({ label: '', value: '' })
}

function removeSpec(index: number) {
  form.specs.splice(index, 1)
}

function save() {
  if (!product.value) return
  if (!validate()) {
    showToast({ text: '还有几处需要修改' })
    return
  }
  catalog.updateProduct(
    product.value.id,
    {
      name: form.name.trim(),
      sub: form.sub.trim(),
      unit: form.unit.trim(),
      tag: form.tag.trim(),
      price: Number(form.price),
      stock: Math.round(Number(form.stock)),
      online: form.online,
      specs: form.specs
        .filter((row) => row.label.trim() && row.value.trim())
        .map((row) => ({ label: row.label.trim(), value: row.value.trim() })),
      story: form.story
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    },
    'manual',
  )
  snapshot.value = serialize()
  showToast({ text: '已保存，C 端已同步' })
  router.replace('/admin/products')
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/admin/products')
}

// 未保存离开：二次确认（返回 false 留在本页）
const leaveOpen = ref(false)
let leaveResolve: ((value: boolean) => void) | null = null

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  leaveOpen.value = true
  return new Promise<boolean>((resolve) => {
    leaveResolve = resolve
  })
})

function resolveLeave(leave: boolean) {
  leaveOpen.value = false
  leaveResolve?.(leave)
  leaveResolve = null
}

const categoryText = computed(() => (product.value?.category === 'teaware' ? '茶器' : '茶品'))
</script>

<template>
  <div v-if="product" class="edit">
    <ONavBar title="编辑商品" back @back="goBack" />

    <div class="edit__body">
      <section class="edit__card">
        <h2 class="edit__section">基本信息</h2>
        <OFormItem label="商品名称" required :error="errors.name">
          <input v-model="form.name" class="edit__input" type="text" maxlength="20" />
        </OFormItem>
        <OFormItem label="副题">
          <input v-model="form.sub" class="edit__input" type="text" maxlength="40" />
        </OFormItem>
        <OFormItem label="单位">
          <input v-model="form.unit" class="edit__input" type="text" maxlength="20" />
        </OFormItem>
        <OFormItem label="分类" hint="分类沿用只读源，不能在后台改">
          <p class="edit__readonly">{{ categoryText }}</p>
        </OFormItem>
        <OFormItem label="标签">
          <input v-model="form.tag" class="edit__input" type="text" maxlength="10" />
        </OFormItem>
      </section>

      <section class="edit__card">
        <h2 class="edit__section">价格与库存</h2>
        <OFormItem label="售价" required :error="errors.price">
          <div class="edit__affix">
            <input
              v-model="form.price"
              class="edit__input edit__input--num"
              type="text"
              inputmode="decimal"
            />
            <span class="edit__suffix">元</span>
          </div>
        </OFormItem>
        <OFormItem label="库存" required :error="errors.stock" hint="保存后变化计入库存流水">
          <div class="edit__affix">
            <input
              v-model="form.stock"
              class="edit__input edit__input--num"
              type="text"
              inputmode="numeric"
            />
            <span class="edit__suffix">件</span>
          </div>
        </OFormItem>

        <div v-if="recentLogs.length > 0" class="edit__logs">
          <p class="edit__logs-title">最近库存流水</p>
          <p v-for="log in recentLogs" :key="log.id" class="edit__log">
            <span>{{ formatShortTime(log.at) }}</span>
            <span :class="log.delta > 0 ? 'is-in' : 'is-out'">
              {{ log.delta > 0 ? `+${log.delta}` : log.delta }}
            </span>
          </p>
        </div>
      </section>

      <section class="edit__card">
        <header class="edit__card-head">
          <h2 class="edit__section">规格</h2>
          <button
            type="button"
            class="edit__add"
            :disabled="form.specs.length >= 6"
            @click="addSpec"
          >
            <OIcon name="plus" :size="14" />
            添加一行
          </button>
        </header>

        <div v-if="form.specs.length > 0" class="edit__specs">
          <div v-for="(row, index) in form.specs" :key="index" class="edit__spec">
            <input
              v-model="row.label"
              class="edit__input edit__input--spec"
              type="text"
              maxlength="8"
              placeholder="名称"
            />
            <input
              v-model="row.value"
              class="edit__input"
              type="text"
              maxlength="20"
              placeholder="内容"
            />
            <button
              type="button"
              class="edit__remove"
              aria-label="删除这一行规格"
              @click="removeSpec(index)"
            >
              <OIcon name="trash" :size="16" />
            </button>
          </div>
        </div>
        <p v-else class="edit__placeholder">还没有规格，可加产区、工艺、仓储等信息。</p>
        <p v-if="errors.specs" class="edit__error" role="alert">{{ errors.specs }}</p>
      </section>

      <section class="edit__card">
        <h2 class="edit__section">简介</h2>
        <OFormItem label="茶品志" hint="每行一段，保存后替换详情页正文">
          <textarea v-model="form.story" class="edit__textarea" rows="5" />
        </OFormItem>
      </section>

      <section class="edit__card edit__status">
        <div>
          <p class="edit__status-title">上架状态</p>
          <p class="edit__status-sub">
            {{ form.online ? '在 C 端商城展示，可被加购' : 'C 端商城隐藏，详情页不可访问' }}
          </p>
        </div>
        <OSwitch v-model="form.online" label="上架状态" />
      </section>
    </div>

    <footer class="edit__bar">
      <OButton type="outline" class="edit__bar-btn" @click="goBack">取消</OButton>
      <OButton class="edit__bar-btn" @click="save">保存</OButton>
    </footer>

    <ODialog v-model="leaveOpen">
      <div class="leave">
        <h3 class="leave__title">放弃未保存的修改？</h3>
        <p class="leave__text">离开后，这次改动不会保留。</p>
        <div class="leave__actions">
          <OButton type="outline" block @click="resolveLeave(false)">继续编辑</OButton>
          <OButton block @click="resolveLeave(true)">放弃修改</OButton>
        </div>
      </div>
    </ODialog>
  </div>

  <div v-else class="edit edit--missing">
    <ONavBar title="编辑商品" back @back="goBack" />
    <OEmpty icon="box" text="找不到这件商品" sub="可能已从商品源移除" action="回商品列表" @action="goBack" />
  </div>
</template>

<style scoped lang="scss">
.edit {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.edit__body {
  flex: 1;
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem 1rem 1rem;
}

.edit__card {
  display: grid;
  gap: 0.875rem;
  padding: 1rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.edit__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.edit__section {
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.edit__input {
  width: 100%;
  height: 2.75rem;
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  color: var(--o-title);
  background: var(--o-paper);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  outline: none;
  transition: border-color var(--o-dur-press) linear;

  &::placeholder {
    color: var(--o-muted);
  }

  &:focus {
    border-color: var(--o-ink);
  }

  &--num {
    font-variant-numeric: tabular-nums;
  }
}

.edit__affix {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit__suffix {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--o-muted);
}

.edit__readonly {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--o-muted);
}

.edit__textarea {
  width: 100%;
  min-height: 6.5rem;
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
  transition: border-color var(--o-dur-press) linear;

  &:focus {
    border-color: var(--o-ink);
  }
}

// —— 库存流水：一行一条，入绿出朱 ——
.edit__logs {
  display: grid;
  gap: 0.375rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--o-line);
}

.edit__logs-title {
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--o-muted);
}

.edit__log {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);

  .is-in {
    color: var(--o-success);
  }

  .is-out {
    color: var(--o-danger);
  }
}

.edit__specs {
  display: grid;
  gap: 0.5rem;
}

.edit__spec {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.edit__input--spec {
  width: 6rem;
  flex-shrink: 0;
}

.edit__remove {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  color: var(--o-muted);
  border-radius: 50%;

  &::before {
    content: '';
    position: absolute;
    inset: -0.375rem;
  }

  &:active {
    color: var(--o-danger);
  }
}

.edit__add {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2rem;
  font-size: 0.75rem;
  color: var(--o-ink);

  &:disabled {
    color: var(--o-disabled);
  }
}

.edit__placeholder {
  font-size: 0.75rem;
  color: var(--o-disabled);
}

.edit__error {
  font-size: 0.6875rem;
  color: var(--o-danger);
}

// —— 上架状态：一行开关，不是卡片套卡片 ——
.edit__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.edit__status-title {
  font-size: 0.875rem;
  color: var(--o-title);
}

.edit__status-sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--o-muted);
}

// —— 固定提交栏 ——
.edit__bar {
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

.edit__bar-btn {
  flex: 1;
}

.leave {
  display: grid;
  gap: 0.5rem;
}

.leave__title {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--o-title);
}

.leave__text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--o-muted);
}

.leave__actions {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
