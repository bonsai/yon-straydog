import { describe, it, expect, beforeEach } from 'vitest'
import { setupTools } from '../hub'

describe('memo persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = `
      <div id="toolbar" class="">
        <button id="tool-btn-memo" class="tool-btn" data-tool="memo">📝</button>
      </div>
      <div id="tool-memo" class="tool-overlay">
        <div id="memo-head"><span>📝 メモ</span><button id="memo-close">✕</button></div>
        <textarea id="memo-textarea" placeholder="会話のメモをここに…"></textarea>
      </div>
    `
  })

  it('memo content is saved to localStorage on close', () => {
    setupTools()
    document.getElementById('tool-btn-memo')!.click()
    const ta = document.getElementById('memo-textarea') as HTMLTextAreaElement
    ta.value = '神保町で犬発見'
    document.getElementById('memo-close')!.click()
    expect(localStorage.getItem('sd_memo')).toBe('神保町で犬発見')
  })

  it('memo content is restored on reopen', () => {
    localStorage.setItem('sd_memo', 'さぼうるのレインボウ')
    setupTools()
    document.getElementById('tool-btn-memo')!.click()
    const ta = document.getElementById('memo-textarea') as HTMLTextAreaElement
    expect(ta.value).toBe('さぼうるのレインボウ')
  })

  it('empty memo is saved as empty string', () => {
    setupTools()
    document.getElementById('tool-btn-memo')!.click()
    document.getElementById('memo-close')!.click()
    expect(localStorage.getItem('sd_memo')).toBe('')
  })

  it('memo overlay is closed after close button', () => {
    setupTools()
    document.getElementById('tool-btn-memo')!.click()
    document.getElementById('memo-close')!.click()
    expect(document.getElementById('tool-memo')?.classList.contains('open')).toBe(false)
  })
})
