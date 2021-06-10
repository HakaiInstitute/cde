import { Map, NavigationControl } from "maplibre-gl";
// import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import React from "react";

export default class CIOOSMap extends React.Component {
  constructor(props) {
    super(props)
    this.layerId = 'data-layer'
    this.sourceId = 'sourceID'
    this.counter = 0
    this.map = new Map({
      container: "map",
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
      center: [-100, 49], // starting position
      zoom: 3 // starting zoom
    })
    
    const drawPolygon = new MapboxDraw();
    
    this.map.addControl(drawPolygon, "top-left");
    this.map.addControl(new NavigationControl(), "bottom-left");
    const query = {
      timeMin: "1900-01-01",
      timeMax: "2021-12-01",
      eovs: ["oxygen", 'seaSurfaceSalinity'],
      // dataType: "Profile",
    }
    this.map.on('load', () => {
      const queryString = Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

      this.map.addLayer({
        id: this.layerId,
        type: "circle",
        
        source: {
          type: "vector",
          tiles: [`https://pac-dev2.cioos.org/ceda/tiles/{z}/{x}/{y}.mvt?${queryString}`],
          
          // tiles: [`http://localhost:3000/tiles/{z}/{x}/{y}.mvt?${queryString}`],
        },
        "source-layer": "internal-layer-name",
        paint: {
          "circle-radius": 1,
          "circle-color": "#25420b",
          "circle-opacity": 0.75,
        },
      });
    })
  }

  getLoaded() {
    return this.map.loaded()
  }
  
  getPolygon() {
    if(this.map.getSource('mapbox-gl-draw-cold')){
      return this.map.getSource('mapbox-gl-draw-cold')._data.features.map(elem => elem.geometry)[0].coordinates[0]//.filter(elem => elem.type !== 'Feature')
    }
  }

  updateSource(queryString) {
    this.map.getSource('data-layer').tiles = [ `https://pac-dev2.cioos.org/ceda/tiles/{z}/{x}/{y}.mvt?${queryString}` ]

    // Remove the tiles for a particular source
    this.map.style.sourceCaches['data-layer'].clearTiles()

    // Load the new tiles for the current viewport (map.transform -> viewport)
    this.map.style.sourceCaches['data-layer'].update(this.map.transform)

    // Force a repaint, so that the map will be repainted without you having to touch the map
    this.map.triggerRepaint()
  }
}