// content.js — Stray Dog DevTools 連携
// window.__debug 経由でゲームを操作し、結果を popup に返す

;(() => {
  const EXT_ID = 'straydog-devtools'

  // popup からのメッセージをリッスン
  window.addEventListener('message', (e) => {
    if (e.source !== window || e.data?.ext !== EXT_ID) return
    const { cmd, args } = e.data

    if (cmd === 'ping') {
      window.postMessage({ ext: EXT_ID, type: 'pong', hasDebug: !!(window as any).__debug }, '*')
      return
    }

    const debug = (window as any).__debug
    if (!debug) {
      window.postMessage({ ext: EXT_ID, type: 'error', msg: '__debug API not available (need #debug hash)' }, '*')
      return
    }

    try {
      // cmd フォーマット: "story.show" or "state.get" or "spell.encode"
      const parts = cmd.split('.')
      let obj: any = debug
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]]
        if (!obj) throw new Error(`unknown path: ${parts.slice(0, i + 1).join('.')}`)
      }
      const fn = obj[parts[parts.length - 1]]
      if (typeof fn !== 'function') throw new Error(`not a function: ${cmd}`)

      const result = Array.isArray(args) ? fn(...args) : fn(args)
      // Promise の場合
      if (result instanceof Promise) {
        result.then(r => window.postMessage({ ext: EXT_ID, type: 'result', cmd, data: r }, '*'))
          .catch(err => window.postMessage({ ext: EXT_ID, type: 'error', cmd, msg: err.message }, '*'))
      } else {
        window.postMessage({ ext: EXT_ID, type: 'result', cmd, data: result }, '*')
      }
    } catch (err: any) {
      window.postMessage({ ext: EXT_ID, type: 'error', cmd, msg: err.message }, '*')
    }
  })

  // ページに読み込まれたことを通知
  window.postMessage({ ext: EXT_ID, type: 'ready' }, '*')
  console.log('[StrayDog DevTools] content script loaded')
})()
