<template>
  <div>
    <tools-component :title="props.title">
      <template #actions>
        <search-bar v-model="searchGroupsString"></search-bar>
      </template>

      <template #tools>
        <v-select
          v-model="mapStore.sitesSelectionMode"
          clearable
          hide-details
          variant="outlined"
          density="compact"
          :label="$t('tools.sitesSelectMode')"
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
        <v-row dense no-gutters>
          <v-col cols="10">
            <v-checkbox
              hide-details
              density="compact"
              :label="$t('tools.sitesSites')"
              v-model="mapStore.layers[mapStore.layersIdxs.sitesFill].shown"
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
              <v-icon :color="mapStore.sitesColor"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="mapStore.sitesColor"
                  show-swatches
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>
        <v-row dense no-gutters>
          <v-col cols="10">
            <v-checkbox
              hide-details
              density="compact"
              :label="$t('tools.sitesCentroids')"
              v-model="
                mapStore.layers[mapStore.layersIdxs.sitesCentroids].shown
              "
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
              <v-icon :color="mapStore.centroidsColor"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="mapStore.centroidsColor"
                  show-swatches
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>
        <v-row dense no-gutters>
          <v-col cols="10">
            <v-checkbox
              hide-details
              density="compact"
              :label="$t('tools.routesStops')"
              v-model="mapStore.layers[mapStore.layersIdxs.stopsPoints].shown"
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
              <v-icon :color="mapStore.stopsColor"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="mapStore.stopsColor"
                  show-swatches
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>

        <v-row dense class="mt-2" no-gutters>
          <v-col cols="9" class="mb-1">
            {{ $t("tools.sitesSelected") }}:
            <span class="ml-3 font-weight-bold">{{
              mapStore.selectedSiteIds.size
            }}</span>
          </v-col>
          <v-col cols="3">
            <span v-show="mapStore.selectedSiteIds.size > 0">
              <v-btn
                v-if="!mapStore.useCurrentSiteGroup"
                flat
                density="compact"
                icon
                @click="addSelectedSites"
              >
                <v-icon color="green-darken-2"> mdi-plus </v-icon>
                <v-tooltip activator="parent" location="bottom">{{
                  $t("tools.sitesAddTooltip")
                }}</v-tooltip>
              </v-btn>
              <v-btn
                v-else
                flat
                density="compact"
                icon
                @click="replaceWithSelectedSites"
              >
                <v-icon color="red-darken-2"> mdi-refresh </v-icon>
                <v-tooltip activator="parent" location="bottom">{{
                  $t("tools.sitesReplaceTooltip")
                }}</v-tooltip>
              </v-btn>
              <v-btn
                flat
                density="compact"
                icon
                @click="clearSelectedSites"
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
        <v-row
          dense
          justify="space-around"
          v-if="mapStore.currentSitesGroup != null"
        >
          <v-col>
            <v-switch
              v-model="mapStore.useCurrentSiteGroup"
              :label="$t('tools.sitesUseCurrent')"
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
                v-for="(ladGroup, idx) in ladGroupsFiltered"
                :key="ladGroup.name"
                @click="selectLadGroup(ladGroup)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ ladGroup.name }} ({{ ladGroup.ids.size }})
                </v-list-item-title>
                <template #append>
                  <v-btn
                    density="comfortable"
                    size="small"
                    flat
                    icon="mdi-trash-can-outline"
                    @click.stop="deleteRoutesGroup(ladGroup)"
                  >
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item value="sites">
            <v-list density="compact">
              <v-list-item
                v-for="(siteGroup, idx) in siteGroupsFiltered"
                :key="siteGroup.name"
                @click="selectSitesGroup(siteGroup)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ siteGroup.name }} ({{ siteGroup.ids.size }})
                </v-list-item-title>
                <template #append>
                  <v-btn
                    density="comfortable"
                    size="small"
                    flat
                    icon="mdi-trash-can-outline"
                    @click.stop="deleteSitesGroup(siteGroup)"
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
      v-if="mapStore.currentSitesGroup"
      :title="`${t('tools.sitesGroup')} (${
        mapStore.currentSitesGroup.ids.size
      })`"
      class="data-group"
    >
      <template #actions>
        <search-bar v-model="searchSitesGroupString"></search-bar>
        <close-button @close="processCloseGroup"></close-button>
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
          <!-- <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.sitesShape')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="siteDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <config-button></config-button>
            </v-col>
          </v-row> -->
        </div>
      </template>
      <v-container class="data-sites-group">
        <v-label class="mb-0 text-subtitle-2">
          {{ $t("tools.sitesSites") }}:
        </v-label>

        <v-list density="compact">
          <v-list-item
            v-for="site in sitesGroupFiltered"
            :key="site.id"
            @click="selectSiteInGroup(site)"
          >
            <v-list-item-title
              class="text-body-2"
              :class="
                mapStore.selectedSiteIds.has(site.id) ? 'font-weight-bold' : ''
              "
            >
              ({{ site.id }}) {{ site.name }}
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                :icon="site.shown ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click.stop="site.shown = !site.shown"
              >
              </v-btn>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteSiteFromGroup(site.id)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-container>
    </tools-component>
    <distribution-dialog
      v-model="showDistribution"
      :title="$t('tools.sitesDistributionTitle')"
      :categories="sitesCategories"
      :field-length="fieldLength"
      :items="sitesDataForDistribution"
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
      :title="$t('tools.sitesSearchTitle')"
      :search-label="$t('tools.sitesSites')"
      :search-items="searchData"
      @select="processSearchResults"
    ></search-dialog>
  </div>
</template>

<script setup>
import _ from "lodash";
import axios from "axios";

import ToolsComponent from "../ToolsComponent.vue";
// import CancelButton from "../elements/CancelButton.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import ConfigButton from "../elements/ConfigButton.vue";
import CloseButton from "../elements/CloseButton.vue";
import SearchBar from "../elements/SearchBar.vue";
import DistributionDialog from "../DistributionDialog.vue";
import SearchDialog from "../SearchDialog.vue";

import { ref, computed, onMounted, watch } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

let sitesStats = null;
let sitesCategories = null;
console.log("🟢🟢 Re-executes Site Tools");

onMounted(async () => {
  await mapStore.loadSitesData();
  await mapStore.loadRoutesData();

  // FIXME: Data loading with backend
  if (sitesStats == null) {
    console.log("Load Sites Stats");
    await axios
      .get("Almaty_sites_stats.json")
      .then((result) => (sitesStats = result.data))
      .catch((err) => console.warn("Error loading Sites stats", err));
  }
  if (sitesCategories == null) {
    console.log("Load Sites Categories");
    await axios
      .get("Almaty_sites_categories.json")
      .then((result) => (sitesCategories = result.data))
      .catch((err) => console.warn("Error loading Sites categories", err));
  }
});

const fieldLength = 6; // FIXME: Should be calculated from Categories data

// const sitesDataDistribution = computed(() => {
//   return mapStore.sitesData.map((site) => ({
//     ...site,
//     // ...sitesStats[i],
//   }));
// });

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
const ladGroupsFiltered = computed(() => {
  return tabSelected.value == "routes"
    ? mapStore.savedRoutesGroups.filter((group) =>
        group.name
          .toLowerCase()
          .includes(searchGroupsString.value.toLowerCase())
      )
    : mapStore.savedRoutesGroups;
});

const selectModes = [
  {
    title: t("tools.sitesSelect"),
    value: "sites",
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
  switch (mapStore.sitesSelectionMode) {
    case "sites":
      mapStore.turnOnLayer(mapStore.layersIdxs.sitesFill);
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

const showDistribution = ref(false);
const showSearch = ref(false);

const searchData = computed(() => {
  return mapStore.currentSitesGroup == null ||
    mapStore.useCurrentSiteGroup == false
    ? mapStore.sitesData.map((site) => ({
        id: site.id,
        name: `(${site.id}) ${site.name}`,
      }))
    : mapStore.currentSitesGroup.sites.map((site) => ({
        id: site.id,
        name: `(${site.id}) ${site.name}`,
      }));
});

const processSearchResults = (ids) => {
  ids.forEach((id) => mapStore.selectedSiteIds.add(id));
};

//
// Distribution logic
//
let sitesDataForDistribution = [];
let categoriesSelected = ref({});
let distributedItems = ref({});
const openDistributionDialog = () => {
  sitesDataForDistribution =
    mapStore.currentSitesGroup == null || mapStore.useCurrentSiteGroup == false
      ? mapStore.sitesData.map((site, i) => ({
          ...site,
          ...sitesStats[i],
        }))
      : mapStore.currentSitesGroup.sites.map((site) => ({
          ...site,
          ...sitesStats.find((item) => item.id == site.id),
        }));
  sitesCategories.forEach((item) => {
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
  // console.log("Selected Array", categoriesSelected);
  // console.log("Distributed Items", distributedItems.value);

  // console.log("Items", sitesDataForDistribution);

  showDistribution.value = true;
};
const isAnyFieldSelected = ref(false);
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
  console.log("SITES: Field selected", data);
  categoriesSelected.value[data.fieldGroup][data.idx] =
    !categoriesSelected.value[data.fieldGroup][data.idx];
};

const processItemSelect = (data) => {
  console.log("SITES: Item selected", data);
  distributedItems.value[data.fieldGroup][data.position][data.idx].selected =
    !distributedItems.value[data.fieldGroup][data.position][data.idx].selected;
  console.log("Items processed", distributedItems.value);
};

const processDistributedItems = (data) => {
  distributedItems.value = _.cloneDeep(data);
  console.log("SITES Distributed Data", distributedItems.value);
};

const processDistributionSelected = (selectedIds) => {
  console.log("🤖 Distribution Done", ...selectedIds);

  selectedIds.forEach((id) => mapStore.selectedSiteIds.add(id));
  // console.log("Categories", categoriesSelected.value);
  // console.log("Items", distributedItems.value);
};

//
// Sites select logic
const clearSelectedSites = () => {
  console.log("Clear selected");
  mapStore.selectedSiteIds.clear();
};

const addSelectedSites = () => {
  console.log("Current sites group:", mapStore.currentSitesGroup);
  if (mapStore.currentSitesGroup) {
    // Exist - add items to if new selected
    console.log("Add to current");
    mapStore.selectedSiteIds.forEach((id) => {
      if (!mapStore.currentSitesGroup.ids.has(id)) {
        mapStore.currentSitesGroup.ids.add(id);
        mapStore.currentSitesGroup.sites.push({
          id: id,
          name: mapStore.getSiteName(id),
          shown: true,
        });
      }
    });
  } else {
    // Not Exist - create new group
    mapStore.currentSitesGroup = {
      name: null,
      ids: new Set(mapStore.selectedSiteIds),
      sites: [...mapStore.selectedSiteIds].map((id) => ({
        id: id,
        name: mapStore.getSiteName(id),
        shown: true,
      })),
    };
  }
  mapStore.useCurrentSiteGroup = true;
  mapStore.selectedSiteIds.clear();
};
const replaceWithSelectedSites = () => {
  mapStore.currentSitesGroup = {
    name: null,
    ids: new Set(mapStore.selectedSiteIds),
    sites: [...mapStore.selectedSiteIds].map((id) => ({
      id: id,
      name: mapStore.getSiteName(id),
      shown: true,
    })),
  };
  if (!mapStore.useCurrentSiteGroup) {
    mapStore.useCurrentSiteGroup = true;
  }
  mapStore.selectedSiteIds.clear();
};

const groupTabs = ["routes", "sites"];
const tabSelected = ref("sites");
const getSavedName = (tab) => {
  return tab == "routes" ? t("tools.routesLads") : t("tools.sitesSites");
};
const getSavedNumber = (tab) => {
  return tab == "routes"
    ? mapStore.savedRoutesGroups.length
    : mapStore.savedSitesGroups.length;
};

const selectLadGroup = (group) => {
  console.log("Select", group);
  mapStore.currentRoutesGroup = _.cloneDeep(group);
  mapStore.useCurrentRoutesGroup = true;

  const sitesIds = new Set();
  group.ids.forEach((id) => {
    const data = mapStore.getSitesByLad(id);
    data.forEach((siteId) => sitesIds.add(siteId));
  });
  console.log("Sites found", sitesIds);
  if (mapStore.useCurrentSiteGroup) {
    console.log("Current Group", mapStore.currentSitesGroup);
    sitesIds.forEach((id) => {
      if (!mapStore.currentSitesGroup.ids.has(id)) {
        sitesIds.delete(id);
      }
    });
  }
  mapStore.selectedSiteIds = sitesIds;
};
const deleteRoutesGroup = (group) => {
  console.log("Delete", group);
  mapStore.savedRoutesGroups = mapStore.savedRoutesGroups.filter(
    (item) => item.name != group.name
  );
};
const selectSitesGroup = (item) => {
  console.log("Select sites group", item);
  sitesGroupName.value = item.name;
  mapStore.currentSitesGroup = _.cloneDeep(item);
  mapStore.useCurrentSiteGroup = true;
};
const deleteSitesGroup = (group) => {
  console.log("Delete sites group", group);
  mapStore.savedSitesGroups = mapStore.savedSitesGroups.filter(
    (item) => item.name != group.name
  );
};

// Sites Group
const siteDisplayOptions = [
  {
    title: t("tools.sitesLadsNumber"),
    value: "lads_group",
  },
  {
    title: t("tools.sitesTripsNumber"),
    value: "trips_group",
  },
  {
    title: t("tools.sitesCapacity"),
    value: "cap_group",
  },
  {
    title: t("tools.sitesBoarding"),
    value: "board_group",
  },
  {
    title: t("tools.sitesAlighting"),
    value: "alight_group",
  },
];

const processCloseGroup = () => {
  console.log("Close Group panel");
  mapStore.currentSitesGroup = null;
  mapStore.useCurrentSiteGroup = false;
  sitesGroupName.value = null;
  mapStore.siteSizeStep = defaultSizeStep;
  mapStore.siteColorMode = null;
  mapStore.siteSizeMode = null;
  mapStore.turnOffLayer(mapStore.layersIdxs.sitesAnalytics);
  mapStore.turnOnLayer(mapStore.layersIdxs.sitesCentroids);
};

const searchSitesGroupString = ref("");

const sitesGroupFiltered = computed(() => {
  return mapStore.currentSitesGroup.sites.filter((site) =>
    (site.name.toLowerCase() + site.id.toString()).includes(
      searchSitesGroupString.value.toLowerCase()
    )
  );
});

const sitesGroupName = ref(null);
const readyToSave = computed(() => {
  return sitesGroupName.value?.length > 0;
});
const saveSitesGroup = () => {
  // console.log("Save Sites Group", sitesGroupName.value);
  // console.log("Current:", mapStore.currentSitesGroup);
  // console.log("Saved Groups:", mapStore.savedSitesGroups);
  // Check exist - yes update | no add
  const savedGroupIdx = mapStore.savedSitesGroups.findIndex(
    (group) => group.name == sitesGroupName.value
  );
  // console.log("Found Index", savedGroupIdx);
  if (savedGroupIdx != -1) {
    console.log("Update");
    mapStore.updateSavedSitesGroup(
      savedGroupIdx,
      _.cloneDeep({
        ...mapStore.currentSitesGroup,
        name: sitesGroupName.value,
      })
    );
  } else {
    console.log("Save new");
    mapStore.savedSitesGroups.push(
      _.cloneDeep({
        ...mapStore.currentSitesGroup,
        name: sitesGroupName.value,
      })
    );
  }
};

const selectSiteInGroup = (site) => {
  console.log("Site selected", site);
  if (mapStore.selectedSiteIds.has(site.id)) {
    mapStore.selectedSiteIds.delete(site.id);
  } else {
    mapStore.selectedSiteIds.add(site.id);
  }
  mapStore.centerItem = {
    type: "site",
    id: site.id,
  };
  // console.log("Stops:", mapStore.getSiteStopIds(site.id));
};
// const toggleSiteShown = (siteIdx) => {
//   mapStore.currentSitesGroup.sites[siteIdx].shown =
//     !mapStore.currentSitesGroup.sites[siteIdx].shown;
//   if (mapStore.useCurrentSiteGroup == false) {
//     mapStore.useCurrentSiteGroup = true;
//   }
// };
const deleteSiteFromGroup = (id) => {
  console.log("Delete Site", id);
  if (mapStore.selectedSiteIds.has(id)) {
    mapStore.selectedSiteIds.delete(id);
  }
  if (mapStore.currentSitesGroup.ids.size == 1) {
    mapStore.currentSitesGroup = null;
    mapStore.useCurrentSiteGroup = false;
  } else {
    if (mapStore.useCurrentSiteGroup == false) {
      mapStore.useCurrentSiteGroup = true;
    }
    mapStore.currentSitesGroup.ids.delete(id);
    const idx = mapStore.currentSitesGroup.sites.findIndex(
      (item) => item.id == id
    );
    mapStore.currentSitesGroup.sites.splice(idx, 1);
  }
};

//
// Analytics Logic
//
const defaultSizeStep = 2;
const defaultSiteColor = mapStore.centroidsColor;

// const siteSizeStep = ref(defaultSizeStep);
// const siteColorMode = ref(null);
// const siteSizeMode = ref(null);

const applyAnalyticsDisplay = () => {
  // console.log(
  //   "Analytics params",
  //   siteColorMode.value,
  //   siteSizeMode.value,
  //   siteSizeStep.value
  // );
  // if (mapStore.siteColorMode == null && mapStore.siteSizeMode == null) {
  //   return;
  // }
  const paintProps = {};
  if (mapStore.siteSizeMode != null) {
    const sizeStep = mapStore.siteSizeStep
      ? Math.abs(mapStore.siteSizeStep)
      : defaultSizeStep;
    paintProps["circle-radius"] = [
      "*",
      ["+", ["get", mapStore.siteSizeMode], 1],
      sizeStep,
    ];
    // if (mapStore.siteColorMode == null) {
    //   paintProps["circle-color"] = defaultSiteColor;
    // }
  } else {
    paintProps["circle-radius"] = defaultSizeStep * 3;
  }
  if (mapStore.siteColorMode != null) {
    paintProps["circle-color"] = {
      property: mapStore.siteColorMode,
      stops: [
        [0, "#ffff00"],
        [1, "#ffcc00"],
        [2, "#ff9900"],
        [3, "#ff6600"],
        [4, "#ff3300"],
        [5, "#ff0000"],
      ],
    };
    // if (mapStore.siteSizeMode == null) {
    //   paintProps["circle-radius"] = defaultSizeStep * 3;
    // }
  } else {
    paintProps["circle-color"] = defaultSiteColor;
  }

  console.log("Props to apply", paintProps);
  mapStore.newLayerPaint = {
    layerIdx: mapStore.layersIdxs.sitesAnalytics,
    paintProps: paintProps,
  };

  mapStore.turnOnLayer(mapStore.layersIdxs.sitesAnalytics);
  mapStore.turnOffLayer(mapStore.layersIdxs.sitesCentroids);
};
</script>

<style scoped>
.data-block {
  overflow: auto;
  max-height: calc(100vh - 582px);
}
.data-sites-group {
  overflow: auto;
  max-height: calc(100vh - 540px);
}
.data-group {
  position: absolute;
  top: calc(64px + 20px);
  left: calc(100dvw - 340px);
}
</style>
