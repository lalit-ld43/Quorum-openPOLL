import React from "react";
import ReactDOM from "react-dom/client";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Buffer } from "buffer";
import App from "./App";
import "./index.css";

// Polyfill Buffer and process for Midnight SDK
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Buffer = (window as any).Buffer || Buffer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).process = (window as any).process || { env: {} };
}

// Configure Midnight Network ID
setNetworkId("preprod");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
