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

  const layersIdxs = {
    adminBorder: 0,
    adminFill: 1,
    zonesBorder: 2,
    zonesFill: 3,
    cellsFill: 4,
    cellsExtrusion: 5,
    cellsSaved: 6,
    cellsSelected: 7,
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
  ]);

  const updateLayers = (newState) => {
    layers.value = newState;
  };

  const newLayerPaint = ref(null);
  const newLayerFilter = ref(null);

  const selectedCellsFeatures = ref([]);

  const addCellToSelected = (feature) => {
    selectedCellsFeatures.value.push(feature);
  };
  const removeCellFromSelected = (feature) => {
    selectedCellsFeatures.value = selectedCellsFeatures.value.filter(
      (item) => item.properties.id != feature.properties.id
    );
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

    clearSelectedCells();
  };
  const removeFromSaved = (id) => {
    console.log(id);
  };

  return {
    userSettingsShown,
    mapStyles,
    activeMapStyle,
    layersIdxs,
    layers,
    newLayerPaint,
    newLayerFilter,
    updateLayers,
    selectedCellsFeatures,
    savedCellsData,
    savedAreas,
    saveSelectedFeatures,
    removeFromSaved,
    selectedSize,
    selectedPopulation,
    selectedPopulationDensity,
    selectedEmployment,
    selectedEmploymentDensity,
    addCellToSelected,
    removeCellFromSelected,
    clearSelectedCells,
  };
});
