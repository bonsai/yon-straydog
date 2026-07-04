# TypeScript 修正案 — UX改善

> 現状のコードベースに対するTypeScriptの改善提案。UX向上を目的とする。

---

## 1. アドベンチャーシステムの統一

### 問題

テキスト表示システムが2つ並存している:

| システム | ファイル | 使用箇所 |
|---------|---------|---------|
| Stepキュー + startAdventure | `game-state.ts` + `adventure.ts` | イントロ (buildIntroSteps) |
| showAdventureText | `main.ts:174` | HUB → 各スポットストーリー |

`showAdventureText` は簡易パラグラフ表示で、Stepシステムと重複している。

### 修正案

`showAdventureText` を廃止し、`buildStorySteps` + `startAdventure` に統合する。

```typescript
// main.ts の呼び出し元
// 修正前:
showAdventureText(paras, 'MAPを開く', () => startSpotMap(nextSpot.id))

// 修正後:
const steps = buildStorySteps(icon, title, paras, () => startSpotMap(nextSpot.id), 'play')
setSteps(steps)
startAdventure()
```

**効果**: コード重複削減、テキスト表示の挙動が统一される。

---

## 2. テキスト自動フロー + 末尾だけ はい/いいえ

### 問題

現在の `adventure.ts` はテキストStepごとに はい/いいえ を表示する。ユーザー要望: 「テキストブロックは流れてから、ゲームをするかやめるかのみ はい/いいえ」

### 修正案

`Step` 型に `auto` フラグを追加し、`type: 'choice'` を追加する。

```typescript
// game-state.ts
export interface Step {
  type: 'text' | 'action' | 'choice'
  text?: string
  action?: () => void
  nextPhase?: GamePhase
  auto?: boolean       // true: 自動送り（タイマー）
  choiceLabel?: string // choice の質問文
}
```

```typescript
// adventure.ts — text 処理
if (step.type === 'text') {
  textEl.textContent = step.text ?? ''
  if (step.auto) {
    choicesEl.style.display = 'none'
    setTimeout(goNext, 3000) // 3秒自動送り
  } else {
    choicesEl.style.display = 'none'
    // タップで次へ（シンプルなnext動作）
    overlay.onclick = goNext
  }
}
```

```typescript
// adventure.ts — choice 処理
if (step.type === 'choice') {
  textEl.textContent = step.choiceLabel ?? 'ゲームをするかやめるか？'
  choicesEl.style.display = 'flex'
  // yes → 実行, no → 何もしない
}
```

**効果**: テキストは自動的に流れ、ユーザーは末尾でゲーム参加の意思決定のみ行う。

---

## 3. GPS デフォルトモックモード

### 問題

現在の `map.ts` は常に実GPSから開始し、8秒後にモックにフォールバックする。デバッグ時に無駄な待ち時間が発生する。

### 修正案

`startGPS()` にモック優先オプションを追加。

```typescript
// map.ts
let forceMock = false

export function setForceMock(v: boolean): void {
  forceMock = v
}

function startGPS(): void {
  if (forceMock) { startMockGPS(); return }
  // 既存のGPS処理...
}
```

または、URLハッシュ `#debug` でモックモード起動:

```typescript
// main.ts
if (location.hash === '#debug') {
  // debug mode: mock GPS, show progress, etc.
}
```

**効果**: デバッグ時の待ち時間解消。

---

## 4. イベントリスナーのリーク防止

### 問題

`start4x4Puzzle()` が呼ばれるたびに `puzzle4-close` と `goBtn` に `addEventListener` を追加している。解除しないため、再表示時にリスナーが重複する。

```typescript
// main.ts:159-160
document.getElementById('puzzle4-close')?.addEventListener('click', () => { ... })
goBtn.addEventListener('click', () => { ... })
```

### 修正案

`once` オプションを使うか、クリーンアップ関数を返す。

```typescript
// 案A: once
closeBtn.addEventListener('click', handler, { once: true })

// 案B: AbortController
const ac = new AbortController()
closeBtn.addEventListener('click', handler, { signal: ac.signal })
// クリーンアップ: ac.abort()
```

**効果**: メモリリーク防止、意図しない多重発火を防止。

---

## 5. null 安全の強化

### 問題

`TS18047` エラーが複数箇所で発生。`document.getElementById()` の戻り値が `null` の可能性があるが、非nullアサーション `!` で無視している。

```typescript
// 現状
const textEl = document.getElementById('intro-text')!
```

### 修正案

ガード節または早期リターン。

```typescript
const textEl = document.getElementById('intro-text')
if (!textEl) return
```

または存在保証ユーティリティ:

```typescript
function ensure<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Element #${id} not found`)
  return el as T
}
```

**効果**: ランタイムエラー防止、デバッグ性向上。

---

## 6. Stepキュー終了後のフェーズ遷移の明確化

### 問題

`advanceStep()` のキュー終了処理で、`lastStep.nextPhase` を参照するが、`action` タイプ以外のStepに `nextPhase` がないと遷移が起きない。呼び出し元が混乱しやすい。

### 修正案

`setSteps` に明示的な完了時コールバックを追加。

```typescript
export function setSteps(steps: Step[], onComplete?: () => void): void {
  stepQueue = steps
  currentStep = 0
  stepCompleteCallback = onComplete ?? null
}
```

```typescript
function advanceStep(): Step | null {
  currentStep++
  if (currentStep >= stepQueue.length) {
    stepCompleteCallback?.()
    clearSteps()
    return null
  }
  return stepQueue[currentStep]
}
```

**効果**: キュー完了時の挙動が予測可能になる。

---

## 7. state の型安全性向上

### 問題

`useDogStore` は `getState()` で state + actions をスプレッドして返すため、型が不明瞭。また `state` オブジェクトが直接ミューテーションされる。

```typescript
// 現状
export const useDogStore = {
  getState: () => ({ ...state, ...actions }),
  setState: (partial: Partial<DogState>) => Object.assign(state, partial),
}
```

### 修正案

`DogState` と `DogActions` を統合したインターフェースを定義し、クローンで返す。

```typescript
export interface DogStore extends DogState, DogActions {}

// actions 内で state を直接書き換えず、setState を経由する
setAppState(s) { setState({ appState: s }) }
```

またはイミュータブルな更新:

```typescript
setState(partial) {
  Object.assign(state, { ...partial })
}
```

**効果**: 型推論が正確になり、ミューテーションの追跡が容易になる。

---

## 8. `window.__gameStarters` の型付け

### 問題

動的インポートを `window.__gameStarters` に格納しているが、`any` 型でアクセスしている。

```typescript
// hub.ts
(window as any).__gameStarters = { ... }
```

### 修正案

型定義を追加。

```typescript
// types.ts
interface GameStarters {
  [spotId: string]: () => Promise<{ start: () => void }>
}

// hub.ts
const starters: GameStarters = {
  s0: () => import('./puyo-game').then(m => m.startPuyoGame(0)),
  // ...
}
;(window as any).__gameStarters = starters
```

**効果**: 型安全な動的インポート、リファクタリング耐性。

---

## 9. CSSクラス名の定数化

### 問題

CSSクラス名（`'active'`, `'screen-enter'`, `'screen-exit'`）が文字列リテラルで複数箇所に散在。

### 修正案

```typescript
// constants.ts
export const CSS = {
  ACTIVE: 'active',
  SCREEN_ENTER: 'screen-enter',
  SCREEN_EXIT: 'screen-exit',
  HIDDEN: 'hidden',
} as const
```

**効果**: タイポ防止、リネーム時の影響範囲が明確。

---

## 10. 推奨優先順位

| 優先度 | 修正項目 | 理由 |
|--------|---------|------|
| **高** | 2. テキスト自動フロー | ユーザー要望に直接対応 |
| **高** | 3. GPSデフォルトモック | デバッグ効率 |
| **高** | 1. アドベンチャー統一 | アーキテクチャ改善 |
| **中** | 6. Step完了コールバック | バグ防止 |
| **中** | 4. イベントリスナーリーク | 品質 |
| **中** | 5. null安全 | 信頼性 |
| **低** | 7. state型安全 | リファクタリング時 |
| **低** | 8. __gameStarters型付け | 型安全 |
| **低** | 9. CSS定数化 | 保守性 |
