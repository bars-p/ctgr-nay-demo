<template>
  <div id="map"></div>
  <div id="rect" class="boxdraw"></div>
  <map-buttons-block
    class="buttons-block"
    @compass="processCompassClicked"
    @rotate="processRotateClicked"
    @ruler="toggleRuler"
  ></map-buttons-block>
</template>

<script setup>
import MapButtonsBlock from "@/components/MapButtonsBlock.vue";

import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import mapboxgl from "mapbox-gl";

import { MapboxLayer } from "@deck.gl/mapbox";
import { ArcLayer } from "@deck.gl/layers";

import axios from "axios";

import union from "@turf/union";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import length from "@turf/length";

import { useMapStore } from "@/store/map";
const { t } = useI18n();

// General component logic
const mapStore = useMapStore();

const props = defineProps(["mode"]);

onMounted(async () => {
  console.log("Map onMounted Called,", `mode "${props.mode}"`);

  // Load Data
  //
  await loadData();

  // Init map instance
  //
  await createMap();
  buildLayers();
});
// Process mode change
watch(
  () => props.mode,
  (to, from) => {
    console.warn(`Mode changed from ${from} to ${to}.`);
    displayModeLayers();

    if (to == "base") {
      map.flyTo({
        center: defaultCenter,
        zoom: defaultZoom,
        pitch: 0,
        bearing: 0,
      });
    }
    if (to == "demand") {
      if (mapStore.demandLevel == "area" && mapStore.savedAreas.length == 0) {
        mapStore.demandLevel = null;
      }
      mapStore.turnOnLayer(layersIdxs.zoneSelect);
      mapStore.turnOnLayer(layersIdxs.zonesSelected);
    }
    if (to == "connectivity") {
      mapStore.turnOnLayer(layersIdxs.zoneSelect);
      mapStore.turnOnLayer(layersIdxs.zonesSelected);
    }
    if (to == "sites") {
      mapStore.turnOnLayer(layersIdxs.sitesFill);
      mapStore.turnOnLayer(layersIdxs.sitesCentroids);
      mapStore.turnOnLayer(layersIdxs.sitesSelected);
    }
    if (from == "sites") {
      mapStore.turnOffLayer(layersIdxs.sitesSelected);
    }
    if (to == "routes") {
      mapStore.turnOnLayer(layersIdxs.ladsTraces);
    }

    // if (to == "social") {
    //   map.boxZoom.disable();
    // }
    // if (from == "social") {
    //   map.boxZoom.enable();
    // }
  }
);
watch(
  () => mapStore.activeMapStyle,
  () => {
    // console.log(
    //   "Change Map Style to:",
    //   mapStore.mapStyles[mapStore.activeMapStyle].title
    // );
    map.setStyle(mapStyles[mapStore.activeMapStyle]);
    // processLayersDisplay();
  }
);
watch(
  () => mapStore.layers,
  () => {
    // console.log("Store State Change WATCHED:", mapStore.layers);
    // console.log("From State:", fromState);
    // console.log("To State:", toState);
    processLayersDisplay();
  },
  { deep: true }
);
watch(
  () => mapStore.newLayerPaint,
  () => {
    updateLayerPaint(mapStore.newLayerPaint);
  }
);
watch(
  () => mapStore.newLayerFilter,
  () => {
    updateLayerFilter(mapStore.newLayerFilter);
  }
);
watch(
  () => mapStore.clearLayerFilter,
  () => {
    map.setFilter(mapStore.layers[mapStore.clearLayerFilter].name, null);
  }
);

watch(
  () => mapStore.centerItem,
  () => {
    switch (mapStore.centerItem.type) {
      case "site":
        centerToSite();
        break;

      default:
        break;
    }
  }
);

//
// Social
watch(
  () => mapStore.selectedCellsFeatures,
  () => {
    console.log("Watch for Selection");
    if (mapStore.selectedCellsFeatures.length == 0) {
      // Clear Selection Called
      selectedCellsIds.clear();
      console.log("SET FILTER 2");
    } else {
      // Replace Selected Called
      selectedCellsIds.clear();
      mapStore.selectedCellsFeatures.forEach((item) =>
        selectedCellsIds.add(item.properties.id)
      );
    }
    map.setFilter(mapStore.layers[mapStore.layersIdxs.cellsSelected].name, [
      "in",
      "id",
      ...selectedCellsIds,
    ]);
  }
);
watch(
  () => mapStore.savedCellsData,
  () => {
    selectedSource.data.features = [...mapStore.savedCellsData];
    console.log("Saved data to Display:", selectedSource);
    map.getSource("saved-areas-source").setData(selectedSource.data);
  }
);

//
//Demand
watch(
  () => mapStore.demandItemsForProcessing,
  () => {
    getDemandStatistics();
  }
);
watch(
  () => mapStore.demandSplit,
  () => {
    processDemandSplit();
  }
);

//
// Connectivity
watch(
  () => mapStore.connectivityItemsForProcessing,
  () => {
    getConnectivityStatistics();
  }
);
watch(
  () => mapStore.connectivityMapData,
  () => {
    console.log("Connect Map Watcher");
    drawConnectivityMap();
  }
);

//
// Sites
watch(
  () => mapStore.sitesColor,
  () => {
    setSitesColor(mapStore.sitesColor);
  }
);
watch(
  () => mapStore.centroidsColor,
  () => {
    setCentroidsColor(mapStore.centroidsColor);
  }
);
watch(
  () => mapStore.stopsColor,
  () => {
    setStopsColor(mapStore.stopsColor);
  }
);
watch(
  () => mapStore.selectedSiteIds,
  () => {
    console.log("Sites Ids Changed:", mapStore.selectedSiteIds);
    map.setFilter(mapStore.layers[layersIdxs.sitesSelected].name, [
      "in",
      "id",
      ...[...mapStore.selectedSiteIds],
    ]);
  },
  { deep: true }
);
watch(
  () => mapStore.currentSitesGroup,
  () => {
    if (mapStore.currentSitesGroup) {
      showCurrentSitesGroup();
    }
  },
  { deep: true }
);
watch(
  () => mapStore.useCurrentSiteGroup,
  () => {
    if (mapStore.useCurrentSiteGroup) {
      // Filter by current
      showCurrentSitesGroup();
    } else {
      // Clear filter
      showAllSites();
    }
  }
);

//
// Data processing
// FIXME: Data loading with BackEnd
let sourceAdminAreas = null;
let sourceAnalyticalZones = null;
let sourceBaseCells = null;
let sourceSites = null;
let sourceSitesCentroids = null;
let sourceStops = null;
let zonesStats = null; // FIXME: Needed because of incorrect GeoJSON 1000x1000 pop and emp data
let accessStats = null;
let sourceLadsTraces = null;

const loadData = async () => {
  await axios
    .get("Almaty_districts.geojson")
    .then((result) => (sourceAdminAreas = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("Admin Areas Loaded:", sourceAdminAreas.features.length);
  await axios
    .get("Almaty_cells_1000_1000.geojson")
    .then((result) => (sourceAnalyticalZones = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("1000x1000 Loaded:", sourceAnalyticalZones.features.length);

  // FIXME: Temp - total population data check
  // const totalPop = sourceAnalyticalZones.features.reduce((sum, cur) => {
  //   return sum + cur.properties.pop;
  // }, 0);
  // console.log("Population stats Total for 1000x1000:", totalPop);
  // const popData = sourceAnalyticalZones.features.map(
  //   (item) => item.properties.pop
  // );
  // console.log("Max Pop per Cell 1000x1000:", Math.max(...popData));
  // FIXME:

  await axios
    .get("Almaty_cells_100_100.geojson")
    .then((result) => (sourceBaseCells = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("100x100 Loaded:", sourceBaseCells.features.length);

  await axios
    .get("Almaty_sites_400.geojson")
    .then((result) => (sourceSites = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("Sites Loaded:", sourceSites.features.length);

  await axios
    .get("Almaty_sites_400_centroids.geojson")
    .then((result) => (sourceSitesCentroids = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("Sites Centroids Loaded:", sourceSitesCentroids.features.length);

  // Enrich Centroids Data - Careful fo ID! - data by Index
  // FIXME: Redundant data load, should be fixed
  let sitesStats = null;
  await axios
    .get("Almaty_sites_stats.json")
    .then((result) => (sitesStats = result.data))
    .catch((err) => console.warn("Error loading Sites stats", err));
  sourceSitesCentroids.features.forEach((item, i) => {
    if (item.properties.id == sitesStats[i].id) {
      item.properties = { ...sitesStats[i] };
    } else {
      console.error("Failed merge sites stats");
      return;
    }
  });
  console.log("Sites Centroids Rich data:", sourceSitesCentroids);

  await axios
    .get("Almaty_stops.geojson")
    .then((result) => (sourceStops = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("Stops Loaded:", sourceStops.features.length);

  // Enrich zones data with Access stats
  await axios
    .get("Almaty_zones_1000_1000_stats.json")
    .then((result) => (zonesStats = result.data))
    .catch((err) => console.log("ERROR load", err));
  sourceAnalyticalZones.features.forEach((zone, i) => {
    // console.log("Zone", zone);
    if (zone.properties.id == zonesStats[i].zoneId) {
      zone.properties.pop = +zonesStats[i].pop;
      zone.properties.emp = +zonesStats[i].emp;
    } else {
      console.error("Failed merge Zones stats");
      return;
    }
  });

  // Enrich cells data with Access stats
  await axios
    .get("Almaty_access_cells_100_100.json")
    .then((result) => (accessStats = result.data))
    .catch((err) => console.warn("Error loading Accessability data", err));
  sourceBaseCells.features.forEach((cell, i) => {
    if (cell.properties.id == accessStats[i].id) {
      cell.properties = {
        ...cell.properties,
        ...accessStats[i],
      };
    } else {
      console.error("Failed merge Cells stats");
      return;
    }
  });

  await axios
    .get("Almaty_traces.geojson")
    .then((result) => (sourceLadsTraces = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("Lads Traces Loaded:", sourceLadsTraces.features.length);

  // console.log("🙆🏻🙆🏻🙆🏻 TEST", sourceBaseCells.features[101].properties);

  // FIXME: Temp - total population data check
  // const totalPop100 = sourceBaseCells.features.reduce((sum, cur) => {
  //   return sum + cur.properties.pop;
  // }, 0);
  // console.log("Population stats Total for 100x100:", totalPop100);
  // const popData100 = sourceBaseCells.features.map(
  //   (item) => item.properties.pop
  // );
  // console.log("Max Pop per Cell 100x100:", Math.max(...popData100));
  // FIXME:
};

// Map processing
const accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN;
const defaultZoom = 11;
const defaultCenter = [76.863441, 43.257331];
const mapStyles = mapStore.mapStyles.map((style) => style.uri);
const defaultMapStyle = mapStore.activeMapStyle;

const layersIdxs = mapStore.layersIdxs;

const selectedCellsIds = new Set();
// const selectedCellsFeatures = ref([]);

let connectArcs = null;

let map = {};

let localLayersState = [];

// Default sets of Layers
const basicLayersIdxs = [
  layersIdxs.adminBorder,
  layersIdxs.adminFill,
  layersIdxs.zonesBorder,
];
const socialLayersIdxs = [
  layersIdxs.adminBorder,
  layersIdxs.zonesBorder,
  layersIdxs.cellsSelected,
  layersIdxs.cellsSaved,
];
const demandLayersIdxs = [
  layersIdxs.adminBorder,
  // layersIdxs.adminFill,
  layersIdxs.zonesBorder,
  layersIdxs.adminAreaSelect,
  layersIdxs.zoneSelect,
];
const connectivityLayersIdxs = [
  layersIdxs.adminBorder,
  // layersIdxs.adminFill,
  layersIdxs.zonesBorder,
  // layersIdxs.adminAreaSelect,
  layersIdxs.zoneSelect,
];
const routesLayersIdxs = [
  layersIdxs.adminBorder,
  layersIdxs.adminFill,
  layersIdxs.zonesBorder,
  layersIdxs.ladsTraces,
];
// const stopsLayersIdxs = [layersIdxs.adminBorder, layersIdxs.cellsFill];
const sitesLayersIdxs = [
  layersIdxs.zonesBorder,
  layersIdxs.adminBorder,
  layersIdxs.sitesFill,
  layersIdxs.sitesCentroids,
  layersIdxs.sitesSelected,
];
const accessLayersIdxs = [
  // layersIdxs.cellsFill,
  layersIdxs.zonesBorder,
  layersIdxs.adminBorder,
];

const mapPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

const selectedSource = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

const measureData = {
  type: "FeatureCollection",
  features: [],
};

const measureLine = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [],
  },
};

const createMap = async () => {
  console.log("In createMap");
  try {
    mapboxgl.accessToken = accessToken;
    map = await new mapboxgl.Map({
      container: "map",
      style: mapStyles[defaultMapStyle],
      center: defaultCenter,
      zoom: defaultZoom,
    });
  } catch (err) {
    console.error("Map init error:", err);
  }
  map.boxZoom.disable();
};

const buildLayers = () => {
  map.on("load", () => {
    // const styleJson = map.getStyle();
    // console.log("Map style", styleJson);
    const canvas = map.getCanvasContainer();

    map.addSource("admin-areas-source", {
      type: "geojson",
      data: sourceAdminAreas,
    });
    map.addSource("analytical-zones-source", {
      type: "geojson",
      data: sourceAnalyticalZones,
    });
    map.addSource("cells-source", {
      type: "geojson",
      data: sourceBaseCells,
    });
    map.addSource("sites-source", {
      type: "geojson",
      data: sourceSites,
    });
    map.addSource("sites-centroids-source", {
      type: "geojson",
      data: sourceSitesCentroids,
    });
    map.addSource("stops-source", {
      type: "geojson",
      data: sourceStops,
    });
    map.addSource("lads-source", {
      type: "geojson",
      data: sourceLadsTraces,
    });
    map.addSource("saved-areas-source", selectedSource);

    map.addSource("measure-source", {
      type: "geojson",
      data: measureData,
    });

    connectArcs = new MapboxLayer({
      id: "connect-arcs",
      type: ArcLayer,
      data: [],
      getSourcePosition: (d) => d.fromCoord,
      getTargetPosition: (d) => d.toCoord,
      getSourceColor: [160, 160, 160],
      getTargetColor: (d) => mapStore.colorLevels[d.sp],
      getWidth: (d) => d.dm * 2,
    });

    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.ladsTraces].name,
        type: "line",
        source: "lads-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-width": 2,
          "line-color": "#4d4d33",
          "line-opacity": 0.8,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.zonesFill].name,
        type: "fill",
        source: "analytical-zones-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": {
            property: "value",
            stops: [
              [0, "#fff5e6"],
              [5, "#ffd699"],
              [10, "#ffad33"],
              [25, "#ff9900"],
              [50, "#cc7a00"],
              [75, "#995c00"],
              [100, "#663d00"],
            ],
          },
          "fill-opacity": 0.7,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "cells-fill",
        type: "fill",
        source: "cells-source",
        layout: {
          visibility: "none",
        },
        paint: {
          // "fill-color": {
          //   property: "pop",
          //   stops: [
          //     [0, "#FFFFFF"],
          //     [10, "#FED976"],
          //     [100, "#FC4E2A"],
          //     [500, "#E31A1C"],
          //     [1000, "#BD0026"],
          //     [20000, "#800026"],
          //   ],
          // },
          "fill-color": "#FED976",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.7,
            0.6,
          ],
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.sitesFill].name,
        type: "fill",
        source: "sites-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": mapStore.sitesColor,
          "fill-opacity": 0.7,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.sitesSelected].name,
        type: "line",
        source: "sites-source",
        layout: {
          visibility: "none",
        },
        filter: ["in", "id", ""],
        paint: {
          "line-width": 3,
          "line-color": "#802000",
          "line-opacity": 0.6,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.sitesCentroids].name,
        type: "circle",
        source: "sites-centroids-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "circle-color": mapStore.centroidsColor,
          "circle-radius": 5,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.sitesAnalytics].name,
        type: "circle",
        source: "sites-centroids-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "circle-color": mapStore.centroidsColor,
          "circle-radius": 5,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.stopsPoints].name,
        type: "circle",
        source: "stops-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "circle-color": mapStore.stopsColor,
          "circle-radius": 3,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "admin-areas-fill",
        type: "fill",
        source: "admin-areas-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.4,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "cells-saved",
        type: "fill",
        source: "saved-areas-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.7,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "cells-selected",
        type: "line",
        source: "cells-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": "#ff1100",
          "line-opacity": 0.7,
          "line-width": 2,
        },
        filter: ["in", "id", ""],
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "analytical-zones-border",
        type: "line",
        source: "analytical-zones-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-width": 1,
          // "line-dasharray": [8, 8],
          "line-color": "grey",
          "line-opacity": 0.8,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "admin-areas-border",
        type: "line",
        source: "admin-areas-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-width": 2,
          "line-color": "#B71C1C",
          "line-opacity": 0.6,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.adminAreaSelect].name,
        type: "fill",
        source: "admin-areas-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.adminAreasSelected].name,
        type: "line",
        source: "admin-areas-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        filter: ["in", "id", ""],
        paint: {
          "line-width": 5,
          "line-color": "#802000",
          "line-opacity": 0.6,
        },
      },
      "road-label"
    );

    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.zoneSelect].name,
        type: "fill",
        source: "analytical-zones-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.zonesSelected].name,
        type: "line",
        source: "analytical-zones-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        filter: ["in", "id", ""],
        paint: {
          "line-width": 5,
          // "line-dasharray": [8, 8],
          "line-color": "#802000",
          "line-opacity": 0.7,
        },
      },
      "road-label"
    );
    map.addLayer(
      {
        id: mapStore.layers[layersIdxs.savedAreasSelected].name,
        type: "line",
        source: "saved-areas-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        filter: ["in", "name", ""],
        paint: {
          "line-width": 2,
          "line-color": "#802000",
          "line-opacity": 0.7,
        },
      },
      "road-label"
    );

    map.addLayer({
      id: "cells-extrusion",
      type: "fill-extrusion",
      source: "cells-source",
      layout: {
        visibility: "none",
      },
      paint: {
        "fill-extrusion-color": [
          "step",
          ["get", "pop"],
          "#e6ccb3",
          0.02,
          "#d9b38c",
          1,
          "#ce9564",
          10,
          "#cc9966",
          100,
          "#996633",
          1000,
          "#604020",
        ],
        "fill-extrusion-height": ["get", "pop"],
        "fill-extrusion-opacity": 0.5,
      },
    });

    map.addLayer({
      id: "measure-points",
      type: "circle",
      source: "measure-source",
      layout: {
        visibility: "none",
      },
      paint: {
        "circle-radius": 5,
        "circle-color": "#000",
      },
      filter: ["in", "$type", "Point"],
    });
    map.addLayer({
      id: "measure-lines",
      type: "line",
      source: "measure-source",
      layout: {
        "line-cap": "round",
        "line-join": "round",
        visibility: "none",
      },
      paint: {
        "line-color": "#000",
        "line-width": 2.5,
      },
      filter: ["in", "$type", "LineString"],
    });
    map.addLayer({
      id: "measure-labels",
      type: "symbol",
      source: "measure-source",
      layout: {
        "text-field": ["get", "distance"],
        "text-variable-anchor": ["left", "right"],
        "text-radial-offset": 0.5,
        "text-justify": "auto",
      },
    });

    map.addLayer(connectArcs);

    map.on("style.load", () => {
      console.warn("MAP STYLE CHANGED!");
      // TODO: Restore Layers
    });

    // TODO: Bulk-select
    // TODO: Probably change logic by mode
    // TODO:
    // FIXME:
    // FIXME:
    // FIXME:

    // Variable to hold the starting xy coordinates
    // when `mousedown` occured.
    let start;

    // Variable to hold the current xy coordinates
    // when `mousemove` or `mouseup` occurs.
    let current;

    // Variable for the draw box element.
    const box = document.getElementById("rect");

    // Set `true` to dispatch the event before other functions
    // call it. This is necessary for disabling the default map
    // dragging behaviour.
    canvas.addEventListener("mousedown", mouseDown, true);

    // Return the xy coordinates of the mouse position
    function mousePos(e) {
      const rect = canvas.getBoundingClientRect();
      return new mapboxgl.Point(
        e.clientX - rect.left - canvas.clientLeft,
        e.clientY - rect.top - canvas.clientTop
      );
    }

    function mouseDown(e) {
      if (
        !(
          props.mode == "social" ||
          (props.mode == "sites" && mapStore.sitesSelectionMode == "sites")
        )
      )
        return;
      // Continue the rest of the function if the shiftkey is pressed.
      if (!(e.shiftKey && e.button === 0)) return;

      // Disable default drag zooming when the shift key is held down.
      map.dragPan.disable();

      // Call functions for the following events
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("keydown", onKeyDown);

      // Capture the first xy coordinates
      start = mousePos(e);
    }

    function onMouseMove(e) {
      // Capture the ongoing xy coordinates
      current = mousePos(e);

      // Append the box element if it doesnt exist
      // if (!box) {
      //   // box = document.getElementById("rect");
      //   box = document.createElement("div");
      //   box.classList.add("boxdraw");

      //   // canvas.appendChild(box);
      //   selectionRect.appendChild(box);
      //   console.log("RECT", selectionRect, selectionRect.style.position);
      // }

      const minX = Math.min(start.x, current.x),
        maxX = Math.max(start.x, current.x),
        minY = Math.min(start.y, current.y),
        maxY = Math.max(start.y, current.y);

      // Adjust width and xy position of the box element ongoing
      const pos = `translate(${minX - 213}px, ${minY + 64}px)`;
      box.style.transform = pos;
      box.style.width = maxX - minX + "px";
      box.style.height = maxY - minY + "px";
      // console.log("BOX:", box);
    }

    function onMouseUp(e) {
      // Capture xy coordinates
      finish([start, mousePos(e)]);
    }

    function onKeyDown(e) {
      // If the ESC key is pressed
      if (e.keyCode === 27) finish();
    }

    function finish(bbox) {
      // Remove these events now that finish has been called.
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mouseup", onMouseUp);

      // box.style.top = 0;
      // box.style.left = 0;
      box.style.transform = "translate(0, 0)";
      box.style.width = 0;
      box.style.height = 0;
      // if (box) {
      // box.parentNode.removeChild(box);
      // box = null;
      // }

      // If bbox exists. use this value as the argument for `queryRenderedFeatures`
      if (bbox) {
        let features = null;
        switch (props.mode) {
          case "social":
            features = map.queryRenderedFeatures(bbox, {
              layers: ["cells-fill"],
            });
            break;

          case "sites":
            features = map.queryRenderedFeatures(bbox, {
              layers: [mapStore.layers[layersIdxs.sitesCentroids].name],
            });
            break;

          default:
            break;
        }

        if (features.length >= 1000) {
          return window.alert(t("tools.socialSelectedToMany"));
        }

        // Run through the selected features and set a filter
        // to match features with unique FIPS codes to activate
        // the `counties-highlighted` layer.
        // const fips = features.map((feature) => feature.properties.FIPS);
        // map.setFilter("counties-highlighted", ["in", "FIPS", ...fips]);

        // FIXME: Unique test for features selected
        console.warn("Selected", features.length);
        const deduplicated = new Map();
        features.forEach((item) => deduplicated.set(item.properties.id, item));
        console.warn("Deduplicated", [...deduplicated.values()].length);
        if (features.length > 0) {
          if (props.mode == "social") {
            processCellsSelected([...deduplicated.values()]);
          } else if (props.mode == "sites") {
            processSitesSelected(
              [...deduplicated.values()].map((item) => item.properties.id)
            );
          }
        }
      }

      map.dragPan.enable();
    }

    // FIXME:
    // FIXME:
    // TODO:
    // TODO:

    //
    // Measure Processing
    //
    map.on("mousemove", (e) => {
      if (!mapStore.measureActive) {
        return;
      }
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["measure-points"],
      });
      // Change the cursor to a pointer when hovering over a point on the map.
      // Otherwise cursor is a crosshair.
      map.getCanvas().style.cursor = features.length ? "pointer" : "crosshair";
    });
    map.on("click", (e) => {
      if (!mapStore.measureActive) {
        return;
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: ["measure-points"],
      });

      // Remove the linestring from the group
      // so we can redraw it based on the points collection.
      if (measureData.features.length > 1) measureData.features.pop();

      // Clear the distance container to populate it with a new value.
      // distanceContainer.innerHTML = "";

      // If a feature was clicked, remove it from the map.
      if (features.length) {
        const id = features[0].properties.id;
        measureData.features = measureData.features.filter(
          (point) => point.properties.id !== id
        );
        // TODO: Rebuild distances!
        if (measureData.features.length > 0) {
          measureData.features[0].properties.distance = 0;
          measureLine.geometry.coordinates = [
            measureData.features[0].geometry.coordinates,
          ];
          for (let i = 1; i < measureData.features.length; i++) {
            measureLine.geometry.coordinates.push(
              measureData.features[i].geometry.coordinates
            );
            const segmentDistance = length(measureLine);
            measureData.features[i].properties.distance =
              segmentDistance.toFixed(2);
          }
        }
      } else {
        const point = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [e.lngLat.lng, e.lngLat.lat],
          },
          properties: {
            id: String(new Date().getTime()),
            distance: 0,
          },
        };

        measureData.features.push(point);
      }

      if (measureData.features.length > 1) {
        measureLine.geometry.coordinates = measureData.features.map(
          (point) => point.geometry.coordinates
        );

        // Populate the distanceContainer with total distance
        // const value = document.createElement("pre");

        const distance = length(measureLine);

        // value.textContent = `Total distance: ${distance.toLocaleString()}km`;
        // distanceContainer.appendChild(value);
        measureData.features.at(-1).properties.distance = distance.toFixed(2);

        console.log("Distance", distance);

        measureData.features.push(measureLine);
      }

      map.getSource("measure-source").setData(measureData);
    });

    //
    // Social processing
    map.on("mousemove", "cells-fill", (e) => {
      if (props.mode == "social") {
        map.getCanvas().style.cursor = "pointer";
        // console.log("Hovered:", e.features[0]);
        const cellData = e.features[0].properties;
        const cellPop = `<br><strong>🏠:</strong> ${cellData.pop}`;
        const cellEmp = `<br><strong>🏢:</strong> ${cellData.emp}`;

        const description = `id: ${cellData.id}${cellPop}${cellEmp}`;

        mapPopup.setLngLat(e.lngLat).setHTML(description).addTo(map);
      }
    });
    map.on("mouseleave", "cells-fill", () => {
      if (props.mode == "social") {
        map.getCanvas().style.cursor = "";
        mapPopup.remove();
      }
    });
    map.on("click", "cells-fill", (item) => {
      if (mapStore.measureActive) {
        return;
      }
      if (props.mode == "social") {
        // const clickedId = item.features[0].properties.id;
        const feature = Object.assign(item.features[0]);
        console.log("Click happened on:", feature);
        // selectedCellsFeatures.value.add(feature);
        // console.log("Feature stored:", selectedCellsFeatures.value);
        processCellsSelected([feature]);
      }
    });

    //
    // Sites processing
    //
    map.on("click", mapStore.layers[layersIdxs.sitesFill].name, (item) => {
      if (mapStore.measureActive) {
        return;
      }

      if (props.mode == "sites" && mapStore.sitesSelectionMode == "sites") {
        const feature = Object.assign(item.features[0]);
        processSitesSelected([feature.properties.id]);
      }
    });
    map.on("mousemove", mapStore.layers[layersIdxs.sitesFill].name, (e) => {
      if (props.mode == "sites" && mapStore.sitesSelectionMode == "sites") {
        map.getCanvas().style.cursor = "pointer";
        // console.log("Hovered:", e.features[0]);
        const siteData = e.features[0].properties;
        const name = mapStore.getSiteName(siteData.id);
        const description = `${t("tools.sitesId")}: ${siteData.id}<br>${t(
          "tools.sitesName"
        )}: ${name}`;
        mapPopup.setLngLat(e.lngLat).setHTML(description).addTo(map);
      }
    });
    map.on("mouseleave", mapStore.layers[layersIdxs.sitesFill].name, () => {
      if (props.mode == "sites" && mapStore.sitesSelectionMode == "sites") {
        map.getCanvas().style.cursor = "";
        mapPopup.remove();
      }
    });

    //
    // Demand processing (not all)

    //
    // Admin Area - District - Highlight on Hover Processing - DEMAND, SITES
    //
    map.on(
      "mousemove",
      mapStore.layers[layersIdxs.adminAreaSelect].name,
      (e) => {
        if (
          (props.mode == "demand" && mapStore.demandLevel == "district") ||
          (props.mode == "sites" &&
            mapStore.sitesSelectionMode == "district" &&
            !mapStore.useCurrentSiteGroup)
        ) {
          map.getCanvas().style.cursor = "pointer";
          // console.log("Hovered:", e.features[0]);
          const cellData = e.features[0].properties;
          const description = `${cellData.name}`;

          mapPopup.setLngLat(e.lngLat).setHTML(description).addTo(map);
        }
      }
    );
    map.on(
      "mouseleave",
      mapStore.layers[layersIdxs.adminAreaSelect].name,
      () => {
        if (
          (props.mode == "demand" && mapStore.demandLevel == "district") ||
          (props.mode == "sites" &&
            mapStore.sitesSelectionMode == "district" &&
            !mapStore.useCurrentSiteGroup)
        ) {
          map.getCanvas().style.cursor = "";
          mapPopup.remove();
        }
      }
    );

    map.on("mousemove", mapStore.layers[layersIdxs.zoneSelect].name, () => {
      if (props.mode == "demand") {
        if (mapStore.demandLevel == "zone") {
          map.getCanvas().style.cursor = "pointer";
          // console.log("Hovered:", e.features[0]);
        }
      } else if (props.mode == "connectivity" && mapStore.connectivityType) {
        map.getCanvas().style.cursor = "pointer";
      }
    });
    map.on("mouseleave", mapStore.layers[layersIdxs.zoneSelect].name, () => {
      if (props.mode == "demand") {
        if (mapStore.demandLevel == "zone") {
          map.getCanvas().style.cursor = "";
          mapPopup.remove();
        }
      } else if (props.mode == "connectivity" && mapStore.connectivityType) {
        map.getCanvas().style.cursor = "";
      }
    });

    //
    // Saved Cells Groups - District - Highlight on Hover Processing - DEMAND, SITES
    //
    map.on("mousemove", "cells-saved", (e) => {
      if (
        (props.mode == "demand" && mapStore.demandLevel == "area") ||
        (props.mode == "sites" &&
          mapStore.sitesSelectionMode == "area" &&
          !mapStore.useCurrentSiteGroup)
      ) {
        map.getCanvas().style.cursor = "pointer";
        // console.log("Hovered:", e.features[0]);
        const cellData = e.features[0].properties;
        const description = `${cellData.name}`;

        mapPopup.setLngLat(e.lngLat).setHTML(description).addTo(map);
      }
    });
    map.on("mouseleave", "cells-saved", () => {
      if (
        (props.mode == "demand" && mapStore.demandLevel == "area") ||
        (props.mode == "sites" &&
          mapStore.sitesSelectionMode == "area" &&
          !mapStore.useCurrentSiteGroup)
      ) {
        map.getCanvas().style.cursor = "";
        mapPopup.remove();
      }
    });

    //
    // Admin Area - District - Select Processing - DEMAND, SITES
    //
    map.on(
      "click",
      mapStore.layers[layersIdxs.adminAreaSelect].name,
      (item) => {
        if (props.mode == "demand" && mapStore.demandLevel == "district") {
          const feature = Object.assign(item.features[0]);
          processDemandFeatureSelect(feature.properties.id);
        }
        if (
          props.mode == "sites" &&
          mapStore.sitesSelectionMode == "district" &&
          !mapStore.useCurrentSiteGroup
        ) {
          const feature = Object.assign(item.features[0]);
          processSitesByDistrict(feature.properties.id);
        }
      }
    );

    map.on("click", mapStore.layers[layersIdxs.zoneSelect].name, (item) => {
      if (mapStore.measureActive) {
        return;
      }

      if (props.mode == "demand" && mapStore.demandLevel == "zone") {
        const feature = Object.assign(item.features[0]);
        processDemandFeatureSelect(feature.properties.id);
      } else if (props.mode == "connectivity" && mapStore.connectivityType) {
        const feature = Object.assign(item.features[0]);
        processConnectivityFeatureSelect(feature.properties.id);
      }
    });

    //
    // Saved Cells Groups - District - Select Processing - DEMAND, SITES
    //
    map.on("click", mapStore.layers[layersIdxs.cellsSaved].name, (item) => {
      if (mapStore.measureActive) {
        return;
      }

      if (props.mode == "demand" && mapStore.demandLevel == "area") {
        const feature = Object.assign(item.features[0]);
        processDemandFeatureSelect(feature.properties.name);
      }
      if (props.mode == "sites" && mapStore.sitesSelectionMode == "area") {
        const feature = Object.assign(item.features[0]);
        processSitesBySavedArea(feature.properties.name);
      }
    });

    setLocalLayers();
    displayModeLayers();
  });
};

const setLocalLayers = () => {
  localLayersState = mapStore.layers.map((layer) => layer.shown);
  // console.log("Local Layers State Recorded:", localLayersState);
};

const displayModeLayers = () => {
  switch (props.mode) {
    case "social":
      if (mapStore.isLayersSet == false) {
        console.log("Set SOCIAL layers");
        toggleLayers(socialLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;
    case "demand":
      if (mapStore.isLayersSet == false) {
        console.log("Set DEMAND layers");
        toggleLayers(demandLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;
    case "connectivity":
      if (mapStore.isLayersSet == false) {
        console.log("Set CONNECTIVITY layers");
        toggleLayers(connectivityLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;
    case "routes":
      if (mapStore.isLayersSet == false) {
        console.log("Set ROUTES layers");
        toggleLayers(routesLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;
    // case "stops":
    //   if (mapStore.isLayersSet == false) {
    //     console.log("Set STOP layers");
    //     toggleLayers(stopsLayersIdxs);
    //     mapStore.isLayersSet = true;
    //   }
    //   break;
    case "sites":
      if (mapStore.isLayersSet == false) {
        console.log("Set Sites layers");
        toggleLayers(sitesLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;
    case "access":
      if (mapStore.isLayersSet == false) {
        console.log("Set Access layers");
        toggleLayers(accessLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;

    default:
      console.log("Display BASIC layers");
      toggleLayers(basicLayersIdxs);
      mapStore.isLayersSet = false;

      break;
  }
};
const toggleLayers = (idxs) => {
  const layers = mapStore.layers.map((item) => ({ ...item, shown: false }));
  for (const idx of idxs) {
    layers[idx].shown = true;
  }

  console.log("Layers State to BE:", layers);
  mapStore.updateLayers(layers);
};
const processLayersDisplay = () => {
  // console.log("In Layers Display Method");
  // console.log("Local Layers:", localLayersState);
  // console.log("Store Layers", mapStore.layers);
  for (const layer of mapStore.layers) {
    const idx = layer.idx;
    // console.log("Store Layer Processed:", idx, layer);
    if (layer.shown != localLayersState[idx]) {
      // console.log("New state for:", mapStore.layers[idx]);
      map.setLayoutProperty(
        layer.name,
        "visibility",
        localLayersState[idx] ? "none" : "visible"
      );
    }
  }

  setLocalLayers();
};
const updateLayerPaint = (data) => {
  for (const propName in data.paintProps) {
    console.log("Paint prop:", propName);
    map.setPaintProperty(
      mapStore.layers[data.layerIdx].name,
      propName,
      data.paintProps[propName]
    );
  }

  // TODO: Toggle Layer On if Off - done in calling component
  // console.log("Layer State:", localLayersState[data.layerIdx]);
  // if (!localLayersState[data.layerIdx]) {
  //   mapStore.layers[data.layerIdx].shown = true;
  // }
};
const updateLayerFilter = (data) => {
  map.setFilter(mapStore.layers[data.layerIdx].name, data.filterProps);
};
const processCellsSelected = (cellsFeatures) => {
  // console.log("Features:", cellsFeatures);
  cellsFeatures.forEach((feature) => {
    const id = feature.properties.id;
    if (selectedCellsIds.has(id)) {
      // console.log("REMOVE", id);
      selectedCellsIds.delete(id);
      mapStore.removeCellFromSelected(feature);
    } else {
      // console.log("ADD", id);

      const objectToStore = {
        id: feature.id,
        layer: { ...feature.layer },
        properties: { ...feature.properties },
        source: feature.source,
        type: feature.type,
        geometry: { ...feature.geometry },
      };
      // console.log("Object to Store:", objectToStore);
      selectedCellsIds.add(id);
      mapStore.addCellToSelected(objectToStore);
    }
  });
  console.log("SET FILTER 1");
  map.setFilter(mapStore.layers[mapStore.layersIdxs.cellsSelected].name, [
    "in",
    "id",
    ...selectedCellsIds,
  ]);
};

//
// Sites Logic
//
const setSitesColor = (color) => {
  const layerPaintData = {
    layerIdx: layersIdxs.sitesFill,
    paintProps: {
      "fill-color": color,
    },
  };
  updateLayerPaint(layerPaintData);
};

const setCentroidsColor = (color) => {
  const layerPaintData = {
    layerIdx: layersIdxs.sitesCentroids,
    paintProps: {
      "circle-color": color,
    },
  };
  updateLayerPaint(layerPaintData);
};

const setStopsColor = (color) => {
  const layerPaintData = {
    layerIdx: layersIdxs.stopsPoints,
    paintProps: {
      "circle-color": color,
    },
  };
  updateLayerPaint(layerPaintData);
};

const processSitesByDistrict = (districtId) => {
  console.log("District", districtId);
  processSitesSelected(mapStore.getSitesByDistrict(districtId));
};

const processSitesBySavedArea = (name) => {
  console.log("Area:", name);
  const areaCells = mapStore.savedCellsData.filter(
    (item) => item.properties.name == name
  );
  let areaUnion = null;
  if (areaCells.length == 0) {
    return;
  } else {
    areaUnion = areaCells[0];
    for (let i = 1; i < areaCells.length; i++) {
      areaUnion = union(areaUnion.geometry, areaCells[i].geometry);
    }
    // areaUnion.properties.name = areaCells[0].properties.name;
    // areaUnion.properties.color = areaCells[0].properties.color;
  }
  // selectedSource.data.features = [areaUnion];
  // map.getSource("saved-areas-source").setData(selectedSource.data);

  const siteIds = [];

  sourceSitesCentroids.features.forEach((site) => {
    if (booleanPointInPolygon(site.geometry.coordinates, areaUnion)) {
      siteIds.push(site.properties.id);
    }
  });

  siteIds.forEach((id) => {
    mapStore.selectedSiteIds.add(id);
  });
};

const processSitesSelected = (sitesIds) => {
  sitesIds.forEach((id) => {
    if (mapStore.selectedSiteIds.has(id)) {
      mapStore.selectedSiteIds.delete(id);
    } else {
      mapStore.selectedSiteIds.add(id);
    }
  });
};

const showCurrentSitesGroup = () => {
  const ids = mapStore.currentSitesGroup.sites
    .filter((site) => site.shown)
    .map((site) => site.id);
  const stopIds = ids.map((id) => mapStore.getSiteStopIds(id));
  const stopsSet = new Set();
  stopIds.forEach((ids) => ids.forEach((id) => stopsSet.add(id)));
  // console.log("Stop IDS", stopIds);
  // console.log("Stop Set", stopsSet);
  map.setFilter(mapStore.layers[layersIdxs.sitesFill].name, [
    "in",
    "id",
    ...ids,
  ]);
  map.setFilter(mapStore.layers[layersIdxs.sitesCentroids].name, [
    "in",
    "id",
    ...ids,
  ]);
  map.setFilter(mapStore.layers[layersIdxs.sitesAnalytics].name, [
    "in",
    "id",
    ...ids,
  ]);
  map.setFilter(mapStore.layers[layersIdxs.stopsPoints].name, [
    "in",
    "id",
    ...stopsSet,
  ]);

  // FIXME: Delete
  console.log("🦚 Centroids Source", sourceSitesCentroids);
};
const showAllSites = () => {
  map.setFilter(mapStore.layers[layersIdxs.sitesFill].name, null);
  map.setFilter(mapStore.layers[layersIdxs.sitesCentroids].name, null);
  map.setFilter(mapStore.layers[layersIdxs.stopsPoints].name, null);
};

const centerToSite = () => {
  const siteCentroid = sourceSitesCentroids.features.find(
    (item) => item.properties.id == mapStore.centerItem.id
  );
  console.log("Centroid:", siteCentroid);
  // console.log("Coordinates:", coordinates);
  map.flyTo({ center: siteCentroid.geometry.coordinates });
};

//
// Demand Logic
//
let demandSplitDone = false;
const processDemandFeatureSelect = (id) => {
  console.log("Select Item", id, mapStore.demandLevel);
  if (mapStore.demandLevel == "district") {
    mapStore.demandDistrictId = id;
  }
  if (mapStore.demandSelectMode == "one") {
    mapStore.demandItemsSelectedIds.clear();
    mapStore.demandItemsSelectedIds.add(id);
    mapStore.demandIdsFromLevel = mapStore.demandLevel;
  } else if (mapStore.demandSelectMode == "many") {
    if (mapStore.demandIdsFromLevel != mapStore.demandLevel) {
      mapStore.demandItemsSelectedIds.clear();
      mapStore.demandIdsFromLevel = mapStore.demandLevel;
    }
    if (mapStore.demandItemsSelectedIds.has(id)) {
      mapStore.demandItemsSelectedIds.delete(id);
    } else {
      mapStore.demandItemsSelectedIds.add(id);
    }
  }
  setDemandSelectFilter();
  if (mapStore.demandSelectMode == "one") {
    getDemandStatistics();
  }
};
const setDemandSelectFilter = () => {
  let idName = "id";
  let layerIdx = null;
  switch (mapStore.demandLevel) {
    case "district":
      layerIdx = mapStore.layersIdxs.adminAreasSelected;
      break;
    case "zone":
      layerIdx = mapStore.layersIdxs.zonesSelected;
      break;
    case "area":
      layerIdx = mapStore.layersIdxs.savedAreasSelected;
      idName = "name";
      break;

    default:
      return;
  }
  map.setFilter(mapStore.layers[layerIdx].name, [
    "in",
    idName,
    ...[...mapStore.demandItemsSelectedIds],
  ]);
};
const getDemandStatistics = () => {
  console.log(
    "🐷 Demand Statistics Processed",
    mapStore.demandItemsSelectedIds
  );
  if (mapStore.demandItemsSelectedIds.size == 0) {
    // For empty request - clear all
    clearAdminAreasSelected();
    clearZonesSelected();
    clearSavedAreasSelected();
    mapStore.demandReady = false;
    // mapStore.demandSplit = false;
    demandSplitDone = false;
    mapStore.demandDistrictParsed = false;
    return;
  } else {
    // If any item selected - clear others
    const zoneIds = new Set(); // FIXME:L Remove later
    switch (mapStore.demandLevel) {
      case "district":
        clearZonesSelected();
        clearSavedAreasSelected();
        mapStore.demandItemsSelectedIds.forEach((id) => {
          const ids = mapStore.getZoneIdsByDistrict(id);
          console.log("IDs", ids);
          ids.forEach((zoneId) => zoneIds.add(zoneId));
        });
        console.log("Zones Collected", zoneIds);
        mapStore.demandItemsSelectedIds = zoneIds;
        mapStore.demandDistrictParsed = true;
        displayDemandZones(getDemandZonesStatistics());

        mapStore.demandReady = true;
        mapStore.demandSplit = false;
        demandSplitDone = false;
        break;

      case "zone":
        clearAdminAreasSelected();
        clearSavedAreasSelected();

        displayDemandZones(getDemandZonesStatistics());

        mapStore.demandReady = true;
        mapStore.demandSplit = false;
        demandSplitDone = false;
        break;

      case "area":
        clearAdminAreasSelected();
        clearZonesSelected();

        displayDemandZones(getDemandSavedCellsStatistics());

        mapStore.demandReady = true;
        mapStore.demandSplit = false;
        demandSplitDone = false;
        break;

      default:
        console.warn("Not implemented level");
        clearAdminAreasSelected();
        clearSavedAreasSelected();
        clearZonesSelected();

        mapStore.demandReady = false;
        mapStore.demandSplit = false;
        demandSplitDone = false;

        break;
    }
  }
};
const displayDemandZones = (zonesData) => {
  //Calculate Demand statistics
  // const zonesData = getDemandZonesStatistics();
  // console.log("Data:", zonesData);

  // Reference level adjustment
  let maxValue = mapStore.demandCityMax;
  if (mapStore.demandReference == "selection") {
    maxValue = Math.max(...zonesData.map((item) => +item.value));
    console.log("Max Value found:", maxValue);
  }
  // zonesData.forEach(item => item.value = item.value/maxValue);

  // Set new Source values and setSource
  zonesData.forEach((item, i) => {
    if (item.zoneId != sourceAnalyticalZones.features[i].properties.id) {
      console.error("Demand data incorrect order.");
      return;
    }
    sourceAnalyticalZones.features[i].properties.value =
      maxValue != 0 ? (+item.value * 100) / maxValue : 0;
  });
  // console.log("Source data:", sourceAnalyticalZones);

  let layerPaintData = null;
  if (mapStore.demandDirection == "from") {
    layerPaintData = {
      layerIdx: layersIdxs.zonesFill,
      paintProps: {
        "fill-color": {
          property: "value",
          stops: [
            [0, "#f9e6ff"],
            [5, "#cc33ff"],
            [10, "#c61aff"],
            [25, "#bf00ff"],
            [50, "#9900cc"],
            [75, "#730099"],
            [100, "#4d0066"],
          ],
        },
        "fill-opacity": 0.7,
      },
    };
  } else {
    layerPaintData = {
      layerIdx: layersIdxs.zonesFill,
      paintProps: {
        "fill-color": {
          property: "value",
          stops: [
            [0, "#fff5e6"],
            [5, "#ffd699"],
            [10, "#ffad33"],
            [25, "#ff9900"],
            [50, "#cc7a00"],
            [75, "#995c00"],
            [100, "#663d00"],
          ],
        },
        "fill-opacity": 0.7,
      },
    };
  }

  map.getSource("analytical-zones-source").setData(sourceAnalyticalZones);
  map.setFilter(mapStore.layers[layersIdxs.zonesFill].name, null);
  updateLayerPaint(layerPaintData);

  // Turn ON layer if it's OFF
  mapStore.turnOnLayer(layersIdxs.zonesFill);
};

const getDemandZonesStatistics = () => {
  const vectors = [];
  mapStore.demandItemsSelectedIds.forEach((id) => {
    const vector =
      mapStore.demandDirection == "from"
        ? mapStore.getDemandFrom(id)
        : mapStore.getDemandTo(id);
    console.log("🍄 Demand for:", id);
    console.log(mapStore.demandDirection, vector.length);
    vectors.push(vector);
  });
  console.log("Size:", vectors.length);
  const result = vectors[0];
  if (vectors.length > 1) {
    result.forEach((item, i) => {
      for (let j = 1; j < vectors.length; j++) {
        item.value += vectors[j][i].value;
      }
    });
  }
  console.log("Result", result);
  return result;
};

const getDemandSavedCellsStatistics = () => {
  // console.log("AREAS", mapStore.demandItemsSelectedIds);

  // Join Cells from all Areas selected
  const cellIds = new Set();
  for (const area of mapStore.demandItemsSelectedIds) {
    // console.log(area);
    const areaCells = mapStore.savedCellsData.filter(
      (item) => item.properties.name == area
    );
    // console.log("Cells", areaCells);
    for (const cell of areaCells) {
      cellIds.add(cell.properties.id);
    }
  }
  // console.log("Cell IDs", cellIds);
  const cells = [];
  for (const id of cellIds) {
    const cell = sourceBaseCells.features.find(
      (item) => item.properties.id == id
    );
    if (cell) {
      cells.push(cell);
    }
  }
  // console.log("Cells total:", cells);

  // For Cell find Zones and get Zone's Demand
  const zoneIds = new Set();
  for (const cell of cells) {
    zoneIds.add(cell.properties.cell_id);
  }
  // console.log("Zones", zoneIds);

  let result = null;

  for (const zoneId of zoneIds) {
    // Find zone pop/emp
    const zone = sourceAnalyticalZones.features.find(
      (item) => item.properties.id == zoneId
    );
    // console.log("Zone found:", zone);
    const zoneCells = cells.filter((cell) => cell.properties.cell_id == zoneId);

    // Find cells pop/emp
    let vector = null;
    let zoneValue = 0;
    let cellsValue = 0;

    if (mapStore.demandDirection == "from") {
      vector = mapStore.getDemandFrom(zoneId);
      zoneValue = zone.properties.pop;
      cellsValue = zoneCells.reduce(
        (sum, cell) => sum + cell.properties.pop,
        0
      );
    } else {
      vector = mapStore.getDemandTo(zoneId);
      zoneValue = zone.properties.emp;
      cellsValue = zoneCells.reduce(
        (sum, cell) => sum + cell.properties.emp,
        0
      );
    }

    // console.log("Zone Value", zoneValue);
    // console.log("Cells Value", cellsValue);
    // console.log("Vector", vector);

    // Find ratio Cells/Zone
    const ratio = cellsValue / zoneValue || 1;
    // console.log("Ratio", ratio);

    // TODO: Get Zone Demand and apply ratio
    const values = vector.map((item) => item.value * ratio);
    // console.log("Vector with Ratio Applied", values);

    // TODO: Add values to result array
    if (result == null) {
      // Init result array
      result = vector.map((item) => ({
        ...item,
        value: 0,
      }));
    }
    for (let i = 0; i < result.length; i++) {
      result[i].value = result[i].value + values[i];
    }
  }

  return result;
};

const processDemandSplit = () => {
  console.log("Split:", mapStore.demandSplit);
  mapStore.clearSelectedColorMode();
  updateLayerFilter({ layerIdx: layersIdxs.cellsFill, filterProps: null });
  if (mapStore.demandSplit) {
    // Process split
    if (!demandSplitDone) {
      displaySplitDemand();
      demandSplitDone = true;
    } else {
      mapStore.layers[layersIdxs.cellsFill].shown = true;
      mapStore.layers[layersIdxs.zonesFill].shown = false;
    }
  } else {
    // Display Zones demand
    mapStore.layers[layersIdxs.cellsFill].shown = false;
    mapStore.layers[layersIdxs.zonesFill].shown = true;
  }
};

const displaySplitDemand = async () => {
  let layerPaintData = null;
  if (mapStore.demandDirection == "from") {
    layerPaintData = {
      layerIdx: layersIdxs.cellsFill,
      paintProps: {
        "fill-color": {
          property: "value",
          stops: [
            [0, "#f9e6ff"],
            [0.1, "#d966ff"],
            [0.2, "#cc33ff"],
            [0.5, "#c61aff"],
            [1, "#bf00ff"],
            [10, "#9900cc"],
            [20, "#730099"],
            [60, "#4d0066"],
          ],
        },
        "fill-opacity": 0.7,
      },
    };
  } else {
    layerPaintData = {
      layerIdx: layersIdxs.cellsFill,
      paintProps: {
        "fill-color": {
          property: "value",
          stops: [
            [0, "#ffebcc"],
            [0.1, "#ffd699"],
            [0.2, "#ffad33"],
            [0.5, "#e68a00"],
            [1, "#ff9900"],
            [10, "#cc7a00"],
            [20, "#995c00"],
            [60, "#663d00"],
          ],
        },
        "fill-opacity": 0.7,
      },
    };
  }

  await calculateSplitDemand();

  map.getSource("cells-source").setData(sourceBaseCells);

  updateLayerPaint(layerPaintData);

  if (mapStore.layers[layersIdxs.zonesFill].shown) {
    mapStore.layers[layersIdxs.zonesFill].shown = false;
  }
  if (!mapStore.layers[layersIdxs.cellsFill].shown) {
    mapStore.layers[layersIdxs.cellsFill].shown = true;
  }
};

const calculateSplitDemand = async () => {
  console.log("1️⃣");

  const maxValue = await prepareDataAndGetMax();
  console.log("Max Value", maxValue);

  // const zonesData = sourceAnalyticalZones.features.map((item, i) => ({
  //   zoneId: item.properties.id,
  //   value: item.properties.value,
  //   pop: +zonesStats[i].pop,
  //   emp: +zonesStats[i].emp,
  // }));
  // // console.log("Zones:", zonesData);

  // let maxValue = 0;
  // console.log("2️⃣");

  // // await zonesData.forEach(
  // //   async (zone) =>
  // for (const zone of zonesData) {
  //   await setTimeout(() => {
  //     const cellsSelected = sourceBaseCells.features.filter(
  //       (cell) => cell.properties.cell_id == zone.zoneId
  //     );

  //     if (zone.value == 0) {
  //       cellsSelected.forEach((cell) => {
  //         cell.properties.value = 0;
  //       });
  //     } else {
  //       if (mapStore.demandDirection == "from") {
  //         const zoneTotal = 0.1 * zone.pop + zone.emp;
  //         // if (zone.zoneId == 408) {
  //         //   console.log("Zone total", zoneTotal);
  //         // }
  //         cellsSelected.forEach((cell) => {
  //           const cellTotal = 0.1 * cell.properties.pop + cell.properties.emp;
  //           const cellValue = (zone.value * cellTotal) / zoneTotal;
  //           cell.properties.value = cellValue;
  //           if (cellValue > maxValue) {
  //             maxValue = cellValue;
  //           }
  //         });
  //       } else {
  //         const zoneTotal = zone.pop + 0.1 * zone.emp;
  //         // if (zone.zoneId == 408) {
  //         //   console.log("Zone total", zoneTotal);
  //         // }
  //         cellsSelected.forEach((cell) => {
  //           const cellTotal = cell.properties.pop + 0.1 * cell.properties.emp;
  //           const cellValue = (zone.value * cellTotal) / zoneTotal;
  //           cell.properties.value = cellValue;
  //           if (cellValue > maxValue) {
  //             maxValue = cellValue;
  //           }
  //         });
  //       }
  //     }
  //   }, 0);
  // }
  // zonesData.forEach((zone) => {
  //   const cellsSelected = sourceBaseCells.features.filter(
  //     (cell) => cell.properties.cell_id == zone.zoneId
  //   );

  //   if (zone.value == 0) {
  //     cellsSelected.forEach((cell) => {
  //       cell.properties.value = 0;
  //     });
  //   } else {
  //     if (mapStore.demandDirection == "from") {
  //       const zoneTotal = 0.1 * zone.pop + zone.emp;
  //       // if (zone.zoneId == 408) {
  //       //   console.log("Zone total", zoneTotal);
  //       // }
  //       cellsSelected.forEach((cell) => {
  //         const cellTotal = 0.1 * cell.properties.pop + cell.properties.emp;
  //         const cellValue = (zone.value * cellTotal) / zoneTotal;
  //         cell.properties.value = cellValue;
  //         if (cellValue > maxValue) {
  //           maxValue = cellValue;
  //         }
  //       });
  //     } else {
  //       const zoneTotal = zone.pop + 0.1 * zone.emp;
  //       // if (zone.zoneId == 408) {
  //       //   console.log("Zone total", zoneTotal);
  //       // }
  //       cellsSelected.forEach((cell) => {
  //         const cellTotal = cell.properties.pop + 0.1 * cell.properties.emp;
  //         const cellValue = (zone.value * cellTotal) / zoneTotal;
  //         cell.properties.value = cellValue;
  //         if (cellValue > maxValue) {
  //           maxValue = cellValue;
  //         }
  //       });
  //     }
  //   }
  // });
  // sourceBaseCells.features.forEach((cell) => {
  //   cell.properties.value = (100 * cell.properties.value) / (maxValue || 1);
  // });

  console.log("3️⃣");

  calculateCellDemand(maxValue);

  console.log("4️⃣");
};

const prepareDataAndGetMax = async () => {
  const zonesData = sourceAnalyticalZones.features.map((item) => ({
    zoneId: item.properties.id,
    value: item.properties.value,
    pop: item.properties.pop,
    emp: item.properties.emp,
  }));
  // console.log("Zones:", zonesData);

  console.log("2️⃣");

  // await zonesData.forEach(
  //   async (zone) =>

  let maxValue = 0;

  for (const zone of zonesData) {
    const zoneMax = await splitZone(zone);
    if (zoneMax > maxValue) {
      maxValue = zoneMax;
    }
  }

  // for (const zone of zonesData) {
  //   await setTimeout(() => {
  //     const cellsSelected = sourceBaseCells.features.filter(
  //       (cell) => cell.properties.cell_id == zone.zoneId
  //     );

  //     if (zone.value == 0) {
  //       cellsSelected.forEach((cell) => {
  //         cell.properties.value = 0;
  //       });
  //     } else {
  //       if (mapStore.demandDirection == "from") {
  //         const zoneTotal = 0.1 * zone.pop + zone.emp;
  //         // if (zone.zoneId == 408) {
  //         //   console.log("Zone total", zoneTotal);
  //         // }
  //         cellsSelected.forEach((cell) => {
  //           const cellTotal = 0.1 * cell.properties.pop + cell.properties.emp;
  //           const cellValue = (zone.value * cellTotal) / zoneTotal;
  //           cell.properties.value = cellValue;
  //           if (cellValue > maxValue) {
  //             maxValue = cellValue;
  //           }
  //         });
  //       } else {
  //         const zoneTotal = zone.pop + 0.1 * zone.emp;
  //         // if (zone.zoneId == 408) {
  //         //   console.log("Zone total", zoneTotal);
  //         // }
  //         cellsSelected.forEach((cell) => {
  //           const cellTotal = cell.properties.pop + 0.1 * cell.properties.emp;
  //           const cellValue = (zone.value * cellTotal) / zoneTotal;
  //           cell.properties.value = cellValue;
  //           if (cellValue > maxValue) {
  //             maxValue = cellValue;
  //           }
  //         });
  //       }
  //     }
  //   }, 0);
  // }
  console.log("2️⃣😡", maxValue);
  return maxValue;
};

const splitZone = async (zone) => {
  let maxValue = 0;

  const cellsSelected = sourceBaseCells.features.filter(
    (cell) => cell.properties.cell_id == zone.zoneId
  );

  if (zone.value == 0) {
    cellsSelected.forEach((cell) => {
      cell.properties.value = 0;
    });
  } else {
    if (mapStore.demandDirection == "from") {
      const zoneTotal = 0.1 * zone.pop + zone.emp;
      // if (zone.zoneId == 408) {
      //   console.log("Zone total", zoneTotal);
      // }
      cellsSelected.forEach((cell) => {
        const cellTotal = 0.1 * cell.properties.pop + cell.properties.emp;
        const cellValue = (zone.value * cellTotal) / zoneTotal;
        cell.properties.value = cellValue;
        if (cellValue > maxValue) {
          maxValue = cellValue;
        }
      });
    } else {
      const zoneTotal = zone.pop + 0.1 * zone.emp;
      // if (zone.zoneId == 408) {
      //   console.log("Zone total", zoneTotal);
      // }
      cellsSelected.forEach((cell) => {
        const cellTotal = cell.properties.pop + 0.1 * cell.properties.emp;
        const cellValue = (zone.value * cellTotal) / zoneTotal;
        cell.properties.value = cellValue;
        if (cellValue > maxValue) {
          maxValue = cellValue;
        }
      });
    }
  }

  return maxValue;
};

const calculateCellDemand = (max) => {
  sourceBaseCells.features.forEach((cell) => {
    cell.properties.value = (100 * cell.properties.value) / (max || 1);
  });
};

//
// Connectivity logic
//
const processConnectivityFeatureSelect = (id) => {
  console.log("Select Item Connectivity", id, mapStore.connectivityType);
  if (mapStore.connectivitySelectMode == "one") {
    mapStore.connectivityItemsSelectedIds.clear();
    mapStore.connectivityItemsSelectedIds.add(id);
    mapStore.connectivityIdsFromType = mapStore.connectivityType;
  } else if (mapStore.connectivitySelectMode == "many") {
    if (mapStore.connectivityIdsFromType != mapStore.connectivityType) {
      mapStore.connectivityItemsSelectedIds.clear();
      mapStore.connectivityIdsFromType = mapStore.connectivityType;
    }
    if (mapStore.connectivityItemsSelectedIds.has(id)) {
      mapStore.connectivityItemsSelectedIds.delete(id);
    } else {
      mapStore.connectivityItemsSelectedIds.add(id);
    }
  }
  setConnectivitySelectFilter();
  if (mapStore.connectivitySelectMode == "one") {
    getConnectivityStatistics();
  }
};
const setConnectivitySelectFilter = () => {
  // let idName = "id";
  const layerIdx = mapStore.layersIdxs.zonesSelected;
  map.setFilter(mapStore.layers[layerIdx].name, [
    "in",
    "id",
    ...[...mapStore.connectivityItemsSelectedIds],
  ]);
};
const getConnectivityStatistics = () => {
  console.log(
    "🦊 Connectivity Statistics Processed",
    mapStore.connectivityItemsSelectedIds
  );
  if (mapStore.connectivityItemsSelectedIds.size == 0) {
    // For empty request - clear all
    console.log("Clear All 🧹");
    clearAdminAreasSelected();
    clearZonesSelected();
    clearSavedAreasSelected();
    mapStore.connectivityProcessed = false;
  } else {
    // TODO: Get data for selection
    // TODO: Display data
    displayConnectivityZones();
    mapStore.connectivityProcessed = true;
  }
};

const displayConnectivityZones = () => {
  //Calculate Demand statistics
  const zonesData = getConnectivityZonesStatistics();
  // console.log("Data:", zonesData);

  // Reference level adjustment
  // let maxValue = mapStore.demandCityMax;
  // if (mapStore.demandReference == "selection") {
  //   maxValue = Math.max(...zonesData.map((item) => +item.value));
  //   console.log("Max Value found:", maxValue);
  // }
  // zonesData.forEach(item => item.value = item.value/maxValue);

  // Set new Source values and setSource
  zonesData.forEach((item, i) => {
    if (item.zoneId != sourceAnalyticalZones.features[i].properties.id) {
      console.error("Connectivity data incorrect order.");
      return;
    }
    sourceAnalyticalZones.features[i].properties.value = item.value;
    sourceAnalyticalZones.features[i].properties.dm = item.dm;
  });
  console.log("🚜 Source data:", sourceAnalyticalZones);

  let layerPaintData = null;
  if (mapStore.connectivityType == "speed") {
    layerPaintData = {
      layerIdx: layersIdxs.zonesFill,
      paintProps: {
        "fill-color": {
          property: "value",
          stops: [
            [0, "#C00000"],
            [1, "#ff8566"],
            [2, "#806000"],
            [3, "#375623"],
            [4, "#00B050"],
            [5, "#2F75B5"],
          ],
        },
        "fill-opacity": 0.7,
      },
    };
  } else if (mapStore.connectivityType == "change") {
    layerPaintData = {
      layerIdx: layersIdxs.zonesFill,
      paintProps: {
        "fill-color": {
          property: "value",
          stops: [
            [0, "#00B050"],
            [1, "#375623"],
            [2, "#806000"],
            [10, "#C00000"],
          ],
        },
        "fill-opacity": 0.7,
      },
    };
  } else {
    layerPaintData = {
      layerIdx: layersIdxs.zonesFill,
      paintProps: {
        "fill-color": "#00ff00",
        "fill-opacity": 0.7,
      },
    };
  }

  map.getSource("analytical-zones-source").setData(sourceAnalyticalZones);

  updateLayerPaint(layerPaintData);
  mapStore.turnOnLayer(layersIdxs.zonesFill);
};

const getConnectivityZonesStatistics = () => {
  const vectors = [];
  mapStore.connectivityItemsSelectedIds.forEach((id) => {
    const vector =
      mapStore.connectivityDirection == "from"
        ? mapStore.getConnectivityFrom(id)
        : mapStore.getConnectivityTo(id);
    console.log("🍄 Connectivity for:", id);
    console.log(mapStore.connectivityDirection, vector.length);
    vectors.push(vector);
  });
  console.log("Size:", vectors.length);
  const result = vectors[0];
  if (vectors.length > 1 && mapStore.connectivityType == "speed") {
    // Aggregate data and normalize if Speed type
    result.forEach((item, i) => {
      let sp_total = 0;
      let dm_total = 0;
      for (let j = 0; j < vectors.length; j++) {
        sp_total += vectors[j][i].value * vectors[j][i].dm;
        dm_total += vectors[j][i].dm;
      }
      item.value = Math.round(sp_total / dm_total);
    });
  }
  console.log("🚜🚜 Connectivity Result", result);
  return result;
};

const drawConnectivityMap = () => {
  // TODO: Build from-to coordinates for data provided
  const data = mapStore.connectivityMapData.map((item) => {
    const fromZone = sourceAnalyticalZones.features.find(
      (zone) => zone.properties.id == item.fromId
    );
    const toZone = sourceAnalyticalZones.features.find(
      (zone) => zone.properties.id == item.toId
    );

    const fromCoord = [
      (fromZone.geometry.coordinates[0][0][0][0] +
        fromZone.geometry.coordinates[0][0][1][0]) /
        2,
      (fromZone.geometry.coordinates[0][0][0][1] +
        fromZone.geometry.coordinates[0][0][2][1]) /
        2,
    ];
    const toCoord = [
      (toZone.geometry.coordinates[0][0][0][0] +
        toZone.geometry.coordinates[0][0][1][0]) /
        2,
      (toZone.geometry.coordinates[0][0][0][1] +
        toZone.geometry.coordinates[0][0][2][1]) /
        2,
    ];

    const arcData = {
      fromCoord: fromCoord,
      toCoord: toCoord,
      dm: item.dm,
      sp: item.sp,
    };
    return arcData;
  });

  console.log("Data to Draw Arcs", data);

  // [
  //   {
  //     fromCoord: [76.76149956, 43.32946354],
  //     toCoord: [76.76149956, 43.23981294],
  //   },
  // ];

  // TODO: Set Arcs data
  connectArcs.setProps({ data: data });
};

//
// Layers Clear
//
const clearAdminAreasSelected = () => {
  map.setFilter(mapStore.layers[layersIdxs.adminAreasSelected].name, [
    "in",
    "id",
    "",
  ]);
};
const clearZonesSelected = () => {
  map.setFilter(mapStore.layers[layersIdxs.zonesSelected].name, [
    "in",
    "id",
    "",
  ]);
};
const clearSavedAreasSelected = () => {
  map.setFilter(mapStore.layers[layersIdxs.savedAreasSelected].name, [
    "in",
    "name",
    "",
  ]);
};

// TODO: Change name to the appropriate one
const processCompassClicked = () => {
  console.log("Compass");
  map.setPitch(0).setBearing(0);
};
const processRotateClicked = () => {
  console.log("Rotate");
  map.setPitch(60).setBearing(-30);
};
const toggleRuler = () => {
  if (mapStore.measureActive) {
    mapStore.measureActive = false;
    mapStore.turnOffLayer(layersIdxs.measureLines);
    mapStore.turnOffLayer(layersIdxs.measurePoints);
    mapStore.turnOffLayer(layersIdxs.measureLabels);
    map.getCanvas().style.cursor = "";
    measureData.features = [];
    measureLine.coordinates = [];
    map.getSource("measure-source").setData(measureData);
  } else {
    mapStore.measureActive = true;
    mapStore.turnOnLayer(layersIdxs.measureLines);
    mapStore.turnOnLayer(layersIdxs.measurePoints);
    mapStore.turnOnLayer(layersIdxs.measureLabels);
  }
};
</script>

<style scoped>
#map {
  width: calc(100vw + 213px);
  height: calc(100vh - 64px - 36px);
  position: absolute;
  left: -213px;
}
.buttons-block {
  position: absolute;
  right: 20px;
  bottom: 70px;
}
.boxdraw {
  background: rgba(56, 135, 190, 0.1);
  border: 2px solid #3887be;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
</style>
