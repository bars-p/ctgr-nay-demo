<template>
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
            class="mt-2"
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
        clearable
        hide-details
        variant="outlined"
        density="compact"
        :label="$t('tools.socialColor')"
        class="mb-4"
        :items="[
          'Population',
          'Employment',
          'Visitors',
          'Population +5 years',
          'Employment +5 years',
        ]"
      ></v-select>
      <v-select
        clearable
        hide-details
        variant="outlined"
        density="compact"
        :label="$t('tools.socialBars')"
        class="mb-2"
        :items="[
          'Population',
          'Employment',
          'Visitors',
          'Population +5 years',
          'Employment +5 years',
        ]"
      ></v-select>
      <v-switch
        density="compact"
        :label="$t('tools.socialMix')"
        hide-details
        class="ml-1"
      ></v-switch>
      <v-label
        class="mt-1 text-subtitle-2"
        :text="$t('tools.socialLayers')"
      ></v-label>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialBoundary')"
        v-model="borderShownState"
      ></v-checkbox>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialZones')"
        v-model="zonesShownState"
      ></v-checkbox>
    </template>

    <v-container class="data-block">
      <div class="area-data mb-5">
        <v-label class="text-subtitle-2 mb-2">
          {{ $t("tools.socialSelected") }}
        </v-label>
        <div>
          <v-label class="mr-3">
            {{ $t("general.size") }}
          </v-label>
          <strong>{{ (36000).toLocaleString() }}</strong> {{ $t("general.m")
          }}<sup>2</sup>
        </div>
        <div>
          <v-label class="mr-3">
            {{ $t("general.population") }}
          </v-label>
          <strong>{{ (3407).toLocaleString() }}</strong> (<strong>23</strong>
          {{ $t("general.perKm") }}<sup>2</sup>)
        </div>
        <div>
          <v-label class="mr-3">
            {{ $t("general.employment") }}
          </v-label>
          <strong>{{ (803).toLocaleString() }}</strong> (<strong>8</strong>
          {{ $t("general.perKm") }}<sup>2</sup>)
        </div>
        <div class="mt-3">
          <v-text-field
            v-model="activeAreaName"
            clearable
            :label="$t('tools.socialName')"
            variant="outlined"
            density="compact"
            append-icon="mdi-content-save"
            @click:append="saveArea"
            hide-details
          ></v-text-field>
        </div>
      </div>

      <div v-if="areas.length">
        <v-divider></v-divider>
        <v-label class="text-subtitle-2 mt-3">{{
          $t("tools.socialSaved")
        }}</v-label>
        <v-list density="compact">
          <v-list-item
            v-for="(area, idx) in areasFiltered"
            :key="area.id"
            @click="selectSavedArea(area)"
          >
            <v-list-item-title class="text-body-2">
              {{ idx + 1 }}. {{ area.name }} ({{ area.cells.length }})
            </v-list-item-title>
            <template #append>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-checkbox-blank"
              >
                <v-icon :color="area.color"></v-icon>
                <v-menu activator="parent" :close-on-content-click="false">
                  <v-color-picker
                    v-model="area.color"
                    show-swatches
                  ></v-color-picker>
                </v-menu>
              </v-btn>
              <v-btn
                density="comfortable"
                size="small"
                flat
                icon="mdi-trash-can-outline"
                @click.stop="deleteSavedArea(area)"
              >
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-container>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";

import { onMounted, defineProps, ref, computed } from "vue";

import { useMapStore } from "@/store/map";

const mapStore = useMapStore();

const props = defineProps(["title"]);

// General tasks
onMounted(() => {
  console.log("Social Tools Mounted");
  // TODO: Init component controls to default state (in sync with map layers state)
});

const borderShownState = computed({
  get() {
    return mapStore.layers[0].shown;
  },
  set(newValue) {
    mapStore.layers[0].shown = newValue;
  },
});
const zonesShownState = computed({
  get() {
    return mapStore.layers[3].shown;
  },
  set(newValue) {
    mapStore.layers[3].shown = newValue;
  },
});

// Search logic
const isSearching = ref(false);
const searchString = ref("");

const clearSearch = () => (searchString.value = "");
const toggleSearch = () => {
  isSearching.value = !isSearching.value;
  if (searchString.value) {
    searchString.value = "";
  }
};
const areasFiltered = computed(() => {
  return areas.value.filter((area) =>
    area.name.toLowerCase().includes(searchString.value)
  );
});

// Areas logic
const activeAreaName = ref(null);

const mockSavedAreas = [
  {
    id: 1,
    name: "Deep forest",
    cells: [1, 2, 3],
    color: "#228B22",
  },
  {
    id: 2,
    name: "Urban zone",
    cells: [32, 54, 332],
    color: "#DC143C",
  },
  {
    id: 3,
    name: "City Center",
    cells: [123, 242, 312, 2112],
    color: "#4169E1",
  },
];
const areas = ref(mockSavedAreas);

// FIXME:

const saveArea = () => {
  // FIXME: Store test -- REMOVE

  mapStore.layers[0].shown = !mapStore.layers[0].shown;

  // FIXME:
  if (!activeAreaName.value) {
    return;
  }
  // TODO: Check name to be unique

  console.log("Save Area", activeAreaName.value);
};

const selectSavedArea = (area) => {
  console.log("Area selected:", area);
};
const deleteSavedArea = (area) => {
  console.log("DELETE:", area);
};
</script>

<style scoped>
.data-block {
  overflow: auto;
  max-height: calc(100vh - 500px);
}
.area-data {
  display: flex;
  flex-direction: column;
}
.search-field {
  width: 50px;
  padding-bottom: 15px;
}
</style>
