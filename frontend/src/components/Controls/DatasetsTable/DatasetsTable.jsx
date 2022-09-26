import * as React from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  ChevronCompactRight,
  CircleFill,
  SortAlphaDown,
  SortAlphaUp,
  SortNumericDown,
  SortNumericUp,
  Square
} from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import platformColors from '../../platformColors'
import './styles.css'
import DataTable from 'react-data-table-component'
import DataTableExtensions from 'react-data-table-component-extensions'
import { ribbonArrow } from 'd3'

export default function DatasetsTable({
  handleSelectAllDatasets,
  handleSelectDataset,
  datasets,
  selectAll,
  setInspectDataset,
  isDownloadModal,
  setHoveredDataset = () => {}
}) {
  const { t } = useTranslation()

  const checkBoxOnclick = (point) => () => handleSelectDataset(point)
  const selectAllOnclick = (e) => {
    e.stopPropagation()
    handleSelectAllDatasets()
  }

  const columns = [
    {
      name: selectAll ? (
        <CheckSquare onClick={selectAllOnclick} />
      ) : (
        <Square onClick={selectAllOnclick} />
      ),

      selector: (row) => row.selected,
      cell: (row) =>
        row.selected ? (
          <CheckSquare onClick={checkBoxOnclick(row)} />
        ) : (
          <Square onClick={checkBoxOnclick(row)} />
        ),

      ignoreRowClick: true,
      width: '60px',
      sortable: false
    },
    {
      name: <div>Platform</div>,

      wrap: true,

      center: true,
      selector: (row) => row.platform,
      cell: (point) => {
        const platformColor = platformColors.find(
          (pc) => pc.platform === point.platform
        )

        return (
          <CircleFill
            title={point.platform}
            className='optionColorCircle'
            fill={platformColor?.color || '#000000'}
            size={15}
          />
        )
      },
      width: '80px',
      sortable: true
    },
    {
      name: 'Title',
      selector: (row) => row.title,
      wrap: true,
      width: '250px',
      sortable: true
    },
    {
      name: 'Type',
      compact: true,
      selector: (row) =>
        row.cdm_data_type
          .replace('TimeSeriesProfile', 'Timeseries / Profile')
          .replace('TimeSeries', 'Timeseries'),
      wrap: true,
      sortable: true
    },
    {
      name: 'Locations',
      selector: (row) => row.profiles_count,
      wrap: true,
      sortable: true,
      width: '75px'
    }
  ]

  const data = datasets
  const tableData = {
    columns,
    data
  }

  return (
    <div className='datasetsTable'>
      <DataTableExtensions
        {...tableData}
        print={false}
        exportHeaders
        filterPlaceholder={t('datasetInspectorFilterText')}
        filter={!isDownloadModal}
        export={!isDownloadModal}
      >
        <DataTable
          striped
          columns={columns}
          data={data}
          onRowClicked={isDownloadModal ? undefined : setInspectDataset}
          onRowMouseEnter={setHoveredDataset}
          highlightOnHover={!isDownloadModal}
          pointerOnHover={!isDownloadModal}
        />
      </DataTableExtensions>
    </div>
  )
}
