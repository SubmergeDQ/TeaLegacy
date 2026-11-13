<script setup lang="ts">
import type { CraftSceneKey } from '@/catalog/craft/types'

import { sceneMap } from './scenes'

// ============================================================
// 工序图版调度：场景按 key 分到独立组件（scenes/ 目录），
// 这里只负责把 progress 与 step 交给当前那一幅。
// ============================================================

defineProps<{
  scene: CraftSceneKey
  /** 步骤 key：同一场景内的细分状态（选果 / 开盖 / 挖果 / 填茶） */
  step: string
  progress: number
}>()
</script>

<template>
  <component :is="sceneMap[scene]" :progress="progress" :step="step" />
</template>
