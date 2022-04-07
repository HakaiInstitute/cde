import * as React from 'react'
import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import _, { orderBy } from 'lodash'

import Filter from './Filter/Filter.jsx'
import MultiCheckboxFilter from './Filter/MultiCheckboxFilter/MultiCheckboxFilter.jsx'
import TimeSelector from './Filter/TimeSelector/TimeSelector.jsx'
import DepthSelector from './Filter/DepthSelector/DepthSelector.jsx'
import { filterObjectPropertyByPropertyList, generateMultipleSelectBadgeTitle, generateRangeSelectBadgeTitle, useDebounce } from '../../utilities.js'
import { server } from '../../config'

import { ArrowsExpand, Building, CalendarWeek, FileEarmarkSpreadsheet, Water } from 'react-bootstrap-icons'

import './styles.css'
import { defaultEovsSelected, defaultOrgsSelected, defaultStartDate, defaultEndDate, defaultStartDepth, defaultEndDepth, defaultDatatsetsSelected } from '../config.js'
import HeirarchicalMultiCheckboxFilter from './Filter/HeirarchicalMultiCheckboxFilter/HeirarchicalMultiCheckboxFilter.jsx'

export default function Controls({ setQuery, children }) {

  // Making changes to context within context consumers (ie. passing mutable state down to children to manipulate)
  //https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component

  // EOV filter initial values and state
  const [eovsSelected, setEovsSelected] = useState(defaultEovsSelected)
  const eovsFilterName = 'Ocean Variables'
  const eovsBadgeTitle = generateMultipleSelectBadgeTitle(eovsFilterName, eovsSelected)
  const [eovsSearchTerms, setEovsSearchTerms] = useState()

  // Organization filter initial values from API and state
  const [orgsSelected, setOrgsSelected] = useState(defaultOrgsSelected)
  useEffect(() => {
    fetch(`${server}/organizations`).then(response => response.json()).then(orgData => {
      let orgsReturned = {}
      orgData.forEach(elem => {
        orgsReturned[elem.name] = false
      })
      fetch(`${server}/datasets`).then(response => response.json()).then(datasetsData => {
        let datasetsReturned = {}
        datasetsData.forEach(dataset => {
          datasetsReturned[dataset.title] = false
        })
        setOrgsSelected(orgsReturned)
        setDatasetsFullList(datasetsData.map(dataset => {
          return {
            ...dataset,
            orgTitles: orgData.filter(org => dataset.organization_pks.includes(org.pk)).map(org => org.name)
          }
        }))
        setDatasetsSelected(datasetsReturned)
      }).catch(error => { throw error })
    })
  }, [])
  const orgsFilterName = 'Organizations'
  const orgsBadgeTitle = generateMultipleSelectBadgeTitle(orgsFilterName, orgsSelected)
  const [orgsSearchTerms, setOrgsSearchTerms] = useState()

  // Dataset filter initial values and state
  const [datasetsSelected, setDatasetsSelected] = useState(defaultDatatsetsSelected)
  const datasetsFilterName = 'Datasets'
  const datasetsBadgeTitle = generateMultipleSelectBadgeTitle(datasetsFilterName, datasetsSelected)
  const [datasetSearchTerms, setDatasetSearchTerms] = useState()
  const [datasetsFullList, setDatasetsFullList] = useState()

  // Timeframe filter initial values and state
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const timeframesFilterName = 'Timeframe'
  const timeframesBadgeTitle = generateRangeSelectBadgeTitle(timeframesFilterName, [startDate, endDate], [defaultStartDate, defaultEndDate])

  // Depth filter initial values and state
  const [startDepth, setStartDepth] = useState(defaultStartDepth)
  const debouncedStartDepth = useDebounce(startDepth, 500)
  const [endDepth, setEndDepth] = useState(defaultEndDepth)
  const debouncedEndDepth = useDebounce(endDepth, 500)
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
      orgsSelected: orgsSelected,
      datasetsSelected: datasetsSelected
    })
  }, [startDate, endDate, debouncedStartDepth, debouncedEndDepth, eovsSelected, orgsSelected, datasetsSelected])

  const childrenArray = React.Children.toArray(children)

  function createOptionSubset(searchTerms, allOptions) {
    // If there are search terms
    if (searchTerms) {
      // Get a list of the allowed datasets
      const allowedOptions = Object.keys(allOptions).filter(optionName => optionName.toLowerCase().includes(searchTerms.toString().toLowerCase()))
      // Generate the subset of datasets
      const filteredOptions = filterObjectPropertyByPropertyList(allOptions, allowedOptions)
      // Set the subset of datasets
      return { ...filteredOptions }
    } else { // Else if there aren't search terms, set the subset to the whole set
      return { ...allOptions }
    }
  }

  function createHeirarchicalOptionSubset(searchTerms, allOptions) {
    if (searchTerms) {
      return allOptions.filter(option => option.title.toString().toLowerCase().includes(searchTerms.toString().toLowerCase()))
    } else {
      return allOptions
    }
  }

  function handleSetDatasetsSelected(selection) {
    setDatasetsSelected(selection)

  }

  return (
    <div className='controls'>
      <Container fluid>
        <Row>
          {childrenArray.length === 2 && childrenArray[0]}
          <Col className='controlColumn' >
            <Filter
              badgeTitle={eovsBadgeTitle}
              optionsSelected={eovsSelected}
              setOptionsSelected={setEovsSelected}
              tooltip='Filter data by ocean variable name. Selection works as logical OR operation.'
              icon={<Water />}
              controlled
              searchable
              searchTerms={eovsSearchTerms}
              setSearchTerms={setEovsSearchTerms}
              searchPlaceholder='Search for ocean variable name...'
              filterName={eovsFilterName}
              openFilter={openFilter === eovsFilterName}
              setOpenFilter={setOpenFilter}
            >
              <MultiCheckboxFilter
                optionsSelected={createOptionSubset(eovsSearchTerms, eovsSelected)}
                setOptionsSelected={setEovsSelected}
                searchable
                allOptions={eovsSelected}
              />
            </Filter>
            <Filter
              badgeTitle={orgsBadgeTitle}
              optionsSelected={orgsSelected}
              setOptionsSelected={setOrgsSelected}
              tooltip='Filter data by responsible organisation name. Selection works as logical OR operation.'
              icon={<Building />}
              controlled
              searchable
              searchTerms={orgsSearchTerms}
              setSearchTerms={setOrgsSearchTerms}
              searchPlaceholder='Search for organization name...'
              filterName={orgsFilterName}
              openFilter={openFilter === orgsFilterName}
              setOpenFilter={setOpenFilter}
            >
              <MultiCheckboxFilter
                optionsSelected={createOptionSubset(orgsSearchTerms, orgsSelected)}
                setOptionsSelected={setOrgsSelected}
                searchable
                allOptions={orgsSelected}
              />
            </Filter>
            <Filter
              badgeTitle={datasetsBadgeTitle}
              optionsSelected={datasetsSelected}
              setOptionsSelected={setDatasetsSelected}
              tooltip='Filter data by dataset name. Selection works as logical OR operation.'
              icon={<FileEarmarkSpreadsheet />}
              controlled
              searchable
              searchTerms={datasetSearchTerms}
              setSearchTerms={setDatasetSearchTerms}
              searchPlaceholder='Search for dataset name...'
              filterName={datasetsFilterName}
              openFilter={openFilter === datasetsFilterName}
              setOpenFilter={setOpenFilter}
            >
              <HeirarchicalMultiCheckboxFilter
                optionsSelected={createOptionSubset(datasetSearchTerms, datasetsSelected)}
                setOptionsSelected={handleSetDatasetsSelected}
                searchable
                allOptions={datasetsSelected}
                hierachicalData={datasetsFullList}
              />
            </Filter>
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
            <Filter
              badgeTitle={depthRangeBadgeTitle}
              optionsSelected={startDepth, endDepth}
              setOptionsSelected={() => { setStartDepth(0); setEndDepth(12000) }}
              tooltip='Filter data by depth. Selection works as inclusive range.'
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
            {childrenArray.length === 2 ? childrenArray[1] : childrenArray[0]}
          </Col>
        </Row>
      </Container>
    </div >
  )
}
