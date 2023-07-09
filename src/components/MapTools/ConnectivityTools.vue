<template>
  <div>
    <tools-component :title="props.title">
      <template #actions>
        <search-bar
          v-if="mapStore.savedConnectionsGroups.length"
          v-model="searchConnectionsGroupsString"
        ></search-bar>
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
        <div
          v-if="
            ((mapStore.connectivityType == 'speed' ||
              mapStore.connectivityType == 'change') &&
              mapStore.connectivityProcessed) ||
            mapStore.connectivityType == 'general'
          "
        >
          <v-row
            no-gutters
            class="mt-3"
            :class="mapStore.connectivityType == 'speed' ? 'mb-3' : ''"
          >
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
          <div v-if="mapStore.connectivityType != 'change'">
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
          </div>
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
          <div v-if="mapStore.connectivityType == 'general'">
            <v-row no-gutters class="mt-5 mb-3">
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
          </div>
        </div>
        <!-- <div v-if="mapStore.connectivityType == 'change' &&
              mapStore.connectivityProcessed">

        </div> -->
      </template>

      <v-container
        v-if="
          mapStore.connectivityType == 'general' &&
          mapStore.savedConnectionsGroups.length
        "
        class="saved-groups-block"
      >
        <v-label class="mb-0 text-subtitle-2"
          >{{ $t("tools.routesSaved") }}:
        </v-label>
        <v-list density="compact">
          <v-list-item
            v-for="(group, idx) in connectionsGroupsFiltered"
            :key="group.name"
            @click="selectConnectionsGroup(group)"
          >
            <v-list-item-title class="text-body-2">
              {{ idx + 1 }}. {{ group.name }} ({{ group.data.length }})
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteConnectionsGroup(group)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
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
            v-model="connectionsGroupName"
            clearable
            :label="$t('tools.connectionsGroupName')"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-5"
          >
            <template v-slot:append-inner>
              <v-icon v-if="readyToSave" @click="saveConnectionsGroup"
                >mdi-content-save</v-icon
              >
            </template>
          </v-text-field>
          <!-- <v-row class="mt-2">
            <v-col>
              <v-label class="mb-1 text-subtitle-2">
                {{ $t("general.displayOptions") }}:
              </v-label>
              <apply-button @click="applyAnalyticsDisplay"></apply-button>
            </v-col>
          </v-row> -->

          <v-row no-gutters class="mb-3">
            <v-col cols="12">
              <v-select
                v-model="connectionsOrderBy"
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.connectivityOrder')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="connectionsOrderOptions"
              ></v-select>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="7" align-self="end">
              <v-label> {{ $t("tools.connectivityNTop") }}: </v-label>
            </v-col>
            <v-col cols="2" align-self="end">
              <v-text-field
                v-model="topN"
                density="compact"
                hide-details
                variant="underlined"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <apply-button class="mt-4" @click="getTopNItems"></apply-button>
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
            v-for="conn in connectionsFiltered"
            :key="conn.id"
            @click="selectConnectionInGroup(conn)"
          >
            <v-list-item-title
              class="text-body-2"
              :class="conn.selected ? 'font-weight-black' : ''"
            >
              {{ conn.fromId }} -> {{ conn.toId }} ({{
                conn.kmh.toFixed(2)
              }}
              kmh, {{ conn.sp }}, {{ conn.dm }})
            </v-list-item-title>
            <template #append>
              <!-- <v-btn
                density="comfortable"
                size="small"
                flat
                :icon="
                  conn.selected
                    ? 'mdi-radiobox-marked'
                    : 'mdi-checkbox-blank-circle-outline'
                "
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
import _ from "lodash";

import ToolsComponent from "../ToolsComponent.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import CancelButton from "../elements/CancelButton.vue";
import CloseButton from "../elements/CloseButton.vue";
import SearchBar from "../elements/SearchBar.vue";
// import ConfigButton from "../elements/ConfigButton.vue";

import { onMounted, ref, computed } from "vue";

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
      mapStore.connectivityGeneralDirection = "between";

      break;

    default:
      mapStore.turnOffLayer(mapStore.layersIdxs.zonesSelected);
      mapStore.connectivitySelectMode = "one";
      mapStore.connectivityBelow = 1;
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
  } else if (mapStore.connectivityType == "change") {
    const filterData = {
      layerIdx: mapStore.layersIdxs.zonesFill,
      filterProps: [">=", ["get", "dm"], mapStore.connectivityDemandAbove],
    };
    mapStore.newLayerFilter = filterData;
  } else if (mapStore.connectivityType == "general") {
    console.log("Connectivity General Map");

    let connectivityMap = null;

    if (mapStore.connectivityItemsSelectedIds.size == 0) {
      // No Zones selected - Get all Zone pairs within the Range
      connectivityMap = mapStore.getConnectivityMap();
      console.log("Connectivity Map:", connectivityMap.length, connectivityMap);
    } else {
      // For Zones selected check Direction and Connections presence
      connectivityMap = mapStore.getZonesFilteredConnections();
    }

    const connectivityMapDiffer = connectivityMap.filter(
      (item) => item.fromId != item.toId
    );

    connectivityMapDiffer.forEach((item) => {
      item.id = item.fromId * 1000 + item.toId;
      item.selected = false;
    });

    console.log(
      "Connectivity Map Differ:",
      connectivityMapDiffer.length,
      connectivityMapDiffer
    );

    // Check for volume
    if (connectivityMapDiffer.length > 5000) {
      return window.alert(t("tools.connectivityTooMany"));
    }

    // Draw Zones Arrows/Arcs/Lines
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
  connectionsGroupName.value = "";
};

const searchConnectionsString = ref("");

const selectConnectionInGroup = (connection) => {
  console.log("Select Connection:", connection);

  // Highlight Zones
  if (!connection.selected) {
    // Add Zones pair
    mapStore.connectivityItemsSelectedIds.add(connection.fromId);
    mapStore.connectivityItemsSelectedIds.add(connection.toId);
  } else {
    // Remove zone if last deselected
    removeConnectionZonesFromSelection(connection);
  }
  // toggleZone(connection.fromId);
  // toggleZone(connection.toId);
  // mapStore.connectivityProcessItems();

  // Highlight Arc
  connection.selected = !connection.selected;

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

const removeConnectionZonesFromSelection = (connection) => {
  const zoneIds = [];
  mapStore.connectivityMapData
    .filter((item) => item.selected)
    .forEach((item) => {
      zoneIds.push(item.fromId);
      zoneIds.push(item.toId);
    });
  console.log("Zone Ids", zoneIds);

  if (zoneIds.filter((id) => id == connection.fromId).length == 1) {
    // Last zone Id
    mapStore.connectivityItemsSelectedIds.delete(connection.fromId);
  }
  if (zoneIds.filter((id) => id == connection.toId).length == 1) {
    // Last zone Id
    mapStore.connectivityItemsSelectedIds.delete(connection.toId);
  }
};

// const toggleZone = (id) => {
//   mapStore.connectivityItemsSelectedIds.has(id)
//     ? mapStore.connectivityItemsSelectedIds.delete(id)
//     : mapStore.connectivityItemsSelectedIds.add(id);
// };

const searchConnectionsGroupsString = ref("");

const connectionsGroupsFiltered = computed(() => {
  return mapStore.savedConnectionsGroups.filter((group) =>
    group.name
      .toLowerCase()
      .includes(searchConnectionsGroupsString.value.toLowerCase())
  );
});
const selectConnectionsGroup = (group) => {
  mapStore.connectivityMapData = group.data;
  connectionsGroupName.value = group.name;
};
const deleteConnectionsGroup = (group) => {
  console.log("Delete Group", group);
  mapStore.savedConnectionsGroups = mapStore.savedConnectionsGroups.filter(
    (item) => item.name != group.name
  );
};

const connectionsFiltered = computed(() => {
  let result = mapStore.connectivityMapData.filter((connection) =>
    connection.id
      .toString()
      .includes(searchConnectionsString.value.toLowerCase())
  );
  result = result.sort(compareConnections);

  return result;
});
const compareConnections = (a, b) => {
  switch (connectionsOrderBy.value) {
    case "kmh_asc":
      return a.kmh - b.kmh;

    case "kmh_des":
      return b.kmh - a.kmh;

    case "con_asc":
      return a.sp - b.sp;

    case "con_des":
      return b.sp - a.sp;

    case "dm_asc":
      return a.dm - b.dm;

    case "dm_des":
      return b.dm - a.dm;

    default:
      return a.id - b.id;
  }
};

const connectionsGroupName = ref(null);
const readyToSave = computed(() => {
  return connectionsGroupName.value?.length > 0;
});
const saveConnectionsGroup = () => {
  console.log("Current to Save:", mapStore.connectivityMapData);
  const savedGroupIdx = mapStore.savedConnectionsGroups.findIndex(
    (group) => group.name == connectionsGroupName.value
  );
  if (savedGroupIdx != -1) {
    console.log("Update Connections Group");
    mapStore.savedConnectionsGroups[savedGroupIdx] = _.cloneDeep({
      data: mapStore.connectivityMapData,
      name: connectionsGroupName.value,
    });
  } else {
    console.log("Save new");
    mapStore.savedConnectionsGroups.push(
      _.cloneDeep({
        data: mapStore.connectivityMapData,
        name: connectionsGroupName.value,
      })
    );
  }
};

const connectionsOrderBy = ref(null);
const connectionsOrderOptions = [
  {
    title: t("tools.connectivitySpeedAsc"),
    value: "kmh_asc",
  },
  {
    title: t("tools.connectivitySpeedDes"),
    value: "kmh_des",
  },
  {
    title: t("tools.connectivityConnAsc"),
    value: "con_asc",
  },
  {
    title: t("tools.connectivityConnDes"),
    value: "con_des",
  },
  {
    title: t("tools.connectivityDemandAsc"),
    value: "dm_asc",
  },
  {
    title: t("tools.connectivityDemandDes"),
    value: "dm_des",
  },
];

const topN = ref(0);
const getTopNItems = () => {
  console.log("Top N", topN.value);
  if (topN.value < 1) {
    topN.value = 0;
    return;
  }

  if (connectionsFiltered.value.length < topN.value) {
    console.log("Too Much to crop");
    return;
  }

  mapStore.connectivityMapData = connectionsFiltered.value.slice(0, topN.value);
};
</script>

<style scoped>
.saved-groups-block {
  overflow: auto;
  max-height: calc(100vh - 640px);
}
.data-group {
  position: absolute;
  top: calc(64px + 20px);
  left: calc(100dvw - 340px);
}
.data-connections-group {
  overflow: auto;
  max-height: calc(100vh - 480px);
}
</style>
