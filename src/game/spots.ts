export type SpotId = string
export type MiniGameType = 'puyo' | 'simon' | 'quiz4' | 'final'

export interface Spot {
  id: SpotId
  name: string
  icon: string
  hint: string         // photo hint (what to look for)
  game: MiniGameType   // which mini-game at this spot
  story: string        // story text after clearing
  puzzle: string       // compatibility
  answer: string
  task: string
  desc: string
  badge: string
  lat: number
  lng: number
}

export const SPOTS: Spot[] = [
  { id:'s0', name:'さぼうる', icon:'🍨', hint:'昭和のクリームソーダが名物の喫茶店。ピンクの外壁と白い看板が目印。', game:'puyo', story:'犬は窓辺でいつもこのグラスを見つめていた。あの頃、まだ夫は一人だった。', puzzle:'', answer:'', task:'', desc:'', badge:'', lat:35.69580, lng:139.75800 },
  { id:'s1', name:'響（野外彫刻）', icon:'🔔', hint:'細い路地を抜けた先にある、曲線の金属彫刻。風が通り抜ける音が聞こえる場所。', game:'simon', story:'犬は曲線に耳を寄せていた。金属の奥で、夫のリードを握る手が震えていたのを覚えている。', puzzle:'', answer:'', task:'', desc:'', badge:'', lat:35.69412, lng:139.75954 },
  { id:'s2', name:'神田橋公園', icon:'🗽', hint:'金ピカの像が立っている小さな公園。鳥が頭にとまっても動かない。', game:'quiz4', story:'金の像の前で、妻が言った。「私たち、親になるんだね」', puzzle:'', answer:'', task:'', desc:'', badge:'', lat:35.69480, lng:139.76500 },
  { id:'s3', name:'YON 3F リビングミュージック', icon:'🎵', hint:'* 3つのヒント玉を集めると場所が開く *', game:'final', story:'犬はずっとここで、真空管アンプの音に耳をすませていた。', puzzle:'', answer:'', task:'', desc:'', badge:'', lat:35.69598, lng:139.75765 },
]
