<template>
  <tools-component :title="props.title">
    <template #actions>
      <v-progress-circular
        v-if="mapStore.demandSelectMode == 'many'"
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
            {{ t("tools.demandDirection") }}
          </v-label>
        </v-col>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ t("tools.demandMode") }}
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
          >
            <v-tooltip :text="$t('tools.demandFrom')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-upload" value="from"></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('tools.demandTo')" location="bottom">
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
            <v-tooltip :text="$t('tools.demandOne')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-checkbox-blank"
                  value="one"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('tools.demandMany')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-checkbox-multiple-blank"
                  value="many"
                ></v-btn>
              </template>
            </v-tooltip>
          </v-btn-toggle>
          <v-btn
            v-if="mapStore.demandSelectMode == 'many'"
            icon="mdi-checkbox-marked-circle-outline"
            flat
            density="comfortable"
            class="ml-3"
            @click="mapStore.demandProcessItems"
          >
            <v-icon color="grey-darken-2"></v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
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
    </template>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";

// import { ref } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

// const demandDirection = ref("from");
// const selectMode = ref("one");

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

const processLevelSelect = (val) => {
  console.log("Selected Level", mapStore.demandLevel);
  console.log("Value", val);
  switch (val) {
    case "district":
      if (!mapStore.layers[mapStore.layersIdxs.adminAreaSelect].shown) {
        mapStore.layers[mapStore.layersIdxs.adminAreaSelect].shown = true;
      }
      if (!mapStore.layers[mapStore.layersIdxs.adminBorder].shown) {
        mapStore.layers[mapStore.layersIdxs.adminBorder].shown = true;
      }
      if (!mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown = true;
      }
      if (mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = false;
      }
      if (mapStore.layers[mapStore.layersIdxs.savedAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.savedAreasSelected].shown = false;
      }

      break;
    case "zone":
      if (!mapStore.layers[mapStore.layersIdxs.zoneSelect].shown) {
        mapStore.layers[mapStore.layersIdxs.zoneSelect].shown = true;
      }
      if (!mapStore.layers[mapStore.layersIdxs.zonesBorder].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesBorder].shown = true;
      }
      if (!mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = true;
      }
      if (mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown = false;
      }
      if (mapStore.layers[mapStore.layersIdxs.savedAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.savedAreasSelected].shown = false;
      }

      break;
    case "area":
      if (!mapStore.layers[mapStore.layersIdxs.cellsSaved].shown) {
        mapStore.layers[mapStore.layersIdxs.cellsSaved].shown = true;
      }
      if (!mapStore.layers[mapStore.layersIdxs.savedAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.savedAreasSelected].shown = true;
      }
      if (mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = false;
      }
      if (mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown = false;
      }

      break;

    default:
      if (mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.adminAreasSelected].shown = false;
      }
      if (mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = false;
      }
      clearSelection();
      break;
  }
};

const clearSelection = () => {
  console.log("Clear Selection");
  mapStore.demandItemsSelectedIds.clear();
  mapStore.demandProcessItems();
};
</script>
