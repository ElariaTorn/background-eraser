
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

declare global {
  interface Window {
    Telegram?: any;
  }
}

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.expand();
  tg.ready();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
