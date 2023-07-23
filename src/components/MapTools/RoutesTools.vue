<template>
  <div>
    <tools-component :title="props.title">
      <template #actions>
        <search-bar v-model="searchGroupsString"></search-bar>
      </template>

      <template #tools>
        <v-select
          v-model="mapStore.routesSelectMode"
          clearable
          hide-details
          variant="outlined"
          density="compact"
          :label="$t('tools.routesSelectMode')"
          class="mb-4"
          :no-data-text="$t('general.noData')"
          :items="selectModes"
          @update:model-value="changeSelectMode"
        ></v-select>
        <v-row justify="center" class="my-3">
          <v-btn
            prepend-icon="mdi-table-merge-cells"
            size="small"
            variant="outlined"
            color="grey-darken-3"
            class="mr-3"
            @click="openDistributionDialog"
            >{{ $t("general.distribution") }}</v-btn
          >
          <v-btn
            prepend-icon="mdi-magnify"
            size="small"
            variant="outlined"
            color="grey-darken-3"
            class="ml-3"
            @click="showSearch = true"
            >{{ $t("general.search") }}</v-btn
          >
        </v-row>

        <v-label
          class="mt-2 text-subtitle-2"
          :text="$t('tools.socialLayers')"
        ></v-label>
        <v-row
          dense
          no-gutters
          :key="mode.mode"
          v-for="(mode, i) in mapStore.modesDisplay"
        >
          <v-col cols="10">
            <v-checkbox
              :disabled="mapStore.useCurrentRoutesGroup"
              hide-details
              density="compact"
              :label="modesName[i].name"
              v-model="mode.shown"
              @update:model-value="processModeSelect"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-btn
              density="comfortable"
              size="small"
              flat
              icon="mdi-checkbox-blank"
              class="ml-4 mt-2"
            >
              <v-icon :color="mode.color"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="mode.color"
                  show-swatches
                  @update:model-value="updateModeColor(mode)"
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>

        <v-row dense class="mt-2" no-gutters>
          <v-col cols="9" class="mb-1">
            {{ $t("tools.routesLadsSelected") }}:
            <span class="ml-3 font-weight-bold">{{
              mapStore.routesSelectedIds.size
            }}</span>
          </v-col>
          <v-col cols="3">
            <span v-show="mapStore.routesSelectedIds.size > 0">
              <v-btn
                v-if="!mapStore.useCurrentRoutesGroup"
                flat
                density="compact"
                icon
                @click="addSelectedRoutes"
              >
                <v-icon color="green-darken-2"> mdi-plus </v-icon>
                <v-tooltip activator="parent" location="bottom">{{
                  $t("tools.routesAddTooltip")
                }}</v-tooltip>
              </v-btn>
              <v-btn
                v-else
                flat
                density="compact"
                icon
                @click="replaceWithSelectedRoutes"
              >
                <v-icon color="red-darken-2"> mdi-refresh </v-icon>
                <v-tooltip activator="parent" location="bottom">{{
                  $t("tools.routesReplaceTooltip")
                }}</v-tooltip>
              </v-btn>
              <v-btn
                flat
                density="compact"
                icon
                @click="clearSelectedRoutes"
                class="ml-2"
              >
                <v-icon color="red-lighten-2"> mdi-cancel </v-icon>
                <v-tooltip activator="parent" location="bottom">{{
                  $t("general.clear")
                }}</v-tooltip>
              </v-btn>
            </span>
          </v-col>
        </v-row>
        <v-row dense v-if="mapStore.currentRoutesGroup != null">
          <v-col>
            <v-switch
              v-model="mapStore.useCurrentRoutesGroup"
              :label="$t('tools.routesUseCurrent')"
              hide-details
              density="compact"
            ></v-switch>
          </v-col>
        </v-row>
      </template>
      <v-container class="data-block">
        <v-label class="mb-0 text-subtitle-2"
          >{{ $t("tools.routesSaved") }}:</v-label
        >
        <v-tabs v-model="tabSelected" grow>
          <v-tab
            v-for="item in groupTabs"
            :key="item"
            :value="item"
            density="compact"
          >
            {{ getSavedName(item) }} ({{ getSavedNumber(item) }})
          </v-tab>
        </v-tabs>
        <v-window v-model="tabSelected">
          <v-window-item value="routes">
            <v-list density="compact">
              <v-list-item
                v-for="(group, idx) in routesGroupsFiltered"
                :key="group.name"
                @click="selectRoutesGroup(group)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ group.name }} ({{ group.ids.size }})
                </v-list-item-title>
                <template #append>
                  <v-btn
                    density="comfortable"
                    size="small"
                    flat
                    icon="mdi-trash-can-outline"
                    @click.stop="deleteRoutesGroup(group)"
                  >
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item value="sites">
            <v-list density="compact">
              <v-list-item
                v-for="(sitesGroup, idx) in siteGroupsFiltered"
                :key="sitesGroup.name"
                @click="selectSitesGroup(sitesGroup)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ sitesGroup.name }} ({{
                    sitesGroup.ids.size
                  }})
                </v-list-item-title>
                <template #append>
                  <v-btn
                    density="comfortable"
                    size="small"
                    flat
                    icon="mdi-trash-can-outline"
                    @click.stop="deleteSitesGroup(sitesGroup)"
                  >
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-window-item>
        </v-window>
      </v-container>
    </tools-component>

    <tools-component
      v-if="mapStore.currentRoutesGroup"
      :title="`${t('tools.routesLadGroup')} (${
        mapStore.currentRoutesGroup.ids.size
      })`"
      class="lad-group"
    >
      <template #actions>
        <search-bar v-model="searchRoute"></search-bar>
        <close-button @close="processCloseGroup"></close-button>
      </template>
      <template #tools>
        <div class="mt-0">
          <v-text-field
            v-model="routesGroupName"
            clearable
            :label="$t('tools.routesGroupName')"
            variant="outlined"
            density="compact"
            hide-details
          >
            <template v-slot:append-inner>
              <v-icon v-if="readyToSave" @click="saveRoutesGroup"
                >mdi-content-save</v-icon
              >
            </template>
          </v-text-field>
          <v-row class="mt-2">
            <v-col>
              <v-label class="mb-1 text-subtitle-2">
                {{ $t("general.displayOptions") }}:
              </v-label>
              <apply-button></apply-button>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.routesLadColor')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="ladDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <config-button></config-button>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.routesLadWidth')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="ladDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <v-text-field
                density="compact"
                hide-details
                variant="underlined"
                :label="$t('general.max')"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </template>
      <v-container class="data-lad-group">
        <v-label class="mb-0 text-subtitle-2">
          {{ $t("tools.routesLads") }}:
        </v-label>

        <v-list density="compact">
          <v-list-item
            v-for="route in routesFiltered"
            :key="route.id"
            @click="selectSavedRoute(route)"
          >
            <v-list-item-title
              class="text-body-2"
              :class="isRouteSelected(route.id) ? 'font-weight-bold' : ''"
            >
              (<span :style="{ color: mapStore.getModeColor(route.id) }">{{
                route.id
              }}</span
              >) {{ route.name }}
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                :icon="route.shown ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click.stop="toggleRouteShown(route.id)"
              >
              </v-btn>
              <!-- <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-checkbox-blank"
              >
                <v-icon :color="route.color"></v-icon>
                <v-menu activator="parent" :close-on-content-click="false">
                  <v-color-picker
                    v-model="route.color"
                    show-swatches
                    @update:model-value="ladColorUpdate"
                  ></v-color-picker>
                </v-menu>
              </v-btn> -->
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteRoute(route)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-container>
    </tools-component>
    <distribution-dialog
      v-model="showDistribution"
      :title="$t('tools.routesDistributionTitle')"
      :categories="routesCategories"
      :field-length="fieldLength"
      :items="routesDataForDistribution"
      :field-items="distributedItems"
      :selected="categoriesSelected"
      :any-selected="isAnyFieldSelected"
      @select-field-group="processFieldSelect"
      @select-item="processItemSelect"
      @distributed="processDistributedItems"
      @done="processDistributionSelected"
    ></distribution-dialog>
    <search-dialog
      v-model="showSearch"
      :title="$t('tools.routesSearchTitle')"
      :search-label="$t('tools.routesLads')"
      :search-items="searchData"
      @select="processSearchResults"
    ></search-dialog>
  </div>
</template>

<script setup>
import _ from "lodash";
import axios from "axios";

import ToolsComponent from "../ToolsComponent.vue";

import ApplyButton from "../elements/ApplyButton.vue";
import ConfigButton from "../elements/ConfigButton.vue";
import SearchBar from "../elements/SearchBar.vue";
import DistributionDialog from "../DistributionDialog.vue";
import SearchDialog from "../SearchDialog.vue";

import { ref, computed, onMounted, watch } from "vue";

import { useI18n } from "vue-i18n";
import CloseButton from "../elements/CloseButton.vue";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

let routesStats = null;
let routesCategories = null;

onMounted(async () => {
  await mapStore.loadRoutesData();
  await mapStore.loadSitesData();

  // FIXME: Data loading with backend
  if (routesStats == null) {
    console.log("Load Routes Stats");
    await axios
      .get("Almaty_lads_stats.json")
      .then((result) => (routesStats = result.data))
      .catch((err) => console.warn("Error loading Routes stats", err));
  }
  if (routesCategories == null) {
    console.log("Load Routes Categories");
    await axios
      .get("Almaty_lads_categories.json")
      .then((result) => (routesCategories = result.data))
      .catch((err) => console.warn("Error loading Routes categories", err));
  }
});

const selectModes = [
  {
    title: t("tools.routesSelect"),
    value: "routes",
  },
  {
    title: t("tools.demandAdminAreas"),
    value: "district",
  },
  mapStore.savedAreas.length > 0 && {
    title: t("tools.socialSavedDisplay"),
    value: "area",
  },
].filter(Boolean);
const changeSelectMode = () => {
  console.log("Select Mode:", mapStore.routesSelectMode);
  switch (mapStore.routesSelectMode) {
    case "routes":
      mapStore.turnOnLayer(mapStore.layersIdxs.ladsTraces);
      mapStore.turnOffLayer(mapStore.layersIdxs.adminAreaSelect);
      mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);
      break;

    case "district":
      mapStore.turnOnLayer(mapStore.layersIdxs.adminAreaSelect);
      mapStore.turnOnLayer(mapStore.layersIdxs.adminBorder);
      mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);
      break;

    case "area":
      mapStore.turnOnLayer(mapStore.layersIdxs.cellsSaved);
      mapStore.turnOffLayer(mapStore.layersIdxs.adminAreaSelect);
      break;

    default:
      mapStore.turnOffLayer(mapStore.layersIdxs.adminAreaSelect);
      mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);
      break;
  }
};

const modesName = [
  {
    name: t("tools.routesModeBus"),
    mode: "Bus",
  },
  {
    name: t("tools.routesModeTrolley"),
    mode: "Trolley",
  },
  {
    name: t("tools.routesModeSubway"),
    mode: "Subway",
  },
  {
    name: t("tools.routesModeOther"),
    mode: "Unknown",
  },
];
const processModeSelect = () => {
  const filterData = {
    layerIdx: mapStore.layersIdxs.ladsTraces,
    filterProps: [
      "any",
      [
        "all",
        ["boolean", mapStore.modesDisplay[0].shown],
        ["==", ["get", "mode"], mapStore.modesDisplay[0].mode],
      ],
      [
        "all",
        ["boolean", mapStore.modesDisplay[1].shown],
        ["==", ["get", "mode"], mapStore.modesDisplay[1].mode],
      ],
      [
        "all",
        ["boolean", mapStore.modesDisplay[2].shown],
        ["==", ["get", "mode"], mapStore.modesDisplay[2].mode],
      ],
      [
        "all",
        ["boolean", mapStore.modesDisplay[3].shown],
        ["==", ["get", "mode"], mapStore.modesDisplay[3].mode],
      ],
    ],
  };
  mapStore.newLayerFilter = filterData;
};
const updateModeColor = (mode) => {
  switch (mode.mode) {
    case "Bus":
      mapStore.busColor = mode.color;
      break;

    case "Trolley":
      mapStore.trolleyColor = mode.color;
      break;

    case "Subway":
      mapStore.subwayColor = mode.color;
      break;

    case "Unknown":
      mapStore.skeletonColor = mode.color;
      break;

    default:
      break;
  }
};

//
// Search Logic
//
const showSearch = ref(false);

const searchData = computed(() => {
  // return mapStore.currentRoutesGroup == null ||
  //   mapStore.useCurrentRoutesGroup == false
  //   ? mapStore.ladsData.map((lad) => ({
  //       id: lad.ladId,
  //       name: `(${lad.ladId}) ${lad.line} -> ${lad.dir}`,
  //     }))
  //   : mapStore.currentRoutesGroup.routes.map((lad) => ({
  //       id: lad.id,
  //       name: `(${lad.id}) ${lad.name}`,
  //     }));
  const ids =
    mapStore.currentRoutesGroup == null ||
    mapStore.useCurrentRoutesGroup == false
      ? mapStore.ladsData.map((lad) => lad.ladId)
      : mapStore.currentRoutesGroup.routes.map((lad) => lad.id);
  const result = ids.map((id) => {
    const lad = mapStore.ladsData.find((lad) => lad.ladId == id);
    if (lad) {
      const startSite = mapStore.sitesData.find(
        (site) => site.id == lad?.startId
      );
      const endSite = mapStore.sitesData.find((site) => site.id == lad?.endId);
      return {
        id,
        name: `(${id}) ${lad?.line} -> ${lad?.dir} "${startSite?.name} - ${endSite?.name}"`,
      };
    } else {
      return `(${id}) Not found`;
    }
  });
  return result;
});

const processSearchResults = (ids) => {
  ids.forEach((id) => mapStore.routesSelectedIds.add(id));
};

//
// DISTRIBUTION LOGIC
//
const showDistribution = ref(false);
const fieldLength = 6; // FIXME: Should be calculated from Categories data

let routesDataForDistribution = [];
let categoriesSelected = ref({});
let distributedItems = ref({});

const isAnyFieldSelected = ref(false);

const openDistributionDialog = () => {
  routesDataForDistribution =
    mapStore.currentRoutesGroup == null ||
    mapStore.useCurrentRoutesGroup == false
      ? mapStore.ladsData.map((rt, i) => ({
          ...rt,
          name: `${mapStore.ladsData[i].line}->${mapStore.ladsData[i].dir}`,
          ...routesStats[i],
        }))
      : mapStore.currentRoutesGroup.routes.map((rt) => ({
          ...rt,
          name: getLadName(rt.id),
          ...routesStats.find((item) => item.id == rt.id),
        }));
  routesCategories.forEach((item) => {
    categoriesSelected.value[item.fieldGroup] = new Array(fieldLength).fill(
      false
    );
    distributedItems.value[item.fieldGroup] = new Array(fieldLength).fill(null);
  });
  Object.keys(distributedItems.value).forEach((fieldGroup) => {
    for (let i = 0; i < fieldLength; i++) {
      distributedItems.value[fieldGroup][i] = new Array();
    }
  });

  console.log("Routes Data For Distr:", routesDataForDistribution);

  showDistribution.value = true;
};

watch(
  () => categoriesSelected,
  () => {
    isAnyFieldSelected.value = false;
    Object.keys(categoriesSelected.value).forEach((fieldGroup) => {
      // console.log(
      //   "Watch field",
      //   fieldGroup,
      //   categoriesSelected.value[fieldGroup]
      // );
      const fieldSelected = categoriesSelected.value[fieldGroup].reduce(
        (result, current) => result || current,
        false
      );
      // console.log("Field result", fieldGroup, fieldSelected);
      isAnyFieldSelected.value = isAnyFieldSelected.value || fieldSelected;
    });
    // console.log("Any Selected Watched", isAnyFieldSelected.value);
  },
  { deep: true }
);

const processFieldSelect = (data) => {
  console.log("ROUTES: Field selected", data);
  categoriesSelected.value[data.fieldGroup][data.idx] =
    !categoriesSelected.value[data.fieldGroup][data.idx];
};

const processItemSelect = (data) => {
  console.log("ROUTES: Item selected", data);
  distributedItems.value[data.fieldGroup][data.position][data.idx].selected =
    !distributedItems.value[data.fieldGroup][data.position][data.idx].selected;
  console.log("Items processed", distributedItems.value);
};

const processDistributedItems = (data) => {
  distributedItems.value = _.cloneDeep(data);
  console.log("ROUTES Distributed Data", distributedItems.value);
};

const processDistributionSelected = (selectedIds) => {
  console.log("🤖 Distribution Done", ...selectedIds);

  selectedIds.forEach((id) => mapStore.routesSelectedIds.add(id));
  // console.log("Categories", categoriesSelected.value);
  // console.log("Items", distributedItems.value);
};

//
// Selected processing
//

const addSelectedRoutes = () => {
  if (mapStore.currentRoutesGroup) {
    // Exist - add items to if new selected
    mapStore.routesSelectedIds.forEach((id) => {
      if (!mapStore.currentRoutesGroup.ids.has(id)) {
        mapStore.currentRoutesGroup.ids.add(id);
        mapStore.currentRoutesGroup.routes.push({
          id: id,
          name: mapStore.getRouteName(id),
          shown: true,
        });
      }
    });
  } else {
    // Not Exist - create new group
    mapStore.currentRoutesGroup = {
      name: null,
      ids: new Set(mapStore.routesSelectedIds),
      routes: [...mapStore.routesSelectedIds].map((id) => ({
        id: id,
        name: mapStore.getRouteName(id),
        shown: true,
      })),
    };
  }
  mapStore.useCurrentRoutesGroup = true;
  mapStore.routesSelectedIds.clear();
};

const replaceWithSelectedRoutes = () => {
  mapStore.currentRoutesGroup = {
    name: null,
    ids: new Set(mapStore.routesSelectedIds),
    routes: [...mapStore.routesSelectedIds].map((id) => ({
      id: id,
      name: mapStore.getRouteName(id),
      shown: true,
    })),
  };
  if (!mapStore.useCurrentRoutesGroup) {
    mapStore.useCurrentRoutesGroup = true;
  }
  mapStore.routesSelectedIds.clear();
};

const clearSelectedRoutes = () => {
  mapStore.routesSelectedIds.clear();
};

const groupTabs = ["routes", "sites"];
const tabSelected = ref("routes");
const getSavedNumber = (tab) => {
  return tab == "routes"
    ? mapStore.savedRoutesGroups.length
    : mapStore.savedSitesGroups.length;
};
const getSavedName = (tab) => {
  return tab == "routes" ? t("tools.routesLads") : t("tools.sitesSites");
};

const searchGroupsString = ref("");
const siteGroupsFiltered = computed(() => {
  return tabSelected.value == "sites"
    ? mapStore.savedSitesGroups.filter((group) =>
        group.name
          .toLowerCase()
          .includes(searchGroupsString.value.toLowerCase())
      )
    : mapStore.savedSitesGroups;
});
const routesGroupsFiltered = computed(() => {
  return tabSelected.value == "routes"
    ? mapStore.savedRoutesGroups.filter((group) =>
        group.name
          .toLowerCase()
          .includes(searchGroupsString.value.toLowerCase())
      )
    : mapStore.savedRoutesGroups;
});

const selectRoutesGroup = (group) => {
  routesGroupName.value = group.name;
  mapStore.currentRoutesGroup = _.cloneDeep(group);
  mapStore.useCurrentRoutesGroup = true;
};
const deleteRoutesGroup = (group) => {
  console.log("Delete", group);
  mapStore.savedRoutesGroups = mapStore.savedRoutesGroups.filter(
    (item) => item.name != group.name
  );
};
const selectSitesGroup = (group) => {
  console.log("Select stops group", group);
  mapStore.currentSitesGroup = _.cloneDeep(group);
  mapStore.useCurrentSiteGroup = true;

  const ladsIds = new Set();
  group.ids.forEach((id) => {
    const data = mapStore.getLadsBySite(id);
    data.forEach((ladId) => ladsIds.add(ladId));
  });
  console.log("LADs found", ladsIds);
  if (mapStore.useCurrentRoutesGroup) {
    ladsIds.forEach((id) => {
      if (!mapStore.currentRoutesGroup.ids.has(id)) {
        ladsIds.delete(id);
      }
    });
  }
  mapStore.routesSelectedIds = ladsIds;
};
const deleteSitesGroup = (group) => {
  console.log("Delete stops group", group);
  mapStore.savedSitesGroups = mapStore.savedSitesGroups.filter(
    (item) => item.name != group.name
  );
};

// LAD Group
const ladDisplayOptions = [
  {
    title: t("tools.routesFrequency"),
    value: "freq",
  },
  {
    title: t("tools.routesRidership"),
    value: "ride",
  },
  {
    title: t("tools.routesSpeed"),
    value: "speed",
  },
  {
    title: t("tools.routesMode"),
    value: "mode",
  },
];

// const ladsInGroupMock = ref([
//   {
//     id: 101,
//     name: "1-0-1",
//     color: "#DCE775",
//     shown: true,
//   },
//   {
//     id: 102,
//     name: "1-0-2",
//     color: "#C0CA33",
//     shown: true,
//   },
//   {
//     id: 201,
//     name: "M-0-1",
//     color: "#FF4081",
//     shown: false,
//   },
//   {
//     id: 202,
//     name: "M-0-2",
//     color: "#C51162",
//     shown: true,
//   },
// ]);

const processCloseGroup = () => {
  console.log("Close Group panel");
  mapStore.currentRoutesGroup = null;
  mapStore.useCurrentRoutesGroup = false;
  routesGroupName.value = null;
  // mapStore.siteSizeStep = defaultSizeStep;
  // mapStore.siteColorMode = null;
  // mapStore.siteSizeMode = null;
  // mapStore.turnOffLayer(mapStore.layersIdxs.sitesAnalytics);
  // mapStore.turnOnLayer(mapStore.layersIdxs.sitesCentroids);
};

const searchRoute = ref("");
const routesFiltered = computed(() => {
  return mapStore.currentRoutesGroup.routes.filter((route) =>
    (route.name.toLowerCase() + route.id.toString()).includes(
      searchRoute.value.toLowerCase()
    )
  );
});

const toggleRouteShown = (id) => {
  const route = mapStore.currentRoutesGroup.routes.find(
    (item) => item.id == id
  );
  route.shown = !route.shown;
};

const routesGroupName = ref(null);
const readyToSave = computed(() => {
  return routesGroupName.value?.length > 0;
});
const saveRoutesGroup = () => {
  console.log("Save Routes Group", routesGroupName.value);
  const savedGroupIdx = mapStore.savedRoutesGroups.findIndex(
    (group) => group.name == routesGroupName.value
  );
  // console.log("Found Index", savedGroupIdx);
  if (savedGroupIdx != -1) {
    console.log("Update Group");
    mapStore.updateSavedRoutesGroup(
      savedGroupIdx,
      _.cloneDeep({
        ...mapStore.currentRoutesGroup,
        name: routesGroupName.value,
      })
    );
  } else {
    console.log("Save New Group");
    mapStore.savedRoutesGroups.push(
      _.cloneDeep({
        ...mapStore.currentRoutesGroup,
        name: routesGroupName.value,
      })
    );
  }
};

const selectSavedRoute = (route) => {
  if (mapStore.routesSelectedIds.has(route.id)) {
    mapStore.routesSelectedIds.delete(route.id);
  } else {
    mapStore.routesSelectedIds.add(route.id);
  }
};
const isRouteSelected = (id) => {
  return mapStore.routesSelectedIds.has(id);
};

const deleteRoute = (route) => {
  console.log("Delete LAD", route);
  mapStore.currentRoutesGroup.ids.delete(route.id);
  mapStore.currentRoutesGroup.routes =
    mapStore.currentRoutesGroup.routes.filter((item) => item.id != route.id);
  if (mapStore.routesSelectedIds.has(route.id)) {
    mapStore.routesSelectedIds.delete(route.id);
  }
  if (mapStore.currentRoutesGroup.routes.length == 0) {
    processCloseGroup();
  }
};

const getLadName = (id) => {
  console.log("ID", id);
  const lad = mapStore.ladsData.find((lad) => lad.ladId == id);
  console.log("LAD found", lad);
  return `${lad.line}->${lad.dir}`;
};

// const ladColorSelect = (ladName) => {
//   console.log("Select Color for LAD:", ladName);
// };
// const ladColorUpdate = (color) => {
//   console.log("Set New color to:", color);
// };

//
//
</script>

<style scoped>
.data-block {
  overflow: auto;
  max-height: calc(100vh - 620px);
}
.data-lad-group {
  overflow: auto;
  max-height: calc(100vh - 510px);
}
.lad-group {
  position: absolute;
  top: calc(64px + 20px);
  left: calc(100dvw - 340px);
}
</style>
