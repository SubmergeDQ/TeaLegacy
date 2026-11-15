// ============================================================
// 工序场景注册表
//
// 每种场景一个组件；同一组件承担相近的几幕（如压制的三种形制）。
// 新增一种工序图版只需：
// 1. 在本目录新建场景组件；
// 2. 在 CraftSceneKey 联合类型里补一个 key；
// 3. 在这里登记一行。
// ============================================================

import type { Component } from 'vue'

import type { CraftSceneKey } from '@/catalog/craft/types'

import BeadScene from './BeadScene.vue'
import CitrusScene from './CitrusScene.vue'
import DemoldScene from './DemoldScene.vue'
import DryScene from './DryScene.vue'
import GardenScene from './GardenScene.vue'
import MoldScene from './MoldScene.vue'
import PileScene from './PileScene.vue'
import PrepScene from './PrepScene.vue'
import PressScene from './PressScene.vue'
import RollScene from './RollScene.vue'
import SortScene from './SortScene.vue'
import StoreScene from './StoreScene.vue'
import SunScene from './SunScene.vue'
import TuoShapeScene from './TuoShapeScene.vue'
import WeighScene from './WeighScene.vue'
import WitherScene from './WitherScene.vue'
import WokScene from './WokScene.vue'
import WrapScene from './WrapScene.vue'

export const sceneMap: Record<CraftSceneKey, Component> = {
  pluck: GardenScene,
  wither: WitherScene,
  wok: WokScene,
  roll: RollScene,
  sun: SunScene,
  pile: PileScene,
  spread: PileScene,
  sort: SortScene,
  store: StoreScene,
  citrusPick: CitrusScene,
  peelDry: CitrusScene,
  citrusFill: CitrusScene,
  citrusDry: CitrusScene,
  citrusRest: CitrusScene,
  prep: PrepScene,
  blend: PrepScene,
  moisten: PrepScene,
  weigh: WeighScene,
  bead: BeadScene,
  mold: MoldScene,
  press: PressScene,
  demold: DemoldScene,
  dry: DryScene,
  wrap: WrapScene,
  tuoShape: TuoShapeScene,
}
