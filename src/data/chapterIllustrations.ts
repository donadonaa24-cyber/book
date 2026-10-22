/** 同じ人物画像は作品全体で1回。登場・回想する章末に分散する。 */
export const chapterIllustrations: Record<string, Record<string, readonly string[]>> = {
  // 第一部は兄弟の子ども時代が中心のため人物画は置かない（設定画は src/data/novels/hoshi/index.ts）。
  // 人物画は二〇六九年以降の姿なので、第二部を中心に、入りきらない分を第三部へ回す。
  "hoshi-vol2": {
    // 兵士型ロボットは作者指定の世界観資料。本文の四脚型防衛機とは別。
    "ch-15": ["enemy-soldier", "soldier-robot", "kuze"],
    "ch-16": ["sara", "touma"],
    "ch-17": ["rena", "rebel-soldier"],
    "ch-19": ["minato"],
    "ch-20": ["shiro", "haru"],
    "ch-21": ["yui"],
    "ch-22": ["riku"],
  },
  "hoshi-vol3": {
    "ch-33": ["ritsu", "tetsu", "security-drone"],
    "ch-34": ["alma"],
    "ch-35": ["sumi"],
    "ch-36": ["sota"],
    "ch-37": ["hiroto"],
    "ch-39": ["gen"],
  },
  // 旧特別編（hoshi2）は本棚から外したため配置なし。
  hanachiru: {
    "ch-02": ["saki", "kaede", "sachiko"],
    "ch-03": ["ryoji", "toru"],
    "ch-17": ["katsuya"],
  },
  hanachiru2: {
    "ch-24": ["hana"],
    "ch-27": ["edward"],
  },
  echoshion: {
    "ch-00": ["shion", "echo-humanoid"],
    "ch-01": ["shion-mother", "mio-mother"],
    "ch-02": ["echo-usa", "hiyori"],
    "ch-04": ["echoshion"],
    "ch-05": ["mio"],
    "ch-10": ["shion-sister"],
    "ch-11": ["shion-father", "tanabe"],
    "ch-12": ["mio-father", "mio-brother"],
    "ch-15a": ["ray"],
    "ch-20": ["shion-brother"],
  },
};
