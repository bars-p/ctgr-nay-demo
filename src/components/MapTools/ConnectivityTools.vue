<template>
  <tools-component :title="props.title">
    <template #actions>
      <!-- <v-progress-circular
        v-if="mapStore.connectivitySelectMode == 'many'"
        indeterminate
        color="primary"
        :width="3"
        :size="25"
        class="mr-4"
      ></v-progress-circular> -->
    </template>
    <template #tools>
      <v-row dense>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ t("general.direction") }}
          </v-label>
        </v-col>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ t("general.mode") }}
          </v-label>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <v-btn-toggle
            v-model="mapStore.connectivityDirection"
            divided
            variant="outlined"
            density="comfortable"
            mandatory
            @update:model-value="processDirectionChange"
          >
            <v-tooltip :text="$t('general.from')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-upload" value="from"></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('general.to')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-download" value="to"></v-btn>
              </template>
            </v-tooltip>
          </v-btn-toggle>
        </v-col>
        <v-col>
          <v-btn-toggle
            v-model="mapStore.connectivitySelectMode"
            divided
            variant="outlined"
            density="comfortable"
            mandatory
          >
            <v-tooltip :text="$t('general.one')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-checkbox-blank"
                  value="one"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('general.many')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-checkbox-multiple-blank"
                  value="many"
                  :disabled="mapStore.connectivityType == 'change'"
                ></v-btn>
              </template>
            </v-tooltip>
          </v-btn-toggle>
          <apply-button
            v-if="mapStore.connectivitySelectMode == 'many'"
            density="comfortable"
            @click="mapStore.connectivityProcessItems"
          ></apply-button>
          <!-- <v-btn
            v-if="mapStore.connectivitySelectMode == 'many'"
            icon="mdi-checkbox-marked-circle-outline"
            flat
            density="comfortable"
            class="ml-3"
            @click="mapStore.demandProcessItems"
          >
            <v-icon color="grey-darken-2"></v-icon>
          </v-btn> -->
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="mapStore.connectivityType"
            clearable
            hide-details
            variant="outlined"
            density="compact"
            :label="$t('tools.connectivityType')"
            class="mb-2"
            :no-data-text="$t('general.noData')"
            :items="connectivityTypes"
            @update:model-value="processTypeChange"
          >
          </v-select>
        </v-col>
      </v-row>
    </template>

    <v-container
      v-if="
        mapStore.connectivityType == 'speed' && mapStore.connectivityProcessed
      "
    >
      <v-row no-gutters>
        <v-col cols="8">
          <v-label class="text-subtitle-2">
            {{ t("tools.connectivityGaps") }}:
          </v-label>
        </v-col>
        <v-col cols="2"> </v-col>
        <v-col cols="2">
          <apply-button @click="applyDemandFilter"></apply-button>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-3">
        <v-col cols="9" align-self="end">
          <v-label>{{ t("tools.connectivityDemand") }}</v-label>
        </v-col>
        <v-col cols="3" align-self="end">
          <v-select
            v-model="mapStore.connectivityDemandAbove"
            :label="$t('general.level')"
            density="compact"
            variant="underlined"
            hide-details
            mandatory
            :items="levelsDemand"
          ></v-select>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-3">
        <v-col cols="9" align-self="end">
          <v-label>{{ t("tools.connectivityBelow") }}</v-label>
        </v-col>
        <v-col cols="3" align-self="end">
          <v-select
            v-model="mapStore.connectivityBelow"
            :label="$t('general.level')"
            density="compact"
            variant="underlined"
            hide-details
            mandatory
            :items="levelsConnect"
          ></v-select>
        </v-col>
      </v-row>
    </v-container>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import ApplyButton from "../elements/ApplyButton.vue";

import { onMounted } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

onMounted(() => {
  mapStore.loadDemandConnectData();
  // mapStore.turnOnLayer(mapStore.layersIdxs.zoneSelect);
});

const connectivityTypes = [
  {
    title: t("tools.connectivitySpeed"),
    value: "speed",
  },
  {
    title: t("tools.connectivityRoute"),
    value: "change",
  },
];

const levelsConnect = [
  {
    title: "1",
    value: 0,
  },
  {
    title: "2",
    value: 1,
  },
  {
    title: "3",
    value: 2,
  },
  {
    title: "4",
    value: 3,
  },
  {
    title: "5",
    value: 4,
  },
  {
    title: "6",
    value: 5,
  },
];
const levelsDemand = [
  {
    title: "1",
    value: 1,
  },
  {
    title: "2",
    value: 2,
  },
  {
    title: "3",
    value: 3,
  },
  {
    title: "4",
    value: 4,
  },
  {
    title: "5",
    value: 5,
  },
  {
    title: "6",
    value: 6,
  },
];

const processTypeChange = (val) => {
  console.log("Selected Type", mapStore.connectivityType);
  console.log("Value", val);
  switch (val) {
    case "speed":
      console.log("Speed statistics");
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesSelected);
      // TODO: Process Speed Stats for Zones selected
      mapStore.connectivityProcessItems();

      break;

    case "change":
      console.log("Route Change statistics");
      mapStore.connectivitySelectMode = "one";
      mapStore.newLayerFilter = {
        layerIdx: mapStore.layersIdxs.zonesFill,
        filterProps: null,
      };
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesSelected);
      // TODO: Process Route Stats for Zones selected
      mapStore.connectivityProcessItems();

      break;

    default:
      mapStore.turnOffLayer(mapStore.layersIdxs.zonesSelected);
      clearSelection();
      break;
  }
};

const processDirectionChange = () => {
  console.log("Direction", mapStore.connectivityDirection);
  mapStore.connectivityProcessItems();
};

const applyDemandFilter = () => {
  console.log(
    "Levels:",
    mapStore.connectivityBelow,
    mapStore.connectivityDemandAbove
  );
  const filterData = {
    layerIdx: mapStore.layersIdxs.zonesFill,
    filterProps: [
      "all",
      ["<=", ["get", "value"], mapStore.connectivityBelow],
      [">=", ["get", "dm"], mapStore.connectivityDemandAbove],
    ],

    // filterProps: ["<=", ["get", "value"], mapStore.connectivityBelow],
    // filterProps: [">=", ["get", "dm"], mapStore.connectivityDemandAbove],
  };

  mapStore.newLayerFilter = filterData;
};

const clearSelection = () => {
  console.log("Clear Selection");
  mapStore.turnOffLayer(mapStore.layersIdxs.zonesFill);
  mapStore.newLayerFilter = {
    layerIdx: mapStore.layersIdxs.zonesFill,
    filterProps: null,
  };
  mapStore.connectivityItemsSelectedIds.clear();
  mapStore.connectivityProcessItems();
  // mapStore.connectivityProcessed = false;
};
</script>
