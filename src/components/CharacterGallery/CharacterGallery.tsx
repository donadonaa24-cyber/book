import { useEffect, useRef, useState } from "react";
import { characterWorks, setCharacterHash } from "../../data/characters";
import type { Character } from "../../data/characters";
import { assetUrl } from "../../lib/assets";
import "./characterGallery.css";

interface Props {
  initialWorkId: string;
  onClose: () => void;
}

export function CharacterGallery({ initialWorkId, onClose }: Props) {
  const [workId, setWorkId] = useState(initialWorkId);
  const [selected, setSelected] = useState<Character | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const work = characterWorks.find((item) => item.id === workId) ?? characterWorks[0];

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { setCharacterHash(work.id); }, [work.id]);
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);

  function closeImage() {
    dialog.current?.close();
    setSelected(null);
  }

  return (
    <main className="characters">
      <header className="characters__header">
        <button type="button" className="btn btn--bar" onClick={onClose}>← 本棚に戻る</button>
        <p className="characters__eyebrow">ANIANI BUNKO</p>
        <h1 ref={heading} tabIndex={-1}>登場人物</h1>
        <p>物語のそばにいる人たちを、イメージイラストで。</p>
        <p className="characters__credit">キャラクターイラストは生成AIを使用して制作しています。</p>
      </header>
      <nav className="characters__works" aria-label="作品を選ぶ">
        {characterWorks.map((item) => (
          <button key={item.id} type="button" className="btn" aria-pressed={item.id === work.id} onClick={() => setWorkId(item.id)}>
            {item.title}
          </button>
        ))}
      </nav>
      <section aria-labelledby="characters-work-title">
        <h2 id="characters-work-title">{work.title}</h2>
        <div className="characters__grid">
          {work.characters.map((character) => (
            <article className="character" key={character.id}>
              <button type="button" className="character__image" aria-label={`${character.name}のイラストを大きく見る`} onClick={() => setSelected(character)}>
                <img src={assetUrl(character.image)} alt={character.name} width={1024} height={1536} loading="lazy" />
                <span>大きく見る</span>
              </button>
              <div className="character__text">
                <p className="character__role">{character.role}</p>
                <h3>{character.name}</h3>
                <p>{character.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <p className="characters__portal"><a href="https://donadonaa24-cyber.github.io/aniani-asobiba/" target="_blank" rel="noopener noreferrer">あにあにポータルの無料ガチャでも、このイラストを集められます ↗</a></p>
      <dialog ref={dialog} className="character-zoom" aria-labelledby="character-zoom-title" onClose={() => setSelected(null)}>
        {selected && <>
          <header>
            <h2 id="character-zoom-title">{selected.name}</h2>
            <button type="button" className="btn btn--bar" onClick={closeImage} autoFocus>閉じる ×</button>
          </header>
          <img src={assetUrl(selected.image)} alt={selected.name} width={1024} height={1536} />
          <p>{selected.description}</p>
          <p className="characters__credit">このイラストは生成AIを使用して制作しています。</p>
        </>}
      </dialog>
    </main>
  );
}
