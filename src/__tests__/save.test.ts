import { describe, it, expect, beforeEach } from 'vitest'
import { saveGame, loadGame, listSaves, deleteSave, restoreSave, exportSave, importSave, autoSave } from '../save'

describe('saveGame', () => {
  beforeEach(() => {
    localStorage.clear()
    // Clear save slots
    for (let i = 0; i < 3; i++) localStorage.removeItem('sd_save_' + i)
  })

  it('saves and loads game state', () => {
    localStorage.setItem('sd_intro_done', 'true')
    localStorage.setItem('sd_4x4_done', 'true')
    localStorage.setItem('sd_completed', '["s0","s1"]')
    localStorage.setItem('sd_memo', 'test memo')

    const data = saveGame(0, 'テストセーブ')
    expect(data).toBeTruthy()
    expect(data!.slot).toBe(0)
    expect(data!.name).toBe('テストセーブ')
    expect(data!.introDone).toBe(true)
    expect(data!.puzzleDone).toBe(true)
    expect(data!.s0).toBe(true)
    expect(data!.s1).toBe(true)
    expect(data!.s2).toBe(false)
    expect(data!.s3).toBe(false)
    expect(data!.memo).toBe('test memo')
  })

  it('loads saved game state', () => {
    localStorage.setItem('sd_completed', '["s0","s2"]')
    saveGame(0)

    const loaded = loadGame(0)
    expect(loaded).toBeTruthy()
    expect(loaded!.s0).toBe(true)
    expect(loaded!.s1).toBe(false)
    expect(loaded!.s2).toBe(true)
  })

  it('returns null for invalid slot', () => {
    expect(saveGame(-1)).toBeNull()
    expect(saveGame(3)).toBeNull()
  })

  it('returns null for nonexistent save', () => {
    expect(loadGame(2)).toBeNull()
  })
})

describe('listSaves', () => {
  beforeEach(() => {
    localStorage.clear()
    for (let i = 0; i < 3; i++) localStorage.removeItem('sd_save_' + i)
  })

  it('returns empty array when no saves', () => {
    expect(listSaves()).toEqual([])
  })

  it('lists all saves', () => {
    saveGame(0, 'first')
    saveGame(1, 'second')
    saveGame(2, 'third')
    const saves = listSaves()
    expect(saves.length).toBe(3)
    const names = saves.map(s => s.name)
    expect(names).toContain('first')
    expect(names).toContain('second')
    expect(names).toContain('third')
  })
})

describe('deleteSave', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('deletes a save slot', () => {
    saveGame(0)
    expect(loadGame(0)).toBeTruthy()
    expect(deleteSave(0)).toBe(true)
    expect(loadGame(0)).toBeNull()
  })

  it('returns false for invalid slot', () => {
    expect(deleteSave(-1)).toBe(false)
    expect(deleteSave(3)).toBe(false)
  })
})

describe('restoreSave', () => {
  beforeEach(() => {
    localStorage.clear()
    ;(window as any).__dogStore_get = () => ({
      reset: () => {
        localStorage.removeItem('sd_completed')
        localStorage.removeItem('sd_intro_done')
        localStorage.removeItem('sd_4x4_done')
        localStorage.removeItem('sd_story_progress')
        localStorage.removeItem('sd_memo')
      },
    })
  })

  it('restores full save data', () => {
    const data = {
      slot: 0, timestamp: new Date().toISOString(), name: 'test',
      introDone: true, puzzleDone: true, s0: true, s1: false, s2: true, s3: false,
      storyProgress: 5, memo: 'saved memo',
    }
    restoreSave(data)
    expect(localStorage.getItem('sd_intro_done')).toBe('true')
    expect(localStorage.getItem('sd_4x4_done')).toBe('true')
    expect(localStorage.getItem('sd_story_progress')).toBe('5')
    expect(localStorage.getItem('sd_memo')).toBe('saved memo')
    const completed = JSON.parse(localStorage.getItem('sd_completed') ?? '[]')
    expect(completed).toContain('s0')
    expect(completed).toContain('s2')
    expect(completed).not.toContain('s1')
    expect(completed).not.toContain('s3')
  })
})

describe('exportSave / importSave', () => {
  beforeEach(() => {
    localStorage.clear()
    for (let i = 0; i < 3; i++) localStorage.removeItem('sd_save_' + i)
  })

  it('exports single save as JSON', () => {
    saveGame(0, 'export-test')
    const json = exportSave(0)
    expect(json).toContain('export-test')
    const parsed = JSON.parse(json)
    expect(parsed.slot).toBe(0)
  })

  it('exports all saves as JSON array', () => {
    saveGame(0, 's0')
    saveGame(1, 's1')
    const json = exportSave()
    const parsed = JSON.parse(json)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBe(2)
  })

  it('imports a single save', () => {
    saveGame(0, 'original')
    const json = exportSave(0)
    deleteSave(0)
    expect(importSave(json)).toBe(true)
    const loaded = loadGame(0)
    expect(loaded?.name).toBe('original')
  })

  it('imports multiple saves', () => {
    saveGame(0, 'a')
    saveGame(1, 'b')
    const json = exportSave()
    deleteSave(0)
    deleteSave(1)
    expect(importSave(json)).toBe(true)
    expect(loadGame(0)?.name).toBe('a')
    expect(loadGame(1)?.name).toBe('b')
  })

  it('returns false for invalid import', () => {
    expect(importSave('{ invalid json }')).toBe(false)
  })
})

describe('autoSave', () => {
  beforeEach(() => {
    localStorage.clear()
    for (let i = 0; i < 3; i++) localStorage.removeItem('sd_save_' + i)
  })

  it('saves to default slot 0 with name "auto"', () => {
    autoSave()
    const loaded = loadGame(0)
    expect(loaded).toBeTruthy()
    expect(loaded!.name).toBe('auto')
  })

  it('saves to specified slot', () => {
    autoSave(1)
    const loaded = loadGame(1)
    expect(loaded).toBeTruthy()
    expect(loaded!.name).toBe('auto')
    expect(loadGame(0)).toBeNull()
  })
})
