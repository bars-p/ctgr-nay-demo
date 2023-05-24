<template>
  <tools-component :title="props.title">
    <template #actions>
      <v-text-field
        v-if="isSearching"
        v-model="searchString"
        density="compact"
        variant="underlined"
        class="search-field"
        hide-details
      >
        <template v-slot:append-inner>
          <v-btn
            v-show="searchString.length"
            density="compact"
            icon="mdi-close"
            size="small"
            class="mt-2"
            @click="clearSearch"
          >
          </v-btn>
        </template>
      </v-text-field>
      <v-btn
        density="comfortable"
        icon="mdi-magnify"
        size="small"
        @click="toggleSearch"
      >
      </v-btn>
    </template>

    <template #tools>
      <v-select
        v-model="colorSelection"
        clearable
        hide-details
        single-line
        variant="outlined"
        density="compact"
        :label="$t('tools.socialColor')"
        class="mb-4"
        :items="selectItemsColor"
        @update:model-value="processColorChange"
      ></v-select>
      <v-select
        v-model="barsSelection"
        clearable
        hide-details
        variant="outlined"
        density="compact"
        :label="$t('tools.socialBars')"
        class="mb-2"
        :items="selectItemsBars"
        @update:model-value="processBarsChange"
      ></v-select>
      <!-- <v-switch
        v-model="mixMode"
        density="compact"
        :label="$t('tools.socialMix')"
        hide-details
        class="ml-1"
        @update:model-value="processMixMode"
      ></v-switch> -->
      <v-label
        class="mt-1 text-subtitle-2"
        :text="$t('tools.socialLayers')"
      ></v-label>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialBoundary')"
        v-model="borderShownState"
      ></v-checkbox>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialZones')"
        v-model="zonesShownState"
      ></v-checkbox>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialSavedDisplay')"
        v-model="savedShownState"
      ></v-checkbox>
    </template>

    <v-container class="data-block">
      <div class="area-data mb-5">
        <div>
          <v-label class="text-subtitle-2 mb-2">
            {{ $t("tools.socialSelected") }}
          </v-label>
          <v-btn
            v-show="mapStore.selectedCellsFeatures.length > 0"
            flat
            density="compact"
            icon
            class="cancel-button"
            @click="clearSelection"
            ><v-icon size="small" color="grey-darken-1"
              >mdi-cancel</v-icon
            ></v-btn
          >
        </div>
        <div>
          <v-label class="mr-3">
            {{ $t("general.size") }}
          </v-label>
          <strong>{{ mapStore.selectedSize.toLocaleString() }}</strong>
          {{ $t("general.m") }}<sup>2</sup>
        </div>
        <div>
          <v-label class="mr-3">
            {{ $t("general.population") }}
          </v-label>
          <strong>{{
            Math.round(mapStore.selectedPopulation).toLocaleString()
          }}</strong>
          (<strong>{{
            mapStore.selectedPopulationDensity.toLocaleString()
          }}</strong>
          {{ $t("general.perCell") }})
        </div>
        <div>
          <v-label class="mr-3">
            {{ $t("general.employment") }}
          </v-label>
          <strong>{{
            Math.round(mapStore.selectedEmployment).toLocaleString()
          }}</strong>
          (<strong>{{
            mapStore.selectedEmploymentDensity.toLocaleString()
          }}</strong>
          {{ $t("general.perCell") }})
        </div>
        <div class="mt-3">
          <v-text-field
            v-model="activeAreaName"
            clearable
            :label="$t('tools.socialName')"
            variant="outlined"
            density="compact"
            hide-details
          >
            <template v-slot:append-inner>
              <v-icon v-if="readyToSaveArea" @click="saveArea"
                >mdi-content-save</v-icon
              >
            </template>
          </v-text-field>
        </div>
      </div>

      <div v-if="mapStore.savedAreas.length">
        <v-divider></v-divider>
        <v-label class="text-subtitle-2 mt-3">{{
          $t("tools.socialSaved")
        }}</v-label>
        <v-list density="compact">
          <v-list-item
            v-for="(area, idx) in areasFiltered"
            :key="area.id"
            @click="selectSavedArea(area)"
          >
            <v-list-item-title class="text-body-2">
              {{ idx + 1 }}. {{ area.name }}
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-checkbox-blank"
                @click="areaColorSelect(area.name)"
              >
                <v-icon :color="area.color"></v-icon>
                <v-menu activator="parent" :close-on-content-click="false">
                  <v-color-picker
                    v-model="area.color"
                    show-swatches
                    @update:model-value="areaColorUpdate"
                  ></v-color-picker>
                </v-menu>
              </v-btn>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteSavedArea(area)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-container>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";

import { onMounted, defineProps, ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import { useMapStore } from "@/store/map";

const props = defineProps(["title"]);
const { t } = useI18n();

const mapStore = useMapStore();

// General tasks
onMounted(() => {
  console.log("Social Tools Mounted");
  // TODO: Init component controls to default state (in sync with map layers state)
});

const borderShownState = computed({
  get() {
    return mapStore.layers[mapStore.layersIdxs.adminBorder].shown;
  },
  set(newValue) {
    mapStore.layers[mapStore.layersIdxs.adminBorder].shown = newValue;
  },
});
const zonesShownState = computed({
  get() {
    return mapStore.layers[mapStore.layersIdxs.zonesBorder].shown;
  },
  set(newValue) {
    mapStore.layers[mapStore.layersIdxs.zonesBorder].shown = newValue;
  },
});

const savedShownState = computed({
  get() {
    return mapStore.layers[mapStore.layersIdxs.cellsSaved].shown;
  },
  set(newValue) {
    mapStore.layers[mapStore.layersIdxs.cellsSaved].shown = newValue;
  },
});

// Selection logic
const selectItemsColor = [
  {
    value: 0,
    title: t("tools.socialLayerPopulation"),
    layerIdx: 4,
    filterProps: null,
    paintProps: {
      "fill-color": [
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
      "fill-opacity": 0.7,
    },
  },
  {
    value: 1,
    title: t("tools.socialLayerEmployment"),
    layerIdx: 4,
    filterProps: null,
    paintProps: {
      "fill-color": [
        "step",
        ["get", "emp"],
        "#f5e6ff",
        0.02,
        "#cc80ff",
        1,
        "#b84dff",
        100,
        "#a31aff",
        1000,
        "#8a00e6",
        10000,
        "#5c0099",
      ],
      "fill-opacity": 0.7,
    },
  },
  {
    value: 2,
    title: t("tools.socialLayerMix"),
    layerIdx: 4,
    filterProps: null,
    paintProps: {
      "fill-color": [
        "step",
        ["/", ["+", ["get", "pop"], 1], ["+", ["get", "emp"], 1]],
        "#8a00e6",
        0.002,
        "#cc80ff",
        0.2,
        "#ffffff",
        10,
        "#d9b38c",
        100,
        "#996633",
      ],
      "fill-opacity": 0.7,
    },
  },
  {
    value: 3,
    title: t("tools.socialLayerVisitors"),
    layerIdx: null,
    filterProps: null,
    paintProps: null,
  },
  {
    value: 4,
    title: t("tools.socialLayerPopulationNext"),
    layerIdx: null,
    filterProps: null,
    paintProps: null,
  },
  {
    value: 5,
    title: t("tools.socialLayerEmploymentNext"),
    layerIdx: null,
    filterProps: null,
    paintProps: null,
  },
];
const selectItemsBars = [
  {
    value: 0,
    title: t("tools.socialLayerPopulation"),
    layerIdx: 5,
    filterProps: ["!=", ["get", "pop"], 0],
    paintProps: {
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
      "fill-extrusion-height": ["/", ["get", "pop"], 2],
      "fill-extrusion-opacity": 0.7,
    },
  },
  {
    value: 1,
    title: t("tools.socialLayerEmployment"),
    layerIdx: 5,
    filterProps: ["!=", ["get", "emp"], 0],
    paintProps: {
      "fill-extrusion-color": [
        "step",
        ["get", "emp"],
        "#f5e6ff",
        0.02,
        "#cc80ff",
        1,
        "#b84dff",
        100,
        "#a31aff",
        1000,
        "#8a00e6",
        10000,
        "#5c0099",
      ],
      "fill-extrusion-height": ["/", ["get", "emp"], 10],
      "fill-extrusion-opacity": 0.5,
    },
  },
  {
    value: 2,
    title: t("tools.socialLayerVisitors"),
    layerIdx: null,
    filterProps: null,
    paintProps: null,
  },
  {
    value: 3,
    title: t("tools.socialLayerPopulationNext"),
    layerIdx: null,
    filterProps: null,
    paintProps: null,
  },
  {
    value: 4,
    title: t("tools.socialLayerEmploymentNext"),
    layerIdx: null,
    filterProps: null,
    paintProps: null,
  },
];

let colorSelected = null;
let barsSelected = null;
const colorSelection = ref(null);
const barsSelection = ref(null);
// const mixMode = ref(false);

const processColorChange = (val) => {
  if (val !== null && selectItemsColor[val].layerIdx === null) {
    colorSelected = val;
    return;
  }
  if (val === null && selectItemsColor[colorSelected].layerIdx === null) {
    colorSelected = null;
    return;
  }
  console.log("New color:", val, colorSelected);
  if (val === null) {
    const layerIdx = selectItemsColor[colorSelected].layerIdx;
    mapStore.layers[layerIdx].shown = false;
    mapStore.layers[mapStore.layersIdxs.cellsSelected].shown = false;

    // if (barsSelected !== null) {
    //   barsSelection.value = null;
    //   processBarsChange(val);
    // }
  } else {
    if (selectItemsColor[val].paintProps !== null) {
      mapStore.newLayerPaint = {
        layerIdx: selectItemsColor[val].layerIdx,
        paintProps: selectItemsColor[val].paintProps,
      };
    }
    if (selectItemsColor[val].filterProps !== null) {
      mapStore.newLayerFilter = {
        layerIdx: selectItemsColor[val].layerIdx,
        filterProps: selectItemsColor[val].filterProps,
      };
    }
    if (mapStore.layers[selectItemsColor[val].layerIdx].shown == false) {
      mapStore.layers[selectItemsColor[val].layerIdx].shown = true;
      mapStore.layers[mapStore.layersIdxs.cellsSelected].shown = true;
    }
  }
  colorSelected = val;
};
const processBarsChange = (val) => {
  if (val !== null && selectItemsColor[val].layerIdx === null) {
    barsSelected = val;
    return;
  }
  console.log("New bars:", val);
  if (val !== null) {
    // if (colorSelected === null) {
    //   colorSelection.value = val;
    //   processColorChange(val);
    // }
    if (selectItemsBars[val].paintProps !== null) {
      mapStore.newLayerPaint = {
        layerIdx: selectItemsBars[val].layerIdx,
        paintProps: selectItemsBars[val].paintProps,
      };
    }
    if (selectItemsBars[val].filterProps !== null) {
      mapStore.newLayerFilter = {
        layerIdx: selectItemsBars[val].layerIdx,
        filterProps: selectItemsBars[val].filterProps,
      };
    }
    if (mapStore.layers[selectItemsBars[val].layerIdx].shown == false) {
      mapStore.layers[selectItemsBars[val].layerIdx].shown = true;
    }
  } else {
    if (selectItemsBars[barsSelected].layerIdx !== null) {
      const layerIdx = selectItemsBars[barsSelected].layerIdx;
      mapStore.layers[layerIdx].shown = false;
    }
  }
  barsSelected = val;
};
// const processMixMode = () => {
//   console.log("Mix Mode:", mixMode);
// };

// Search logic
const isSearching = ref(false);
const searchString = ref("");

const clearSearch = () => (searchString.value = "");
const toggleSearch = () => {
  isSearching.value = !isSearching.value;
  if (searchString.value) {
    searchString.value = "";
  }
};
const areasFiltered = computed(() => {
  return mapStore.savedAreas.filter((area) =>
    area.name.toLowerCase().includes(searchString.value)
  );
  // return areas.value.filter((area) =>
  //   area.name.toLowerCase().includes(searchString.value)
  // );
});

// Areas logic
const activeAreaName = ref("");

// const mockSavedAreas = [
//   {
//     id: 1,
//     name: "Deep forest",
//     cells: [1, 2, 3],
//     color: "#228B22",
//   },
//   {
//     id: 2,
//     name: "Urban zone",
//     cells: [32, 54, 332],
//     color: "#DC143C",
//   },
//   {
//     id: 3,
//     name: "City Center",
//     cells: [123, 242, 312, 2112],
//     color: "#4169E1",
//   },
// ];
// // FIXME:
// const areas = ref(mockSavedAreas);

const clearSelection = () => {
  mapStore.clearSelectedCells();
  activeAreaName.value = "";
};

const readyToSaveArea = computed(() => {
  return activeAreaName.value && mapStore.selectedCellsFeatures.length;
});
const saveArea = () => {
  if (!readyToSaveArea.value) {
    console.warn("Cannot save");
    return;
  }
  const name = activeAreaName.value.trim();
  const areaExist = mapStore.savedAreas.find((item) => item.name == name);

  const color = areaExist
    ? areaExist.color
    : `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, 0)}`;
  mapStore.saveSelectedFeatures(name, color);
  activeAreaName.value = "";
};

let areaColorSelectName = "";
const areaColorSelect = (areaName) => {
  areaColorSelectName = areaName;
};
const areaColorUpdate = (color) => {
  mapStore.updateSavedAreaColor(areaColorSelectName, color);
};
const selectSavedArea = (area) => {
  console.log("Area selected:", area);
  activeAreaName.value = area.name;
  // TODO: Set selected cells
  mapStore.selectSavedArea(area.name);
  //TODO: Fix color value
};
const deleteSavedArea = (area) => {
  mapStore.removeFromSaved(area.name);
};
</script>

<style scoped>
.data-block {
  overflow: auto;
  max-height: calc(100vh - 500px);
}
.area-data {
  display: flex;
  flex-direction: column;
}
.search-field {
  width: 50px;
  padding-bottom: 15px;
}
.cancel-button {
  position: absolute;
  right: 15px;
}
</style>
