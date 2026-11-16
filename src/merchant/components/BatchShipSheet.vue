<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import OButton from '@/components/oil-ui/OButton.vue'
import OSegmented from '@/components/oil-ui/OSegmented.vue'
import OSheet from '@/components/oil-ui/OSheet.vue'
import { showToast } from '@/components/oil-ui/toast'
import { useAdminOrdersStore, type Order } from '@/catalog/admin'
import {
  CARRIERS,
  carrierPrefix,
  loadCarrierName,
  makeTracking,
  saveCarrierName,
} from '@/merchant/shipment'

// 批量发货：一个承运商，逐单填运单号。
// 打开时按顺序预填演示单号，赶时间可以直接提交，也能逐单改。
const props = defineProps<{ modelValue: boolean; orders: Order[] }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  shipped: []
}>()

const store = useAdminOrdersStore()
const companyOptions = CARRIERS.map((item) => ({ value: item.name, label: item.name }))

interface BatchRow {
  no: string
  buyer: string
  qty: number
  value: string
  edited: boolean
}

const company = ref(loadCarrierName())
const rows = ref<BatchRow[]>([])
const error = ref('')
const submitting = ref(false)

function buildRows() {
  const prefix = carrierPrefix(company.value)
  rows.value = props.orders.map((order) => ({
    no: order.no,
    buyer: order.buyer.name,
    qty: order.items.reduce((sum, item) => sum + item.qty, 0),
    value: makeTracking(prefix),
    edited: false,
  }))
}

watch(
  () => props.modelValue,
  (show) => {
    if (!show) return
    company.value = loadCarrierName()
    error.value = ''
    buildRows()
  },
)

watch(company, (name) => {
  saveCarrierName(name)
  const prefix = carrierPrefix(name)
  rows.value.forEach((row) => {
    if (!row.edited) row.value = makeTracking(prefix)
  })
})

const allValid = computed(
  () =>
    rows.value.length > 0 &&
    rows.value.every((row) => /^[A-Za-z0-9]{8,20}$/.test(row.value.trim())),
)

function onInput(row: BatchRow) {
  row.edited = true
  error.value = ''
}

async function submit() {
  if (submitting.value) return
  if (!allValid.value) {
    error.value = '每单都需要 8–20 位字母或数字的运单号'
    return
  }
  submitting.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 320))
  let shipped = 0
  for (const row of rows.value) {
    if (store.ship(row.no, { company: company.value, no: row.value.trim() })) shipped += 1
  }
  submitting.value = false
  if (shipped === 0) {
    error.value = '这些订单当前不能发货，请刷新后重试'
    return
  }
  showToast({ text: `已发货 ${shipped} 单 · ${company.value}` })
  emit('update:modelValue', false)
  emit('shipped')
}
</script>

<template>
  <OSheet
    :model-value="modelValue"
    :title="`批量发货 · ${orders.length} 单`"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="batch">
      <div class="batch__field">
        <p class="batch__label">物流公司</p>
        <OSegmented v-model="company" :options="companyOptions" :columns="2" />
      </div>

      <p class="batch__hint">运单号已按顺序预填，可逐单修改。</p>

      <div class="batch__rows">
        <div v-for="row in rows" :key="row.no" class="batch__row">
          <div class="batch__head">
            <span class="batch__no">{{ row.no }}</span>
            <span class="batch__meta">{{ row.buyer }} · {{ row.qty }} 件</span>
          </div>
          <input
            v-model="row.value"
            class="batch__input"
            type="text"
            maxlength="20"
            autocomplete="off"
            :aria-label="`${row.no} 的运单号`"
            @input="onInput(row)"
          />
        </div>
      </div>

      <p v-if="error" class="batch__error" role="alert">{{ error }}</p>
    </div>

    <template #footer>
      <OButton block size="lg" :loading="submitting" :disabled="rows.length === 0" @click="submit">
        确认发货（{{ rows.length }}）
      </OButton>
    </template>
  </OSheet>
</template>

<style scoped lang="scss">
.batch {
  display: grid;
  gap: 0.875rem;
}

.batch__field {
  display: grid;
  gap: 0.375rem;
}

.batch__label {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

.batch__hint {
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.batch__rows {
  display: grid;
  gap: 0.625rem;
}

.batch__row {
  display: grid;
  gap: 0.25rem;
}

.batch__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.batch__no {
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
}

.batch__meta {
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.batch__input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
  background: var(--o-paper);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  outline: none;
  transition: border-color var(--o-dur-press) linear;

  &:focus {
    border-color: var(--o-ink);
  }
}

.batch__error {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--o-danger);
}
</style>
