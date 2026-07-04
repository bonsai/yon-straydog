// popup.js — Stray Dog DevTools popup

const EXT_ID = 'straydog-devtools'
let tabId: number | null = null
let connected = false

const statusEl = document.getElementById('status')!
const resultEl = document.getElementById('result')!

function log(msg: string, type = '') {
  resultEl.innerHTML += `<div class="${type}">${msg}</div>`
  resultEl.scrollTop = resultEl.scrollHeight
}

function setStatus(msg: string, cls = '') {
  statusEl.textContent = msg
  statusEl.className = cls
}

// コンテンツスクリプトにメッセージを送信
function sendCmd(cmd: string, args?: any[]) {
  if (!tabId) { log('No active tab', 'err'); return }
  chrome.tabs.sendMessage(tabId, { ext: EXT_ID, cmd, args: args ?? [] }, (resp) => {
    if (chrome.runtime.lastError) {
      log(`⚠️ ${chrome.runtime.lastError.message}`, 'err')
      return
    }
    if (resp?.type === 'result') {
      const data = typeof resp.data === 'object' ? JSON.stringify(resp.data, null, 2) : String(resp.data)
      log(`✅ ${cmd} → ${data}`, 'ok')
    } else if (resp?.type === 'error') {
      log(`❌ ${resp.msg}`, 'err')
    }
  })
}

// popup → content script (postMessage 経由)
function postMsg(cmd: string, args?: any[]) {
  if (!tabId) { log('No active tab', 'err'); return }
  chrome.scripting.executeScript({
    target: { tabId },
    func: (extId: string, c: string, a: any[]) => {
      window.postMessage({ ext: extId, cmd: c, args: a }, '*')
    },
    args: [EXT_ID, cmd, args ?? []],
  }).catch(err => log(`❌ ${err.message}`, 'err'))
}

// 結果のリスナー (content script からの postMessage)
window.addEventListener('message', (e) => {
  if (e.source !== window || e.data?.ext !== EXT_ID) return
  if (e.data.type === 'ready') {
    setStatus('✅ ページ接続完了', 'ok')
    connected = true
  } else if (e.data.type === 'pong') {
    setStatus(e.data.hasDebug ? '✅ __debug API 利用可能' : '⚠️ #debug が必要です', e.data.hasDebug ? 'ok' : 'err')
    connected = true
  } else if (e.data.type === 'result') {
    const data = typeof e.data.data === 'object' ? JSON.stringify(e.data.data, null, 2) : String(e.data.data)
    log(`✅ ${e.data.cmd} → ${data}`, 'ok')
  } else if (e.data.type === 'error') {
    log(`❌ ${e.data.msg}`, 'err')
  }
})

// 現在のタブを取得
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.id) {
    tabId = tabs[0].id
    setStatus('⏳ ページに接続中...')
    // content script を injection して ping
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    }).then(() => {
      setTimeout(() => {
        // content script 経由で postMessage
        chrome.scripting.executeScript({
          target: { tabId },
          func: (extId: string) => {
            window.postMessage({ ext: extId, cmd: 'ping' }, '*')
          },
          args: [EXT_ID],
        })
      }, 200)
    }).catch(err => {
      setStatus(`❌ 接続エラー: ${err.message}`, 'err')
    })
  } else {
    setStatus('❌ アクティブタブなし', 'err')
  }
})

// ── イベントバインディング ──

// data-cmd 属性のボタン: クリックで送信
document.querySelectorAll('[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = (btn as HTMLElement).dataset.cmd!
    // 空引数で呼び出す
    postMsg(cmd, [])
  })
})

// ストーリー scene 選択 + 表示ボタン
document.getElementById('story-show')?.addEventListener('click', () => {
  const sel = document.getElementById('scene-select') as HTMLSelectElement
  const idx = parseInt(sel.value, 10)
  postMsg('story.show', [idx])
})

// 呪文デコード
document.getElementById('spell-decode')?.addEventListener('click', () => {
  const input = document.getElementById('spell-input') as HTMLInputElement
  const code = input.value.trim()
  if (code.length !== 4) { log('⚠️ 4文字のひらがなを入力してください', 'err'); return }
  postMsg('spell.decode', [code])
  input.value = ''
})

// 呪文生成 → 結果を入力欄にセット
// これは特殊: data-cmd では結果が返ってこないので個別処理
document.querySelector('[data-cmd="spell.encode"]')?.addEventListener('click', () => {
  chrome.scripting.executeScript({
    target: { tabId: tabId! },
    func: () => {
      const sp = (window as any).__debug?.spell
      if (!sp) return null
      const code = sp.encode()
      // alert で表示 (popup に直接返せないので)
      return code
    },
  }).then((results) => {
    const code = results[0]?.result
    if (code) {
      const input = document.getElementById('spell-input') as HTMLInputElement
      input.value = code
      log(`🔮 呪文: ${code}`, 'ok')
    } else {
      log('❌ 呪文生成失敗 (#debug 必要)', 'err')
    }
  }).catch(err => log(`❌ ${err.message}`, 'err'))
})

// セーブ読み込み
document.getElementById('save-load')?.addEventListener('click', () => {
  const sel = document.getElementById('save-select') as HTMLSelectElement
  const id = sel.value
  postMsg('db.loadSave', [id])
})

// seed → 選択肢を最新に
document.querySelector('[data-cmd="db.seed"]')?.addEventListener('click', () => {
  chrome.scripting.executeScript({
    target: { tabId: tabId! },
    func: () => (window as any).__debug?.db?.seed(),
  }).then(() => {
    log('✅ Seed 完了', 'ok')
  }).catch(err => log(`❌ ${err.message}`, 'err'))
})

// エクスポート
document.querySelector('[data-cmd="db.export"]')?.addEventListener('click', () => {
  chrome.scripting.executeScript({
    target: { tabId: tabId! },
    func: () => (window as any).__debug?.db?.export(),
  }).then((results) => {
    const data = results[0]?.result
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      log('✅ クリップボードにコピーしました', 'ok')
    }
  }).catch(err => log(`❌ ${err.message}`, 'err'))
})
