<template>
  <div>
    <v-menu location="top" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <map-button
          icon-symbol="mdi-layers-outline"
          class="button-item mr-5"
          v-bind="props"
        ></map-button>
      </template>
      <v-list class="mb-1" min-width="100px">
        <v-list-item
          v-for="layer in layers"
          :key="layer.idx"
          :value="layer.idx"
          density="compact"
          @click="layer.state = !layer.state"
        >
          <template #prepend>
            <v-icon v-if="layer.state" size="small" class="mr-2"
              >mdi-eye-outline</v-icon
            >
            <v-icon v-else size="small" class="mr-2"
              >mdi-eye-off-outline</v-icon
            >
          </template>
          <v-list-item-title class="text-body-2">{{
            layer.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <map-button
      icon-symbol="mdi-format-rotate-90"
      @click="$emit('compass')"
      class="button-item"
    ></map-button>
    <map-button
      icon-symbol="mdi-rotate-3d"
      @click="$emit('rotate')"
      class="button-item"
    ></map-button>
  </div>
</template>

<script setup>
import MapButton from "./MapButton.vue";

import { ref, computed } from "vue";

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const getLayerData = (idx) => {
  return {
    idx: idx,
    state: computed({
      get() {
        return mapStore.layers[idx].shown;
      },
      set(value) {
        mapStore.layers[idx].shown = value;
      },
    }),
  };
};

const layers = ref([
  {
    title: "Borders",
    ...getLayerData(mapStore.layersIdxs.adminBorder),
  },
  {
    title: "Districts",
    ...getLayerData(mapStore.layersIdxs.adminFill),
  },
  {
    title: "Zones",
    ...getLayerData(mapStore.layersIdxs.zonesBorder),
  },
  {
    title: "Cells",
    ...getLayerData(mapStore.layersIdxs.cellsFill),
  },
  {
    title: "Sites",
    ...getLayerData(mapStore.layersIdxs.sitesFill),
  },
  {
    title: "Centroids",
    ...getLayerData(mapStore.layersIdxs.sitesCentroids),
  },
  {
    title: "Stops",
    ...getLayerData(mapStore.layersIdxs.stopsPoints),
  },
  {
    title: "Routes",
    ...getLayerData(mapStore.layersIdxs.ladsTraces),
  },
]);
</script>

<style scoped>
.button-item {
  margin-left: 5px;
}
</style>
