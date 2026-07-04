import { test, expect } from '@playwright/test'

test.describe('進行順 画面フロー', () => {
  test('01. Intro: 夫妻写真 + タイピングテキスト', async ({ page }) => {
    await page.goto('/#reset')
    await page.waitForTimeout(1500)
    await expect(page.locator('#intro')).toBeVisible()
    await expect(page.locator('#intro-skip')).toBeVisible()
    await expect(page.locator('#intro-bg')).toBeVisible()
  })

  test('02. スキップ → 2×2 Puzzle', async ({ page }) => {
    await page.goto('/#reset')
    await page.waitForTimeout(1500)
    await page.locator('#intro-skip').click()
    await expect(page.locator('#puzzle4')).toBeVisible()
    await expect(page.locator('#puzzle4-grid')).toBeVisible()
    await expect(page.locator('.p4-tile')).toHaveCount(4)
  })

  test('03. パズル閉じる → 心配ストーリー', async ({ page }) => {
    await page.goto('/#reset')
    await page.waitForTimeout(1500)
    await page.locator('#intro-skip').click()
    await page.waitForSelector('#puzzle4', { state: 'visible' })
    await page.locator('#puzzle4-close').click()
    await page.waitForTimeout(500)
    await expect(page.locator('#adventure-overlay')).toBeVisible()
    await expect(page.locator('#adventure-text')).toContainText('心配')
  })

  test('04. 心配テキスト → 選択肢', async ({ page }) => {
    await page.goto('/#reset')
    await page.waitForTimeout(1500)
    await page.locator('#intro-skip').click()
    await page.waitForSelector('#puzzle4', { state: 'visible' })
    await page.locator('#puzzle4-close').click()
    await page.waitForSelector('#adventure-overlay', { state: 'visible' })
    // タイピング終了まで #adventure-text を click で送る
    const textArea = page.locator('#adventure-text')
    for (let i = 0; i < 10; i++) {
      const visible = await page.locator('#adv-yes').isVisible().catch(() => false)
      if (visible) break
      await textArea.click()
      await page.waitForTimeout(400)
    }
    await expect(page.locator('#adv-yes')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#adv-yes')).toContainText('近くを探す')
  })

  test('05. 「近くを探す」→ 地図 (s0パルス)', async ({ page }) => {
    await page.goto('/#reset')
    await page.waitForTimeout(1500)
    await page.locator('#intro-skip').click()
    await page.waitForSelector('#puzzle4', { state: 'visible' })
    await page.locator('#puzzle4-close').click()
    await page.waitForSelector('#adventure-overlay', { state: 'visible' })
    const textArea = page.locator('#adventure-text')
    for (let i = 0; i < 10; i++) {
      const visible = await page.locator('#adv-yes').isVisible().catch(() => false)
      if (visible) break
      await textArea.click()
      await page.waitForTimeout(400)
    }
    await page.locator('#adv-yes').click()
    await page.waitForTimeout(1000)
    await expect(page.locator('#map-wrap')).toBeVisible()
  })

  test('06. #debug/screen/hub で Hub + ツールバー', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
      const api = (window as any).__debug
      if (api?.screen?.hub) api.screen.hub()
    })
    await page.waitForTimeout(500)
    await expect(page.locator('#spot-hub')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#toolbar')).toBeVisible()
    await expect(page.locator('#tool-btn-bag')).toBeVisible()
    await expect(page.locator('#tool-btn-memo')).toBeVisible()
    await expect(page.locator('#tool-btn-camera')).toBeVisible()
    await expect(page.locator('#tool-btn-mic')).toBeVisible()
  })

  test('07. カバン: 開閉', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
      const api = (window as any).__debug
      if (api?.screen?.hub) api.screen.hub()
    })
    await page.waitForTimeout(500)
    await page.locator('#tool-btn-bag').click()
    await expect(page.locator('#tool-bag')).toBeVisible()
    await expect(page.locator('#bag-balls')).toBeVisible()
    await page.locator('#bag-close').click()
    await expect(page.locator('#tool-bag')).not.toBeVisible()
  })

  test('08. メモ: 入力＋閉じる', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
      const api = (window as any).__debug
      if (api?.screen?.hub) api.screen.hub()
    })
    await page.waitForTimeout(500)
    await page.locator('#tool-btn-memo').click()
    await expect(page.locator('#tool-memo')).toBeVisible()
    await page.locator('#memo-textarea').fill('テストメモ')
    await page.locator('#memo-close').click()
    await expect(page.locator('#tool-memo')).not.toBeVisible()
  })

  test('09. リザルト画面', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
    })
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      const api = (window as any).__debug
      api.state.complete('s0')
      api.screen.result('s0')
    })
    await expect(page.locator('#result')).toBeVisible()
    await expect(page.locator('#r-title')).toContainText('バッジを獲得')
    await expect(page.locator('#r-progress')).toContainText('🟡')
    await page.locator('#r-btn').click()
    await expect(page.locator('#spot-hub')).toBeVisible()
  })

  test('10. コンプリート画面', async ({ page }) => {
    await page.goto('/#debug/screen/complete')
    await page.waitForTimeout(2000)
    await expect(page.locator('#complete')).toBeVisible()
    await expect(page.locator('#complete-share-btn')).toBeVisible()
    await expect(page.locator('#complete-btn')).toBeVisible()
  })

  test('11. ストーリーモーダル', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    const titles = await page.evaluate(() => {
      const api = (window as any).__debug
      return api?.story?.list?.() ?? []
    })
    expect(titles.length).toBeGreaterThanOrEqual(8)
  })

  test('12. ストーリーマラソン', async ({ page }) => {
    await page.goto('/#debug/story/marathon')
    await expect(page.locator('#story-mode')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#story-mode-title')).toContainText('幕1')
  })

  test('13. 復活の呪文', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      const api = (window as any).__debug
      api.state.completeAll()
    })
    const code = await page.evaluate(() => {
      const api = (window as any).__debug
      return api.spell.encode()
    })
    expect(code).toMatch(/^[あ-ん]{4}$/)
    await page.evaluate(() => {
      const api = (window as any).__debug
      api.state.reset()
    })
    const restored = await page.evaluate((c: string) => {
      const api = (window as any).__debug
      return api.spell.decode(c)
    }, code)
    expect(restored.s0).toBe(true)
    expect(restored.s1).toBe(true)
    expect(restored.s2).toBe(true)
  })

  test('14. コンプリート→もう一度遊ぶ', async ({ page }) => {
    await page.goto('/#debug/screen/complete')
    await page.waitForTimeout(2000)
    await page.locator('#complete-btn').click()
    await expect(page.locator('#intro')).toBeVisible()
  })

  test('15. ツールバー5ボタン', async ({ page }) => {
    await page.goto('/#debug')
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      localStorage.setItem('sd_intro_done', 'true')
      localStorage.setItem('sd_4x4_done', 'true')
      const api = (window as any).__debug
      if (api?.screen?.hub) api.screen.hub()
      api.tool.toolbar(true)
    })
    await page.waitForTimeout(500)
    const btns = await page.locator('#toolbar [id^="tool-btn"]').count()
    expect(btns).toBeGreaterThanOrEqual(5)
  })
})
