import React from 'react'
import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { Col } from 'react-bootstrap'

import Controls from "./Controls/Controls.jsx";
import Map from "./Map/Map.js";
import SelectionPanel from './Controls/SelectionPanel/SelectionPanel.jsx';
import { defaultEovsSelected, defaultOrgsSelected, defaultStartDate, defaultEndDate, defaultStartDepth, defaultEndDepth } from './config.js';

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

  const [selectionType, setSelectionType] = useState('none')
  const [selection, setSelection] = useState()

  const [query, setQuery] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    startDepth: defaultStartDepth,
    endDepth: defaultEndDepth,
    eovsSelected: defaultEovsSelected,
    orgsSelected: defaultOrgsSelected
  })

  const [clickedPointDetails, setClickedPointDetails] = useState()

  console.log(clickedPointDetails)

  return (
    <div>
      <Map
        setSelection={setSelection}
        setSelectionType={setSelectionType}
        setClickedPointDetails={setClickedPointDetails}
        query={query}
      />
      <Controls
        setQuery={setQuery}
      >
        {selectionType !== 'none' && (
          <Col xs='auto' className='selectionPanelColumn'>
            <SelectionPanel>
              {selectionType === 'point' && (
                <div>Points</div>
              )}
              {selectionType === 'polygon' && (
                <div>Polygon</div>
              )}
            </SelectionPanel>
          </Col>
        )
        }
      </Controls>
    </div>
  );
}


// This is where react reaches into the DOM, finds the <div id="chart"> element, and replaces it with the content of ReactD3Viz's render function JSX.
const domContainer = document.querySelector('#app')
ReactDOM.render(<App />, domContainer)
