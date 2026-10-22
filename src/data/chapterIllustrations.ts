/** 同じ人物画像は作品全体で1回。登場・回想する章末に分散する。 */
export const chapterIllustrations: Record<string, Record<string, readonly string[]>> = {
  hoshi: {
    "ch-01": ["security-drone"],
    "ch-02": ["haru", "sumi", "rebel-soldier"],
    "ch-04": ["gen"],
    "ch-06": ["riku"],
    "ch-07": ["minato"],
    "ch-11": ["yui", "kuze", "ritsu"],
    "ch-12": ["hiroto"],
    "ch-14": ["rena", "tetsu", "touma"],
    // 兵士型ロボットは作者指定の世界観資料。本文の四脚型防衛機とは別。
    "ch-15": ["enemy-soldier", "soldier-robot"],
    "ch-16": ["sara"],
    "ch-20": ["shiro"],
    "ch-34": ["alma"],
    "ch-36": ["sota"],
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
