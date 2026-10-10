import { useCallback, useState } from "react";
import type { Novel } from "./types/novel";
import { novels } from "./data/novels";
import { loadProgress } from "./lib/progress";
import { Bookshelf } from "./components/Bookshelf/Bookshelf";
import { CoverStage } from "./components/CoverStage/CoverStage";
import type { OpenMode } from "./components/CoverStage/CoverStage";
import { ReadingSession } from "./components/Reader/ReadingSession";
import { CharacterGallery } from "./components/CharacterGallery/CharacterGallery";
import { characterWorkFromHash, characterWorkId, setCharacterHash } from "./data/characters";

/**
 * 画面遷移
 *   shelf（本棚）→ cover（本を手に取り表紙を表示）→ reading（オープニング演出 → 読書）
 */
type Scene =
  | { name: "shelf" }
  | { name: "cover"; novel: Novel; fromRect: DOMRect }
  | { name: "reading"; novel: Novel; mode: OpenMode }
  | { name: "characters"; workId: string };

export default function App() {
  const [scene, setScene] = useState<Scene>(() => {
    const workId = characterWorkFromHash();
    return workId ? { name: "characters", workId } : { name: "shelf" };
  });

  const backToShelf = useCallback(() => {
    setCharacterHash(null);
    setScene({ name: "shelf" });
  }, []);

  if (scene.name === "characters") {
    return <CharacterGallery initialWorkId={scene.workId} onClose={backToShelf} />;
  }

  if (scene.name === "reading") {
    return <ReadingSession key={scene.novel.id} novel={scene.novel} mode={scene.mode} onExit={backToShelf} />;
  }

  return (
    <>
      <Bookshelf
        novels={novels}
        pickedId={scene.name === "cover" ? scene.novel.id : null}
        onSelect={(novel, fromRect) => setScene({ name: "cover", novel, fromRect })}
        onCharacters={() => setScene({ name: "characters", workId: "hoshi" })}
      />
      {scene.name === "cover" && (
        <CoverStage
          key={scene.novel.id}
          novel={scene.novel}
          fromRect={scene.fromRect}
          progress={loadProgress(scene.novel.id)}
          onOpen={(mode) => setScene({ name: "reading", novel: scene.novel, mode })}
          onClose={backToShelf}
          onCharacters={() => setScene({ name: "characters", workId: characterWorkId(scene.novel.id) })}
        />
      )}
    </>
  );
}
