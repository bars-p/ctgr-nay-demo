<template>
  <div id="map"></div>
  <map-buttons-block
    class="buttons-block"
    @compass="processCompassClicked"
    @rotate="processRotateClicked"
  ></map-buttons-block>
</template>

<script setup>
import MapButtonsBlock from "@/components/MapButtonsBlock.vue";

import { onMounted, defineProps, watch } from "vue";

import mapboxgl from "mapbox-gl";
import axios from "axios";

import { useMapStore } from "@/store/map";

// General component logic
const mapStore = useMapStore();

const props = defineProps(["mode"]);

onMounted(async () => {
  console.log("Map onMounted Called,", `mode "${props.mode}"`);
  // TODO: Load Data
  //
  await loadData();

  // TODO: Init map instance
  //
  await createMap();
  buildLayers();

  //
});
watch(
  () => props.mode,
  (to, from) => {
    console.warn(`Mode changed from ${from} to ${to}.`);
    displayModeLayers();
  }
);
watch(
  () => mapStore.layers,
  (toState, fromState) => {
    console.log("Store State Change WATCHED:", mapStore.layers);
    console.log("From State:", fromState);
    console.log("To State:", toState);
    processLayersDisplay();
  },
  { deep: true }
);

// Data processing
let sourceAdminAreas = null;
let sourceAnalyticalZones = null;
let sourceBaseCells = null;

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
  //   return sum + cur.properties.pop_2022;
  // }, 0);
  // console.log("Population stats:", totalPop);
  // const popData = sourceAnalyticalZones.features.map(
  //   (item) => item.properties.pop_2022
  // );
  // console.log("Max Pop per Cell:", Math.max(...popData));
  // FIXME:

  await axios
    .get("Almaty_cells_100_100.geojson")
    .then((result) => (sourceBaseCells = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("100x100 Loaded:", sourceBaseCells.features.length);

  // FIXME: Temp - total population data check
  // const totalPop = sourceBaseCells.features.reduce((sum, cur) => {
  //   return sum + cur.properties.populati_1;
  // }, 0);
  // console.log("Population stats Total for 100x100:", totalPop);
  // const popData = sourceBaseCells.features.map(
  //   (item) => item.properties.populati_1
  // );
  // console.log("Max Pop per Cell 100x100:", Math.max(...popData));
  // FIXME:
};

// Map processing
const accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN;
const defaultZoom = 11;
const defaultCenter = [76.863441, 43.257331];
const mapStyles = [
  "mapbox://styles/mapbox/streets-v12",
  "mapbox://styles/mapbox/satellite-streets-v12",
  "mapbox://styles/mapbox/outdoors-v12",
  "mapbox://styles/mapbox/light-v11",
  "mapbox://styles/mapbox/dark-v11",
];
const defaultMapStyle = 0;

let map = {};

let localLayerState = [];

const basicLayersIdxs = [0, 1, 2];
const socialLayersIdxs = [0, 3];
const stopsLayersIdxs = [0, 4];

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
};

const buildLayers = () => {
  map.on("load", () => {
    const styleJson = map.getStyle();
    console.log("Map style", styleJson);

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
        id: "analytical-zones-fill",
        type: "fill",
        source: "analytical-zones-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": {
            property: "pop_2022",
            stops: [
              [100, "#FFEDA0"],
              [1000, "#FED976"],
              [5000, "#FC4E2A"],
              [10000, "#E31A1C"],
              [50000, "#BD0026"],
              [100000, "#800026"],
            ],
          },
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.7,
            0.5,
          ],
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
        id: "cells-fill",
        type: "fill",
        source: "cells-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": {
            property: "populati_1",
            stops: [
              [10, "#FFEDA0"],
              [100, "#FED976"],
              [500, "#FC4E2A"],
              [1000, "#E31A1C"],
              [5000, "#BD0026"],
              [50000, "#800026"],
            ],
          },
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.7,
            0.5,
          ],
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

    setLocalLayers();
    displayModeLayers();
  });
};

const setLocalLayers = () => {
  localLayerState = mapStore.layers.map((layer) => layer.shown);
  console.log("Local Layers State Recorded:", localLayerState);
};

const displayModeLayers = () => {
  switch (props.mode) {
    case "social":
      console.log("Display SOCIAL layers");
      toggleLayers(socialLayersIdxs);

      break;
    case "stops":
      console.log("Display DEMAND layers");
      toggleLayers(stopsLayersIdxs);
      break;

    default:
      console.log("Display BASIC layers");
      toggleLayers(basicLayersIdxs);
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
  console.log("In Layers Display Method");
  console.log("Local Layers:", localLayerState);
  console.log("Store Layers", mapStore.layers);
  for (const layer of mapStore.layers) {
    const idx = layer.idx;
    console.log("Store Layer Processed:", idx, layer);
    if (layer.shown != localLayerState[idx]) {
      console.log("New state for:", mapStore.layers[idx]);
      map.setLayoutProperty(
        layer.name,
        "visibility",
        localLayerState[idx] ? "none" : "visible"
      );
    }
  }

  setLocalLayers();
};
const processCompassClicked = () => {
  console.log("Compass");
  map.setPitch(0).setBearing(0, { duration: 2000 });
};
const processRotateClicked = () => {
  console.log("Rotate");
  map.setPitch(60).setBearing(-30);
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
</style>
