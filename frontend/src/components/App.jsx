import React from 'react'
import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { Col, Spinner } from 'react-bootstrap'
import { CheckCircle, XCircle } from 'react-bootstrap-icons'

import Controls from "./Controls/Controls.jsx"
import Map from "./Map/Map.js"
import SelectionPanel from './Controls/SelectionPanel/SelectionPanel.jsx'
import SelectionDetails from './Controls/SelectionDetails/SelectionDetails.jsx'
import DataDownloadModal from './Controls/DataDownloadModal/DataDownloadModal.jsx'
import Loading from './Controls/Loading/Loading.jsx'
import { defaultEovsSelected, defaultOrgsSelected, defaultStartDate, defaultEndDate, defaultStartDepth, defaultEndDepth } from './config.js'

import "bootstrap/dist/css/bootstrap.min.css"

import "./styles.css"
import { createDataFilterQueryString, validateEmail } from '../utilities.js'
import { server } from '../config.js'
import { colorScale } from './config.js'
import _ from 'lodash'
import Legend from './Controls/Legend/Legend.jsx'

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

  const [pointsToDownload, setPointsToDownload] = useState()
  const [selectedPointPKs, setSelectedPointPKs] = useState()
  const [polygon, setPolygon] = useState()
  const [email, setEmail] = useState()
  const [emailValid, setEmailValid] = useState()
  const [submissionState, setSubmissionState] = useState()
  const [submissionIcon, setSubmissionIcon] = useState()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState()
  const [zoom, setZoom] = useState(2)
  const [legendLevels, setLegendLevels] = useState()
  const [legendLevel, setLegendLevel] = useState()
  const [query, setQuery] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    startDepth: defaultStartDepth,
    endDepth: defaultEndDepth,
    eovsSelected: defaultEovsSelected,
    orgsSelected: defaultOrgsSelected
  })

  function fetchLegend() {
    fetch(`${server}/legend?${createDataFilterQueryString(query)}`).then(response => response.json()).then(legend => {
      if (legend) {
        console.log(legend)
        setLegendLevels(legend.recordsCount)
        setLegendLevel(getLegendLevel())
      } else {
        console.log('legend query failed')
      }
    })
  }

  // useEffect(() => {
  //   fetchLegend()
  // }, [])

  useEffect(() => {
    fetchLegend()
  }, [query])

  useEffect(() => {
    console.log('points to download', pointsToDownload)
  }, [pointsToDownload])

  useEffect(() => {
    fetch(`${server}/organizations`).then(response => response.json()).then(data => {
      let orgsReturned = {}
      data.forEach(elem => {
        orgsReturned[elem.name] = elem.pk
      })
      setOrganizations(orgsReturned)
    }).catch(error => { throw error })
    fetchLegend()
  }, [])

  useEffect(() => {
    switch (submissionState) {
      case 'submitted':
        submitRequest()
        setSubmissionIcon(
          <Spinner
            className='text-warning'
            as="span"
            animation="border"
            size={30}
            role="status"
            aria-hidden="true"
          />
        )
        break;

      case 'successful':
        setSubmissionIcon(
          <CheckCircle
            className='text-success'
            size={30}
          />
        )
        break;

      case 'failed':
        setSubmissionIcon(
          <XCircle
            className='text-danger'
            size={30}
          />
        )
        break;

      default:
        setSubmissionIcon()
        break;
    }
  }, [submissionState])

  function handleEmailChange(value) {
    setEmailValid(validateEmail(value))
    setEmail(value)
    setSubmissionState()
  }

  function handleSubmission() {
    setSubmissionState('submitted')
  }

  function submitRequest() {
    fetch(`${server}/download?${createDataFilterQueryString(query, organizations)}&polygon=${JSON.stringify(polygon)}&email=${email}`).then((response) => {
      if (response.ok) {
        setSubmissionState('successful')
      } else {
        setSubmissionState('failed')
      }
    })
  }

  function DownloadButton() {
    return (
      <DataDownloadModal
        disabled={_.isEmpty(selectedPointPKs)}
      >
        <SelectionDetails
          pointPKs={pointsToDownload && pointsToDownload.map(point => point.pk)}
          setPointsToDownload={setPointsToDownload}
          query={query}
          polygon={polygon}
          organizations={organizations}
          width={740}
        >
          <input className='emailAddress' type='email' placeholder='email@email.com' onChange={e => handleEmailChange(e.target.value)} />
          <button className='submitRequestButton' disabled={!emailValid || _.isEmpty(pointsToDownload)} onClick={() => handleSubmission()}>Submit Request</button>
          {submissionIcon}
        </SelectionDetails>
      </DataDownloadModal >
    )
  }

  function getLegendLevel() {
    console.log(zoom)
    switch (zoom) {
      case 0 <= zoom < 5:
        return legendLevels['zoom0']
      case 5 <= zoom < 7:
        return legendLevels['zoom1']
      case 7 <= zoom:
        return legendLevels['zoom2']
      default:
        break;
    }
  }
  console.log('loading', loading)
  return (
    <div>
      {loading && <Loading />}
      <Map
        setPolygon={setPolygon}
        setSelectedPointPKs={setSelectedPointPKs}
        setLoading={setLoading}
        query={query}
        polygon={polygon}
        organizations={organizations}
        zoom={zoom}
        setZoom={setZoom}
      />
      <Controls
        setQuery={setQuery}
        setLoading={setLoading}
      >
        {selectedPointPKs && (
          <Col xs='auto' className='selectionPanelColumn'>
            <SelectionPanel>
              <SelectionDetails
                pointPKs={selectedPointPKs}
                setPointsToDownload={setPointsToDownload}
                query={query}
                polygon={polygon}
                organizations={organizations}
                width={550}
              >
                {DownloadButton()}
              </SelectionDetails>
            </SelectionPanel>
          </Col>
        )}
        {DownloadButton()}
      </Controls>
      <a title='Return to CIOOS pacific homepage' className='logo' href='https://cioospacific.ca/' />
      <Legend colorScale={colorScale} legendLevel={legendLevel} />
    </div>
  );
}


// This is where react reaches into the DOM, finds the <div id="chart"> element, and replaces it with the content of ReactD3Viz's render function JSX.
const domContainer = document.querySelector('#app')
ReactDOM.render(<App />, domContainer)
