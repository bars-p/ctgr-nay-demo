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
            >!Distribution</v-btn
          >
          <v-btn
            prepend-icon="mdi-magnify"
            size="small"
            variant="outlined"
            color="grey-darken-3"
            class="ml-3"
            >!Search</v-btn
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
              label="!Network skeleton"
              v-model="showSkeleton"
            ></v-checkbox>
          </v-col>
          <v-col cols="2" align-self="center">
            <v-btn
              density="comfortable"
              size="small"
              flat
              icon="mdi-checkbox-blank"
            >
              <v-icon :color="skeletonColor"></v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-color-picker
                  v-model="skeletonColor"
                  show-swatches
                  @update:model-value="skeletonColorUpdate"
                ></v-color-picker>
              </v-menu>
            </v-btn>
          </v-col>
        </v-row>
        <v-checkbox
          hide-details
          density="compact"
          label="!Stops"
          v-model="showStops"
        ></v-checkbox>

        <v-row dense class="mt-2 mb-4">
          <v-col>
            !LADs selected: <strong>0</strong>
            <cancel-button @click="clearSelectedLads"></cancel-button>
          </v-col>
        </v-row>
        <v-row dense class="my-3" justify="space-around">
          <v-btn
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-plus"
          >
            !Add
            <v-tooltip activator="parent" location="bottom"
              >!Add selected</v-tooltip
            >
          </v-btn>
          <v-btn
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-refresh"
          >
            !Replace
            <v-tooltip activator="parent" location="bottom"
              >!Replace with selected</v-tooltip
            >
          </v-btn>
        </v-row>

        <div v-if="false">
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
        </div>
      </template>
      <v-container class="data-block" v-if="true">
        <v-label class="mb-0 text-subtitle-2">!!Saved groups:</v-label>
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
          <v-window-item v-for="item in groupTabs" :key="item" :value="item">
            <v-list density="compact" v-if="item == 'LADs'">
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
            <v-list density="compact" v-else>
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
        <!-- <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quasi earum ullam animi quod et atque, exercitationem, repellat nemo
          sed laudantium sequi pariatur perferendis, illo nostrum vero magni
          reiciendis. Fugiat.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quasi earum ullam animi quod et atque, exercitationem, repellat nemo
          sed laudantium sequi pariatur perferendis, illo nostrum vero magni
          reiciendis. Fugiat.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quasi earum ullam animi quod et atque, exercitationem, repellat nemo
          sed laudantium sequi pariatur perferendis, illo nostrum vero magni
          reiciendis. Fugiat.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quasi earum ullam animi quod et atque, exercitationem, repellat nemo
          sed laudantium sequi pariatur perferendis, illo nostrum vero magni
          reiciendis. Fugiat.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quasi earum ullam animi quod et atque, exercitationem, repellat nemo
          sed laudantium sequi pariatur perferendis, illo nostrum vero magni
          reiciendis. Fugiat.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quasi earum ullam animi quod et atque, exercitationem, repellat nemo
          sed laudantium sequi pariatur perferendis, illo nostrum vero magni
          reiciendis. Fugiat.
        </p> -->
      </v-container>
    </tools-component>

    <tools-component
      :title="`!LAD-Group (${ladsInGroupMock.length})`"
      class="lad-group"
    >
      <template #actions>
        <search-bar v-model="searchLad"></search-bar>
      </template>
      <template #tools>
        <div class="mt-0">
          <v-text-field
            v-model="ladGroupName"
            clearable
            label="!LAD-Group name"
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
              <v-label class="mb-1 text-subtitle-2">!!Display options:</v-label>
              <apply-button></apply-button>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                clearable
                density="compact"
                variant="underlined"
                label="!Color"
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
                label="!Width"
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
                label="!Max"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </template>
      <v-container class="data-lad-group">
        <v-label class="mb-0 text-subtitle-2">!!LADs:</v-label>
        <p>{{ searchLad }}</p>

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
        <!-- <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          eveniet reprehenderit obcaecati at quod, quis modi magnam molestias
          ullam a, vel explicabo id veniam unde velit, earum sunt. Rem, ad.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          eveniet reprehenderit obcaecati at quod, quis modi magnam molestias
          ullam a, vel explicabo id veniam unde velit, earum sunt. Rem, ad.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          eveniet reprehenderit obcaecati at quod, quis modi magnam molestias
          ullam a, vel explicabo id veniam unde velit, earum sunt. Rem, ad.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          eveniet reprehenderit obcaecati at quod, quis modi magnam molestias
          ullam a, vel explicabo id veniam unde velit, earum sunt. Rem, ad.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          eveniet reprehenderit obcaecati at quod, quis modi magnam molestias
          ullam a, vel explicabo id veniam unde velit, earum sunt. Rem, ad.
        </p> -->
      </v-container>
    </tools-component>
  </div>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import CancelButton from "../elements/CancelButton.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import ConfigButton from "../elements/ConfigButton.vue";
import SearchBar from "../elements/SearchBar.vue";

import { ref, computed } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// import { useMapStore } from "@/store/map";
// const mapStore = useMapStore();

const props = defineProps(["title"]);

const searchString = ref("");

const selectMode = ref(null);
const selectModes = [
  {
    title: "!Routes select",
    value: "routes",
  },
  {
    title: "!Districts",
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

const showSkeleton = ref(true);
const showStops = ref(false);

const skeletonColor = ref("#757575");
// const skeletonColorSelect = () => {
//   console.log("Skeleton color select");
// };
const skeletonColorUpdate = () => {
  console.log("Skeleton new color", skeletonColor.value);
};

const clearSelectedLads = () => {
  console.log("Clear selected");
};

const stopDisplayOptions = [
  {
    title: "!Trips number",
    value: "trips",
  },
  {
    title: "!LADs number",
    value: "lads",
  },
  {
    title: "!Boarding",
    value: "in",
  },
  {
    title: "!Alighting",
    value: "out",
  },
];

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

const groupTabs = ["LADs", "Stops"];
const tabSelected = ref("LADs");
const getSavedNumber = (name) => {
  return name == "LADs" ? savedLadsMock.value.length : savedStopsMock.length;
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
    title: "!Frequency",
    value: "freq",
  },
  {
    title: "!Ridership",
    value: "ride",
  },
  {
    title: "!Speed",
    value: "speed",
  },
  {
    title: "!Transit mode",
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
