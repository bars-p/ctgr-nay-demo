<template>
  <tools-component :title="'[' + props.lad?.id + '] ' + props.lad?.name">
    <template #actions>
      <close-button @close="mapStore.showRouteInfo = false"></close-button>
    </template>
    <template #tools>
      <v-select
        v-model="selectedMode"
        :items="displayModes"
        mandatory
        hide-details
        variant="outlined"
        density="compact"
        :label="$t('tools.routesSelectMode')"
      >
      </v-select>
    </template>
    <v-container v-if="selectedMode == 'stats'" class="stats-block">
      <v-row v-for="item in props.categories" :key="item.field" no-gutters>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ item.name }}
          </v-label>
          <p class="ml-5">{{ lad[item.field].toFixed(item.decimals) }}</p>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else class="sites-block">
      <p
        v-for="(siteId, i) in mapStore.getSitesByLad(props.lad.id)"
        :key="siteId"
      >
        {{ i + 1 }}. {{ mapStore.getSiteName(siteId) }}
      </p>
    </v-container>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import CloseButton from "../elements/CloseButton.vue";

import { ref } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["lad", "categories"]);

const selectedMode = ref("sites");

const displayModes = [
  {
    title: t("tools.routesSitesList"),
    value: "sites",
  },
  {
    title: t("tools.routesStats"),
    value: "stats",
  },
];
</script>

<style scoped>
.stats-block {
  overflow: auto;
  max-height: calc(100vh - 510px);
}
.sites-block {
  overflow: auto;
  max-height: calc(100vh - 410px);
}
</style>
