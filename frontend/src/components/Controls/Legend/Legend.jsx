import React from 'react'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronCompactLeft, ChevronCompactRight, CircleFill, HexagonFill } from 'react-bootstrap-icons'
import * as _ from 'lodash'

import { capitalizeFirstLetter, useOutsideAlerter, generateColorStops } from '../../../utilities.js'
import { colorScale, platformColors } from '../../config.js'

import './styles.css'
import LegendElement from './LegendElement.jsx/LegendElement.jsx'
import classNames from 'classnames'

export default function Legend({ currentRangeLevel, zoom, selectionPanelOpen }) {
  const { t } = useTranslation()
  const [legendOpen, setLegendOpen] = useState(true)
  const wrapperRef = useRef(null)
  useOutsideAlerter(wrapperRef, setLegendOpen, false)

  function generateLegendElements() {
    if (_.isEmpty(currentRangeLevel)) { // No Data
      return (
        <div
          title={t('legendNoDataWarningTitle')} //'Choose less restrictive filters to see data'
        >
          {t('legendNoDataWarningText')}
          {/* No Data */}
        </div>
      )
    } else if (zoom < 7) { // Hexes
      const colorStops = generateColorStops(colorScale, currentRangeLevel)
      return (
        <>
          <LegendElement
            title='Points per hexagon'
            open={legendOpen}
          >
            Color
          </LegendElement>
          {colorStops && colorStops.map((colorStop, index) => {
            const pointCount = `${colorStop.stop}`
            return (
              <LegendElement
                key={index}
                title={pointCount}
                open={legendOpen}
              >
                <HexagonFill title={pointCount} size={15} fill={colorStop.color} />
              </LegendElement>
            )
          })
          }
        </>
      )
    } else if (zoom >= 7) { // Points
      return (
        <>
          <LegendElement
            title='Days of data'
            open={legendOpen}
          >
            Size
          </LegendElement>
          <LegendElement
            title='One day of data or less'
            open={legendOpen}
          >
            <CircleFill size={4} fill='white' style={{ border: '1px solid black', borderRadius: '15px', margin: '5.5px' }} />
          </LegendElement>
          <LegendElement
            title='More than one day of data'
            open={legendOpen}
          >
            <CircleFill size={15} fill='white' style={{ border: '1px solid black', borderRadius: '15px' }} />
          </LegendElement>
          <hr />
          <LegendElement
            title='Platform type'
            open={legendOpen}
          >
            Color
          </LegendElement>
          {platformColors.map((pc, index) => {
            return (
              <LegendElement
                title={capitalizeFirstLetter(pc.platformType)}
                open={legendOpen}
                key={index}
              >
                <CircleFill size={15} fill={pc.platformColor} />
              </LegendElement>
            )
          })}
        </>
      )
    }
  }
  const className = classNames('legend', { panelOpen: selectionPanelOpen })

  return (
    <div
      className={className}
      ref={wrapperRef}
      onClick={() => setLegendOpen(!legendOpen)}
    >
      {generateLegendElements()}
      <LegendElement
        open={legendOpen}
      >
        <div className='legendToggleButton' title={legendOpen ? 'Close legend' : 'Open legend'}>
          {legendOpen ?
            <ChevronCompactLeft />
            :
            <ChevronCompactRight />
          }
        </div>
      </LegendElement>
    </div>
  )
}