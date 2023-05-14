<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted, defineProps, watch } from "vue";

import mapboxgl from "mapbox-gl";
import axios from "axios";

const props = defineProps(["mode"]);

// General component logic
onMounted(async () => {
  console.log("Map onMounted Called,", `mode "${props.mode}"`);
  // TODO: Load Data
  //
  await loadData();

  // TODO: Init map instance
  //
  await createMap();
  buildLayers();
  // displayModeLayers();

  //
});
watch(
  () => props.mode,
  (to, from) => {
    console.warn(`Mode changed from ${from} to ${to}.`);
    displayModeLayers();
  }
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

  // FIXME: Temp
  const totalPop = sourceAnalyticalZones.features.reduce((sum, cur) => {
    return sum + cur.properties.pop_2022;
  }, 0);
  console.log("Population stats:", totalPop);
  const popData = sourceAnalyticalZones.features.map(
    (item) => item.properties.pop_2022
  );
  console.log("Max Pop per Cell:", Math.max(...popData));
  // FIXME:

  await axios
    .get("Almaty_cells_100_100.geojson")
    .then((result) => (sourceBaseCells = result.data))
    .catch((err) => console.log("ERROR load", err));
  console.log("100x100 Loaded:", sourceBaseCells.features.length);
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

const allLayers = [
  { idx: 0, name: "admin-areas-border" },
  { idx: 1, name: "admin-areas-fill" },
  { idx: 2, name: "analytical-zones-border" },
  { idx: 3, name: "analytical-zones-fill" },
  // { idx: 4, name: "cells-fill" }, // FIXME: Not ready
];
const basicLayersIdxs = [0, 1, 2];
const socialLayersIdxs = [0, 3];

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

    map.addLayer(
      {
        id: "analytical-zones-border",
        type: "line",
        source: "analytical-zones-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "visible",
        },
        paint: {
          "line-width": 1,
          // "line-dasharray": [8, 8],
          "line-color": "lightgrey",
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
          visibility: "visible",
        },
        paint: {
          "fill-color":
            // [
            //   "interpolate",
            //   ["linear"],
            //   ["get", "populati_1"],
            //   1000,
            //   ["to-color", "#FC4E2A"],
            //   2000000,
            //   ["to-color", "#800026"],
            // ],
            {
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
          visibility: "visible",
        },
        paint: {
          "fill-color": "#FFCC80",
          "fill-opacity": 0.6,
        },
      },
      "road-label"
    );
    map.addLayer({
      id: "admin-areas-border",
      type: "line",
      source: "admin-areas-source",
      layout: {
        "line-join": "round",
        "line-cap": "round",
        visibility: "visible",
      },
      paint: {
        "line-width": 2,
        "line-color": "#B71C1C",
        "line-opacity": 0.6,
      },
    });
    displayModeLayers();
  });
};

const displayModeLayers = () => {
  switch (props.mode) {
    case "social":
      console.log("Display SOCIAL layers");
      toggleLayers(socialLayersIdxs);

      break;
    case "demand":
      console.log("Display DEMAND layers");
      toggleLayers(basicLayersIdxs);

      break;

    default:
      console.log("Display BASIC layers");
      toggleLayers(basicLayersIdxs);
      break;
  }
};
const toggleLayers = (idxs) => {
  const layers = allLayers.map((item) => ({ name: item.name, mode: "none" }));
  for (const idx of idxs) {
    layers[idx].mode = "visible";
  }
  console.log("Display layers:", layers);
  for (const layer of layers) {
    map.setLayoutProperty(layer.name, "visibility", layer.mode);
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
</style>
