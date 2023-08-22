<template>
  <v-sheet rounded elevation="2">
    <v-container>
      <!-- <close-button flat @close="closeChart" class="float-right"></close-button> -->
      <Scatter :data="data" :options="options" class="chart-style" />
    </v-container>
  </v-sheet>
</template>

<script setup>
// import CloseButton from "./elements/CloseButton.vue";

import { computed } from "vue";

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
} from "chart.js";
import { Scatter } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const props = defineProps(["sites"]);

// const closeChart = () => {
//   console.log("Close chart");
//   console.log("Sites Data", props.sites);
// };

// const data = {
//   labels: ["January", "February", "March"],
//   datasets: [
//     {
//       label: t("tools.sitesBoarding"),
//       type: "bar",
//       data: [40, 20, 12],
//       backgroundColor: mapStore.routeInfoBoardColor,
//     },
//     {
//       label: t("tools.sitesAlighting"),
//       type: "bar",
//       data: [10, 14, 11],
//       backgroundColor: mapStore.routeInfoAlightColor,
//     },
//     {
//       label: t("tools.routesLoad"),
//       type: "line",
//       data: [40, 20, 12],
//     },
//   ],
// };

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
    ],
  };

  return dataObject;
});

const options = {
  responsive: true,
  scales: {
    x: {
      type: "linear",
      ticks: {
        stepSize: 1,
      },
    },
    // y: {
    //   beginAtZero: true,
    // },
  },
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        title: function (tooltipItems) {
          const idx = tooltipItems[0].dataIndex;
          const km = +tooltipItems[0].label;

          return `${idx + 1}. ${props.sites[idx].name} (${
            Math.round(km * 10) / 10
          } ${t("general.km")})`;
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
