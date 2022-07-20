import _, { toInteger } from 'lodash'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { Table } from 'react-bootstrap'
import { ArrowDown, ArrowUp, CheckSquare, ChevronCompactRight, CircleFill, SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp, Square } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { abbreviateString, bytesToMemorySizeString } from '../../../utilities'
import platformColors from '../../platformColors'
import './styles.css'

export default function DatasetsTable({ handleSelectAllDatasets, handleSelectDataset, datasets, setDatasets, selectAll, setInspectDataset, setHoveredDataset }) {
  const { t } = useTranslation()
  const [sortedData, setSortedData] = useState(datasets)
  const [sortProp, setSortProp] = useState('title')
  const [ascending, setAscending] = useState(false)

  useEffect(() => {
    setSortedData(datasets)
  }, [datasets])

  useEffect(() => {
    handleSortByProperty(sortProp)
  }, [])

  function sortByProperty(prop) {
    let data = datasets
    if (prop === sortProp) {
      ascending ? data.sort((a, b) => _.get(a, prop) > _.get(b, prop) ? -1 : _.get(a, prop) < _.get(b, prop) ? 1 : 0) : data.sort((a, b) => _.get(a, prop) > _.get(b, prop) ? 1 : _.get(a, prop) < _.get(b, prop) ? -1 : 0)

    } else {
      data.sort((a, b) => _.get(a, prop) > _.get(b, prop) ? 1 : _.get(a, prop) < _.get(b, prop) ? -1 : 0)
    }
    return data
  }

  function handleSortByProperty(prop) {
    if (datasets) {
      setDatasets(sortByProperty(prop))
      if (prop === sortProp) {
        setAscending(!ascending)
      } else {
        setAscending(true)
      }
      setSortProp(prop)
    }
  }

  return (
    <div className='datasetsTable'>
      <Table striped hover>
        <thead>
          <tr>
            <th title={t('datasetsTableHeaderSelectAllTitle')}
              // Select all
              onClick={(e) => {
                handleSortByProperty('selected')
                e.stopPropagation()
              }}
            >
              <div className='selectAllHeader'>
                {selectAll ?
                  <CheckSquare onClick={(e) => {
                    e.stopPropagation()
                    handleSelectAllDatasets()
                  }}
                  />
                  :
                  <Square onClick={(e) => {
                    e.stopPropagation()
                    handleSelectAllDatasets()
                  }}
                  />
                }
                {sortProp === 'selected' && (ascending ? <ArrowDown /> : <ArrowUp />)}
              </div>
            </th>
            <th
              title={t('datasetsTableHeaderTitleTitle')}
              // 'Sort by dataset title' 
              onClick={() => handleSortByProperty('title')}
            >
              {t('datasetsTableHeaderTitleText')} {sortProp === 'title' && (ascending ? <SortAlphaDown /> : <SortAlphaUp />)}
            </th>
            <th
              title={t('datasetsTableHeaderTypeTitle')}
              //'Sort by dataset type' 
              onClick={() => handleSortByProperty('cdm_data_type')}
            >
              {t('datasetsTableHeaderTypeText')} {sortProp === 'cdm_data_type' && (ascending ? <SortAlphaDown /> : <SortAlphaUp />)}
            </th>
            <th
              title={t('datasetsTableHeaderRecordsTitle')}
              //'Sort by number of records in dataset' 
              onClick={() => handleSortByProperty('profiles_count')}
            >
              {t('datasetsTableHeaderRecordsText')} {sortProp === 'profiles_count' && (ascending ? <SortNumericDown /> : <SortNumericUp />)}
            </th>
            <th
              title={t('datasetsTableHeaderSizeTitle')}
              // 'Sort by approximate dataset size in megabytes'
              onClick={() => handleSortByProperty('size')}
            >
              {t('datasetsTableHeaderSizeText')} {sortProp === 'size' && (ascending ? <SortNumericDown /> : <SortNumericUp />)}
            </th>
            <th
              title={t('datasetsTableHeaderDetailsTitle')}
            //'Open dataset details'
            >
              {t('datasetsTableHeaderDetailsText')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((point, index) => {
            let platformColor = platformColors.filter(pc => pc.platform === point.platform)
            return (
              <tr key={index}
                onMouseEnter={() => setHoveredDataset(point)}
                onMouseLeave={() => setHoveredDataset()}
              >
                <td
                  onClick={() => {
                    // setHoveredDataset()
                    handleSelectDataset(point)
                  }}
                  title={t('datasetsTableSelectTitle')}
                //'Select dataset for download'
                >
                  {point.selected ? <CheckSquare /> : <Square />}
                </td>
                <td
                  className='datasetsTableTitleCell'
                  title={point.title}
                  onClick={() => setInspectDataset(point)}
                >
                  {<CircleFill className='optionColorCircle' fill={!_.isEmpty(platformColor) ? platformColor[0].color : '#000000'} size='15' />}
                  {abbreviateString(point.title, 35)}
                </td>
                <td
                  style={{ wordBreak: point.cdm_data_type === 'TimeSeriesProfile' && 'break-word' }}
                  title={t('datasetsTableTypeTitle')}
                  //'Dataset type'
                  onClick={() => setInspectDataset(point)}
                >
                  {point.cdm_data_type}
                </td>
                <td
                  title={t('datasetsTableRecordsTitle')}
                  //'Number of records in dataset'
                  onClick={() => setInspectDataset(point)}
                >
                  {toInteger(point.profiles_count)}
                </td>
                <td
                  title={t('datasetsTableSizeTitle')}
                  //'Approximate dataset size in megabytes'
                  onClick={() => setInspectDataset(point)}
                >
                  {bytesToMemorySizeString(point.size)}
                </td>
                <td
                  title={t('datasetsTableDetailsTitle')}
                  //'Open dataset details'
                  onClick={() => setInspectDataset(point)}
                >
                  <div className='inspectButton'><ChevronCompactRight /></div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div >
  )
}