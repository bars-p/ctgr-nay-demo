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
    if (to == "base") {
      map.flyTo({
        center: defaultCenter,
        zoom: defaultZoom,
        pitch: 0,
        bearing: 0,
      });
    }
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
    console.log("New paint:", mapStore.newLayerPaint);
    updateLayerPaint(mapStore.newLayerPaint);
  }
);
watch(
  () => mapStore.newLayerFilter,
  () => {
    console.log("New Filter:", mapStore.newLayerFilter);
    updateLayerFilter(mapStore.newLayerFilter);
  }
);
watch(
  () => mapStore.selectedCellsFeatures,
  () => {
    console.log("Watch for Selection");
    if (mapStore.selectedCellsFeatures.length == 0) {
      selectedCellsIds.clear();
      map.setFilter(mapStore.layers[mapStore.layersIdxs.cellsSelected].name, [
        "in",
        "id",
        ...selectedCellsIds,
      ]);
    }
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

let map = {};

let localLayersState = [];

const basicLayersIdxs = [
  layersIdxs.adminBorder,
  layersIdxs.adminFill,
  layersIdxs.zonesBorder,
];
const socialLayersIdxs = [layersIdxs.adminBorder, layersIdxs.zonesBorder];
const stopsLayersIdxs = [layersIdxs.adminBorder, layersIdxs.cellsFill];

const cellPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

// const sizeSelected = computed(() => {
//   return selectedCellsFeatures.value.length * 10;
// });

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
    map.addSource("saved-areas-source", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            // FIXME: Test only, delete later
            type: "Feature",
            properties: {
              id: 435340,
              cell_id: 997,
              district_id: 6,
              pop: 0.000155943,
              emp: 0.0,
              color: "#ff1100",
            },
            geometry: {
              type: "MultiPolygon",
              coordinates: [
                [
                  [
                    [77.167654898056, 43.349168945956301],
                    [77.167654898056, 43.350064494066501],
                    [77.168881952552098, 43.350064494066501],
                    [77.168881952552098, 43.349168945956301],
                    [77.167654898056, 43.349168945956301],
                  ],
                ],
              ],
            },
          },
        ],
      },
    });

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
            property: "pop",
            stops: [
              [10, "#FFEDA0"],
              [50, "#FED976"],
              [100, "#FC4E2A"],
              [1000, "#E31A1C"],
              [50000, "#BD0026"],
              [200000, "#800026"],
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
            property: "pop",
            stops: [
              [0, "#FFFFFF"],
              [10, "#FED976"],
              [100, "#FC4E2A"],
              [500, "#E31A1C"],
              [1000, "#BD0026"],
              [20000, "#800026"],
            ],
          },
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
        id: "cells-saved",
        type: "line",
        source: "saved-areas-source",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-opacity": 0.7,
          "line-width": 2,
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

    map.on("style.load", () => {
      console.warn("STYLE CHANGE!");
      // TODO: Restore Layers
    });

    // TODO: On-Hover definition
    map.on("mousemove", "cells-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";
      // console.log("Hovered:", e.features[0]);
      const cellData = e.features[0].properties;
      const cellPop = `<br><strong>🏠:</strong> ${cellData.pop}`;
      const cellEmp = `<br><strong>🏢:</strong> ${cellData.emp}`;

      const description = `id: ${cellData.id}${cellPop}${cellEmp}`;

      cellPopup.setLngLat(e.lngLat).setHTML(description).addTo(map);
    });
    map.on("mouseleave", "cells-fill", () => {
      map.getCanvas().style.cursor = "";
      cellPopup.remove();
    });
    map.on("click", "cells-fill", (item) => {
      const clickedId = item.features[0].properties.id;
      const feature = Object.assign(item.features[0]);
      console.log("Click happened on:", clickedId, feature);
      // selectedCellsFeatures.value.add(feature);
      // console.log("Feature stored:", selectedCellsFeatures.value);
      processCellsSelected([clickedId], [feature]);
    });

    setLocalLayers();
    displayModeLayers();
  });
};

const setLocalLayers = () => {
  localLayersState = mapStore.layers.map((layer) => layer.shown);
  console.log("Local Layers State Recorded:", localLayersState);
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
  console.log("Local Layers:", localLayersState);
  console.log("Store Layers", mapStore.layers);
  for (const layer of mapStore.layers) {
    const idx = layer.idx;
    console.log("Store Layer Processed:", idx, layer);
    if (layer.shown != localLayersState[idx]) {
      console.log("New state for:", mapStore.layers[idx]);
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
const processCellsSelected = (cellsIds, cellsFeatures) => {
  cellsIds.forEach((id, idx) => {
    if (selectedCellsIds.has(id)) {
      selectedCellsIds.delete(id);
      mapStore.removeCellFromSelected(cellsFeatures[idx]);
      // mapStore.selectedCellsFeatures = mapStore.selectedCellsFeatures.filter(
      //   (item) => item.properties.id != id
      // );
    } else {
      selectedCellsIds.add(id);
      mapStore.addCellToSelected(cellsFeatures[idx]);
    }
  });
  map.setFilter(mapStore.layers[mapStore.layersIdxs.cellsSelected].name, [
    "in",
    "id",
    ...selectedCellsIds,
  ]);
  // console.log("Selected Cells:", mapStore.selectedCellsFeatures);
  // console.log("Selected Size:", mapStore.selectedCellsFeatures.length);
};

// TODO: Change name to appropriate
const processCompassClicked = () => {
  console.log("Compass");
  map.setPitch(0).setBearing(0);
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
