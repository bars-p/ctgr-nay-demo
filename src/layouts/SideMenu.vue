<template>
  <v-list :items="items"> </v-list>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const items = [
  {
    type: "subheader",
    title: t("navigation.menuGroupCity"),
  },
  {
    title: t("navigation.menuItemSocial"),
    value: 1,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-home-city-outline",
      to: "/social",
    },
  },
  {
    title: t("navigation.menuItemDemand"),
    value: 2,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-account-switch-outline",
      to: "/demand",
    },
  },
  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupNetwork"),
  },
  {
    title: t("navigation.menuItemRoutes"),
    value: 3,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-vector-polyline",
      to: "/routes",
    },
  },
  {
    title: t("navigation.menuItemStops"),
    value: 4,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-store-outline",
      to: "/stops",
    },
  },
  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupAnalytics"),
  },
  {
    title: t("navigation.menuItemDuplication"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-poll",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemDirectness"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-transit-connection-variant",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemRidership"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-account-group",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemConnectivity"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-transit-connection",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemPtal"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-land-plots-circle",
      to: "/stops",
    },
  },
  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupEdit"),
  },
  {
    title: t("navigation.menuItemEditRoutes"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-vector-polyline-edit",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemEditStops"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-store-edit-outline",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemEditZones"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-view-dashboard-edit-outline",
      to: "/stops",
    },
  },
  {
    title: t("navigation.menuItemEditCells"),
    value: 5,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-vector-point-edit",
      to: "/stops",
    },
  },
];

// const processClick = () => {
//   console.log(itemSelected);
// };
</script>

<style scoped></style>
