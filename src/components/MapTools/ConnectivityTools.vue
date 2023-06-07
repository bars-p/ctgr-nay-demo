<template>
  <tools-component :title="props.title">
    <template #actions>
      <v-progress-circular
        v-if="mapStore.connectivitySelectMode == 'many'"
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
            v-model="mapStore.connectivityDirection"
            divided
            variant="outlined"
            density="comfortable"
            mandatory
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
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import ApplyButton from "../elements/ApplyButton.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

const connectivityTypes = [
  {
    title: t("tools.connectivitySpeed"),
    value: "speed",
  },
  {
    title: t("tools.connectivityRoute"),
    value: "route",
  },
];

const processTypeChange = (val) => {
  console.log("Selected Type", mapStore.connectivityType);
  console.log("Value", val);
  switch (val) {
    case "speed":
      console.log("Speed statistics");
      if (!mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = true;
      }
      // TODO: Process Speed Stats for Zones selected

      break;

    case "route":
      console.log("Route statistics");
      if (!mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = true;
      }
      // TODO: Process Route Stats for Zones selected

      break;

    default:
      if (mapStore.layers[mapStore.layersIdxs.zonesSelected].shown) {
        mapStore.layers[mapStore.layersIdxs.zonesSelected].shown = false;
      }
      clearSelection();
      break;
  }
};

const clearSelection = () => {
  console.log("Clear Selection");
  mapStore.connectivityItemsSelectedIds.clear();
  mapStore.connectivityProcessItems();
};
</script>
