import { test, expect } from '@playwright/test'

test.describe('画面フロー', () => {
  test('1. 初期表示: Intro画面が表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#intro')).toBeVisible()
    await expect(page.locator('#intro-skip')).toBeVisible()
  })

  test('2. スキップ→4x4パズルに遷移', async ({ page }) => {
    await page.goto('/')
    await page.locator('#intro-skip').click()
    await expect(page.locator('#puzzle4')).toBeVisible()
    await expect(page.locator('#puzzle4-grid')).toBeVisible()
  })

  test('3. パズル閉じる→Hubに遷移', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
    })
    await page.goto('/')
    await expect(page.locator('#puzzle4')).toBeVisible()
    await page.locator('#puzzle4-close').click()
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('4. Hubに4つのスポットカードが表示される', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/')
    await expect(page.locator('#spot-hub')).toBeVisible()
    await expect(page.locator('.hub-card')).toHaveCount(4)
  })

  test('5. Hubに3つのバッジボールが表示される', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/')
    await expect(page.locator('#spot-hub')).toBeVisible()
    await expect(page.locator('#hub-balls span')).toHaveCount(3)
  })

  test('6. 両方doneなら即座にHub (skip intro+puzzle)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/')
    await expect(page.locator('#spot-hub')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('デバッグモード', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/#debug')
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('7. #debug でdebug-only要素が表示される', async ({ page }) => {
    await expect(page.locator('#hub-debug-btn')).toBeVisible()
  })

  test('8. デバッグパネルを開閉できる', async ({ page }) => {
    await page.locator('#hub-debug-btn').click()
    await expect(page.locator('#debug-panel.open')).toBeVisible()
    await expect(page.locator('#debug-body')).not.toBeEmpty()
    await page.locator('#debug-close').click()
    await expect(page.locator('#debug-panel.open')).not.toBeVisible()
  })

  test('9. デバッグパネルに4スポットの情報が表示される', async ({ page }) => {
    await page.locator('#hub-debug-btn').click()
    await expect(page.locator('#debug-body')).toContainText('さぼうる')
    await expect(page.locator('#debug-body')).toContainText('響')
    await expect(page.locator('#debug-body')).toContainText('神田橋公園')
    await expect(page.locator('#debug-body')).toContainText('YON 3F')
  })

  test('10. デバッグパネルに進捗状態が表示される', async ({ page }) => {
    await page.locator('#hub-debug-btn').click()
    await expect(page.locator('#debug-body')).toContainText('badges:')
    await expect(page.locator('#debug-body')).toContainText('completed:')
  })

  test('11. window.__debug が利用可能', async ({ page }) => {
    const hasDebug = await page.evaluate(() => typeof (window as any).__debug !== 'undefined')
    expect(hasDebug).toBe(true)
  })

  test('12. __debug.screen.complete() でComplete画面表示', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.screen.complete())
    await expect(page.locator('#complete')).toBeVisible()
    await expect(page.locator('#complete-title')).toContainText('犬を見つけた')
  })

  test('13. __debug.game.puyo/simon/quiz でミニゲーム起動', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.game.puyo())
    await expect(page.locator('#puyo-game')).toBeVisible()
    await page.evaluate(() => (window as any).__debug.game.simon())
    await expect(page.locator('#simon-game')).toBeVisible()
    await page.evaluate(() => (window as any).__debug.game.quiz())
    await expect(page.locator('#quiz4-game')).toBeVisible()
  })

  test('14. __debug.data にspots/stories情報が含まれる', async ({ page }) => {
    const data = await page.evaluate(() => (window as any).__debug.data)
    expect(data.spots).toHaveLength(4)
    expect(data.stories).toHaveLength(8)
  })

  test('15. __debug.state.get() で状態を取得できる', async ({ page }) => {
    const state = await page.evaluate(() => (window as any).__debug.state.get())
    expect(state).toHaveProperty('completed')
    expect(state).toHaveProperty('badges')
    expect(state).toHaveProperty('introDone')
    expect(state).toHaveProperty('phase')
  })

  test('16. __debug.state.complete() + reset を試す', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.state.completeAll())
    const state = await page.evaluate(() => (window as any).__debug.state.get())
    expect(state.badges).toBe(3)
    await page.evaluate(() => (window as any).__debug.state.reset())
    const resetState = await page.evaluate(() => (window as any).__debug.state.get())
    expect(resetState.badges).toBe(0)
  })

  test('17. __debug.util.confetti() で紙吹雪を表示', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.util.confetti())
    const particles = page.locator('.confetti')
    await expect(particles).toHaveCount(40)
  })

  test('18. __debug.debug.panel() でデバッグパネルを開く', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.debug.panel())
    await expect(page.locator('#debug-panel.open')).toBeVisible()
    await page.evaluate(() => (window as any).__debug.debug.panelClose())
    await expect(page.locator('#debug-panel.open')).not.toBeVisible()
  })

  test('19. __debug.tool でツールを開閉', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.tool.memo())
    await expect(page.locator('#tool-memo.open')).toBeVisible()
    await page.evaluate(() => (window as any).__debug.tool.hide('memo'))
    await expect(page.locator('#tool-memo.open')).not.toBeVisible()
  })
})

test.describe('ツールバー', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/#debug')
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('20. Hub表示時にツールバーが表示される', async ({ page }) => {
    await expect(page.locator('#toolbar')).toBeVisible()
  })

  test('21. メモツールを開閉できる', async ({ page }) => {
    await page.locator('#tool-btn-memo').click()
    await expect(page.locator('#tool-memo')).toBeVisible()
    await page.locator('#memo-close').click()
    await expect(page.locator('#tool-memo')).not.toBeVisible()
  })
})

test.describe('リザルト画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/#debug')
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('22. リザルト画面が表示できる', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.screen.result('s0'))
    await expect(page.locator('#result')).toBeVisible()
    await expect(page.locator('#r-title')).toContainText('バッジを獲得')
  })

  test('23. リザルト「つづける」ボタンでHubに戻る', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.screen.result('s0'))
    await page.locator('#r-btn').click()
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('24. バッジ進捗が表示される', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.screen.result('s0'))
    await expect(page.locator('#r-progress')).not.toBeEmpty()
  })
})

test.describe('コンプリート画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/#debug')
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('25. コンプリート画面のシェア/リトライボタンが存在', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.screen.complete())
    await expect(page.locator('#complete-share-btn')).toBeVisible()
    await expect(page.locator('#complete-btn')).toBeVisible()
  })

  test('26. もう一度遊ぶボタンで全リセット→Intro', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.screen.complete())
    await page.locator('#complete-btn').click()
    await expect(page.locator('#intro')).toBeVisible()
  })
})

test.describe('ストーリー', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.goto('/#debug')
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('27. ストーリーモーダルを開ける', async ({ page }) => {
    await page.locator('#hub-story-btn').click()
    await expect(page.locator('#story-mode')).toBeVisible()
  })

  test('28. __debug.story.show() で任意のシーンを表示', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.story.show(1))
    await expect(page.locator('#story-mode')).toBeVisible()
    await expect(page.locator('#story-mode-title')).toContainText('さぼうる')
  })

  test('29. ストーリーの次へ/戻るが動作する', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.story.show(0))
    await expect(page.locator('#story-mode-next')).toBeVisible()
    await page.locator('#story-mode-next').click()
    await expect(page.locator('#story-mode-text')).not.toBeEmpty()
  })

  test('30. ストーリーマラソンが開始できる', async ({ page }) => {
    await page.evaluate(() => (window as any).__debug.story.marathon())
    await expect(page.locator('#story-mode')).toBeVisible()
    await expect(page.locator('#story-mode-title')).toContainText('幕1')
    // 最終シーンまで進めて閉じる
    for (let i = 0; i < 8; i++) {
      const btn = page.locator('#story-mode-next')
      const label = await btn.textContent()
      if (label === '閉じる ✕') break
      await btn.click()
    }
  })
})

test.describe('エッジケース', () => {
  test('31. 不明なURLでクラッシュしない', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/nonexistent')
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })
})
