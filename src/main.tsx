import React from "react";
import ReactDOM from "react-dom/client";
import { NetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import App from "./App";
import "./index.css";

// Configure Midnight Network ID
setNetworkId(NetworkId.TestNet);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
