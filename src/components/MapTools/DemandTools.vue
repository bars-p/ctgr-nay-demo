<template>
  <tools-component :title="props.title">
    <template #actions>
      <v-progress-circular
        v-if="mapStore.demandProcessing"
        indeterminate
        color="primary"
        :width="3"
        :size="25"
        class="mr-4"
      ></v-progress-circular>
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
            v-model="mapStore.demandDirection"
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
            v-model="mapStore.demandSelectMode"
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
                  :disabled="mapStore.demandLevel == 'district'"
                ></v-btn>
              </template>
            </v-tooltip>
          </v-btn-toggle>
          <apply-button
            v-if="mapStore.demandSelectMode == 'many'"
            density="comfortable"
            @click="processManyItems"
          ></apply-button>
          <!-- <v-btn
            v-if="mapStore.demandSelectMode == 'many'"
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
      <v-row dense v-if="mapStore.demandReady">
        <v-col>
          <v-switch
            :label="$t('tools.demandSplit')"
            v-model="mapStore.demandSplit"
            hide-details
            density="comfortable"
            :disabled="!mapStore.demandReady"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row :dense="mapStore.demandReady">
        <v-col>
          <v-select
            v-model="mapStore.demandLevel"
            clearable
            hide-details
            variant="outlined"
            density="compact"
            :label="$t('tools.demandLevel')"
            class="mb-2"
            :no-data-text="$t('general.noData')"
            :items="selectItemsLevel"
            @update:model-value="processLevelSelect"
          >
          </v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="mapStore.demandReference"
            mandatory
            hide-details
            variant="outlined"
            density="compact"
            :label="$t('tools.demandReference')"
            class="mb-2"
            :no-data-text="$t('general.noData')"
            :items="selectItemsReference"
            @update:model-value="processReferenceSelect"
          >
          </v-select>
        </v-col>
      </v-row>
    </template>
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

onMounted(async () => {
  console.log("🫣 Demand Mounted");
  await mapStore.loadDemandConnectData();
});

const selectItemsLevel = [
  {
    title: t("tools.demandAdminAreas"),
    value: "district",
  },
  {
    title: t("tools.socialZones"),
    value: "zone",
  },
  mapStore.savedAreas.length > 0 && {
    title: t("tools.socialSavedDisplay"),
    value: "area",
  },
].filter(Boolean);

const selectItemsReference = [
  {
    title: t("tools.demandSelection"),
    value: "selection",
    props: {
      disabled: false,
    },
  },
  {
    title: t("tools.demandCity"),
    value: "city",
    props: {
      disabled: false,
    },
  },
  {
    title: t("tools.demandGlobal"),
    value: "global",
    props: {
      disabled: true,
    },
  },
];

const processLevelSelect = (val) => {
  console.log("Selected Level", mapStore.demandLevel);
  console.log("Value", val);
  switch (val) {
    case "district":
      mapStore.turnOnLayer(mapStore.layersIdxs.adminAreaSelect);
      mapStore.turnOnLayer(mapStore.layersIdxs.adminBorder);
      mapStore.turnOnLayer(mapStore.layersIdxs.adminAreasSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.savedAreasSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);
      break;

    case "zone":
      mapStore.turnOnLayer(mapStore.layersIdxs.zoneSelect);
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesBorder);
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesSelected);

      mapStore.turnOffLayer(mapStore.layersIdxs.adminAreasSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.savedAreasSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);

      break;

    case "area":
      mapStore.turnOnLayer(mapStore.layersIdxs.cellsSaved);
      mapStore.turnOnLayer(mapStore.layersIdxs.savedAreasSelected);

      mapStore.turnOffLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.adminAreasSelected);

      break;

    default:
      mapStore.turnOffLayer(mapStore.layersIdxs.adminAreasSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.turnOffLayer(mapStore.layersIdxs.zonesFill);
      // mapStore.turnOffLayer(mapStore.layersIdxs.cellsFill);
      mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);

      clearSelection();
      break;
  }
};

const clearSelection = () => {
  console.log("Clear Selection");
  mapStore.demandItemsSelectedIds.clear();
  mapStore.demandDistrictId = null;
  mapStore.demandProcessItems();
};

const processManyItems = () => {
  mapStore.demandProcessItems();
};

const processReferenceSelect = () => {
  console.log("Reference level:", mapStore.demandReference);
  mapStore.demandProcessItems();
};

const processDirectionChange = () => {
  console.log("Direction", mapStore.demandDirection);
  if (mapStore.demandLevel == "district" && mapStore.demandDistrictId != null) {
    mapStore.demandItemsSelectedIds.clear();
    mapStore.demandItemsSelectedIds.add(mapStore.demandDistrictId);
  }
  mapStore.demandProcessItems();
};
</script>
