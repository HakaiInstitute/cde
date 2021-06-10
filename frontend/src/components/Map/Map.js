import { Map, NavigationControl } from "maplibre-gl";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import geojsonData from '../Map/geojsonData';

export default function createMap() {

  mapboxgl.accessToken = 'pk.eyJ1IjoiaGFrYWkiLCJhIjoiY2lyNTcwYzY5MDAwZWc3bm5ubTdzOWtzaiJ9.6QhxH6sQEgK634qO7a8MoQ';

  var map = new mapboxgl.Map({
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
  });

  map.on("load", function () {
    console.log("test");
    map.addSource('10m-bathymetry-81bsvj', {
      type: 'vector',
      url: 'mapbox://mapbox.9tm8dx88'
      });
    map.addLayer(
      {
      'id': '10m-bathymetry-81bsvj',
      'type': 'fill',
      'source': '10m-bathymetry-81bsvj',
      'source-layer': '10m-bathymetry-81bsvj',
      'layout': {},
      'paint': {
      'fill-outline-color': 'hsla(337, 82%, 62%, 0)',
      // cubic bezier is a four point curve for smooth and precise styling
      // adjust the points to change the rate and intensity of interpolation
      'fill-color': [
      'interpolate',
      ['cubic-bezier', 0, 0.5, 1, 0.5],
      ['get', 'DEPTH'],
      200,
      '#78bced',
      9000,
      '#15659f'
      ]
      }
      },
      );
    map.addLayer({
      minzoom: 5,
      id: "internal-layer-name",
      type: "circle",

      source: {
        type: "vector",
        tiles: ["https://pac-dev2.cioos.org/ceda/tiles/{z}/{x}/{y}.mvt"],
      },
      "source-layer": "internal-layer-name",
      paint: {
        "circle-radius": 1,
        "circle-color": "#25420b",
        "circle-opacity": 0.75,
      },
    });

  // hexagons
  const sourceId = 'h3-hexes';
  const layerId = `${sourceId}-layer`;
  const config = ({
    lng: -124.4,
    lat: 50.7923539,
    zoom: 5,
    fillOpacity: .8,
    colorScale: ['#ffffD9', '#50BAC3', '#1A468A']
  })
  map.addSource(sourceId, {
    type: 'geojson',
    data: geojsonData
  });

  map.addLayer({
    id: layerId,
    source: sourceId,
    type: 'fill',
    // maxzoom: 7,
    maxzoom: 5,
    interactive: false,
    paint: {
      'fill-outline-color': 'rgba(0,0,0,0)'
    }
  });

  const source = map.getSource(sourceId);

  // Update the geojson data
  source.setData(geojsonData);

  // Update the layer paint properties, using the current config values
  map.setPaintProperty(layerId, 'fill-color', {
    property: 'value',
    stops: [
      [0, config.colorScale[0]],
      [0.5, config.colorScale[1]],
      [1, config.colorScale[2]]
    ]
  });


   
  });

  const drawPolygon = new MapboxDraw();
  map.addControl(drawPolygon, "top-left");
  map.addControl(new NavigationControl(), "bottom-left");
}
