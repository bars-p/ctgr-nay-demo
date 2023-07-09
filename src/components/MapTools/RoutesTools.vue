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
              :label="$t('tools.routesSkeleton')"
              v-model="mapStore.layers[mapStore.layersIdxs.ladsTraces].shown"
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
              <v-icon :color="mapStore.skeletonColor"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="mapStore.skeletonColor"
                  show-swatches
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>
        <!-- <v-checkbox
          hide-details
          density="compact"
          :label="$t('tools.routesStops')"
          v-model="showStops"
        ></v-checkbox> -->

        <v-row dense class="mt-2 mb-4">
          <v-col>
            {{ $t("tools.routesLadsSelected") }}: <strong>0</strong>
            <cancel-button @click="clearSelectedLads"></cancel-button>
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
              $t("tools.routesAddTooltip")
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
              $t("tools.routesReplaceTooltip")
            }}</v-tooltip>
          </v-btn>
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
          <v-window-item value="lads">
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
          <v-window-item value="sites">
            <v-list density="compact">
              <v-list-item
                v-for="(stopGroup, idx) in savedStopsMock"
                :key="stopGroup.name"
                @click="selectStopsGroup(stopGroup)"
              >
                <v-list-item-title class="text-body-2">
                  {{ idx + 1 }}. {{ stopGroup.name }} ({{ stopGroup.count }})
                </v-list-item-title>
                <template #append>
                  <v-btn
                    density="comfortable"
                    size="small"
                    flat
                    icon="mdi-trash-can-outline"
                    @click.stop="deleteStopsGroup(idx)"
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
      :title="`${t('tools.routesLadGroup')} (${ladsInGroupMock.length})`"
      class="lad-group"
    >
      <template #actions>
        <search-bar v-model="searchLad"></search-bar>
        <close-button @close="processCloseGroup"></close-button>
      </template>
      <template #tools>
        <div class="mt-0">
          <v-text-field
            v-model="ladGroupName"
            clearable
            :label="$t('tools.routesGroupName')"
            variant="outlined"
            density="compact"
            hide-details
          >
            <template v-slot:append-inner>
              <v-icon v-if="readyToSave" @click="saveLadGroup"
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
            v-for="(lad, idx) in ladsInGroupMock"
            :key="lad.id"
            @click="selectSavedLad(lad)"
          >
            <v-list-item-title class="text-body-2">
              {{ idx + 1 }}. {{ lad.name }}
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                :icon="lad.shown ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click.stop="toggleLadShown(idx)"
              >
              </v-btn>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-checkbox-blank"
              >
                <v-icon :color="lad.color"></v-icon>
                <v-menu activator="parent" :close-on-content-click="false">
                  <v-color-picker
                    v-model="lad.color"
                    show-swatches
                    @update:model-value="ladColorUpdate"
                  ></v-color-picker>
                </v-menu>
              </v-btn>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteLad(lad)"
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
    ></distribution-dialog>
    <search-dialog
      v-model="showSearch"
      :title="$t('tools.routesSearchTitle')"
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

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["title"]);

const searchString = ref("");

const selectMode = ref(null);
const selectModes = [
  {
    title: t("tools.routesSelect"),
    value: "routes",
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

// const showSkeleton = ref(true);
// const showStops = ref(false);

// const skeletonColor = ref("#757575");
// const skeletonColorSelect = () => {
//   console.log("Skeleton color select");
// };

const clearSelectedLads = () => {
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
const savedStopsMock = [
  {
    name: "Stops around Hospital",
    count: 9,
  },
  {
    name: "Central stops",
    count: 57,
  },
];

const groupTabs = ["lads", "sites"];
const tabSelected = ref("lads");
const getSavedNumber = (name) => {
  return name == "lads" ? savedLadsMock.value.length : savedStopsMock.length;
};
const getSavedName = (tab) => {
  return tab == "lads" ? t("tools.routesLads") : t("tools.sitesSites");
};

const selectLadGroup = (ladGroup) => {
  console.log("Select", ladGroup);
};
const deleteLadGroup = (ladGroup) => {
  console.log("Delete", ladGroup);
  savedLadsMock.value.splice(ladGroup, 1);
  console.log("LADs:", savedLadsMock.value);
};
const selectStopsGroup = (item) => {
  console.log("Select stops group", item);
};
const deleteStopsGroup = (item) => {
  console.log("Delete stops group", item);
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

const ladsInGroupMock = ref([
  {
    id: 101,
    name: "1-0-1",
    color: "#DCE775",
    shown: true,
  },
  {
    id: 102,
    name: "1-0-2",
    color: "#C0CA33",
    shown: true,
  },
  {
    id: 201,
    name: "M-0-1",
    color: "#FF4081",
    shown: false,
  },
  {
    id: 202,
    name: "M-0-2",
    color: "#C51162",
    shown: true,
  },
]);

const processCloseGroup = () => {
  console.log("Close Group panel");
};

const searchLad = ref("");

const toggleLadShown = (ladIdx) => {
  ladsInGroupMock.value[ladIdx].shown = !ladsInGroupMock.value[ladIdx].shown;
};

const ladGroupName = ref(null);
const readyToSave = computed(() => {
  return ladGroupName.value?.length > 0;
});
const saveLadGroup = () => {
  console.log("Save LadGroup", ladGroupName.value);
};

const selectSavedLad = (lad) => {
  console.log("LAD selected", lad);
};
const deleteLad = (lad) => {
  console.log("Delete LAD", lad.name);
};
// const ladColorSelect = (ladName) => {
//   console.log("Select Color for LAD:", ladName);
// };
const ladColorUpdate = (color) => {
  console.log("Set New color to:", color);
};
</script>

<style scoped>
.data-block {
  overflow: auto;
  max-height: calc(100vh - 582px);
}
.data-lad-group {
  overflow: auto;
  max-height: calc(100vh - 470px);
}
.lad-group {
  position: absolute;
  top: calc(64px + 20px);
  left: calc(100dvw - 340px);
}
</style>
