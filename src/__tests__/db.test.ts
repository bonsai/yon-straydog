import { describe, it, expect, beforeEach } from 'vitest'

import {
  createTable, dropTable, insert, select, selectById,
  update, remove, count, allTables, clearDb, exportDb, importDb,
} from '../db'

interface SaveRow {
  id: string
  name: string
  introDone: boolean
  puzzleDone: boolean
  s0: boolean
  s1: boolean
  s2: boolean
  s3: boolean
}

const TEST_SAVE: SaveRow = {
  id: 'test-1', name: 'テストセーブ',
  introDone: true, puzzleDone: true,
  s0: true, s1: false, s2: false, s3: false,
}

describe('db', () => {
  const TABLE = 'saves_test'

  beforeEach(() => {
    clearDb()
    createTable(TABLE)
  })

  it('createTable + allTables', () => {
    expect(allTables()).toContain(TABLE)
  })

  it('insert + selectById', () => {
    insert(TABLE, TEST_SAVE)
    const row = selectById<SaveRow>(TABLE, 'test-1')
    expect(row).not.toBeNull()
    expect(row!.name).toBe('テストセーブ')
    expect(row!.s0).toBe(true)
  })

  it('select with query', () => {
    insert(TABLE, TEST_SAVE)
    insert(TABLE, { ...TEST_SAVE, id: 'test-2', s0: false, name: '別セーブ' })
    const results = select<SaveRow>(TABLE, { s0: true })
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('test-1')
  })

  it('select with empty query returns all', () => {
    insert(TABLE, TEST_SAVE)
    insert(TABLE, { ...TEST_SAVE, id: 'test-2' })
    expect(select(TABLE)).toHaveLength(2)
  })

  it('update', () => {
    insert(TABLE, TEST_SAVE)
    const updated = update<SaveRow>(TABLE, 'test-1', { name: '更新済み', s1: true })
    expect(updated).not.toBeNull()
    expect(updated!.name).toBe('更新済み')
    expect(updated!.s1).toBe(true)
    // s0 should be preserved
    expect(updated!.s0).toBe(true)
  })

  it('update returns null for missing id', () => {
    expect(update(TABLE, 'nonexistent', { name: 'x' })).toBeNull()
  })

  it('remove', () => {
    insert(TABLE, TEST_SAVE)
    expect(remove(TABLE, 'test-1')).toBe(true)
    expect(selectById(TABLE, 'test-1')).toBeNull()
  })

  it('remove returns false for missing id', () => {
    expect(remove(TABLE, 'nonexistent')).toBe(false)
  })

  it('count', () => {
    expect(count(TABLE)).toBe(0)
    insert(TABLE, TEST_SAVE)
    expect(count(TABLE)).toBe(1)
    insert(TABLE, { ...TEST_SAVE, id: 'test-2' })
    expect(count(TABLE)).toBe(2)
  })

  it('dropTable', () => {
    insert(TABLE, TEST_SAVE)
    dropTable(TABLE)
    expect(allTables()).not.toContain(TABLE)
    expect(count(TABLE)).toBe(0)
  })

  it('exportDb + importDb roundtrip', () => {
    insert(TABLE, TEST_SAVE)
    insert(TABLE, { ...TEST_SAVE, id: 'test-2', name: 'セーブ2' })
    const exported = exportDb()
    expect(exported[TABLE]).toHaveLength(2)

    clearDb()
    expect(count(TABLE)).toBe(0)
    importDb(exported)
    expect(count(TABLE)).toBe(2)
  })

  it('selectById returns null for missing', () => {
    expect(selectById(TABLE, 'nope')).toBeNull()
  })
})
