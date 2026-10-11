/** 同じ人物画像は作品全体で1回。登場・回想する章末に分散する。 */
export const chapterIllustrations: Record<string, Record<string, readonly string[]>> = {
  hoshi: {
    "ch-01": ["security-drone"],
    "ch-02": ["haru", "sumi", "rebel-soldier"],
    "ch-03": ["gen"],
    "ch-04": ["yui", "kuze", "ritsu"],
    "ch-05": ["hiroto", "riku", "minato"],
    "ch-06": ["rena", "tetsu", "touma"],
    "ch-07": ["enemy-soldier"],
    "ch-08": ["sara"],
    // 兵士型ロボットは作者指定の世界観資料。本文の四脚型防衛機とは別。
    "ch-09": ["soldier-robot"],
  },
  hoshi2: {
    "ch-01": ["shiro"],
    "ch-03": ["sota"],
    "ch-05": ["alma"],
  },
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
