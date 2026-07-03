// ============================================================================
// Save/Load System — unified game save API
// ============================================================================

export interface SaveData {
  slot: number
  timestamp: string
  name: string
  introDone: boolean
  puzzleDone: boolean
  s0: boolean
  s1: boolean
  s2: boolean
  s3: boolean
  storyProgress: number
  memo: string
}

const SAVE_PREFIX = 'sd_save_'
const MAX_SLOTS = 3

function slotKey(slot: number): string {
  return `${SAVE_PREFIX}${slot}`
}

export function saveGame(slot: number, name?: string): SaveData | null {
  if (slot < 0 || slot >= MAX_SLOTS) {
    console.warn('[save] invalid slot:', slot)
    return null
  }

  const data: SaveData = {
    slot,
    timestamp: new Date().toISOString(),
    name: name ?? `スロット ${slot + 1}`,
    introDone: localStorage.getItem('sd_intro_done') === 'true',
    puzzleDone: localStorage.getItem('sd_4x4_done') === 'true',
    s0: JSON.parse(localStorage.getItem('sd_completed') ?? '[]').includes('s0'),
    s1: JSON.parse(localStorage.getItem('sd_completed') ?? '[]').includes('s1'),
    s2: JSON.parse(localStorage.getItem('sd_completed') ?? '[]').includes('s2'),
    s3: JSON.parse(localStorage.getItem('sd_completed') ?? '[]').includes('s3'),
    storyProgress: parseInt(localStorage.getItem('sd_story_progress') ?? '0', 10) || 0,
    memo: localStorage.getItem('sd_memo') ?? '',
  }

  localStorage.setItem(slotKey(slot), JSON.stringify(data))
  return data
}

export function loadGame(slot: number): SaveData | null {
  if (slot < 0 || slot >= MAX_SLOTS) {
    console.warn('[save] invalid slot:', slot)
    return null
  }

  const raw = localStorage.getItem(slotKey(slot))
  if (!raw) return null

  try {
    return JSON.parse(raw) as SaveData
  } catch {
    console.warn('[save] corrupted save in slot:', slot)
    return null
  }
}

export function listSaves(): SaveData[] {
  const saves: SaveData[] = []
  for (let i = 0; i < MAX_SLOTS; i++) {
    const data = loadGame(i)
    if (data) saves.push(data)
  }
  return saves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function deleteSave(slot: number): boolean {
  if (slot < 0 || slot >= MAX_SLOTS) return false
  localStorage.removeItem(slotKey(slot))
  return true
}

/** Apply saved state to the current game (resets first) */
export function restoreSave(data: SaveData): void {
  // Dynamic import to avoid circular deps — store is imported lazily
  const store = (window as any).__dogStore_get
  if (!store) { console.warn('[save] store not available for restore'); return }

  // Reset everything first
  localStorage.removeItem('sd_completed')
  localStorage.removeItem('sd_intro_done')
  localStorage.removeItem('sd_4x4_done')
  localStorage.removeItem('sd_story_progress')
  localStorage.removeItem('sd_memo')

  // Apply state piece by piece
  if (data.introDone) {
    localStorage.setItem('sd_intro_done', 'true')
  }
  if (data.puzzleDone) {
    localStorage.setItem('sd_4x4_done', 'true')
  }
  if (data.storyProgress > 0) {
    localStorage.setItem('sd_story_progress', String(data.storyProgress))
  }
  if (data.memo) {
    localStorage.setItem('sd_memo', data.memo)
  }

  // Build completed array
  const completed: string[] = []
  if (data.s0) completed.push('s0')
  if (data.s1) completed.push('s1')
  if (data.s2) completed.push('s2')
  if (data.s3) completed.push('s3')
  localStorage.setItem('sd_completed', JSON.stringify(completed))
}

export function autoSave(slot?: number): SaveData | null {
  return saveGame(slot ?? 0, 'auto')
}

export function exportSave(slot?: number): string {
  if (slot !== undefined) {
    const data = loadGame(slot)
    if (!data) return ''
    return JSON.stringify(data, null, 2)
  }
  // Export all saves
  return JSON.stringify(listSaves(), null, 2)
}

export function importSave(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      // Array of saves
      for (const item of parsed) {
        if (item.slot !== undefined) {
          localStorage.setItem(slotKey(item.slot), JSON.stringify(item))
        }
      }
    } else if (parsed.slot !== undefined) {
      // Single save
      localStorage.setItem(slotKey(parsed.slot), JSON.stringify(parsed))
    } else {
      console.warn('[save] invalid save data format')
      return false
    }
    return true
  } catch {
    console.warn('[save] failed to parse save JSON')
    return false
  }
}
