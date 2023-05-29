<template>
  <div>
    <tools-component :title="props.title">
      <template #actions>
        <v-text-field
          v-if="isSearching"
          v-model="searchString"
          density="compact"
          variant="underlined"
          class="search-field"
          hide-details
        >
          <template v-slot:append-inner>
            <v-btn
              v-show="searchString.length"
              density="compact"
              icon="mdi-close"
              size="small"
              class="mt-1"
              @click="clearSearch"
            >
            </v-btn>
          </template>
        </v-text-field>
        <v-btn
          density="comfortable"
          icon="mdi-magnify"
          size="small"
          @click="toggleSearch"
        >
        </v-btn>
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
            prepend-icon="mdi-magnify"
            size="small"
            variant="outlined"
            color="grey-darken-3"
            class="mr-3"
            >!LADs</v-btn
          >
          <v-btn
            prepend-icon="mdi-magnify"
            size="small"
            variant="outlined"
            color="grey-darken-3"
            class="ml-3"
            >!Stops</v-btn
          >
        </v-row>
        <v-row dense class="my-2">
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
        <v-label
          class="mt-2 text-subtitle-2"
          :text="$t('tools.socialLayers')"
        ></v-label>
        <v-checkbox
          hide-details
          density="compact"
          label="!Network skeleton"
        ></v-checkbox>
        <v-checkbox hide-details density="compact" label="!Stops"></v-checkbox>
        <v-divider class="my-3"></v-divider>
        <v-label class="mb-1 text-subtitle-2">!!LADs display options:</v-label>
        <apply-button></apply-button>
        <v-row no-gutters class="mb-3">
          <v-col cols="9">
            <v-select
              clearable
              density="compact"
              variant="underlined"
              label="!LAD Color"
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
        <v-row no-gutters class="mb-1">
          <v-col cols="9">
            <v-select
              clearable
              density="compact"
              variant="underlined"
              label="!LAD Width"
              hide-details
              class="mr-3 mt-1"
              :no-data-text="$t('general.noData')"
              :items="ladDisplayOptions"
            ></v-select>
          </v-col>
          <v-col cols="3" align-self="end">
            <v-text-field
              density="compact"
              variant="underlined"
              label="!Max"
              type="number"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-label class="mb-1 text-subtitle-2">!!Stops display options:</v-label>
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
      </template>
      <v-container class="data-block" v-if="true">
        <v-label class="mb-0 text-subtitle-2">!!Saved LAD-groups:</v-label>
        <v-list density="compact">
          <v-list-item
            v-for="(ladGroup, idx) in savedLadsMock"
            :key="ladGroup.name"
            @click="selectLadGroup(ladGroup)"
          >
            <v-list-item-title class="text-body-2">
              {{ idx + 1 }}. {{ ladGroup.name }}
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteLadGroup(ladGroup)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-container>
    </tools-component>
    <tools-component title="!LAD-Group" class="lad-group">
      <template #tools>
        <div class="mt-3">
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
        </div>
      </template>
      <v-container>
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
                icon="mdi-checkbox-blank"
                @click="ladColorSelect(lad.name)"
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
  </div>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import CancelButton from "../elements/CancelButton.vue";
import ApplyButton from "../elements/ApplyButton.vue";
import ConfigButton from "../elements/ConfigButton.vue";

import { ref, computed } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// import { useMapStore } from "@/store/map";
// const mapStore = useMapStore();

const props = defineProps(["title"]);

const isSearching = ref(false);
const searchString = ref("");

const clearSearch = () => (searchString.value = "");
const toggleSearch = () => {
  isSearching.value = !isSearching.value;
  if (searchString.value) {
    searchString.value = "";
  }
};

const selectMode = ref(null);
const selectModes = [
  {
    title: t("tools.socialZones"),
    value: "zones",
  },
  {
    title: t("tools.socialSavedDisplay"),
    value: "areas",
  },
  {
    title: "!Routes select",
    value: "routes",
  },
  {
    title: "!Stops select",
    value: "stops",
  },
];
const changeSelectMode = () => {
  console.log("Select Mode:", selectMode.value);
};

const clearSelectedLads = () => {
  console.log("Clear selected");
};
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

const savedLadsMock = [
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
];
const selectLadGroup = (ladGroup) => {
  console.log("Select", ladGroup);
};
const deleteLadGroup = (ladGroup) => {
  console.log("Delete", ladGroup);
};

// LAD Group
const ladsInGroupMock = ref([
  {
    id: 101,
    name: "1-0-1",
    color: "#DCE775",
  },
  {
    id: 102,
    name: "1-0-2",
    color: "#C0CA33",
  },
  {
    id: 201,
    name: "M-0-1",
    color: "#FF4081",
  },
  {
    id: 202,
    name: "M-0-2",
    color: "#C51162",
  },
]);

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
const ladColorSelect = (ladName) => {
  console.log("Select Color for LAD:", ladName);
};
const ladColorUpdate = (color) => {
  console.log("Set New color to:", color);
};
</script>

<style scoped>
.search-field {
  width: 50px;
  padding-bottom: 15px;
}
.data-block {
  overflow: auto;
  max-height: calc(100vh - 902px);
}
.lad-group {
  position: absolute;
  top: calc(64px + 20px);
  left: calc(100dvw - 340px);
}
</style>
