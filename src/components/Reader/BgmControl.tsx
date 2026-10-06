import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { bgm } from "../../lib/bgm/engine";

function useBgmState() {
  return useSyncExternalStore(
    (fn) => bgm.subscribe(fn),
    () => `${bgm.settings.enabled}|${bgm.settings.volume}|${bgm.mood ?? ""}|${bgm.blocked}`,
  );
}

/** 読書画面の上部バーに置く BGM ボタンと、オン・オフ／音量のパネル */
export function BgmControl() {
  useBgmState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { enabled, volume } = bgm.settings;
  const mood = bgm.mood;

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    // Esc はパネルを閉じるだけにする（読書画面の「Esc で本棚へ戻る」より先に受け取る）
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc, { capture: true });
    };
  }, [open]);

  return (
    <div className="bgm" ref={ref} data-no-flip>
      <button
        type="button"
        className={`btn btn--bar bgm__toggle ${enabled ? "" : "bgm__toggle--off"}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`BGM（${enabled ? "オン" : "オフ"}）`}
      >
        <span aria-hidden="true">♪</span>
        <span className="bgm__label">BGM</span>
      </button>
      {open && (
        <div className="bgm__panel" role="dialog" aria-label="BGM の設定">
          <label className="bgm__row">
            <span>BGM</span>
            <input
              type="checkbox"
              className="bgm__switch"
              checked={enabled}
              onChange={(e) => bgm.setEnabled(e.target.checked)}
            />
          </label>
          <label className={`bgm__row bgm__row--volume ${enabled ? "" : "bgm__row--disabled"}`}>
            <span>音量</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              disabled={!enabled}
              onChange={(e) => bgm.setVolume(Number(e.target.value) / 100)}
              aria-label="BGM の音量"
            />
            <span className="bgm__value">{Math.round(volume * 100)}</span>
          </label>
          <p className="bgm__now">
            {!enabled ? "BGM はオフです" : bgm.blocked ? "画面をタップすると流れはじめます" : mood && mood !== "無音" ? `いまの曲：${mood}` : "いまは無音の場面です"}
          </p>
        </div>
      )}
    </div>
  );
}
