<template>
  <div id="map"></div>
  <div id="rect" class="boxdraw"></div>
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
// TODO: Process mode change
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
  layersIdxs.adminFill,
  layersIdxs.zonesBorder,
];
const routesLayersIdxs = [
  layersIdxs.adminBorder,
  layersIdxs.adminFill,
  layersIdxs.zonesBorder,
];
const stopsLayersIdxs = [layersIdxs.adminBorder, layersIdxs.cellsFill];

const cellPopup = new mapboxgl.Popup({
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
    map.addSource("saved-areas-source", selectedSource);

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
          "line-width": 3,
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
        const features = map.queryRenderedFeatures(bbox, {
          layers: ["cells-fill"],
        });

        if (features.length >= 1000) {
          return window.alert("Select a smaller number of features");
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
          processCellsSelected([...deduplicated.values()]);
        }
      }

      map.dragPan.enable();
    }

    // FIXME:
    // FIXME:
    // TODO:
    // TODO:

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
      // const clickedId = item.features[0].properties.id;
      const feature = Object.assign(item.features[0]);
      console.log("Click happened on:", feature);
      // selectedCellsFeatures.value.add(feature);
      // console.log("Feature stored:", selectedCellsFeatures.value);
      processCellsSelected([feature]);
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
    case "routes":
      if (mapStore.isLayersSet == false) {
        console.log("Set ROUTES layers");
        toggleLayers(routesLayersIdxs);
        mapStore.isLayersSet = true;
      }
      break;
    case "stops":
      if (mapStore.isLayersSet == false) {
        console.log("Set STOP layers");
        toggleLayers(stopsLayersIdxs);
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
  // cellsIds.forEach((id, idx) => {
  //   if (selectedCellsIds.has(id)) {
  //     selectedCellsIds.delete(id);
  //     mapStore.removeCellFromSelected(cellsFeatures[idx]);
  //   } else {
  //     const objectToStore = {
  //       id: cellsFeatures[idx].id,
  //       layer: { ...cellsFeatures[idx].layer },
  //       properties: { ...cellsFeatures[idx].properties },
  //       source: cellsFeatures[idx].source,
  //       type: cellsFeatures[idx].type,
  //       geometry: { ...cellsFeatures[idx].geometry },
  //     };
  //     console.log("Object to Store:", objectToStore);
  //     selectedCellsIds.add(id);
  //     mapStore.addCellToSelected(objectToStore);
  //   }
  // });
  console.log("SET FILTER 1");
  map.setFilter(mapStore.layers[mapStore.layersIdxs.cellsSelected].name, [
    "in",
    "id",
    ...selectedCellsIds,
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
