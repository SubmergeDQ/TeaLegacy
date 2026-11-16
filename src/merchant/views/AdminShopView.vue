<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import OCell from '@/components/oil-ui/OCell.vue'
import ODialog from '@/components/oil-ui/ODialog.vue'
import OFormItem from '@/components/oil-ui/OFormItem.vue'
import OSheet from '@/components/oil-ui/OSheet.vue'
import OSwitch from '@/components/oil-ui/OSwitch.vue'
import { showToast } from '@/components/oil-ui/toast'
import {
  exportAdminSnapshot,
  resetAdminData,
  useAdminCatalogStore,
  useAdminShopStore,
} from '@/catalog/admin'
import { useAdminAuthStore } from '@/merchant/stores/adminAuth'
import RoleSwitcher from '@/components/RoleSwitcher.vue'

// 我的：店铺资料、营业与通知开关、演示数据、身份切换、退出。
const router = useRouter()
const shop = useAdminShopStore()
const catalog = useAdminCatalogStore()
const auth = useAdminAuthStore()

const infoOpen = ref(false)
const resetOpen = ref(false)
const nameDraft = ref('')
const introDraft = ref('')

watch(infoOpen, (open) => {
  if (!open) return
  nameDraft.value = shop.profile.name
  introDraft.value = shop.profile.intro
})

function saveInfo() {
  const name = nameDraft.value.trim()
  if (name.length < 2 || name.length > 20) {
    showToast({ text: '店铺名需为 2–20 个字' })
    return
  }
  shop.update({ name, intro: introDraft.value.trim() })
  infoOpen.value = false
  showToast({ text: '店铺资料已保存' })
}

function setOpen(value: boolean) {
  shop.update({ open: value })
  showToast({ text: value ? '已开始营业' : '已打烊，C 端会显示休息中' })
}

function openInventory() {
  router.push('/admin/inventory')
}

function setNotifyNewOrder(value: boolean) {
  shop.update({ notifyNewOrder: value })
}

function setNotifyLowStock(value: boolean) {
  shop.update({ notifyLowStock: value })
}

function doReset() {
  resetAdminData()
  resetOpen.value = false
  showToast({ text: '演示数据已重置：48 单、默认价格与库存' })
}

function exportData() {
  const data = exportAdminSnapshot()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  link.href = url
  link.download = `tea-legacy-admin-${stamp}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  showToast({ text: '演示数据已导出' })
}

function logout() {
  auth.logout()
  showToast({ text: '已退出商家端' })
  void router.replace('/admin/login')
}
</script>

<template>
  <div class="mine">
    <header class="mine__head">
      <h1 class="mine__title">我的</h1>
      <span class="mine__badge">商家端</span>
    </header>

    <section class="mine__card mine__shop">
      <span class="mine__seal" aria-hidden="true">承</span>
      <div class="mine__shop-main">
        <p class="mine__name">{{ shop.profile.name }}</p>
        <p class="mine__meta">
          {{ shop.profile.open ? '营业中' : '已打烊' }} · 普洱与茶器
        </p>
      </div>
      <button type="button" class="mine__edit" @click="infoOpen = true">编辑</button>
    </section>

    <p class="mine__intro">{{ shop.profile.intro }}</p>

    <section class="mine__card mine__group">
      <h2 class="mine__section">店铺</h2>
      <OCell label="店铺信息" :value="shop.profile.name" arrow clickable @click="infoOpen = true" />
      <OCell label="营业状态" hint="打烊后 C 端显示休息中">
        <template #value>
          <OSwitch
            :model-value="shop.profile.open"
            label="营业状态"
            @update:model-value="setOpen"
          />
        </template>
      </OCell>
      <OCell
        label="库存管理"
        :value="catalog.lowStockCount > 0 ? `${catalog.lowStockCount} 款预警` : '库存充足'"
        arrow
        clickable
        @click="openInventory"
      />
      <OCell label="新订单通知">
        <template #value>
          <OSwitch
            :model-value="shop.profile.notifyNewOrder"
            label="新订单通知"
            @update:model-value="setNotifyNewOrder"
          />
        </template>
      </OCell>
      <OCell label="低库存提醒" :hint="`${catalog.lowStockCount} 款低于 5 件`">
        <template #value>
          <OSwitch
            :model-value="shop.profile.notifyLowStock"
            label="低库存提醒"
            @update:model-value="setNotifyLowStock"
          />
        </template>
      </OCell>
    </section>

    <section class="mine__card mine__group">
      <h2 class="mine__section">演示数据</h2>
      <OCell
        label="重置演示数据"
        tone="danger"
        hint="订单回到 48 单，商品恢复默认价与库存"
        arrow
        clickable
        @click="resetOpen = true"
      />
      <OCell label="导出数据" hint="下载一份 JSON 备份" arrow clickable @click="exportData" />
    </section>

    <section class="mine__card">
      <h2 class="mine__section">身份与入口</h2>
      <RoleSwitcher />
    </section>

    <section class="mine__card mine__group">
      <h2 class="mine__section">关于</h2>
      <OCell label="版本" value="v1.0.1 · 商家端 P0" />
      <OCell label="技术栈" value="Vue 3 · Vite 7 · Oil UI" />
      <OCell label="数据说明" value="全部离线演示" />
    </section>

    <OButton type="outline" block class="mine__logout" @click="logout">退出登录</OButton>

    <OSheet v-model="infoOpen" title="店铺信息">
      <div class="mine__form">
        <OFormItem label="店铺名" required hint="2–20 个字，展示在概览与 C 端">
          <input v-model="nameDraft" class="mine__input" type="text" maxlength="20" />
        </OFormItem>
        <OFormItem label="简介" hint="一句话说明这家店在卖什么">
          <textarea v-model="introDraft" class="mine__textarea" rows="3" maxlength="60" />
        </OFormItem>
      </div>
      <template #footer>
        <OButton block size="lg" @click="saveInfo">保存</OButton>
      </template>
    </OSheet>

    <ODialog v-model="resetOpen">
      <div class="mine__dialog">
        <h3 class="mine__dialog-title">重置演示数据？</h3>
        <p class="mine__dialog-text">
          订单会回到初始 48 单，商品价格、库存、上下架与店铺设置全部恢复默认。此操作不可撤销。
        </p>
        <div class="mine__dialog-actions">
          <OButton type="outline" block @click="resetOpen = false">取消</OButton>
          <OButton block @click="doReset">确认重置</OButton>
        </div>
      </div>
    </ODialog>
  </div>
</template>

<style scoped lang="scss">
.mine {
  padding: 0 1rem 2rem;
}

.mine__head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0 1rem;
}

.mine__title {
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.mine__badge {
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--o-line);
  border-radius: 999px;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.mine__card {
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--o-card);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
}

.mine__shop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.mine__seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  background: var(--o-primary);
  color: var(--o-on-ink);
  font-family: var(--o-font-serif);
  font-size: 1.25rem;
  line-height: 1;
}

.mine__shop-main {
  flex: 1;
  min-width: 0;
}

.mine__name {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.mine__meta {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.mine__edit {
  flex-shrink: 0;
  min-height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--o-line);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--o-text);

  &:active {
    background: rgba(47, 79, 79, 0.05);
  }
}

.mine__intro {
  margin: -0.25rem 0 0.875rem;
  padding: 0 0.25rem;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--o-muted);
}

.mine__section {
  margin-bottom: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--o-muted);
}

.mine__form {
  display: grid;
  gap: 1rem;
}

.mine__input {
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

  &:focus {
    border-color: var(--o-ink);
  }
}

.mine__textarea {
  width: 100%;
  min-height: 4.5rem;
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

.mine__logout {
  margin-top: 0.5rem;
}

.mine__dialog {
  display: grid;
  gap: 0.5rem;
}

.mine__dialog-title {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--o-title);
}

.mine__dialog-text {
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--o-muted);
}

.mine__dialog-actions {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
