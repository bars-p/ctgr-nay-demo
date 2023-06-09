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
  // {
  //   title: t("navigation.menuItemStops"),
  //   value: 4,
  //   props: {
  //     nav: "nav",
  //     "prepend-icon": "mdi-store-outline",
  //     to: "/stops",
  //   },
  // },
  {
    title: t("navigation.menuItemSites"),
    value: 4,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-store-outline",
      to: "/sites",
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
      to: "/duplication",
    },
  },
  {
    title: t("navigation.menuItemDirectness"),
    value: 6,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-transit-connection-variant",
      to: "/directness",
    },
  },
  {
    title: t("navigation.menuItemRidership"),
    value: 7,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-account-group",
      to: "/ridership",
    },
  },
  {
    title: t("navigation.menuItemConnectivity"),
    value: 8,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-transit-connection",
      to: "/connectivity",
    },
  },
  {
    title: t("navigation.menuItemAccess"),
    value: 9,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-land-plots-circle",
      to: "/access",
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
    value: 10,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-vector-polyline-edit",
      disabled: true,
      to: "/edit/routes",
    },
  },
  // {
  //   title: t("navigation.menuItemEditStops"),
  //   value: 11,
  //   props: {
  //     nav: "nav",
  //     "prepend-icon": "mdi-store-edit-outline",
  //     to: "/edit/stops",
  //   },
  // },
  {
    title: t("navigation.menuItemEditSites"),
    value: 12,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-store-edit-outline",
      to: "/edit/sites",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemEditZones"),
    value: 13,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-view-dashboard-edit-outline",
      to: "/edit/zones",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemEditCells"),
    value: 14,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-vector-point-edit",
      to: "/edit/cells",
      disabled: true,
    },
  },
];

// const processClick = () => {
//   console.log(itemSelected);
// };
</script>
