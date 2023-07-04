<template>
  <div>
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
            <v-label
              class="text-subtitle-2"
              v-if="mapStore.connectivityType != 'general'"
            >
              {{ t("general.mode") }}
            </v-label>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col>
            <v-btn-toggle
              v-if="mapStore.connectivityType != 'general'"
              :disabled="mapStore.connectivityType == null"
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
            <v-btn-toggle
              v-else
              :disabled="mapStore.connectivityType == null"
              v-model="mapStore.connectivityGeneralDirection"
              divided
              variant="outlined"
              density="comfortable"
              mandatory
            >
              <v-tooltip :text="$t('general.between')" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-arrow-left-right-bold"
                    value="between"
                  ></v-btn>
                </template>
              </v-tooltip>
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
              v-if="mapStore.connectivityType != 'general'"
              :disabled="mapStore.connectivityType == null"
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
              v-if="
                mapStore.connectivitySelectMode == 'many' &&
                mapStore.connectivityType != 'general'
              "
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
          (mapStore.connectivityType == 'speed' &&
            mapStore.connectivityProcessed) ||
          mapStore.connectivityType == 'general'
        "
      >
        <v-row no-gutters class="mb-3">
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
        <div v-if="mapStore.connectivityType == 'general'">
          <v-row no-gutters class="mt-5">
            <v-col cols="10">
              <v-label
                >{{ t("tools.connectivityZones") }}:
                <span class="pl-5">
                  <strong>
                    {{ mapStore.connectivityItemsSelectedIds.size }}
                  </strong>
                </span>
              </v-label>
            </v-col>
            <v-col cols="2">
              <cancel-button
                v-if="mapStore.connectivityItemsSelectedIds.size > 0"
                @click="clearZonesSelected"
              ></cancel-button>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-switch
                v-model="mapStore.connectivityUseSpeedValues"
                :label="$t('tools.connectivityUseSpeed')"
                hide-details
              ></v-switch>
            </v-col>
          </v-row>
        </div>
        <v-row no-gutters v-if="!mapStore.connectivityUseSpeedValues">
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
        <v-row no-gutters v-else>
          <v-col cols="9" align-self="end">
            <v-label>{{ t("tools.connectivitySpeedBelow") }}</v-label>
          </v-col>
          <v-col cols="3" align-self="end">
            <v-text-field
              v-model="mapStore.connectivitySpeedBelow"
              :label="$t('general.kmh')"
              variant="underlined"
              density="compact"
              hide-details
              type="number"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters class="mt-3 mb-3">
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
      </v-container>
    </tools-component>

    <tools-component
      v-if="mapStore.connectivityMapData?.length > 0"
      :title="`${t('tools.connectivityConnections')} (${
        mapStore.connectivityMapData?.length
      })`"
      class="data-group"
    >
      <template #actions>
        <search-bar v-model="searchConnectionsString"></search-bar>
        <close-button @close="clearArcs"></close-button>
      </template>
      <template #tools>
        <div class="mt-0">
          <v-text-field
            v-model="sitesGroupName"
            clearable
            :label="$t('tools.sitesGroupName')"
            variant="outlined"
            density="compact"
            hide-details
          >
            <template v-slot:append-inner>
              <v-icon v-if="readyToSave" @click="saveSitesGroup"
                >mdi-content-save</v-icon
              >
            </template>
          </v-text-field>
          <v-row class="mt-2">
            <v-col>
              <v-label class="mb-1 text-subtitle-2">
                {{ $t("general.displayOptions") }}:
              </v-label>
              <apply-button @click="applyAnalyticsDisplay"></apply-button>
            </v-col>
          </v-row>

          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                v-model="mapStore.siteColorMode"
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.sitesColor')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="siteDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <config-button></config-button>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                v-model="mapStore.siteSizeMode"
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.sitesSize')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="siteDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <v-text-field
                v-model="mapStore.siteSizeStep"
                density="compact"
                hide-details
                variant="underlined"
                :label="$t('general.step')"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </template>
      <v-container class="data-connections-group">
        <v-label class="mb-0 text-subtitle-2">
          {{ $t("tools.connectivityConnections") }} ({{
            $t("tools.connectivityDetails")
          }}):
        </v-label>

        <v-list density="compact">
          <v-list-item
            v-for="conn in mapStore.connectivityMapData"
            :key="conn.id"
            @click="selectConnectionInGroup(conn)"
          >
            <v-list-item-title class="text-body-2">
              {{ conn.fromId }} -> {{ conn.toId }} ({{
                conn.kmh.toFixed(2)
              }}
              kmh, {{ conn.sp + 1 }}, {{ conn.dm }})
            </v-list-item-title>
            <template #append>
              <!-- <v-btn
                density="comfortable"
                size="small"
                flat
                :icon="conn.shown ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click.stop="conn.shown = !conn.shown"
              >
              </v-btn> -->
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteConnectionFromGroup(conn.id)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-container>
    </tools-component>
  </div>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import CancelButton from "../elements/CancelButton.vue";
import CloseButton from "../elements/CloseButton.vue";
import SearchBar from "../elements/SearchBar.vue";

import { onMounted, ref } from "vue";

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
  {
    title: t("tools.connectivityGeneral"),
    value: "general",
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
  switch (val) {
    case "speed":
      console.log("Speed statistics");
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.turnOnLayer(mapStore.layersIdxs.zoneSelect);
      mapStore.connectivityProcessItems();

      // mapStore.connectivityBelow = 5;
      // mapStore.connectivityDemandAbove = 1;

      break;

    case "change":
      console.log("Route Change statistics");
      mapStore.connectivitySelectMode = "one";
      mapStore.newLayerFilter = {
        layerIdx: mapStore.layersIdxs.zonesFill,
        filterProps: null,
      };
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.turnOnLayer(mapStore.layersIdxs.zoneSelect);
      mapStore.connectivityProcessItems();

      break;

    case "general":
      mapStore.turnOnLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.turnOnLayer(mapStore.layersIdxs.zoneSelect);

      break;

    default:
      mapStore.turnOffLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.connectivitySelectMode = "one";
      mapStore.connectivityBelow = 0;
      mapStore.connectivityDemandAbove = 6;
      mapStore.connectivitySpeedBelow = 0;
      mapStore.connectivityUseSpeedValues = false;

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
  if (mapStore.connectivityType == "speed") {
    const filterData = {
      layerIdx: mapStore.layersIdxs.zonesFill,
      filterProps: [
        "all",
        ["<=", ["get", "value"], mapStore.connectivityBelow],
        [">=", ["get", "dm"], mapStore.connectivityDemandAbove],
      ],
    };
    mapStore.newLayerFilter = filterData;
  } else if (mapStore.connectivityType == "general") {
    console.log("Connectivity General Map");

    // Get all Zone pairs within the Range
    const connectivityMap = mapStore.getConnectivityMap();
    console.log("Connectivity Map:", connectivityMap.length, connectivityMap);
    const connectivityMapDiffer = connectivityMap.filter(
      (item) => item.fromId != item.toId
    );

    connectivityMapDiffer.forEach((item) => {
      item.id = item.fromId * 1000 + item.toId;
      item.shown = true;
    });

    console.log(
      "Connectivity Map Differ:",
      connectivityMapDiffer.length,
      connectivityMapDiffer
    );

    // TODO: Draw Zones Arrows/Arcs/Lines
    mapStore.connectivityMapData = connectivityMapDiffer;
  }
};

const clearZonesSelected = () => {
  mapStore.connectivityItemsSelectedIds.clear();
  mapStore.connectivityProcessItems();
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

  clearArcs();
  // mapStore.connectivityProcessed = false;
};

const clearArcs = () => {
  mapStore.connectivityMapData = [];
};

const searchConnectionsString = ref("");

const selectConnectionInGroup = (connection) => {
  console.log("Select Connection:", connection);
  toggleZone(connection.fromId);
  toggleZone(connection.toId);
  // mapStore.connectivityProcessItems();

  const filterData = {
    layerIdx: mapStore.layersIdxs.zonesSelected,
    filterProps: ["in", "id", ...[...mapStore.connectivityItemsSelectedIds]],
  };

  mapStore.newLayerFilter = filterData;
};

const deleteConnectionFromGroup = (id) => {
  console.log("Delete Connection:", id);

  mapStore.connectivityMapData = mapStore.connectivityMapData.filter(
    (item) => item.id != id
  );
};

const toggleZone = (id) => {
  mapStore.connectivityItemsSelectedIds.has(id)
    ? mapStore.connectivityItemsSelectedIds.delete(id)
    : mapStore.connectivityItemsSelectedIds.add(id);
};
</script>

<style scoped>
.data-group {
  position: absolute;
  top: calc(64px + 20px);
  left: calc(100dvw - 340px);
}
.data-connections-group {
  overflow: auto;
  max-height: calc(100vh - 540px);
}
</style>
