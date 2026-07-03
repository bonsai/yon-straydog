import { startPuyoGame } from './puyo'
import { startSimon } from './simon'
import { startQuiz4 } from './quiz'
import { PuzzleStarter } from './puzzle-starter'
import { startTextQuiz } from './text-quiz'
import { startSortGame } from './sort-game'
import { startMatchGame } from './match-game'
import { startCandyGame } from './candy-crush'

export function registerGameStarters(target: Record<string, () => void>): void {
  Object.assign(target, {
    s0: () => PuzzleStarter(),
    s1: () => startTextQuiz({
      question: 'さぼうる名物<br>7色レインボウ・クリームソーダ。<br>藍色（あいいろ）のシロップの味は？',
      hint: '',
      answer: 'カルピス',
      icon: '🍨',
    }),
    s2: () => startSortGame({
      title: 'バッハの代表曲を古い順に並べて',
      items: [
        { text: '無伴奏チェロ組曲' },
        { text: 'ブランデンブルク協奏曲' },
        { text: 'マタイ受難曲' },
        { text: 'ゴルトベルク変奏曲' },
      ],
    }),
    s3: () => startMatchGame({
      series: [
        {
          label: '画家シリーズ',
          items: [
            { figure: '雪舟', hint: '水墨画の祖、「秋冬山水図」', era: '1503年（戦国）' },
            { figure: '俵屋宗達', hint: '琳派の祖、「風神雷神図」', era: '1657年（江戸）' },
            { figure: '黒田清輝', hint: '日本近代洋画の父、「湖畔」', era: '1881年（明治）' },
            { figure: '竹久夢二', hint: '大正ロマンの画家、「黒船屋」', era: '1907年（大正）' },
          ],
        },
        {
          label: '文人シリーズ',
          items: [
            { figure: '世阿弥', hint: '能楽の大成者、「風姿花伝」', era: '1503年（戦国）', altEras: ['1657年（江戸）'] },
            { figure: '松尾芭蕉', hint: '俳聖、「奥の細道」', era: '1657年（江戸）' },
            { figure: '正岡子規', hint: '俳句革新、「写生」の提唱', era: '1881年（明治）' },
            { figure: '芥川龍之介', hint: '「羅生門」「蜘蛛の糸」', era: '1907年（大正）' },
          ],
        },
        {
          label: '武将シリーズ',
          items: [
            { figure: '太田道灌', hint: '江戸城を築いた名将', era: '1503年（戦国）' },
            { figure: '徳川家康', hint: '江戸幕府を開いた天下人', era: '1657年（江戸）' },
            { figure: '西郷隆盛', hint: '維新三傑、「最後の武士」', era: '1881年（明治）' },
            { figure: '乃木希典', hint: '明治天皇に殉じた軍人', era: '1907年（大正）' },
          ],
        },
      ],
    }),
  })
}
