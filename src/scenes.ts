/**
 * Scene Registry — 全画面を id(number) と name(string) で一元管理。
 * goToScene(3) や goToScene('hub') でどこからでも遷移できる。
 * URL hash は #hub, #3, #s0/game 等で自動同期される。
 */

type EnterFn = () => void
type ExitFn = (() => void) | undefined

interface SceneDef {
  id: number
  name: string
  enter: EnterFn
  exit?: ExitFn
}

const byId = new Map<number, SceneDef>()
const byName = new Map<string, SceneDef>()

export function registerScene(def: SceneDef): void {
  byId.set(def.id, def)
  byName.set(def.name, def)
}

/** シーン遷移。名前でも数値でも指定可 */
export function goToScene(idOrName: number | string): void {
  const scene = typeof idOrName === 'number'
    ? byId.get(idOrName)
    : (byName.get(idOrName) ?? byId.get(Number(idOrName)))
  if (!scene) { console.warn(`[scene] unknown: ${idOrName}`); return }
  scene.enter()
}

/** DOMContentLoaded 時に #name があればそこへ、なければ intro へ */
export function routeFromHash(): void {
  const hash = location.hash.slice(1)
  if (!hash) { goToScene(0); return }
  if (hash === 'reset') return
  if (hash === 'debug') { goToScene(0); return } // debug mode + normal start
  if (hash.startsWith('debug/')) return // debug API routing
  const scene = byName.get(hash) ?? byId.get(Number(hash))
  if (scene) { scene.enter(); return }
  goToScene(0)
}

export function getSceneId(name: string): number | undefined { return byName.get(name)?.id }
export function getSceneName(id: number): string | undefined { return byId.get(id)?.name }
export function listScenes(): { id: number; name: string }[] {
  return [...byId.values()].map(s => ({ id: s.id, name: s.name })).sort((a, b) => a.id - b.id)
}
