import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

// ============================================================
// 制茶记录：哪几款茶已经亲手做成，成茶时选了什么风味。
// 与购物车同样落 localStorage，刷新后"已制成"标记还在。
// ============================================================

export interface CraftRecord {
  id: string
  flavors: string[]
  at: number
}

const STORAGE_KEY = 'tea-legacy.craft.v1'

function load(): Record<string, CraftRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, CraftRecord>
    // 读回时只保留结构完整的记录
    const safe: Record<string, CraftRecord> = {}
    for (const [id, r] of Object.entries(parsed)) {
      if (r && typeof r.id === 'string' && Array.isArray(r.flavors)) safe[id] = r
    }
    return safe
  } catch {
    return {}
  }
}

export const useCraftStore = defineStore('craft', () => {
  const records = ref<Record<string, CraftRecord>>(load())

  const count = computed(() => Object.keys(records.value).length)

  function record(id: string): CraftRecord | undefined {
    return records.value[id]
  }

  function done(id: string): boolean {
    return records.value[id] !== undefined
  }

  /** 成茶落定：重做会覆盖上一次的风味 */
  function finish(id: string, flavors: string[]) {
    const unique = [...new Set(flavors)]
    records.value = { ...records.value, [id]: { id, flavors: unique, at: Date.now() } }
  }

  watch(
    records,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      } catch {
        // 隐私模式下仅保留在内存
      }
    },
    { deep: true },
  )

  return { records, count, record, done, finish }
})
