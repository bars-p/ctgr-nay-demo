// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

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
  const layers = ref([
    { idx: 0, name: "admin-areas-border", shown: false },
    { idx: 1, name: "admin-areas-fill", shown: false },
    { idx: 2, name: "analytical-zones-border", shown: false },
    { idx: 3, name: "analytical-zones-fill", shown: false },
    { idx: 4, name: "cells-fill", shown: false }, // FIXME: Not ready
  ]);

  const updateLayers = (newState) => {
    layers.value = newState;
  };

  return { layers, updateLayers };
});
