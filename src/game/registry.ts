import { startPuyoGame } from './puyo'
import { startSimon } from './simon'
import { startQuiz4 } from './quiz'
import { PuzzleStarter } from './puzzle-starter'
import { startTextQuiz } from './text-quiz'
import { startSortGame } from './sort-game'
import { startMatchGame } from './match-game'

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
      title: '神保町の古層 - 4人の偉人',
      items: [
        { figure: '太田道灌', hint: '江戸城を築いた武将', era: '1503年（戦国）' },
        { figure: '林羅山', hint: '湯島聖堂を創建した儒学者', era: '1657年（江戸）' },
        { figure: '夏目漱石', hint: '「吾輩は猫である」の文豪', era: '1881年（明治）' },
        { figure: '寺田寅彦', hint: '物理学者にして随筆家', era: '1907年（大正）' },
      ],
    }),
  })
}
