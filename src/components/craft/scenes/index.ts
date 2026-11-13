// ============================================================
// 工序场景注册表
//
// 每种场景一个组件，新增一种工序图版只需：
// 1. 在本目录新建场景组件；
// 2. 在 CraftSceneKey 联合类型里补一个 key；
// 3. 在这里登记一行。
// ============================================================

import type { Component } from 'vue'

import type { CraftSceneKey } from '@/catalog/craft/types'

import CitrusScene from './CitrusScene.vue'
import GardenScene from './GardenScene.vue'
import PileScene from './PileScene.vue'
import PressScene from './PressScene.vue'
import RollScene from './RollScene.vue'
import SunScene from './SunScene.vue'
import WitherScene from './WitherScene.vue'
import WokScene from './WokScene.vue'

export const sceneMap: Record<CraftSceneKey, Component> = {
  garden: GardenScene,
  wither: WitherScene,
  wok: WokScene,
  roll: RollScene,
  press: PressScene,
  citrus: CitrusScene,
  sun: SunScene,
  pile: PileScene,
}
