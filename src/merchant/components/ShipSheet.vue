<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import OButton from '@/components/oil-ui/OButton.vue'
import OFormItem from '@/components/oil-ui/OFormItem.vue'
import OSegmented from '@/components/oil-ui/OSegmented.vue'
import OSheet from '@/components/oil-ui/OSheet.vue'
import { showToast } from '@/components/oil-ui/toast'
import { useAdminOrdersStore } from '@/catalog/admin'
import { CARRIERS, loadCarrierName, saveCarrierName } from '@/merchant/shipment'
import { formatPrice } from '@/utils/format'

// 发货：物流公司 + 运单号，成功后写入时间轴。
// 列表卡与详情页共用同一个弹层，避免两套校验。
const props = defineProps<{ modelValue: boolean; orderNo: string }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  shipped: []
}>()

const orders = useAdminOrdersStore()

const companyOptions = CARRIERS.map((item) => ({ value: item.name, label: item.name }))

const company = ref(loadCarrierName())
const trackingNo = ref('')
const error = ref('')
const submitting = ref(false)

// 弹层里带上这张单的关键信息，连续发货时不会发错单
const order = computed(() => orders.find(props.orderNo))
const totalQty = computed(
  () => order.value?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0,
)

const canSubmit = computed(() => trackingNo.value.trim().length > 0)

watch(company, (value) => saveCarrierName(value))

watch(
  () => props.modelValue,
  (show) => {
    if (!show) return
    trackingNo.value = ''
    error.value = ''
  },
)

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  if (submitting.value) return
  const value = trackingNo.value.trim()
  if (!/^[A-Za-z0-9]{8,20}$/.test(value)) {
    error.value = '运单号需为 8–20 位字母或数字'
    return
  }
  submitting.value = true
  // 模拟一次网络往返
  await new Promise((resolve) => window.setTimeout(resolve, 320))
  const ok = orders.ship(props.orderNo, { company: company.value, no: value })
  submitting.value = false
  if (!ok) {
    error.value = '这张订单当前不能发货，请刷新后重试'
    return
  }
  showToast({ text: `已发货 · ${company.value}` })
  close()
  emit('shipped')
}
</script>

<template>
  <OSheet
    :model-value="modelValue"
    title="发货"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="ship">
      <div v-if="order" class="ship__order">
        <p class="ship__order-no">{{ order.no }}</p>
        <p class="ship__order-meta">
          {{ order.buyer.name }} · 共 {{ totalQty }} 件 · ¥{{ formatPrice(order.total) }}
        </p>
      </div>

      <OFormItem label="物流公司" required>
        <OSegmented v-model="company" :options="companyOptions" />
      </OFormItem>

      <OFormItem
        label="运单号"
        required
        :error="error"
        hint="8–20 位字母或数字，演示环境不校验真实物流"
      >
        <input
          v-model="trackingNo"
          class="ship__input"
          type="text"
          inputmode="text"
          autocomplete="off"
          placeholder="如 SF1234567890"
          @input="error = ''"
        />
      </OFormItem>
    </div>

    <template #footer>
      <OButton block size="lg" :loading="submitting" :disabled="!canSubmit" @click="submit">
        确认发货
      </OButton>
    </template>
  </OSheet>
</template>

<style scoped lang="scss">
.ship {
  display: grid;
  gap: 1rem;
}

// 这张单是谁的、多少钱：连续发货时防止发错
.ship__order {
  display: grid;
  gap: 0.125rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed var(--o-line);
}

.ship__order-no {
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
}

.ship__order-meta {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}

.ship__input {
  width: 100%;
  height: 2.75rem;
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
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
}
</style>
