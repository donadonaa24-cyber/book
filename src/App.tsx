import { useCallback, useState } from "react";
import type { Novel } from "./types/novel";
import { novels } from "./data/novels";
import { loadProgress } from "./lib/progress";
import { Bookshelf } from "./components/Bookshelf/Bookshelf";
import { CoverStage } from "./components/CoverStage/CoverStage";
import type { OpenMode } from "./components/CoverStage/CoverStage";
import { ReadingSession } from "./components/Reader/ReadingSession";

/**
 * 画面遷移
 *   shelf（本棚）→ cover（本を手に取り表紙を表示）→ reading（オープニング演出 → 読書）
 */
type Scene =
  | { name: "shelf" }
  | { name: "cover"; novel: Novel; fromRect: DOMRect }
  | { name: "reading"; novel: Novel; mode: OpenMode };

export default function App() {
  const [scene, setScene] = useState<Scene>({ name: "shelf" });

  const backToShelf = useCallback(() => setScene({ name: "shelf" }), []);

  if (scene.name === "reading") {
    return <ReadingSession key={scene.novel.id} novel={scene.novel} mode={scene.mode} onExit={backToShelf} />;
  }

  return (
    <>
      <Bookshelf
        novels={novels}
        pickedId={scene.name === "cover" ? scene.novel.id : null}
        onSelect={(novel, fromRect) => setScene({ name: "cover", novel, fromRect })}
      />
      {scene.name === "cover" && (
        <CoverStage
          key={scene.novel.id}
          novel={scene.novel}
          fromRect={scene.fromRect}
          progress={loadProgress(scene.novel.id)}
          onOpen={(mode) => setScene({ name: "reading", novel: scene.novel, mode })}
          onClose={backToShelf}
        />
      )}
    </>
  );
}
