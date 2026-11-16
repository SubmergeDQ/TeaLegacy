<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import OIcon from '@/components/oil-ui/OIcon.vue'
import { showToast } from '@/components/oil-ui/toast'
import {
  DEMO_ACCOUNT,
  DEMO_PASSWORD,
  useAdminAuthStore,
} from '@/merchant/stores/adminAuth'

// 演示用模拟登录：不走后端，账号密码在 store 内本地校验。
const route = useRoute()
const router = useRouter()
const auth = useAdminAuthStore()

const account = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const canSubmit = computed(() => account.value.trim() !== '' && password.value !== '')

function useDemoAccount() {
  account.value = DEMO_ACCOUNT
  password.value = DEMO_PASSWORD
  error.value = ''
}

async function submit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  error.value = ''
  // 模拟一次网络往返，让按钮的 loading 状态有意义
  await new Promise((resolve) => window.setTimeout(resolve, 320))
  const ok = auth.login(account.value, password.value)
  loading.value = false
  if (!ok) {
    error.value = '账号或密码不正确，可点下方「填入演示账号」'
    return
  }
  showToast({ text: '已进入商家中心' })
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  await router.replace(redirect || '/admin/dashboard')
}

function backToStore() {
  router.replace('/shop')
}
</script>

<template>
  <div class="login">
    <header class="login__brand">
      <span class="login__seal" aria-hidden="true">承</span>
      <div>
        <h1 class="login__name">茶承 · 商家中心</h1>
        <p class="login__sub">TeaLegacy Merchant · 演示环境</p>
      </div>
    </header>

    <form class="login__card" @submit.prevent="submit">
      <label class="login__field">
        <span class="login__label">账号</span>
        <input
          v-model="account"
          class="login__input"
          type="text"
          name="account"
          autocomplete="username"
          placeholder="tea-admin"
          @input="error = ''"
        />
      </label>

      <label class="login__field">
        <span class="login__label">密码</span>
        <input
          v-model="password"
          class="login__input"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="123456"
          @input="error = ''"
        />
      </label>

      <p v-if="error" class="login__error" role="alert">{{ error }}</p>

      <OButton type="primary" size="lg" block :loading="loading" :disabled="!canSubmit">
        进入商家中心
      </OButton>

      <button type="button" class="login__demo" @click="useDemoAccount">
        填入演示账号 · {{ DEMO_ACCOUNT }} / {{ DEMO_PASSWORD }}
      </button>
    </form>

    <footer class="login__foot">
      <p>离线演示：数据只存在本机，不会上传；关闭应用后登录态失效。</p>
      <button type="button" class="login__back" @click="backToStore">
        <OIcon name="back" :size="16" />
        返回用户端商城
      </button>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.login {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem 1.5rem;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(107, 66, 38, 0.08), transparent 62%),
    var(--o-paper);
}

.login__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0 1.75rem;
}

.login__seal {
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

.login__name {
  font-family: var(--o-font-serif);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--o-title);
}

.login__sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.login__card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--o-card);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  box-shadow: 0 10px 30px rgba(28, 25, 18, 0.06);
}

.login__field {
  display: grid;
  gap: 0.375rem;
}

.login__label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.login__input {
  width: 100%;
  height: 2.75rem;
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.9375rem;
  color: var(--o-title);
  background: var(--o-paper);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  outline: none;
  transition: border-color var(--o-dur-press) linear;

  &::placeholder {
    color: var(--o-disabled);
  }

  &:focus {
    border-color: var(--o-ink);
  }
}

.login__error {
  font-size: 0.75rem;
  color: #a5463a;
}

.login__demo {
  font-size: 0.75rem;
  color: var(--o-muted);
  text-decoration: underline;
  text-underline-offset: 0.25em;
  text-align: center;
  min-height: 2.75rem;
}

.login__foot {
  margin-top: auto;
  padding-top: 2rem;
  display: grid;
  gap: 0.75rem;
  font-size: 0.6875rem;
  color: var(--o-disabled);
}

.login__back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  align-self: flex-start;
  font-size: 0.75rem;
  color: var(--o-muted);
  min-height: 2.75rem;
}
</style>
