export type SpotId = string
export type MiniGameType = 'puzzle' | 'puyo' | 'simon' | 'quiz4' | 'final'

// ============================================================================
// Intro Text
// ============================================================================

export interface IntroLine {
  text: string
  speed: number
  color?: string
}

export const INTRO_LINES: IntroLine[] = [
  { text: '壁のQRコードを読み取ると、', speed: 40 },
  { text: 'そこには ひと組の夫妻の姿があった。', speed: 40 },
  { text: '', speed: 200 },
  { text: '「あの…すみません。」', speed: 50, color: '#ffd700' },
  { text: '「うちの犬がいなくなってしまったんです。」', speed: 50, color: '#ffd700' },
  { text: '「妻が妊娠中で、動けなくて…どうか…」', speed: 50, color: '#ffd700' },
  { text: '', speed: 200 },
  { text: 'あなたは夫妻の代わりに、', speed: 40 },
  { text: '犬を探すことにした——', speed: 40 },
  { text: '', speed: 400 },
  { text: '夫妻は一枚の写真を差し出した。', speed: 40 },
  { text: 'だが——写真は砕け散っている。', speed: 40 },
  { text: '元に戻せば、なにかがわかる。', speed: 40 },
]

// ============================================================================
// Story Scene
// ============================================================================

export interface StoryScene {
  icon: string
  title: string
  paragraphs: string[]
}

export const SCENE_INTRO: StoryScene = {
  icon: '📖', title: '幕1: 出会い — YON 2F',
  paragraphs: [
    '壁のQRコードを読み取ると、', 'そこには ひと組の夫妻の姿があった。', '',
    '「あの…すみません。」', '「うちの犬がいなくなってしまったんです。」', '「妻が妊娠中で、動けなくて…どうか…」', '',
    'あなたは夫妻の代わりに、', '犬を探すことにした——', '夫妻は一枚の写真を差し出した。', 'だが——写真は砕け散っている。', '',
    '元に戻せば、なにかがわかる。',
  ],
}

export const SCENE_YON2F: StoryScene = {
  icon: '📖', title: '幕2-0: YON 2F — 砕けた写真',
  paragraphs: [
    '夫妻は一枚の写真を差し出した。', 'だが——写真は砕け散っている。', '',
    '元に戻せば、なにかがわかる。', '',
    '「さぼうる の レインボウを さがせ」',
  ],
}

export const SCENE_SABOURU: StoryScene = {
  icon: '🌈', title: '幕2-1: さぼうる',
  paragraphs: [
    'さぼうる名物7色クリームソーダ。虹の色を数えて。', '', '窓辺のテーブル。犬はいつもこのグラスを見つめていた。', '',
    '——犬の記憶', '"ここには、いつもガラスが揺れていた。', '　店主の手がくり出す無数のつぼみ。', '　赤、橙、黄、緑、青、藍、紫——', '　一度だけ、皿のすきまをくぐってベロを舐めたら', '　炭酸がはじけて、メロンの匂いがした。', '　あの頃、まだ　夫は一人だった。"',
  ],
}

export const SCENE_HIBIKI: StoryScene = {
  icon: '🔔', title: '幕2-2: 響（野外彫刻）',
  paragraphs: [
    '丸山ともみ作「響」。曲線が風を受けて鳴らなかった音。', '', '犬は曲線に耳を寄せていた。金属の奥で、かすかな響き。', '',
    '——犬の記憶', '"風の強い午後、私はここで座り込んだ。', '　金属のカーブが風をかみ砕いて、', '　聞こえるはずのない音を聞かせてくれた。', '　夫が来たのはそのあとだ。', '　リードを握った手が震えていた。', '　彼は何か言いたそうだったが、', '　結局、何も言わなかった。"',
  ],
}

export const SCENE_KANDABASHI: StoryScene = {
  icon: '🗽', title: '幕2-3: 神田橋公園',
  paragraphs: [
    '金色に輝く豊展観守像。その名をよく見て。', '', '金の像の前で立ち止まる。もうすぐだ。', '',
    '——犬の記憶', '"ここで人はいちばん金ピカだ。', '　じっとして、一ミリも動かない。', '　ときどき鳩が頭にとまるが、', '　それでも動かない。すごいぞ。', '　私は3秒も待てない。', '', '　あの日、二人はこの像の前で立ち止まった。', '　妻が言った。「私たち、親になるんだね」', '　夫はうなずいて、私の頭を撫でた。"',
  ],
}

export const SCENE_YON3F_STORY: StoryScene = {
  icon: '🎵', title: '幕2-4: YON 3F リビングミュージック',
  paragraphs: [
    'さぼうるの数から銅像の数を引いて。', '', '階段を上がる。音楽が近づく。', '犬は——ずっとここで、', '真空管アンプの音に耳をすませていた。', '',
    '——犬の記憶', '"ここはあったかい。', '　電気が通るとガラスが光る。', '　人間はあれを「真空管」と呼ぶ。', '　あの小さい光の中に、バッハがいるらしい。', '　私はバッハが誰か知らないけど、', '　音を聴いていると眠くなる。', '　夫と妻が探しているのも知ってる。', '　でも、もう少しだけ——', '　ここにいたい。"',
  ],
}

export const SCENE_REUNION: StoryScene = {
  icon: '🐕', title: '幕3: 再会 — YON 3F',
  paragraphs: [
    '犬を見つけた！', '', '足跡をたどって辿り着くと——', 'そこには犬がいた。', '',
    '📞 夫妻に電話', '「見つかりましたよ。大丈夫です。」', '電話の向こうで、妻の泣き声が聞こえた。',
  ],
}

export const SCENE_GOLDBERG: StoryScene = {
  icon: '🎵', title: '幕4: Goldberg 層へ',
  paragraphs: [
    '犬は階段のほうを向いた。', '', '「こっちだよ」と言うように、', 'しっぽを一度、大きく振る。', '',
    '妻のお腹が大きくなる頃には、', 'きっと、この街のすべての音が', 'バッハの変奏に聴こえる。', '',
    '尾張家の鍋がふつふつと鳴り、', '響の彫刻がかすかに震え、', '豊展観守が金のまぶたを細め、', 'さぼうるのクリームソーダが', '虹の炭酸をはじけさせる。', '',
    'Goldberg 層へ。', '君は最初の音に、たどり着いた。',
  ],
}

export const SCENE_EXTRAS: StoryScene = {
  icon: '🐾', title: '補足: 犬の言い訳（全編）',
  paragraphs: [
    'さぼうるの窓辺はいい匂いがする。', 'メロンと炭酸と、古い革の匂い。', 'クリームソーダの緑をずっと見ていたら、', 'なんだか外に出たくなった。', 'ごめん、夫くん。ごめん、妻さん。', '',
    '響の彫刻は、風の日は鳴らない。', 'それなのに、耳を当てると低い音がしている。', '誰にも聞こえない音。私にだけは、聞こえている。', '',
    '金色の像は動かない。', 'でも、鳩が頭に乗っても微動だにしないなんて、', 'すごいよね。私には無理。あと3秒で駆け出しちゃう。', '',
    '3階に来たら、思い出した。', 'ここだ。ここだった。', '真空管の光は、さぼうるのメロンソーダと同じ色。', 'ずっと探してた音が、ここにあった。', 'ただそれだけなんだ。ただそれだけで——', 'ずいぶん遠くまで来ちゃったね。',
  ],
}

export const STORY_SCENES: StoryScene[] = [
  SCENE_INTRO,
  SCENE_YON2F,
  SCENE_SABOURU,
  SCENE_HIBIKI,
  SCENE_KANDABASHI,
  SCENE_YON3F_STORY,
  SCENE_REUNION,
  SCENE_GOLDBERG,
  SCENE_EXTRAS,
]

// ============================================================================
// Spots
// ============================================================================

export interface Spot {
  id: SpotId
  name: string
  icon: string
  hint: string
  game: MiniGameType
  story: string
  storyParagraphs: string[]
  badge: string
  badgeName: string
  lat: number
  lng: number
}

export const SPOTS: Spot[] = [
  {
    id: 's0', name: 'YON 2F', icon: '📖',
    hint: '壁のQRコードを読み取ると、夫妻が待っている。砕けた写真を元に戻せ。',
    game: 'puzzle',
    story: '夫妻の写真は砕け散っていた。元に戻すと「さぼうるのレインボウをさがせ」の文字。',
    storyParagraphs: SCENE_YON2F.paragraphs,
    badge: '📖', badgeName: '出会いのバッジ',
    lat: 35.69598, lng: 139.75765,
  },
  {
    id: 's1', name: 'さぼうる', icon: '🍨',
    hint: '昭和のクリームソーダが名物の喫茶店。ピンクの外壁と白い看板が目印。',
    game: 'puyo',
    story: '犬は窓辺でいつもこのグラスを見つめていた。あの頃、まだ夫は一人だった。',
    storyParagraphs: SCENE_SABOURU.paragraphs,
    badge: '🍨', badgeName: 'クリームソーダのバッジ',
    lat: 35.69580, lng: 139.75800,
  },
  {
    id: 's2', name: '響（野外彫刻）', icon: '🔔',
    hint: '細い路地を抜けた先にある、曲線の金属彫刻。風が通り抜ける音が聞こえる場所。',
    game: 'simon',
    story: '犬は曲線に耳を寄せていた。金属の奥で、夫のリードを握る手が震えていたのを覚えている。',
    storyParagraphs: SCENE_HIBIKI.paragraphs,
    badge: '🔔', badgeName: '彫刻のバッジ',
    lat: 35.69412, lng: 139.75954,
  },
  {
    id: 's3', name: '神田橋公園', icon: '🗽',
    hint: '金ピカの像が立っている小さな公園。鳥が頭にとまっても動かない。',
    game: 'quiz4',
    story: '金の像の前で、妻が言った。「私たち、親になるんだね」',
    storyParagraphs: SCENE_KANDABASHI.paragraphs,
    badge: '🗽', badgeName: '金ピカのバッジ',
    lat: 35.69480, lng: 139.76500,
  },
  {
    id: 's4', name: 'YON 3F リビングミュージック', icon: '🎵',
    hint: '* 4つのヒント玉を集めると場所が開く *',
    game: 'final',
    story: '犬はずっとここで、真空管アンプの音に耳をすませていた。',
    storyParagraphs: SCENE_YON3F_STORY.paragraphs,
    badge: '', badgeName: '',
    lat: 35.69598, lng: 139.75765,
  },
]

export const BADGE_SPOTS = SPOTS.filter(s => s.id !== 's4')

// Maps spot id → STORY_SCENES index for story viewer
export const SPOT_SCENE_INDEX: Record<SpotId, number> = { s0: 1, s1: 2, s2: 3, s3: 4, s4: 5 }
