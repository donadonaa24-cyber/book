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
        "image": "/assets/novels/hanachiru/characters/saki.png"
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
        "image": "/assets/novels/echoshion/characters/echoshion.png"
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
