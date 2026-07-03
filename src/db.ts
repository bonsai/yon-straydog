// 簡易 localStorage データベース
// プレフィックス: sd_db_ で全キーを管理

export interface DbRow {
  id: string
  [key: string]: unknown
}

const PREFIX = 'sd_db_'
const META_KEY = PREFIX + '_meta'

interface DbMeta {
  version: number
  tables: string[]
  created: string
  updated: string
}

function meta(): DbMeta {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (raw) return JSON.parse(raw) as DbMeta
  } catch { /* ignore */ }
  return { version: 1, tables: [], created: new Date().toISOString(), updated: new Date().toISOString() }
}

function saveMeta(m: DbMeta): void {
  m.updated = new Date().toISOString()
  localStorage.setItem(META_KEY, JSON.stringify(m))
}

function tableKey(table: string): string {
  return PREFIX + table
}

function readTable<T extends DbRow>(table: string): T[] {
  try {
    const raw = localStorage.getItem(tableKey(table))
    if (raw) return JSON.parse(raw) as T[]
  } catch { /* ignore */ }
  return []
}

function writeTable<T extends DbRow>(table: string, rows: T[]): void {
  localStorage.setItem(tableKey(table), JSON.stringify(rows))
  const m = meta()
  if (!m.tables.includes(table)) m.tables.push(table)
  saveMeta(m)
}

// ── Public API ──

export function createTable(table: string): void {
  const m = meta()
  if (!m.tables.includes(table)) {
    m.tables.push(table)
    writeTable(table, [])
  }
}

export function dropTable(table: string): void {
  localStorage.removeItem(tableKey(table))
  const m = meta()
  m.tables = m.tables.filter(t => t !== table)
  saveMeta(m)
}

export function insert<T extends DbRow>(table: string, row: T): T {
  const rows = readTable<T>(table)
  rows.push(row)
  writeTable(table, rows)
  return row
}

export function select<T extends DbRow>(table: string, query?: Partial<T>): T[] {
  const rows = readTable<T>(table)
  if (!query || Object.keys(query).length === 0) return rows
  return rows.filter(row =>
    Object.entries(query).every(([k, v]) => (row as Record<string, unknown>)[k] === v)
  )
}

export function selectById<T extends DbRow>(table: string, id: string): T | null {
  return select<T>(table, { id } as Partial<T>)[0] ?? null
}

export function update<T extends DbRow>(table: string, id: string, changes: Partial<T>): T | null {
  const rows = readTable<T>(table)
  const idx = rows.findIndex(r => r.id === id)
  if (idx < 0) return null
  rows[idx] = { ...rows[idx], ...changes } as T
  writeTable(table, rows)
  return rows[idx]
}

export function remove(table: string, id: string): boolean {
  const rows = readTable(table)
  const idx = rows.findIndex(r => r.id === id)
  if (idx < 0) return false
  rows.splice(idx, 1)
  writeTable(table, rows)
  return true
}

export function count(table: string): number {
  return readTable(table).length
}

export function allTables(): string[] {
  return meta().tables
}

export function exportDb(): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {}
  for (const table of allTables()) {
    result[table] = readTable(table)
  }
  return result
}

export function importDb(data: Record<string, unknown[]>): void {
  for (const [table, rows] of Object.entries(data)) {
    writeTable(table, rows as DbRow[])
  }
}

export function clearDb(): void {
  for (const table of allTables()) {
    localStorage.removeItem(tableKey(table))
  }
  localStorage.removeItem(META_KEY)
}

export function seedFromUrl(url: string): Promise<number> {
  return fetch(url)
    .then(r => r.json())
    .then((data: Record<string, unknown[]>) => {
      let count = 0
      for (const [table, rows] of Object.entries(data)) {
        writeTable(table, rows as DbRow[])
        count += rows.length
      }
      return count
    })
}
