<template>
  <tools-component :title="props.title">
    <template #tools>
      <v-row no-gutters>
        <v-col cols="8">
          <v-label class="text-subtitle-2">
            {{ t("tools.accessHighlight") }}:
          </v-label>
        </v-col>
        <v-col cols="2">
          <!-- <v-btn
            density="comfortable"
            size="small"
            flat
            icon="mdi-checkbox-blank"
            class="ml-5"
          >
            <v-icon :color="mapStore.accessGapColor"></v-icon>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker
                v-model="mapStore.accessGapColor"
                show-swatches
              ></v-color-picker>
            </v-menu>
          </v-btn> -->
        </v-col>
        <v-col cols="2">
          <apply-button @click="processHighlight"></apply-button>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-3">
        <v-col cols="9" align-self="end">
          <v-label>{{ t("tools.accessPopulation") }}</v-label>
        </v-col>
        <v-col cols="3" align-self="end">
          <v-select
            v-model="mapStore.populationAbove"
            :label="$t('general.level')"
            density="compact"
            variant="underlined"
            hide-details
            mandatory
            :items="levels"
          ></v-select>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-3">
        <v-col cols="9" align-self="end">
          <v-label>{{ t("tools.accessAccessability") }}</v-label>
        </v-col>
        <v-col cols="3" align-self="end">
          <v-select
            v-model="mapStore.accessabilityBelow"
            :label="$t('general.level')"
            density="compact"
            variant="underlined"
            hide-details
            mandatory
            :items="levels"
          ></v-select>
        </v-col>
      </v-row>
    </template>
  </tools-component>
</template>

<script setup>
import { useMapStore } from "@/store/map";
import ToolsComponent from "../ToolsComponent.vue";
import ApplyButton from "../elements/ApplyButton.vue";

// import { ref } from "vue";

import { useI18n } from "vue-i18n";
import { onMounted } from "vue";
const { t } = useI18n();

const props = defineProps(["title"]);

const mapStore = useMapStore();

onMounted(async () => {
  console.log("😡 Mounted Access");
  // processHighlight();
});

const levels = [
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

const processHighlight = () => {
  console.log("Highlight with color:", mapStore.accessGapColor);

  const paintData = {
    layerIdx: mapStore.layersIdxs.cellsFill,
    paintProps: {
      "fill-color": {
        property: "acc_lvl",
        stops: [
          [0, "#C00000"],
          [1, "#A66BD3"],
          [2, "#806000"],
          [3, "#375623"],
          [4, "#00B050"],
          [5, "#2F75B5"],
        ],
      },
      "fill-opacity": 0.7,
    },
  };
  const filterData = {
    layerIdx: mapStore.layersIdxs.cellsFill,
    filterProps: [
      "all",
      ["<=", ["get", "acc_lvl"], mapStore.accessabilityBelow],
      [">=", ["get", "pop_lvl"], mapStore.populationAbove],
    ],
  };

  mapStore.newLayerPaint = paintData;
  mapStore.newLayerFilter = filterData;

  mapStore.turnOnLayer(mapStore.layersIdxs.cellsFill);
};
</script>
