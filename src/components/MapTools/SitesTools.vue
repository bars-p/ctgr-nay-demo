<template>
  <div>
    <tools-component :title="props.title">
      <template #actions>
        <search-bar v-model="searchString"></search-bar>
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
            @click="showDistribution = true"
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
              class="ml-4"
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
              class="ml-4"
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
              class="ml-4"
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
            <strong class="ml-2">{{
              mapStore.selectedSiteIds.size
            }}</strong> </v-col
          ><v-col cols="3">
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
            {{ item }} ({{ getSavedNumber(item) }})
          </v-tab>
        </v-tabs>
        <v-window v-model="tabSelected">
          <v-window-item value="LADs">
            <v-list density="compact">
              <v-list-item
                v-for="(ladGroup, idx) in savedLadsMock"
                :key="ladGroup.name"
                @click="selectLadGroup(ladGroup)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ ladGroup.name }} ({{ ladGroup.count }})
                </v-list-item-title>
                <template #append>
                  <v-btn
                    density="comfortable"
                    size="small"
                    flat
                    icon="mdi-trash-can-outline"
                    @click.stop="deleteLadGroup(idx)"
                  >
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item value="Sites">
            <v-list density="compact">
              <v-list-item
                v-for="(siteGroup, idx) in mapStore.savedSitesGroups"
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
                    @click.stop="deleteSitesGroup(idx)"
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
              <apply-button></apply-button>
            </v-col>
          </v-row>

          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
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
                density="compact"
                hide-details
                variant="underlined"
                :label="$t('general.max')"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
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
          </v-row>
        </div>
      </template>
      <v-container class="data-sites-group">
        <v-label class="mb-0 text-subtitle-2">
          {{ $t("tools.sitesSites") }}:
        </v-label>

        <v-list density="compact">
          <v-list-item
            v-for="(site, idx) in sitesGroupFiltered"
            :key="site.id"
            @click="selectSiteInGroup(site)"
          >
            <v-list-item-title class="text-body-2">
              ({{ site.id }}) {{ site.name }}
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                :icon="site.shown ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click.stop="toggleSiteShown(idx)"
              >
              </v-btn>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteSiteFromGroup(idx)"
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
import ToolsComponent from "../ToolsComponent.vue";
// import CancelButton from "../elements/CancelButton.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import ConfigButton from "../elements/ConfigButton.vue";
import CloseButton from "../elements/CloseButton.vue";
import SearchBar from "../elements/SearchBar.vue";
import DistributionDialog from "../DistributionDialog.vue";
import SearchDialog from "../SearchDialog.vue";

import { ref, computed, onMounted } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

onMounted(async () => {
  await mapStore.loadSitesData();
});

const searchString = ref("");

const selectModes = [
  {
    title: t("tools.stopsSitesSelect"),
    value: "sites",
  },
  {
    title: t("tools.demandAdminAreas"),
    value: "zones",
  },
  mapStore.savedAreas.length > 0 && {
    title: t("tools.socialSavedDisplay"),
    value: "area",
  },
].filter(Boolean);

const changeSelectMode = () => {
  if (mapStore.sitesSelectionMode == "areas") {
    mapStore.turnOnLayer(mapStore.layersIdxs.cellsSaved);
  } else {
    mapStore.turnOffLayer(mapStore.layersIdxs.cellsSaved);
  }
  if (mapStore.sitesSelectionMode == "sites") {
    mapStore.turnOnLayer(mapStore.layersIdxs.sitesFill);
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

const savedLadsMock = ref([
  {
    name: "Central routes",
    count: 8,
  },
  {
    name: "Routes from area 1",
    count: 15,
  },
  {
    name: "Routes with very long name and description",
    count: 15,
  },
]);
const savedSitesMock = [
  {
    name: "Stops around Hospital",
    count: 9,
  },
  {
    name: "Central stops",
    count: 57,
  },
];

const groupTabs = ["LADs", "Sites"];
const tabSelected = ref("Sites");
const getSavedNumber = (name) => {
  return name == "LADs" ? savedLadsMock.value.length : savedSitesMock.length;
};

const selectLadGroup = (ladGroup) => {
  console.log("Select", ladGroup);
};
const deleteLadGroup = (ladGroup) => {
  console.log("Delete", ladGroup);
  savedLadsMock.value.splice(ladGroup, 1);
  console.log("LADs:", savedLadsMock.value);
};
const selectSitesGroup = (item) => {
  console.log("Select sites group", item);
};
const deleteSitesGroup = (item) => {
  console.log("Delete sites group", item);
  // TODO: if deleted group open as current - set current to null
};

// Sites Group
const siteDisplayOptions = [
  {
    title: t("tools.sitesTripsNumber"),
    value: "trips",
  },
  {
    title: t("tools.sitesLadsNumber"),
    value: "lads",
  },
  {
    title: t("tools.sitesBoarding"),
    value: "in",
  },
  {
    title: t("tools.sitesAlighting"),
    value: "out",
  },
];

const processCloseGroup = () => {
  console.log("Close Group panel");
  mapStore.currentSitesGroup = null;
  mapStore.useCurrentSiteGroup = false;
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
  console.log("Save Sites Group", sitesGroupName.value);
  console.log(("Current:", mapStore.currentSitesGroup));
  // TODO: Check exist - yes update | no add
  const savedGroupIdx = mapStore.savedSitesGroups.indexOf(
    (group) => group.name == sitesGroupName.value
  );
  if (savedGroupIdx != -1) {
    mapStore.currentSitesGroup[savedGroupIdx] = {
      ...mapStore.currentSitesGroup,
    };
  } else {
    mapStore.savedSitesGroups.push({
      ...mapStore.currentSitesGroup,
      name: sitesGroupName.value,
    });
  }
};

const selectSiteInGroup = (site) => {
  console.log("Site selected", site);
  mapStore.selectedSiteIds.add(site.id);
  mapStore.centerItem = {
    type: "site",
    id: site.id,
  };
  // console.log("Stops:", mapStore.getSiteStopIds(site.id));
};
const toggleSiteShown = (siteIdx) => {
  mapStore.currentSitesGroup.sites[siteIdx].shown =
    !mapStore.currentSitesGroup.sites[siteIdx].shown;
  if (mapStore.useCurrentSiteGroup == false) {
    mapStore.useCurrentSiteGroup = true;
  }
};
const deleteSiteFromGroup = (idx) => {
  console.log("Delete Site", mapStore.currentSitesGroup.sites[idx]);
  if (mapStore.selectedSiteIds.has(mapStore.currentSitesGroup.sites[idx].id)) {
    mapStore.selectedSiteIds.delete(mapStore.currentSitesGroup.sites[idx].id);
  }
  if (mapStore.currentSitesGroup.ids.size == 1) {
    mapStore.currentSitesGroup = null;
    mapStore.useCurrentSiteGroup = false;
  } else {
    if (mapStore.useCurrentSiteGroup == false) {
      mapStore.useCurrentSiteGroup = true;
    }
    mapStore.currentSitesGroup.ids.delete(
      mapStore.currentSitesGroup.sites[idx].id
    );
    mapStore.currentSitesGroup.sites.splice(idx, 1);
  }
};
// const ladColorSelect = (ladName) => {
//   console.log("Select Color for LAD:", ladName);
// };
// const ladColorUpdate = (color) => {
//   console.log("Set New color to:", color);
// };
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
