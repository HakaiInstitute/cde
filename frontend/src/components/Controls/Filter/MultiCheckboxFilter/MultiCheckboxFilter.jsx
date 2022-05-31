import * as React from 'react'
import { CheckSquare, CircleFill, Square } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { capitalizeFirstLetter, abbreviateString } from '../../../../utilities'
import { platformColors } from '../../../config.js'

import './styles.css'

export default function MultiCheckboxFilter({ optionsSelected, setOptionsSelected, searchable, translatable, colored, allOptions }) {
  const { t, i18n } = useTranslation()

  const optionsSelectedSorted = optionsSelected.sort((a, b) => t(a.title).localeCompare(t(b.title), i18n.language))

  function setIsSelectedTo(isSelected, allOptions, listOfPKs) {
    return allOptions.map(option => {
      if (listOfPKs.includes(option.pk)) {
        return {
          ...option,
          isSelected: isSelected
        }
      } else {
        return option
      }
    })
  }

  function selectAllSearchResultsToggle() {
    // Get a list of all the pks in the optionsSelected subset of allOptions
    const listOfPKs = optionsSelected.reduce((accumulatedPKs, currentOption) => {
      accumulatedPKs.push(currentOption.pk)
      return accumulatedPKs
    }, [])

    // Set all isSelected to false if all isSelected === true
    if (optionsSelected.every(option => option.isSelected)) {
      setOptionsSelected(setIsSelectedTo(false, allOptions, listOfPKs))
    } else { // Set all isSelected to true if some isSelected === false
      setOptionsSelected(setIsSelectedTo(true, allOptions, listOfPKs))
    }
  }

  return (
    <div className={`multiCheckboxFilter`}>
      {optionsSelected.length > 0 && optionsSelected.length !== allOptions.length && // search results exist
        <>
          <div className="searchResultsButton" onClick={() => selectAllSearchResultsToggle()}>
            {optionsSelected.every(option => option.isSelected) ? <CheckSquare /> : <Square />}
            {t('multiCheckboxFilterSelectSearchResults')} {`(${optionsSelected.length})`}
            <hr />
          </div>
        </>
      }
      {optionsSelected.length > 0 ? optionsSelectedSorted.map((option, index) => {
        let title
        if (translatable) {
          // Translation in title_translation
          if (option.titleTranslated && option.titleTranslated[i18n.languages[0]] && option.titleTranslated[i18n.languages[1]]) {
            title = option.titleTranslated[i18n.language]
          } else if (t(option.title)) { // Translation in t(title)
            title = t(option.title)
          } else {
            title = option.title // this shouldn't really happen, but its a catch-all fallback
          }
        } else {
          title = option.title
        }

        let platformColor
        if (colored) {
          platformColor = platformColors.filter(pc => pc.platformId === option.pk)
          if (colored && _.isEmpty(platformColor)) {
            platformColor = '#000000'
          } else {
            platformColor = platformColor[0].platformColor
          }
        }
        // No translation
        return (
          <div className='optionButton' key={index} title={t(title)}
            onClick={() => {
              if (searchable) {
                setOptionsSelected(allOptions.map(opt => {
                  if (opt.pk === option.pk) {
                    return {
                      ...opt,
                      isSelected: !opt.isSelected
                    }
                  } else return opt
                }))
              } else {
                setOptionsSelected(optionsSelected.map(opt => {
                  if (opt.pk === option.pk) {
                    return {
                      ...opt,
                      isSelected: !opt.isSelected
                    }
                  } else return opt
                }))
              }
            }}
          >
            {option.isSelected ? <CheckSquare /> : <Square />}
            <span className='optionName'>
              {capitalizeFirstLetter(abbreviateString(title, 30))}
            </span>
            {colored && <CircleFill className='optionColorCircle' fill={platformColor} size='15' />}
          </div>
        )
      })
        : (
          <div>{t('multiCheckboxFilterNoFilterWarning')}</div>
        )
      }
    </div>
  )
}