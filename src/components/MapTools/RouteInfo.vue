<template>
  <div>
    <tools-component :title="'[' + props.lad?.id + '] ' + props.lad?.name">
      <template #actions>
        <close-button @close="processClose"></close-button>
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
        <div v-if="selectedMode == 'sites'">
          <v-row class="mt-2">
            <v-col>
              <v-label class="mb-1 text-subtitle-2">
                {{ $t("general.displayOptions") }}:
              </v-label>
              <apply-button @click="applyOptions"></apply-button>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                v-model="siteSizeMode"
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
                v-model="siteSizeStep"
                density="compact"
                hide-details
                variant="underlined"
                :label="$t('general.step')"
                type="number"
                :min="1"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters class="mb-3">
            <v-col cols="9">
              <v-select
                v-model="segmentWidthMode"
                clearable
                density="compact"
                variant="underlined"
                :label="$t('tools.routesSegmentWidth')"
                hide-details
                class="mr-3 mt-1"
                :no-data-text="$t('general.noData')"
                :items="ladDisplayOptions"
              ></v-select>
            </v-col>
            <v-col cols="3" align-self="end">
              <v-text-field
                v-model="segmentWidthStep"
                density="compact"
                hide-details
                variant="underlined"
                :label="$t('general.step')"
                type="number"
                :min="1"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense no-gutters>
            <v-col cols="12">
              <v-checkbox
                :disabled="siteSizeMode != 'flow'"
                v-model="showSegmentSpeed"
                :label="$t('tools.routesSegmentSpeed')"
                hide-details
                density="compact"
              ></v-checkbox>
            </v-col>
          </v-row>
        </div>
      </template>
      <v-container v-if="selectedMode == 'stats'" class="stats-block">
        <v-row v-for="item in props.categories" :key="item.field" no-gutters>
          <v-col>
            <v-label class="text-subtitle-2">
              {{ item.name }}
            </v-label>
            <p class="ml-5">
              {{ lad[item.field].toFixed(item.decimals) }} ({{
                lad[item.fieldGroup] + 1
              }}
              - {{ item.levels[lad[item.fieldGroup]].name }})
            </p>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-else class="sites-block">
        <v-list density="compact">
          <v-list-item
            v-for="(site, i) in sites"
            :key="site.order"
            @click="selectSite(site)"
          >
            <v-list-item-title
              class="text-body-2"
              :class="site.selected ? 'font-weight-bold' : ''"
            >
              {{ i + 1 }}. [{{ site.id }}] {{ site.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <!-- <p
          v-for="(siteId, i) in mapStore.getSitesByLad(props.lad.id)"
          :key="siteId"
        >
          {{ i + 1 }}. [{{ siteId }}] {{ mapStore.getSiteName(siteId) }}
        </p> -->
      </v-container>
    </tools-component>
    <route-chart :sites="sites" class="chart-block"></route-chart>
  </div>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import RouteChart from "../RouteChart.vue";
import CloseButton from "../elements/CloseButton.vue";
import ApplyButton from "../elements/ApplyButton.vue";

import { ref, watch, onMounted } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["lad", "categories"]);

const siteSizeMode = ref(null);
const siteSizeStep = ref(mapStore.routeInfoDefaultStep);
const segmentWidthMode = ref(null);
const segmentWidthStep = ref(mapStore.routeInfoDefaultStep);
const showSegmentSpeed = ref(false);

onMounted(() => {
  getSites();
});

watch(props, () => getSites());

const getSites = () => {
  // const sitesIds = mapStore.getSitesByLad(props.lad.id);
  const sitesIds = mapStore.routesData.filter(
    (item) => item.ladId == props.lad.id
  );
  sites.value = sitesIds.map((site) => ({
    ...site,
    id: site.siteId,
    selected: false,
    name: mapStore.getSiteName(site.siteId),
  }));
  // sites.value = sitesIds.map((id) => ({
  //   id,
  //   selected: false,
  //   name: mapStore.getSiteName(id),
  // }));
  console.log("Sites", sites.value);
  mapStore.routeInfoSites = sites;
  mapStore.routeInfoLad = props.lad;
};

const siteDisplayOptions = [
  {
    title: t("tools.sitesBoarding"),
    value: "board",
  },
  {
    title: t("tools.sitesAlighting"),
    value: "alight",
  },
  {
    title: t("tools.sitesFlowAfter"),
    value: "flow",
  },
  {
    title: t("tools.sitesBoardingTotal"),
    value: "board_total",
  },
  {
    title: t("tools.sitesAlightingTotal"),
    value: "alight_total",
  },
  {
    title: t("tools.sitesTripsNumber"),
    value: "trips",
  },
  {
    title: t("tools.sitesLadsNumber"),
    value: "lads",
  },
  {
    title: t("tools.sitesCapacity"),
    value: "capacity",
  },
];

const ladDisplayOptions = [
  {
    title: t("tools.routesRidership"),
    value: "flow",
  },
];

const sites = ref([]);

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

const selectSite = (site) => {
  console.log("Selected Site", site);
  site.selected = !site.selected;
};

const applyOptions = () => {
  if (siteSizeStep.value < 1) {
    siteSizeStep.value = mapStore.routeInfoDefaultStep;
  }
  if (segmentWidthStep.value < 1) {
    segmentWidthStep.value = mapStore.routeInfoDefaultStep;
  }
  const options = {
    siteMode: siteSizeMode.value,
    siteStep: siteSizeStep.value,
    segmentMode: segmentWidthMode.value,
    segmentStep: segmentWidthStep.value,
    showSpeed: showSegmentSpeed.value,
  };
  console.log("Apply Pressed", options);
  mapStore.routeInfoOptions = options;
};

const processClose = () => {
  mapStore.routeInfoSites = [];
  mapStore.routeInfoLad = null;
  mapStore.showRouteInfo = false;
};
</script>

<style scoped>
.stats-block {
  overflow: auto;
  max-height: calc(100vh - 290px);
}
.sites-block {
  overflow: auto;
  max-height: calc(100vh - 496px);
}
.chart-block {
  position: absolute;
  top: calc(100vh - 400px);
  margin-left: 360px;
  margin-right: 360px;
  /* margin-top: -300px; */
  height: 320px;
  width: calc(100vw - 940px);
}
</style>
