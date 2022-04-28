import * as React from "react"
import maplibreGl, { NavigationControl, Popup } from "maplibre-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import { useState, useEffect, useRef } from "react"
import * as turf from '@turf/turf'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'
import { useTranslation } from 'react-i18next'

import './styles.css'

import { server } from '../../config'
import { createDataFilterQueryString, generateColorStops, getCurrentRangeLevel } from "../../utilities"
import { colorScale } from "../config"

// Using Maplibre with React: https://documentation.maptiler.com/hc/en-us/articles/4405444890897-Display-MapLibre-GL-JS-map-using-React-JS
export default function CreateMap({ query, setPointsToReview, setPolygon, setLoading, organizations, datasets, zoom, setZoom, offsetFlyTo, rangeLevels }) {
  const { t } = useTranslation()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const creatingRectangle = useRef(false)
  const drawControlOptions = {
    displayControlsDefault: false,
    controls: {
      point: false,
      line_string: false,
      polygon: true,
      trash: true,
      combine_features: false,
      uncombine_features: false,
      modes: Object.assign(MapboxDraw.modes, {
        draw_rectangle: DrawRectangle,
      }),
    }
  }

  const draw = new MapboxDraw(drawControlOptions)
  const drawPolygon = useRef(draw)
  const doFinalCheck = useRef(false)
  const colorStops = useRef([])

  const [boxSelectStartCoords, setBoxSelectStartCoords] = useState()
  const [boxSelectEndCoords, setBoxSelectEndCoords] = useState()

  const popup = new Popup({
    closeButton: false,
    closeOnClick: true,
    maxWidth: '400px'
  })

  useEffect(() => {
    setColorStops()
  }, [rangeLevels])

  useEffect(() => {
    if (map.current) {
      map.current.offsetFlyTo = offsetFlyTo
    }
  }, [offsetFlyTo])

  useEffect(() => {
    if (boxSelectStartCoords && boxSelectEndCoords) {
      if (drawPolygon.current.getAll().features.length > 0) {
        drawPolygon.current.delete(drawPolygon.current.getAll().features[0].id)
      }
      const lineString = turf.lineString([boxSelectStartCoords, boxSelectEndCoords])
      const bboxPolygon = turf.bboxPolygon(turf.bbox(lineString))
      setBoxSelectEndCoords()
      setBoxSelectStartCoords()
      setLoading(true)
      drawPolygon.current.add({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [bboxPolygon.geometry.coordinates[0]]
        }
      })
      highlightPoints(bboxPolygon.geometry.coordinates[0])
      setPolygon(bboxPolygon.geometry.coordinates[0])
    }
  }, [boxSelectEndCoords])

  function setColorStops() {
    if (map.current) {
      colorStops.current = generateColorStops(colorScale, getCurrentRangeLevel(rangeLevels, map.current.getZoom())).map(colorStop => {
        return [colorStop.stop, colorStop.color]
      })
      if (colorStops.current.length > 0) {
        if (map.current.getZoom() >= 7 && map.current.getLayer('points')) {
          map.current.setPaintProperty('points', 'circle-color', {
            property: 'count',
            stops: colorStops.current
          })
        } else if (map.current.getZoom() < 7 && map.current.getLayer('hexes')) {
          map.current.setPaintProperty('hexes', 'fill-color', {
            property: 'count',
            stops: colorStops.current
          })
        }
      }
    }
  }

  function highlightPoints(polygon) {
    var features = map.current.queryRenderedFeatures({ layers: ['points'] }).map(point => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          // Note order: longitude, latitude.
          coordinates: point.geometry.coordinates
        },
        properties: { ...point.properties }
      }
    })

    const featureCollection = { type: 'FeatureCollection', features: features }
    var searchWithin = turf.polygon([polygon]);
    var pointsWithinPolygon = turf.pointsWithinPolygon(featureCollection, searchWithin);

    // Filter points layer to show the points that have been selected
    var filter = pointsWithinPolygon.features.reduce(
      function (memo, feature) {
        memo.push(feature.properties.pk)
        return memo
      },
      ['in', 'pk']
    )

    map.current.setFilter('points-highlighted', filter)
  }

  useEffect(() => {
    setPointsToReview()
    setPolygon()
    if (map && map.current && map.current.loaded()) {
      map.current.setFilter('points-highlighted', ['in', 'pk', ''])
      const tileQuery = `${server}/tiles/{z}/{x}/{y}.mvt?${createDataFilterQueryString(query, organizations, datasets)}`

      map.current.getSource("points").tiles = [tileQuery]
      map.current.getSource("hexes").tiles = [tileQuery]

      // Remove the tiles for a particular source
      map.current.style.sourceCaches["hexes"].clearTiles()
      map.current.style.sourceCaches["points"].clearTiles()

      // Load the new tiles for the current viewport (map.transform -> viewport)
      map.current.style.sourceCaches["hexes"].update(map.current.transform)
      map.current.style.sourceCaches["points"].update(map.current.transform)

      // Force a repaint, so that the map will be repainted without you having to touch the map
      map.current.triggerRepaint()
      setLoading(true)
      doFinalCheck.current = true
      if (drawPolygon.current.getAll().features.length > 0) {
        highlightPoints(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
        setPolygon(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
      }
    }
  }, [query])

  useEffect(() => {
    // If already created don't proceed
    if (map.current) return
    // Create map
    map.current = new maplibreGl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [-125, 49], // starting position
      zoom: zoom, // starting zoom
    })

    map.current.on("load", () => {
      const boxQueryElement = document.getElementById('boxQueryButton');
      if (boxQueryElement) {
        boxQueryElement.onclick = () => {
          creatingRectangle.current = true
          draw.changeMode('draw_rectangle');
        }
      }

      setColorStops()

      map.current.addLayer({
        id: "points",
        type: "circle",
        minzoom: 7,
        source: {
          type: "vector",
          tiles: [`${server}/tiles/{z}/{x}/{y}.mvt`],
        },
        "source-layer": "internal-layer-name",
        paint: {
          'circle-opacity': 1,
          "circle-color": {
            property: 'count',
            stops: colorStops.current
          }
        },
      })

      map.current.addLayer({
        id: "hexes",
        type: "fill",
        minzoom: 0,
        maxzoom: 7,

        source: {
          type: "vector",
          tiles: [`${server}/tiles/{z}/{x}/{y}.mvt`],
        },
        "source-layer": "internal-layer-name",

        paint: {
          "fill-opacity": 0.9,
          "fill-color":
          {
            property: 'count',
            stops: colorStops.current
          }
        },
      })

      map.current.addLayer({
        id: "points-highlighted",
        type: "circle",
        minzoom: 7,
        source: {
          type: "vector",
          tiles: [`${server}/tiles/{z}/{x}/{y}.mvt`],
        },
        "source-layer": "internal-layer-name",
        paint: {
          "circle-color": "red",
          "circle-opacity": 1,
        },
        filter: ['in', 'pk', '']
      })

    })

    // Called order determines stacking order
    map.current.addControl(new NavigationControl(), "bottom-right")
    map.current.addControl(drawPolygon.current, "bottom-right")

    const handleMapOnClick = e => {
      if (drawPolygon.current.getAll().features.length === 0) {
        map.current.setFilter('points-highlighted', ['in', 'pk', ''])
        setPointsToReview()
        setPolygon()
      }
    };

    const handleMapPointsOnClick = e => {
      if (draw.getMode() !== 'draw_polygon' && !creatingRectangle.current) {
        if (drawPolygon.current.getAll().features.length > 0) {
          drawPolygon.current.delete(drawPolygon.current.getAll().features[0].id)
        }
        if (map.current.offsetFlyTo === undefined) {
          map.current.offsetFlyTo = true
        }
        map.current.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], padding: map.current.offsetFlyTo ? { top: 0, bottom: 0, left: 500, right: 0 } : 0 })
        const height = 10
        const width = 10
        var bbox = [
          [e.point.x - width / 2, e.point.y - height / 2],
          [e.point.x + width / 2, e.point.y + height / 2]
        ]
        const cornerA = map.current.unproject(bbox[0])
        const cornerB = map.current.unproject(bbox[1])
        const clickLngLatBBox = [
          [cornerA.lng, cornerA.lat],
          [cornerB.lng, cornerB.lat]
        ]
        const lineString = turf.lineString(clickLngLatBBox)
        const bboxPolygon = turf.bboxPolygon(turf.bbox(lineString))
        highlightPoints(bboxPolygon.geometry.coordinates[0])
        setPolygon(bboxPolygon.geometry.coordinates[0])
      }
      if (creatingRectangle.current) {
        creatingRectangle.current = false
      }
    };

    const handleMapHexesOnClick = e => {
      if (draw.getMode() !== 'draw_polygon' && !creatingRectangle.current) {
        if (map.current.offsetFlyTo === undefined) {
          map.current.offsetFlyTo = true
        }
        map.current.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: 7, padding: map.current.offsetFlyTo ? { top: 0, bottom: 0, left: 500, right: 0 } : 0 })
      }
      if (creatingRectangle.current) {
        creatingRectangle.current = false
      }
    };

    map.current.on('mousemove', 'points', e => {
      var coordinates = e.features[0].geometry.coordinates.slice()
      popup
        .setLngLat(coordinates)
        .setHTML(
          ` <div>
              ${e.features[0].properties.count} ${t('mapPointHoverTooltip')}
            </div> 
          `
        )
        .addTo(map.current)
    })

    map.current.on('mouseleave', 'points', () => {
      popup.remove()
    })

    map.current.on('mousemove', "hexes", e => {
      var coordinates = [e.lngLat.lng, e.lngLat.lat]
      var description = e.features[0].properties.count

      popup
        .setLngLat(coordinates)
        .setHTML(description + t('mapHexHoverTooltip'))
        .addTo(map.current)
    })

    map.current.on('mouseleave', 'hexes', () => {
      popup.remove()
    })

    map.current.on('draw.create', e => {
      setPointsToReview()
      setLoading(true)
      if (drawPolygon.current.getAll().features.length > 1) {
        drawPolygon.current.delete(drawPolygon.current.getAll().features[0].id)
      }
      highlightPoints(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
      setPolygon(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
      creatingRectangle.current = false
    })

    map.current.on('draw.update', e => {
      setLoading(true)
      highlightPoints(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
      setPolygon(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
    })

    map.current.on('draw.delete', e => {
      map.current.setFilter('points-highlighted', ['in', 'pk', ''])
      setPointsToReview()
      setPolygon()
    })

    map.current.on('idle', e => {
      if (doFinalCheck.current && drawPolygon.current.getAll().features.length > 0 && map.current.getZoom() >= 7) {
        setPointsToReview()
        setLoading(true)
        highlightPoints(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
      }
      doFinalCheck.current = false
      // setColorStops()
      setLoading(false)
    })

    map.current.on('dragend', e => {
      if (drawPolygon.current.getAll().features.length > 0) {
        setPointsToReview()
        if (map.current.getZoom() >= 7) {
          setLoading(true)
          highlightPoints(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
        }
      }
    })

    map.current.on('zoomend', e => {
      doFinalCheck.current = true
      if (drawPolygon.current.getAll().features.length > 0) {
        setPointsToReview()
        if (map.current.getZoom() >= 7) {
          setLoading(true)
          highlightPoints(drawPolygon.current.getAll().features[0].geometry.coordinates[0])
        }
      }
    })

    map.current.on('mousedown', e => {
      if (e.originalEvent.shiftKey) {
        setBoxSelectStartCoords([e.lngLat.lng, e.lngLat.lat])
      }
    })

    map.current.on('mouseup', e => {
      setBoxSelectEndCoords([e.lngLat.lng, e.lngLat.lat])
    })

    map.current.on('zoomend', e => {
      setZoom(map.current.getZoom())
    })

    // Workaround for https://github.com/mapbox/mapbox-gl-draw/issues/617

    map.current.on('click', handleMapOnClick);
    // mobile seems better without handleMapOnClick enabled for touch

    map.current.on('click', 'points', handleMapPointsOnClick);
    map.current.on('touchend', 'points', handleMapPointsOnClick);

    map.current.on('click', 'hexes', handleMapHexesOnClick);
    map.current.on('touchend', 'hexes', handleMapHexesOnClick);

    let polygonToolDiv = document.getElementsByClassName('mapbox-gl-draw_polygon')
    polygonToolDiv[0].title = t('mapPolygonToolTitle')

    let deleteToolDiv = document.getElementsByClassName('mapbox-gl-draw_trash')
    deleteToolDiv[0].title = t('mapDeleteToolTitle')

    let zoomInToolDiv = document.getElementsByClassName('mapboxgl-ctrl-zoom-in')
    zoomInToolDiv[0].title = t('mapZoomInToolTitle')

    let zoomOutToolDiv = document.getElementsByClassName('mapboxgl-ctrl-zoom-out')
    zoomOutToolDiv[0].title = t('mapZoomOutToolTitle')

    let orientNorthToolDiv = document.getElementsByClassName('mapboxgl-ctrl-compass')
    orientNorthToolDiv[0].title = t('mapCompassToolTitle')
  }, [])

  return (
    <div ref={mapContainer} className="map" />
  )
}
