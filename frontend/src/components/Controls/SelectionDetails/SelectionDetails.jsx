import * as React from 'react'
import { useState, useEffect } from 'react'
import { ProgressBar } from 'react-bootstrap'

import DatasetsTable from '../DatasetsTable/DatasetsTable.jsx'
import DatasetInspector from '../DatasetInspector/DatasetInspector.jsx'
import QuestionIconTooltip from '../QuestionIconTooltip/QuestionIconTooltip.jsx'
import { server } from '../../../config'

import './styles.css'

// Note: datasets and points are exchangable terminology
export default function SelectionDetails({ pointPKs, setPointsToDownload, downloadButton, children }) {
  const [selectAll, setSelectAll] = useState(true)
  const [pointsData, setPointsData] = useState([])
  const [inspectDataset, setInspectDataset] = useState()
  const [dataTotal, setDataTotal] = useState(0)

  useEffect(() => {
    if (pointsData) {
      let total = 0
      pointsData.forEach((point) => {
        if (point.selected) {
          total += Math.floor(point.profiles.length)
        }
      })
      setDataTotal(total)
      console.log('updating points to download', pointsData)
      setPointsToDownload(pointsData.filter(point => point.selected))//.map(point => point.pk))
    }
  }, [pointsData])

  useEffect(() => {
    if (pointPKs && pointPKs.length !== 0) {
      fetch(`${server}/pointQuery?pointPKs=${pointPKs.join(',')}`).then(response => {
        if (response.ok) {
          response.json().then(data => {
            console.log('pointQuery data', data)
            setPointsData(data.map(point => {
              return {
                ...point,
                selected: true
              }
            }))
          })
        }
      })
    }
  }, [pointPKs])

  function handleSelectDataset(point) {
    let dataset = pointsData.filter((p) => p.dataset_id === point.dataset_id)[0]
    dataset.selected = !point.selected
    const result = pointsData.map((p) => {
      if (p.dataset_id === point.dataset_id) {
        return dataset
      } else {
        return p
      }
    })
    setPointsData(result)
  }

  function handleSelectAllDatasets() {
    setPointsData(pointsData.map(p => {
      return {
        ...p,
        selected: !selectAll
      }
    }))
    setSelectAll(!selectAll)
  }

  // console.log(pointsData)
  return (
    <div className='pointDetails'>
      <div className='pointDetailsInfoRow'>
        {
          inspectDataset ?
            <DatasetInspector
              dataset={inspectDataset}
              setInspectDataset={setInspectDataset}
            /> :
            <DatasetsTable
              handleSelectAllDatasets={handleSelectAllDatasets}
              handleSelectDataset={handleSelectDataset}
              setInspectDataset={setInspectDataset}
              selectAll={selectAll}
              datasets={pointsData}
            />
        }
      </div>
      <div className='pointDetailsControls'>
        <div className='pointDetailsControlRow'>
          <div>
            <ProgressBar
              className='dataTotalBar'
              title='Amount of download size used'
            >
              <ProgressBar
                striped
                className='upTo100'
                variant='success'
                now={dataTotal < 100 ? dataTotal : 100}
                label={dataTotal < 100 ? dataTotal : 100}
                key={1}
              />
              {dataTotal > 100 &&
                <ProgressBar
                  striped
                  className='past100'
                  variant='warning'
                  now={dataTotal > 100 ? dataTotal - 100 : 0}
                  label={dataTotal > 100 ? dataTotal - 100 : 0}
                  key={2}
                />
              }
            </ProgressBar>
            <div className='dataTotalRatio'>
              {dataTotal}MB of 100MB Max
              <QuestionIconTooltip
                tooltipText={'Downloads are limited to 100MB.'}
                size={20}
                tooltipPlacement={'top'}
              />
            </div>
          </div>
          {children}
          {/* {downloadButton} */}
          {/* <button className='downloadButton'>Download</button> */}
        </div>
      </div>
    </div >
  )
}