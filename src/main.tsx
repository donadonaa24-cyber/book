import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/global.css";
import "./styles/page.css";

// react-pageflip は StrictMode の二重実行でページを二重登録してしまうため、StrictMode は使わない
createRoot(document.getElementById("root")!).render(<App />);

registerSW({ immediate: true });
