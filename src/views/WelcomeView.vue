<script setup lang="ts">
import { useRouter } from 'vue-router'

import OIcon from '@/components/oil-ui/OIcon.vue'
import { useAdminAuthStore } from '@/merchant/stores/adminAuth'
import { useAppRoleStore, type AppRole } from '@/stores/appRole'

// 首次启动的身份选择页：用户端 / 商家端。
// 选择后写入 localStorage，之后可在设置里切换。
const router = useRouter()
const role = useAppRoleStore()
const auth = useAdminAuthStore()

function enter(target: AppRole) {
  role.choose(target)
  if (target === 'merchant') {
    void router.replace(auth.logged ? '/admin/dashboard' : '/admin/login')
  } else {
    void router.replace('/craft')
  }
}
</script>

<template>
  <div class="welcome">
    <header class="welcome__brand">
      <span class="welcome__seal" aria-hidden="true">承</span>
      <div>
        <h1 class="welcome__name">茶承 TeaLegacy</h1>
        <p class="welcome__sub">普洱茶非遗文化 · 离线演示</p>
      </div>
    </header>

    <p class="welcome__lead">请选择要进入的身份</p>

    <div class="welcome__cards">
      <button type="button" class="role-card" @click="enter('user')">
        <span class="role-card__icon"><OIcon name="tea" :size="24" /></span>
        <span class="role-card__title">用户端</span>
        <span class="role-card__desc">制茶体验 · 茶事商城<br />先做一遍，再买一饼</span>
        <span class="role-card__go">进入 →</span>
      </button>

      <button type="button" class="role-card" @click="enter('merchant')">
        <span class="role-card__icon"><OIcon name="store" :size="24" /></span>
        <span class="role-card__title">商家端</span>
        <span class="role-card__desc">店铺概览 · 商品订单<br />离线演示，数据只存本机</span>
        <span class="role-card__go">进入 →</span>
      </button>
    </div>

    <p class="welcome__foot">之后可在任意一端的「设置」里切换身份</p>
  </div>
</template>

<style scoped lang="scss">
.welcome {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2.25rem 1.25rem 1.5rem;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(47, 79, 79, 0.08), transparent 60%),
    var(--o-paper);
}

.welcome__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome__seal {
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

.welcome__name {
  font-family: var(--o-font-serif);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--o-title);
}

.welcome__sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.welcome__lead {
  margin-top: 2rem;
  font-family: var(--o-font-serif);
  font-size: 1.125rem;
  letter-spacing: 0.06em;
  color: var(--o-title);
}

.welcome__cards {
  display: grid;
  gap: 0.875rem;
  margin-top: 1rem;
}

.role-card {
  position: relative;
  display: grid;
  gap: 0.375rem;
  padding: 1.125rem 1rem;
  text-align: left;
  background: var(--o-card);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    border-color var(--o-dur-press) linear;

  &:active {
    transform: scale(0.985);
    border-color: var(--o-ink);
  }
}

.role-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin-bottom: 0.25rem;
  border: 1px solid var(--o-line);
  border-radius: 0.625rem;
  color: var(--o-ink);
}

.role-card__title {
  font-family: var(--o-font-serif);
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.role-card__desc {
  font-size: 0.75rem;
  line-height: 1.7;
  color: var(--o-muted);
}

.role-card__go {
  position: absolute;
  right: 1rem;
  top: 1.125rem;
  font-size: 0.75rem;
  color: var(--o-primary);
  letter-spacing: 0.04em;
}

.welcome__foot {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.6875rem;
  color: var(--o-disabled);
  text-align: center;
}
</style>
