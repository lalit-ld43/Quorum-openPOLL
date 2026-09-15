import React from "react";
import ReactDOM from "react-dom/client";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import App from "./App";
import "./index.css";

// Configure Midnight Network ID
setNetworkId("TestNet");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
