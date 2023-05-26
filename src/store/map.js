// Utilities
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// export const useMapStore = defineStore("map", {
//   state: () => ({
//     layersState: {
//       adminAreasBorder: false,
//       adminAreaFill: false,
//       analyticalZonesBorder: false,
//       analyticalZonesFill: false,
//       cellsFill: false,
//     },
//     layers: [
//     //   { idx: 0, name: "admin-areas-border", shown: false },
//     //   { idx: 1, name: "admin-areas-fill", shown: false },
//     //   { idx: 2, name: "analytical-zones-border", shown: false },
//     //   { idx: 3, name: "analytical-zones-fill", shown: false },
//       // { idx: 4, name: "cells-fill", shown: false, }, // FIXME: Not ready
//     ],
//   }),
//   actions: {
//     updateLayers(newState) {
//       console.log("Update Store Layers", newState, this.layers);
//       this.layers = [...newState];
//     },
//   },
// });

export const useMapStore = defineStore("mapStore", () => {
  const userSettingsShown = ref(false);

  const mapStyles = [
    { value: 0, title: "Streets", uri: "mapbox://styles/mapbox/streets-v12" },
    {
      value: 1,
      title: "Satellite",
      uri: "mapbox://styles/mapbox/satellite-streets-v12",
    },
    { value: 2, title: "Outdoor", uri: "mapbox://styles/mapbox/outdoors-v12" },
    { value: 3, title: "Light", uri: "mapbox://styles/mapbox/light-v11" },
    { value: 4, title: "Dark", uri: "mapbox://styles/mapbox/dark-v11" },
  ];
  const activeMapStyle = ref(0);

  const isLayersSet = ref(false);
  const layersIdxs = {
    adminBorder: 0,
    adminFill: 1,
    zonesBorder: 2,
    zonesFill: 3,
    cellsFill: 4,
    cellsExtrusion: 5,
    cellsSaved: 6,
    cellsSelected: 7,
    adminAreaSelect: 8,
    adminAreasSelected: 9,
    zoneSelect: 10,
    zonesSelected: 11,
    savedAreasSelected: 12,
  };
  const layers = ref([
    { idx: 0, name: "admin-areas-border", shown: false },
    { idx: 1, name: "admin-areas-fill", shown: false },
    { idx: 2, name: "analytical-zones-border", shown: false },
    { idx: 3, name: "analytical-zones-fill", shown: false },
    { idx: 4, name: "cells-fill", shown: false },
    { idx: 5, name: "cells-extrusion", shown: false },
    { idx: 6, name: "cells-saved", shown: false },
    { idx: 7, name: "cells-selected", shown: false },
    { idx: 8, name: "admin-area-select", shown: false },
    { idx: 9, name: "admin-areas-selected", shown: false },
    { idx: 10, name: "zone-select", shown: false },
    { idx: 11, name: "zones-selected", shown: false },
    { idx: 12, name: "saved-areas-selected", shown: false },
  ]);

  const updateLayers = (newState) => {
    layers.value = newState;
  };

  const newLayerPaint = ref(null);
  const newLayerFilter = ref(null);

  // Social data
  const socialColor = ref(null);
  const socialBars = ref(null);

  const selectedCellsFeatures = ref([]);

  const addCellToSelected = (feature) => {
    selectedCellsFeatures.value.push(feature);
  };
  const removeCellFromSelected = (feature) => {
    const idx = selectedCellsFeatures.value.findIndex(
      (item) => item.properties.id == feature.properties.id
    );
    console.warn("Index:", idx);
    selectedCellsFeatures.value.splice(idx, 1);

    // selectedCellsFeatures.value = selectedCellsFeatures.value.filter(
    //   (item) => item.properties.id != feature.properties.id
    // );
  };

  const clearSelectedCells = () => {
    selectedCellsFeatures.value = [];
  };
  const selectedSize = computed(() => {
    return selectedCellsFeatures.value.length * 10000;
  });
  const selectedPopulation = computed(() => {
    return selectedCellsFeatures.value.reduce(
      (sum, cur) => sum + cur.properties.pop,
      0
    );
  });
  const selectedPopulationDensity = computed(() => {
    return selectedCellsFeatures.value.length == 0
      ? 0
      : Math.round(
          selectedPopulation.value / selectedCellsFeatures.value.length
        );
  });
  const selectedEmployment = computed(() => {
    return selectedCellsFeatures.value.reduce(
      (sum, cur) => sum + cur.properties.emp,
      0
    );
  });
  const selectedEmploymentDensity = computed(() => {
    return selectedCellsFeatures.value.length == 0
      ? 0
      : Math.round(
          selectedEmployment.value / selectedCellsFeatures.value.length
        );
  });

  const savedCellsData = ref([]);
  const savedAreas = ref([]);
  const savedAreasNames = new Set(); // FIXME: Map() should be better name+color
  const saveSelectedFeatures = (name, color) => {
    console.log("Save Params", name, color);
    console.log("Save Features", selectedCellsFeatures.value);
    let dataBlock = [...savedCellsData.value];
    if (savedAreasNames.has(name)) {
      dataBlock = dataBlock.filter((item) => item.properties.name != name);
    } else {
      savedAreasNames.add(name);
      savedAreas.value.push({ name, color });
    }
    console.log("Saved Areas", savedAreas);

    selectedCellsFeatures.value.forEach((item) =>
      dataBlock.push({
        ...item,
        properties: {
          ...item.properties,
          name: name,
          color: color,
        },
      })
    );
    console.log("Data to Save:", dataBlock);
    savedCellsData.value = [...dataBlock];
    console.log("Save Result:", savedCellsData.value);
    clearSelectedCells();
  };
  const removeFromSaved = (name) => {
    if (savedAreasNames.has(name)) {
      savedAreasNames.delete(name);
      savedAreas.value = savedAreas.value.filter((item) => item.name != name);
      savedCellsData.value = savedCellsData.value.filter(
        (item) => item.properties.name != name
      );
    } else {
      console.warn("Area name not found:", name);
    }
  };
  const updateSavedAreaColor = (name, color) => {
    savedCellsData.value = savedCellsData.value.map((item) => {
      if (item.properties.name != name) {
        return item;
      } else {
        return {
          ...item,
          properties: {
            ...item.properties,
            color: color,
          },
        };
      }
    });
  };
  const selectSavedArea = (name) => {
    const areaFeatures = savedCellsData.value.filter(
      (item) => item.properties.name == name
    );
    // console.log("Saved Data", savedCellsData.value);
    // console.log("Features found", [...areaFeatures]);
    selectedCellsFeatures.value = [...areaFeatures];
  };

  // Demand data
  const demandLevel = ref(null);
  const demandDirection = ref("from");
  const demandSelectMode = ref("one");
  const demandItemsSelectedIds = new Set();
  const demandIdsFromLevel = null;
  const demandItemsForProcessing = ref([]);
  const demandProcessItems = () => {
    console.log("Map Store - Demand processed");
    demandItemsForProcessing.value = [...demandItemsSelectedIds];
  };

  return {
    userSettingsShown,
    mapStyles,
    activeMapStyle,
    isLayersSet,
    layersIdxs,
    layers,
    newLayerPaint,
    newLayerFilter,
    updateLayers,
    socialColor,
    socialBars,
    selectedCellsFeatures,
    savedCellsData,
    savedAreas,
    saveSelectedFeatures,
    removeFromSaved,
    updateSavedAreaColor,
    selectSavedArea,
    selectedSize,
    selectedPopulation,
    selectedPopulationDensity,
    selectedEmployment,
    selectedEmploymentDensity,
    addCellToSelected,
    removeCellFromSelected,
    clearSelectedCells,
    demandLevel,
    demandDirection,
    demandSelectMode,
    demandItemsSelectedIds,
    demandIdsFromLevel,
    demandItemsForProcessing,
    demandProcessItems,
  };
});
