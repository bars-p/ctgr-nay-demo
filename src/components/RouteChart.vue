<template>
  <v-sheet rounded elevation="2">
    <v-container>
      <!-- <close-button flat @close="closeChart" class="float-right"></close-button> -->
      <Scatter
        :data="data"
        :options="options"
        class="chart-style"
        ref="chartRef"
        @click="onClick"
      />
    </v-container>
  </v-sheet>
</template>

<script setup>
// import CloseButton from "./elements/CloseButton.vue";

import { computed, ref } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  ScatterController,
} from "chart.js";

// import Chart from 'chart.js/auto';

import { Scatter, getElementAtEvent } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  BarController,
  ScatterController
);

const chartRef = ref(null);

const onClick = (e) => {
  console.log("Clicked", e);

  const { chart } = chartRef.value;

  console.log("Chart", chart);

  if (!chart) {
    console.warn("Chart not found");
    return;
  }

  const element = getElementAtEvent(chart, e);

  if (!element.length) {
    return;
  }

  const { datasetIndex, index } = element[0];

  console.log("Dataset", datasetIndex);
  console.log("Item", index);

  let siteItem = null;

  switch (datasetIndex) {
    case 3:
      // Selected items
      siteItem = mapStore.routeInfoSites.filter((site) => site.selected)[index];
      siteItem.selected = false;
      break;

    case 4:
      // Not-Selected items
      siteItem = mapStore.routeInfoSites.filter((site) => !site.selected)[
        index
      ];
      siteItem.selected = true;
      break;

    default:
      // All other
      mapStore.routeInfoSites[index].selected =
        !mapStore.routeInfoSites[index].selected;
      break;
  }
};

const props = defineProps(["sites"]);

const data = computed(() => {
  const dataObject = {
    labels: props.sites.map((site) => site.name),
    datasets: [
      {
        label: t("tools.routesLoad"),
        type: "line",
        stepped: true,
        pointRadius: 5,
        data: props.sites.map((site) => ({ x: site.r_acc, y: site.load_pl })),
        borderColor: `${mapStore.routeInfoFlowColor}A0`,
        backgroundColor: `${mapStore.routeInfoFlowColor}A0`,
      },
      {
        label: t("tools.sitesBoarding"),
        type: "bar",
        data: props.sites.map((site) => ({ x: site.r_acc, y: site.board })),
        backgroundColor: `${mapStore.routeInfoBoardColor}A0`,
      },
      {
        label: t("tools.sitesAlighting"),
        type: "bar",
        data: props.sites.map((site) => ({ x: site.r_acc, y: site.alight })),
        backgroundColor: `${mapStore.routeInfoAlightColor}A0`,
      },
      {
        label: t("general.selected"),
        type: "scatter",
        pointRadius: 10,
        pointHoverRadius: 10,
        data: props.sites
          .filter((site) => site.selected)
          .map((site) => ({ x: site.r_acc, y: 0 })),
        // borderColor: "#A9A9A9",
        borderWidth: 2,
        // backgroundColor: "#A9A9A9",
        backgroundColor: "#FF0000",
      },
      {
        label: t("general.notSelected"),
        type: "scatter",
        pointRadius: 10,
        pointHoverRadius: 10,
        data: props.sites
          .filter((site) => !site.selected)
          .map((site) => ({ x: site.r_acc, y: 0 })),
        borderColor: "#A9A9A9",
        borderWidth: 2,
        backgroundColor: "#FFFFFF",
      },
    ],
  };

  return dataObject;
});

const options = {
  responsive: true,
  animation: false,
  scales: {
    x: {
      type: "linear",
      ticks: {
        stepSize: 1,
      },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          // console.log("Tooltip", tooltipItems);

          let siteItem = null;

          const { datasetIndex } = tooltipItems[0];

          const idx = tooltipItems[0].dataIndex;

          switch (datasetIndex) {
            case 3:
              // Parsing Selected
              siteItem = props.sites.filter((site) => site.selected)[idx];
              break;
            case 4:
              // Parsing Not-Selected
              siteItem = props.sites.filter((site) => !site.selected)[idx];
              break;

            default:
              siteItem = props.sites[idx];
              break;
          }

          const { order, name, r_acc } = siteItem;

          const title = `${order}. ${name} (${Math.round(r_acc * 10) / 10} ${t(
            "general.km"
          )})`;

          return title;
        },
        label: (tooltip) => {
          // console.log("Label", tooltip);
          const { datasetIndex } = tooltip;
          switch (datasetIndex) {
            case 3:
            case 4:
              // Selected and Not-Selected
              return false;

            default:
              // Other
              return `${tooltip.dataset.label}: ${tooltip.formattedValue}`;
          }
        },
      },
    },
  },
};
</script>

<style scoped>
.chart-style {
  height: 300px;
  max-height: 300px;
}
</style>
