import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Ogonyok } from "/workspace/src/game/Ogonyok";
import "/workspace/src/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Ogonyok />
  </StrictMode>,
);
