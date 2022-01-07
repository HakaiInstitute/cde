import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import Controls from "./Controls/Controls.jsx";
import CIOOSMap from "./Map/Map.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://ccb1d8806b1c42cb83ef83040dc0d7c0@o56764.ingest.sentry.io/5863595",
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

export default function App() {
  const map = new CIOOSMap()

  // const [query, setQuery] = useState('')

  return (
    <div>
      <Controls
        map={map}
        selectionType='point'
      />
    </div>
  );
}

// This is where react reaches into the DOM, finds the <div id="chart"> element, and replaces it with the content of ReactD3Viz's render function JSX.
const domContainer = document.querySelector('#app')
ReactDOM.render(<App />, domContainer)
