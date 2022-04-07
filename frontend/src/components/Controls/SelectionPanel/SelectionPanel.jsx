import classNames from 'classnames'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { ChevronCompactLeft, ChevronCompactRight } from 'react-bootstrap-icons'

import './styles.css'

export default function SelectionPanel({ children }) {
  const [open, setOpen] = useState(true)
  let selectionPanelClassName = classNames('selectionPanel', { closed: !open })
  let panelContentsClassName = classNames('panelContents', { closed: !open })
  let panelHandleClassName = classNames('panelHandle', { closed: !open })
  return (
    <div className={selectionPanelClassName}>
      <div className={panelContentsClassName}>
        {children}
      </div>
      {children &&
        (
          <div className={panelHandleClassName} title={`${open ? 'Close' : 'Open'} selection panel`} onClick={() => setOpen(!open)}>
            {open ? <ChevronCompactLeft /> : <ChevronCompactRight />}
          </div>
        )
      }
    </div>
  )
}