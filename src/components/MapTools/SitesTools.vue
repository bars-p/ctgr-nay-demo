<template>
  <div>
    <tools-component :title="props.title">
      <template #actions>
        <search-bar v-model="searchString"></search-bar>
      </template>

      <template #tools>
        <v-select
          v-model="selectMode"
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
        <v-row>
          <v-col cols="10">
            <v-checkbox
              hide-details
              density="compact"
              :label="$t('tools.sitesSites')"
              v-model="showSites"
            ></v-checkbox>
          </v-col>
          <v-col cols="2" align-self="center">
            <v-btn
              density="comfortable"
              size="small"
              flat
              icon="mdi-checkbox-blank"
            >
              <v-icon :color="sitesColor"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="sitesColor"
                  show-swatches
                  @update:model-value="sitesColorUpdate"
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>
        <v-checkbox
          hide-details
          density="compact"
          :label="$t('tools.routesStops')"
          v-model="showStops"
        ></v-checkbox>

        <v-row dense class="mt-2 mb-4">
          <v-col>
            {{ $t("tools.sitesSelected") }}: <strong>0</strong>
            <cancel-button @click="clearSelectedSites"></cancel-button>
          </v-col>
        </v-row>
        <v-row dense class="my-3" justify="space-around">
          <v-btn
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-plus"
          >
            <template #prepend>
              <v-icon color="green-darken-2"></v-icon>
            </template>
            {{ $t("general.add") }}
            <v-tooltip activator="parent" location="bottom">{{
              $t("tools.sitesAddTooltip")
            }}</v-tooltip>
          </v-btn>
          <v-btn
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-refresh"
          >
            <template #prepend>
              <v-icon color="red-darken-2"></v-icon>
            </template>
            {{ $t("general.replace") }}
            <v-tooltip activator="parent" location="bottom">{{
              $t("tools.sitesReplaceTooltip")
            }}</v-tooltip>
          </v-btn>
        </v-row>

        <!-- <div v-if="false">
          <v-divider class="my-5"></v-divider>

          <v-label class="my-1 text-subtitle-2"
            >!!Stops display options:</v-label
          >
          <apply-button></apply-button>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                clearable
                density="compact"
                variant="underlined"
                label="!Stop Color"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="stopDisplayOptions"
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
                label="!Stop Size"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="stopDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <v-text-field
                density="compact"
                hide-details
                variant="underlined"
                label="!Max"
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
                label="!Stop Shape"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="stopDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <config-button></config-button>
            </v-col>
          </v-row>
        </div> -->
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
                v-for="(siteGroup, idx) in savedSitesMock"
                :key="siteGroup.name"
                @click="selectSitesGroup(siteGroup)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ siteGroup.name }} ({{ siteGroup.count }})
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
      :title="`${t('tools.sitesGroup')} (${sitesInGroupMock.length})`"
      class="data-group"
    >
      <template #actions>
        <search-bar v-model="searchSite"></search-bar>
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
            v-for="(site, idx) in sitesInGroupMock"
            :key="site.id"
            @click="selectSavedSite(site)"
          >
            <v-list-item-title class="text-body-2">
              {{ idx + 1 }}. {{ site.name }}
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
                @click.stop="deleteSite(site)"
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
    ></search-dialog>
  </div>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import CancelButton from "../elements/CancelButton.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import ConfigButton from "../elements/ConfigButton.vue";
import SearchBar from "../elements/SearchBar.vue";
import DistributionDialog from "../DistributionDialog.vue";
import SearchDialog from "../SearchDialog.vue";

import { ref, computed } from "vue";

import { useI18n } from "vue-i18n";
import CloseButton from "../elements/CloseButton.vue";
const { t } = useI18n();

// import { useMapStore } from "@/store/map";
// const mapStore = useMapStore();

const props = defineProps(["title"]);

const searchString = ref("");

const selectMode = ref(null);
const selectModes = [
  {
    title: t("tools.stopsSitesSelect"),
    value: "sites",
  },
  {
    title: t("tools.demandAdminAreas"),
    value: "zones",
  },
  {
    title: t("tools.socialSavedDisplay"),
    value: "areas",
  },
];
const changeSelectMode = () => {
  console.log("Select Mode:", selectMode.value);
};

const showDistribution = ref(false);
const showSearch = ref(false);

const showSites = ref(false);
const showStops = ref(true);

const sitesColor = ref("#757575");
const sitesColorUpdate = () => {
  console.log("Sites new color", sitesColor.value);
};

const clearSelectedSites = () => {
  console.log("Clear selected");
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

const sitesInGroupMock = ref([
  {
    id: 1,
    site_id: 100,
    name: "Gogol St.",
    shown: true,
  },
  {
    id: 2,
    site_id: 100,
    name: "Alatau drive",
    shown: true,
  },
  {
    id: 3,
    site_id: 100,
    name: "Abay",
    shown: false,
  },
  {
    id: 4,
    site_id: 200,
    name: "Dostyk Hwy",
    shown: true,
  },
]);

const processCloseGroup = () => {
  console.log("Close Group panel");
};

const searchSite = ref("");

const toggleSiteShown = (siteIdx) => {
  sitesInGroupMock.value[siteIdx].shown =
    !sitesInGroupMock.value[siteIdx].shown;
};

const sitesGroupName = ref(null);
const readyToSave = computed(() => {
  return sitesGroupName.value?.length > 0;
});
const saveSitesGroup = () => {
  console.log("Save Sites Group", sitesGroupName.value);
};

const selectSavedSite = (site) => {
  console.log("Site selected", site);
};
const deleteSite = (site) => {
  console.log("Delete Site", site.name);
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
