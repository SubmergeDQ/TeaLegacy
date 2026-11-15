<script setup lang="ts">
import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { sceneMap } from './scenes'

// ============================================================
// 工序图版调度：场景按 key 分到独立组件（scenes/ 目录），
// 这里只负责把 progress、场景名与紧压形态交给当前那一幅。
// ============================================================

defineProps<{
  scene: CraftSceneKey
  /** 紧压形态：压、脱模、阴干、仓储几幕共用 */
  form?: CraftForm
  /** 0–1，由播放器推进 */
  progress: number
}>()
</script>

<template>
  <component :is="sceneMap[scene]" :scene="scene" :form="form" :progress="progress" />
</template>
