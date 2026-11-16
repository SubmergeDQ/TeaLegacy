<script setup lang="ts">
import { useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import RoleSwitcher from '@/components/RoleSwitcher.vue'
import { showToast } from '@/components/oil-ui/toast'
import { useAdminAuthStore } from '@/merchant/stores/adminAuth'

// 「我的」：店铺信息占位 + 身份切换 + 退出登录。
// 店铺资料、通知开关、演示数据管理等按 P0 逐步补齐。
const router = useRouter()
const auth = useAdminAuthStore()

const pending = [
  '店铺资料与营业状态',
  '通知开关（新订单 / 低库存）',
  '演示数据重置与导出',
  '关于与版本信息',
]

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
      <div>
        <p class="mine__name">茶承茶铺</p>
        <p class="mine__meta">营业中 · 演示店铺</p>
      </div>
    </section>

    <section class="mine__card">
      <h2 class="mine__section">身份与入口</h2>
      <RoleSwitcher />
    </section>

    <section class="mine__card">
      <h2 class="mine__section">待开发（P0）</h2>
      <ul class="mine__list">
        <li v-for="it in pending" :key="it">
          <span class="mine__dot" aria-hidden="true" />
          {{ it }}
        </li>
      </ul>
    </section>

    <OButton type="outline" block class="mine__logout" @click="logout">
      退出登录
    </OButton>
  </div>
</template>

<style scoped lang="scss">
.mine {
  padding: 0.75rem 1rem 2rem;
}

.mine__head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.25rem 0 1rem;
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
  margin-bottom: 0.875rem;
  padding: 1rem;
  background: var(--o-card);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
}

.mine__shop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mine__seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: var(--o-primary);
  color: var(--o-on-ink);
  font-family: var(--o-font-serif);
  font-size: 1.25rem;
  line-height: 1;
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

.mine__section {
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.mine__list {
  display: grid;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--o-text);
}

.mine__list li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.mine__dot {
  width: 0.25rem;
  height: 0.25rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--o-line);
  transform: translateY(-0.1rem);
}

.mine__logout {
  margin-top: 0.5rem;
}
</style>
