import { completeCurrentSpot } from './hub'

interface Quiz {
  hint: string
  missing: string
  reading: string
  full: string
}

const QUIZZES: Quiz[] = [
  { hint: '一石□鳥', missing: '二', reading: 'いっせきにちょう', full: '一石二鳥' },
  { hint: '一期一□', missing: '会', reading: 'いちごいちえ', full: '一期一会' },
  { hint: '一騎□千', missing: '当', reading: 'いっきとうせん', full: '一騎当千' },
  { hint: '一網□尽', missing: '打', reading: 'いちもうだじん', full: '一網打尽' },
  { hint: '一気□成', missing: '呵', reading: 'いっきかせい', full: '一気呵成' },
  { hint: '一触即□', missing: '発', reading: 'いっしょくそくはつ', full: '一触即発' },
  { hint: '一衣□水', missing: '帯', reading: 'いちいたいすい', full: '一衣帯水' },
  { hint: '一挙□得', missing: '両', reading: 'いっきょりょうとく', full: '一挙両得' },
  { hint: '一攫□金', missing: '千', reading: 'いっかくせんきん', full: '一攫千金' },
  { hint: '一瀉□里', missing: '千', reading: 'いっしゃせんり', full: '一瀉千里' },
  { hint: '一日□秋', missing: '三', reading: 'いちじつさんしゅう', full: '一日千秋' },
  { hint: '一知□解', missing: '半', reading: 'いっちはんかい', full: '一知半解' },
  { hint: '一長□短', missing: '一', reading: 'いっちょういったん', full: '一長一短' },
  { hint: '二束□文', missing: '三', reading: 'にそくさんもん', full: '二束三文' },
  { hint: '二者□一', missing: '択', reading: 'にしゃたくいつ', full: '二者択一' },
  { hint: '□面六臂', missing: '三', reading: 'さんめんろっぴ', full: '三面六臂' },
  { hint: '三寒□温', missing: '四', reading: 'さんかんしおん', full: '三寒四温' },
  { hint: '三者□様', missing: '三', reading: 'さんしゃさんよう', full: '三者三様' },
  { hint: '四苦□苦', missing: '八', reading: 'しくはっく', full: '四苦八苦' },
  { hint: '四通□達', missing: '八', reading: 'しつうはったつ', full: '四通八達' },
  { hint: '四面□歌', missing: '楚', reading: 'しめんそか', full: '四面楚歌' },
  { hint: '五光□色', missing: '十', reading: 'ごこうじっしょく', full: '五光十色' },
  { hint: '五臓□腑', missing: '六', reading: 'ごぞうろっぷ', full: '五臓六腑' },
  { hint: '五里霧□', missing: '中', reading: 'ごりむちゅう', full: '五里霧中' },
  { hint: '七転□起', missing: '八', reading: 'しちてんはっき', full: '七転八起' },
  { hint: '七転□倒', missing: '八', reading: 'しちてんばっとう', full: '七転八倒' },
  { hint: '九牛□毛', missing: '一', reading: 'くぎゅういちもう', full: '九牛一毛' },
  { hint: '九死□生', missing: '一', reading: 'きゅうしいっしょう', full: '九死一生' },
  { hint: '十人□色', missing: '十', reading: 'じゅうにんといろ', full: '十人十色' },
  { hint: '十中□九', missing: '八', reading: 'じっちゅうはっく', full: '十中八九' },
  { hint: '百花繚□', missing: '乱', reading: 'ひゃっかりょうらん', full: '百花繚乱' },
  { hint: '百鬼夜□', missing: '行', reading: 'ひゃっきやこう', full: '百鬼夜行' },
  { hint: '百発百□', missing: '中', reading: 'ひゃっぱつひゃくちゅう', full: '百発百中' },
  { hint: '百聞□見', missing: '一', reading: 'ひゃくぶんいっけん', full: '百聞一見' },
  { hint: '千載□遇', missing: '一', reading: 'せんざいいちぐう', full: '千載一遇' },
  { hint: '千差□別', missing: '万', reading: 'せんさばんべつ', full: '千差万別' },
  { hint: '千変□化', missing: '万', reading: 'せんぺんばんか', full: '千変万化' },
]

let currentQuiz: Quiz | null = null

function pickQuiz(): Quiz {
  return QUIZZES[Math.floor(Math.random() * QUIZZES.length)]
}

export function startQuiz4(): void {
  currentQuiz = pickQuiz()
  const el = document.getElementById('quiz4-game')
  if (el) el.style.display = 'flex'
  const qEl = document.getElementById('quiz4-q')
  if (qEl) qEl.innerHTML = `□ に入る漢字は？<br><span style="font-size:1.8rem;color:#ffd700">${currentQuiz.hint}</span>`
  const hintEl = document.getElementById('quiz4-hint')
  if (hintEl) hintEl.textContent = `📖 ${currentQuiz.reading}`
  const input = document.getElementById('quiz4-input') as HTMLInputElement | null
  const fb = document.getElementById('quiz4-fb')
  if (input) { input.value = ''; input.focus(); input.placeholder = '?' }
  if (fb) fb.textContent = ''
  const btn = document.getElementById('quiz4-btn') as HTMLButtonElement | null
  if (btn) { btn.textContent = '答える'; btn.onclick = onSubmit; btn.disabled = false }
}

function onSubmit(): void {
  const input = document.getElementById('quiz4-input') as HTMLInputElement | null
  const fb = document.getElementById('quiz4-fb')
  if (!input || !fb || !currentQuiz) return
  const val = input.value.trim()
  if (val === currentQuiz.missing) {
    fb.textContent = `✅ 正解！「${currentQuiz.full}」`; fb.style.color = '#4caf50'
    const btn = document.getElementById('quiz4-btn') as HTMLButtonElement | null
    if (btn) { btn.textContent = '✓ クリア！'; btn.onclick = () => { closeQuiz4(); completeCurrentSpot() } }
  } else if (val) {
    fb.textContent = `❌ 正解は「${currentQuiz.missing}」`; fb.style.color = '#ef5350'
    input.value = ''; input.focus()
  } else {
    fb.textContent = '漢字1文字を入力'; fb.style.color = '#888'
  }
}

export function closeQuiz4(): void {
  const el = document.getElementById('quiz4-game')
  if (el) el.style.display = 'none'
}
