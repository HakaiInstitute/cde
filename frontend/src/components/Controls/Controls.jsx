import * as React from 'react'
import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import _ from 'lodash'

import SelectionPanel from './SelectionPanel/SelectionPanel.jsx'
import Filter from './Filter/Filter.jsx'
import MultiCheckboxFilter from './Filter/MultiCheckboxFilter/MultiCheckboxFilter.jsx'
import TimeSelector from './Filter/TimeSelector/TimeSelector.jsx'
import DepthSelector from './Filter/DepthSelector/DepthSelector.jsx'
import { generateMultipleSelectBadgeTitle, generateRangeSelectBadgeTitle } from '../../utilities.js'
import { server } from '../../config'

import { ArrowsExpand, Building, CalendarWeek, Water } from 'react-bootstrap-icons'

import './styles.css'
import { defaultEovsSelected, defaultOrgsSelected, defaultStartDate, defaultEndDate, defaultStartDepth, defaultEndDepth } from '../config.js'

export default function Controls({ setQuery, children }) {

  // Making changes to context within context consumers (ie. passing mutable state down to children to manipulate)
  //https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component

  // EOV filter initial values and state
  const [eovsSelected, setEovsSelected] = useState(defaultEovsSelected)
  const eovsFilterName = 'Ocean Variables'
  const eovsBadgeTitle = generateMultipleSelectBadgeTitle(eovsFilterName, eovsSelected)

  // Organization filter initial values from API and state
  const [orgsSelected, setOrgsSelected] = useState(defaultOrgsSelected)
  useEffect(() => {
    fetch(`${server}/organizations`).then(response => response.json()).then(data => {
      let orgsReturned = {}
      data.forEach(elem => {
        orgsReturned[elem.name] = false
      })
      setOrgsSelected(orgsReturned)
    }).catch(error => { throw error })
  }, [])
  const orgsFilterName = 'Organizations'
  const orgsBadgeTitle = generateMultipleSelectBadgeTitle(orgsFilterName, orgsSelected)

  // Timeframe filter initial values and state
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const timeframesFilterName = 'Timeframe'
  const timeframesBadgeTitle = generateRangeSelectBadgeTitle(timeframesFilterName, [startDate, endDate], [defaultStartDate, defaultEndDate])

  // Depth filter initial values and state
  const [startDepth, setStartDepth] = useState(defaultStartDepth)
  const [endDepth, setEndDepth] = useState(defaultEndDepth)
  const depthRangeFilterName = 'Depth Range (m)'
  const depthRangeBadgeTitle = generateRangeSelectBadgeTitle(depthRangeFilterName, [startDepth, endDepth], [defaultStartDepth, defaultEndDepth], '(m)')

  // Filter open state
  const [openFilter, setOpenFilter] = useState()

  // Update query 
  useEffect(() => {
    setQuery({
      startDate: startDate,
      endDate: endDate,
      startDepth: startDepth,
      endDepth: endDepth,
      eovsSelected: eovsSelected,
      orgsSelected: orgsSelected
    })
  }, [startDate, endDate, startDepth, endDepth, eovsSelected, orgsSelected])

  return (
    <div>
      <div className='controls'>
        <Container fluid>
          <Row>
            {children && (
              <Col xs='auto' className='selectionPanelColumn'>
                <SelectionPanel>
                  {children}
                </SelectionPanel>
              </Col>
            )}
            <Col xs='auto'>
              <Filter
                badgeTitle={eovsBadgeTitle}
                optionsSelected={eovsSelected}
                setOptionsSelected={setEovsSelected}
                tooltip='Filter data by ocean variable name. Selection works as logical OR operation.'
                icon={<Water />}
                controlled
                filterName={eovsFilterName}
                openFilter={openFilter === eovsFilterName}
                setOpenFilter={setOpenFilter}
              >
                <MultiCheckboxFilter optionsSelected={eovsSelected} setOptionsSelected={setEovsSelected} />
              </Filter>
            </Col>
            <Col xs='auto'>
              <Filter
                badgeTitle={orgsBadgeTitle}
                optionsSelected={orgsSelected}
                setOptionsSelected={setOrgsSelected}
                tooltip='Filter data by responsible organisation name. Selection works as logical OR operation.'
                icon={<Building />}
                controlled
                filterName={orgsFilterName}
                openFilter={openFilter === orgsFilterName}
                setOpenFilter={setOpenFilter}
              >
                <MultiCheckboxFilter optionsSelected={orgsSelected} setOptionsSelected={setOrgsSelected} />
              </Filter>
            </Col>
            <Col xs='auto'>
              <Filter
                badgeTitle={timeframesBadgeTitle}
                optionsSelected={startDate, endDate}
                setOptionsSelected={() => { setStartDate('1900-01-01'); setEndDate(new Date().toISOString().split('T')[0]) }}
                tooltip='Filter data by timeframe. Selection works as inclusive range.'
                icon={<CalendarWeek />}
                controlled
                filterName={timeframesFilterName}
                openFilter={openFilter === timeframesFilterName}
                setOpenFilter={setOpenFilter}
              >
                <TimeSelector
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />
              </Filter>
            </Col>
            <Col xs='auto'>
              <Filter
                badgeTitle={depthRangeBadgeTitle}
                optionsSelected={startDepth, endDepth}
                setOptionsSelected={() => { setStartDepth(0); setEndDepth(12000) }}
                tooltip='Filter data by depth. Selection works as inclusive range, and negative values are meters above ocean surface.'
                icon={<ArrowsExpand />}
                controlled
                filterName={depthRangeFilterName}
                openFilter={openFilter === depthRangeFilterName}
                setOpenFilter={setOpenFilter}
              >
                < DepthSelector
                  startDepth={startDepth}
                  setStartDepth={setStartDepth}
                  endDepth={endDepth}
                  setEndDepth={setEndDepth}
                />
              </Filter>
            </Col>
            <Col xs='auto'>
              <button className='downloadButton' onClick={() => console.log('downloading')}>Download</button>
            </Col>
          </Row>
        </Container>
      </div >
    </div>
  )
}
