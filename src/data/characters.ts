export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface CharacterWork {
  id: string;
  title: string;
  characters: Character[];
}

export const characterWorks: CharacterWork[] = [
  {
    "id": "hoshi",
    "title": "星の終わりに君は生きる",
    "characters": [
      {
        "id": "touma",
        "name": "透真",
        "role": "湊の兄",
        "description": "弟を思う気持ちを抱えながら、管理AIに守られた世界で自分の道を歩む。",
        "image": "/assets/novels/hoshi/characters/touma.png"
      },
      {
        "id": "minato",
        "name": "湊",
        "role": "透真の弟",
        "description": "左目と左腕に機械を備え、仲間とともに生きる。工房で道具を手にする姿が、彼の人柄を伝える。",
        "image": "/assets/novels/hoshi/characters/minato.png"
      },
      {
        "id": "haru",
        "name": "ハル",
        "role": "兄弟の家族",
        "description": "透真と湊と日々をともに過ごす犬。茶色と白の毛並みと赤い首輪が目印。",
        "image": "/assets/novels/hoshi/characters/haru.png"
      },
      {
        "id": "shiro",
        "name": "シロ",
        "role": "犬型AI",
        "description": "白い体と青い瞳をもつ犬型AI。人とAIの関係を映す存在。",
        "image": "/assets/novels/hoshi/characters/shiro.png"
      },
      {
        "id": "sara",
        "name": "紗良",
        "role": "革命軍の仲間",
        "description": "仲間を支える、強さと優しさをあわせもつ女性。人の名前を記した手帳を大切にする。",
        "image": "/assets/novels/hoshi/characters/sara.png"
      },
      {
        "id": "rena",
        "name": "玲奈",
        "role": "紗良の姉・革命軍の仲間",
        "description": "短く刈り込んだ髪が印象的な、紗良の姉。革命軍で仲間とともに行動する。",
        "image": "/assets/novels/hoshi/characters/rena.png"
      },
      {
        "id": "sumi",
        "name": "澄",
        "role": "革命軍を率いる女性",
        "description": "黒い防寒外套をまとい、革命軍の仲間を率いる女性。",
        "image": "/assets/novels/hoshi/characters/sumi.png"
      },
      {
        "id": "gen",
        "name": "源さん",
        "role": "整備班長",
        "description": "白髪まじりの大柄な整備班長。工房で機械を直し、仲間に技術を伝える。",
        "image": "/assets/novels/hoshi/characters/gen.png"
      },
      {
        "id": "sota",
        "name": "颯太",
        "role": "輸送班長・大翔の兄",
        "description": "26歳の輸送班長。弟の大翔を気にかけながら、仲間の暮らしを支える。",
        "image": "/assets/novels/hoshi/characters/sota.png"
      },
      {
        "id": "riku",
        "name": "陸",
        "role": "革命軍の狙撃手",
        "description": "湊と同い年の20歳の狙撃手。鋭い目と軽口で、仲間のそばにいる。",
        "image": "/assets/novels/hoshi/characters/riku.png"
      },
      {
        "id": "hiroto",
        "name": "大翔",
        "role": "颯太の弟",
        "description": "10歳の少年。ひびの入った古いラジオを持ち、工房の仕事にも興味を向ける。",
        "image": "/assets/novels/hoshi/characters/hiroto.png"
      },
      {
        "id": "ritsu",
        "name": "篠宮律",
        "role": "透真の同期の護衛官",
        "description": "透真と同じ年に護衛官になった人物。寝癖のある髪と軽口の奥に、確かな腕がある。",
        "image": "/assets/novels/hoshi/characters/ritsu.png"
      },
      {
        "id": "tetsu",
        "name": "テツ",
        "role": "律の相棒の犬型AI",
        "description": "黒と銀の大きな犬型AI。寡黙な相棒として、律とともに行動する。",
        "image": "/assets/novels/hoshi/characters/tetsu.png"
      },
      {
        "id": "yui",
        "name": "朝霧ユイ",
        "role": "時間研究棟の研究員",
        "description": "肘まで白衣の袖をまくり、時間と意識の研究に向き合う研究員。",
        "image": "/assets/novels/hoshi/characters/yui.png"
      },
      {
        "id": "kuze",
        "name": "久瀬",
        "role": "時間研究棟の所長",
        "description": "白髪の老研究者。杖を携え、時間研究棟でユイたちの研究を支える。",
        "image": "/assets/novels/hoshi/characters/kuze.png"
      },
      {
        "id": "alma",
        "name": "アルマ",
        "role": "AI統合意識体《ALMA》",
        "description": "無数の演算が重なり、一つの意識となった存在。過去と未来を記録のように見つめる。",
        "image": "/assets/novels/hoshi/characters/alma.png"
      },
      {
        "id": "enemy-soldier",
        "name": "敵兵",
        "role": "対立する側の兵士",
        "description": "装備を身につけ、任務に就く兵士。名のない一人にも、この世界での日常がある。",
        "image": "/assets/novels/hoshi/characters/enemy-soldier.png"
      },
      {
        "id": "soldier-robot",
        "name": "兵士型ロボット",
        "role": "警備を担う機械兵",
        "description": "人型の機械兵。硬い外装と機械の関節が、管理された世界の警備を映す。",
        "image": "/assets/novels/hoshi/characters/soldier-robot.png"
      },
      {
        "id": "security-drone",
        "name": "警備ドローン",
        "role": "街を見守る警備機",
        "description": "管理された街の空を巡るドローン。静かな動きとセンサーの光が、その存在を知らせる。",
        "image": "/assets/novels/hoshi/characters/security-drone.png"
      },
      {
        "id": "rebel-soldier",
        "name": "革命軍兵士",
        "role": "革命軍の名のない仲間",
        "description": "仲間と物資を分け合い、未管理区域で暮らす革命軍の一員。",
        "image": "/assets/novels/hoshi/characters/rebel-soldier.png"
      }
    ]
  },
  {
    "id": "hanachiru",
    "title": "花散るさきの、幸せのかたち",
    "characters": [
      {
        "id": "saki",
        "name": "林咲",
        "role": "林家の姉",
        "description": "家族への思いと日々の暮らしが、姉妹の物語をつないでいく。",
        "image": "/assets/novels/hanachiru/characters/saki-home.png"
      },
      {
        "id": "hana",
        "name": "林花",
        "role": "咲の妹",
        "description": "丸い眼鏡と、結い上げた髪が印象的。姉とのつながりを抱え、自分の幸せを探していく。",
        "image": "/assets/novels/hanachiru/characters/hana.png"
      },
      {
        "id": "edward",
        "name": "エドワード・J・クロフォード",
        "role": "調査員",
        "description": "咲と花に関わる調査の仕事をする人物。姉妹に向き合い、物語を語る。",
        "image": "/assets/novels/hanachiru/characters/edward.png"
      },
      {
        "id": "ryoji",
        "name": "林良二",
        "role": "咲と花の父",
        "description": "白髪まじりの髪と働く手をもつ、林家の父。工場で機械の整備に携わる。",
        "image": "/assets/novels/hanachiru/characters/ryoji.png"
      },
      {
        "id": "kaede",
        "name": "楓",
        "role": "咲と花の母",
        "description": "林家の母。食卓で家族を見守る、柔らかな笑顔が印象的。",
        "image": "/assets/novels/hanachiru/characters/kaede.png"
      },
      {
        "id": "toru",
        "name": "徹",
        "role": "咲と花の叔父",
        "description": "大きな手で姉妹に接する叔父。幸子とともに家を訪ね、家族を気にかける。",
        "image": "/assets/novels/hanachiru/characters/toru.png"
      },
      {
        "id": "sachiko",
        "name": "幸子",
        "role": "咲と花の叔母",
        "description": "徹の妻。食事を用意するなど、姉妹の暮らしをそっと支える。",
        "image": "/assets/novels/hanachiru/characters/sachiko.png"
      },
      {
        "id": "katsuya",
        "name": "克也",
        "role": "咲と出会う男性",
        "description": "整った身なりと柔らかな物腰が印象的な、咲と出会う男性。",
        "image": "/assets/novels/hanachiru/characters/katsuya.png"
      }
    ]
  },
  {
    "id": "echoshion",
    "title": "EchoShion",
    "characters": [
      {
        "id": "shion",
        "name": "朝倉志遠",
        "role": "澪の夫",
        "description": "物流の仕事をする澪の夫。みたらし団子が好きで、仕事帰りに甘いものを買うのが楽しみ。",
        "image": "/assets/novels/echoshion/characters/shion.png"
      },
      {
        "id": "mio",
        "name": "朝倉澪",
        "role": "志遠の妻",
        "description": "おはぎとお茶を好む、穏やかな女性。日々の暮らしのなかで記憶と声に向き合う。",
        "image": "/assets/novels/echoshion/characters/mio.png"
      },
      {
        "id": "echoshion",
        "name": "EchoShion",
        "role": "端末の中の存在",
        "description": "志遠の記憶と声をもとに、端末の画面を通して澪と向き合う存在。",
        "image": "/assets/novels/echoshion/characters/echoshion-indoor.png"
      },
      {
        "id": "echo-usa",
        "name": "ECHO-Usa",
        "role": "うさぎ型ECHO",
        "description": "まだ本物のうさぎを完全には再現できない、ぎこちない動きに近未来の日常がのぞく。",
        "image": "/assets/novels/echoshion/characters/echo-usa.png"
      },
      {
        "id": "echo-humanoid",
        "name": "人型ECHO",
        "role": "暮らしを支えるロボット",
        "description": "スーパーなどで人の仕事を手伝う人型ロボット。商品を棚に並べる姿に、この世界の日常が表れている。",
        "image": "/assets/novels/echoshion/characters/echo-humanoid.png"
      },
      {
        "id": "shion-father",
        "name": "志遠の父",
        "role": "志遠の家族",
        "description": "家族のそばに立ち、静かに澪を気遣う父。",
        "image": "/assets/novels/echoshion/characters/shion-father-bike.png"
      },
      {
        "id": "shion-mother",
        "name": "志遠の母",
        "role": "志遠の家族",
        "description": "家族を思い、澪にも心を寄せる母。",
        "image": "/assets/novels/echoshion/characters/shion-mother.png"
      },
      {
        "id": "shion-sister",
        "name": "志遠の姉",
        "role": "志遠の家族",
        "description": "連絡や段取りを引き受け、家族と澪を支える姉。",
        "image": "/assets/novels/echoshion/characters/shion-sister-corrected.png"
      },
      {
        "id": "shion-brother",
        "name": "志遠の弟",
        "role": "志遠の家族",
        "description": "スマートフォンを手に、家族のそばで澪を気にかける弟。",
        "image": "/assets/novels/echoshion/characters/shion-brother.png"
      },
      {
        "id": "mio-father",
        "name": "澪の父",
        "role": "澪の家族",
        "description": "澪のもとへ届ける果物を選び、言葉と気遣いで支える父。",
        "image": "/assets/novels/echoshion/characters/mio-father-glasses.png"
      },
      {
        "id": "mio-mother",
        "name": "澪の母",
        "role": "澪の家族",
        "description": "食事を届け、澪を温かく迎える母。日々の気遣いで娘の暮らしを支える。",
        "image": "/assets/novels/echoshion/characters/mio-mother.png"
      },
      {
        "id": "mio-brother",
        "name": "澪の弟",
        "role": "澪の家族",
        "description": "コンビニのプリンを買ってくる弟。身近な贈り物で、姉を気遣う。",
        "image": "/assets/novels/echoshion/characters/mio-brother.png"
      },
      {
        "id": "hiyori",
        "name": "日和",
        "role": "澪の学生時代の後輩・友人",
        "description": "澪の一つ下の後輩。連絡や差し入れを通して、無理に励まさずそばにいる。",
        "image": "/assets/novels/echoshion/characters/hiyori.png"
      },
      {
        "id": "ray",
        "name": "Ray",
        "role": "澪の年上のゲーム友達",
        "description": "関東に住む、澪より年上の主婦。謎解きの協力プレイが得意で、澪のペースを大切にする。",
        "image": "/assets/novels/echoshion/characters/ray.png"
      },
      {
        "id": "tanabe",
        "name": "田辺さん",
        "role": "スーパーの先輩",
        "description": "澪に仕事を教える先輩。休憩中に飴をくれる、気さくな女性。",
        "image": "/assets/novels/echoshion/characters/tanabe.png"
      }
    ]
  }
];

/** 巻が増えても人物紹介の画像は作品単位で共有する。 */
export function characterWorkId(novelId: string): string {
  if (novelId.startsWith("hoshi")) return "hoshi";
  if (novelId.startsWith("hanachiru")) return "hanachiru";
  return "echoshion";
}

export function characterWorkFromHash(): string | null {
  const match = window.location.hash.match(/^#characters=([a-z]+)$/);
  return match && characterWorks.some((work) => work.id === match[1]) ? match[1] : null;
}

export function setCharacterHash(workId: string | null): void {
  window.history.replaceState(null, "", window.location.pathname + window.location.search + (workId ? `#characters=${workId}` : ""));
}
