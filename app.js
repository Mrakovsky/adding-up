'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {}});

// データを組み替えるためのMapデータ
const prefectureDataMap = new Map();

// ▼ファイルを行単位で処理する
rl.on('line', lineString => {

  // 列別のデータに分割
  const colmuns = lineString.split(','); 
  const year = parseInt(colmuns[0]); // 年
  const prefecture = colmuns[1]; // 都道府県
  const popu = parseInt(colmuns[3]);// 人工（15〜19歳の人口）

  // 2010年または2015年のデータのみ処理する
  if (year === 2010 || year === 2015) {

    let value = null;
    if (!prefectureDataMap.has(prefecture)) {
      // 1週目でデータがないときはvalueを初期化する
      value = {
        popu10: 0, // 2010年の人口データ
        popu15: 0, // 2015年の人口データ
        change: null // 変化率
      };

    } else {
      // 2週目以降で既に都道府県のキーが有る場合
      value = prefectureDataMap.get(prefecture);
    }

    // 年度別のデータをセット
    if (year === 2010) {
      value.popu10 = popu;
    } else if (year === 2015) {
      value.popu15 = popu;
    }
    
    // 都道府県をキーにしてデータを登録
    prefectureDataMap.set(prefecture, value);
  }
});

// ファイルの読み込み終了時に処理したいコードを書く
rl.on('close', () => {
  // 変化率を計算
  for (const [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }

  // ランキング化（並べ替えられた）したデータを作成
  const rankingArray = Array.from(prefectureDataMap)
    .sort((pair1, pair2) => {
      // 並び替えのルールを書く
      return pair1[1].change - pair2[1].change;
    }
  );

  // データを表示用に整形する
  const rankingStrings = rankingArray.map(
    ([key, value], rank) => {
    // 1行ずつどのように整形するかのルールを書く
    return `${rank+1}位 ${key}: ${value.popu10} => ${value.popu15} 変化率: ${value.change}`;
  });

  console.log(rankingStrings);
});