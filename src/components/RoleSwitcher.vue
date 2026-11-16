<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import OButton from '@/components/oil-ui/OButton.vue'
import { useAppRoleStore } from '@/stores/appRole'

// 身份切换面板：用户端「设置」弹窗与商家端「我的」页共用。
const router = useRouter()
const role = useAppRoleStore()

const isAdmin = computed(() => role.current === 'merchant')

function switchRole() {
  if (isAdmin.value) {
    role.choose('user')
    void router.replace('/craft')
    return
  }
  role.choose('merchant')
  void router.replace('/admin/dashboard')
}

function rechoose() {
  role.clear()
  void router.replace('/welcome')
}
</script>

<template>
  <div class="role-switch">
    <p class="role-switch__now">
      当前身份：<strong>{{ isAdmin ? '商家端' : '用户端' }}</strong>
    </p>

    <OButton type="primary" block @click="switchRole">
      {{ isAdmin ? '切换到用户端' : '进入商家端' }}
    </OButton>

    <OButton type="outline" block @click="rechoose">重新选择身份</OButton>

    <p class="role-switch__hint">切换只改变入口，两端的演示数据都保存在本机，不会丢失。</p>
  </div>
</template>

<style scoped lang="scss">
.role-switch {
  display: grid;
  gap: 0.625rem;
}

.role-switch__now {
  font-size: 0.8125rem;
  color: var(--o-muted);

  strong {
    font-weight: 600;
    color: var(--o-title);
  }
}

.role-switch__hint {
  font-size: 0.6875rem;
  line-height: 1.6;
  color: var(--o-muted);
}
</style>
