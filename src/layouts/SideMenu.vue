<template>
  <v-list :items="items" density="compact"> </v-list>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const items = [
  // City block

  {
    type: "subheader",
    title: t("navigation.menuGroupCity"),
    value: "city-group",
  },
  {
    title: t("navigation.menuItemSocial"),
    value: "city-social",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-home-city-outline",
      to: "/social",
    },
  },
  {
    title: t("navigation.menuItemDemand"),
    value: "city-demand",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-account-switch-outline",
      to: "/demand",
    },
  },

  // Transport block

  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupNetwork"),
    value: "transit",
  },
  {
    title: t("navigation.menuItemRoutes"),
    value: "transit-routes",
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
    value: "transit-sites",
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
    value: "analytics",
  },
  {
    title: t("navigation.menuItemDuplication"),
    value: "analytics-duplication",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-poll",
      to: "/duplication",
    },
  },
  {
    title: t("navigation.menuItemDirectness"),
    value: "analytics-directness",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-transit-connection-variant",
      to: "/directness",
    },
  },
  {
    title: t("navigation.menuItemRidership"),
    value: "analytics-ridership",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-account-group",
      to: "/ridership",
    },
  },
  {
    title: t("navigation.menuItemConnectivity"),
    value: "analytics-connectivity",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-arrow-decision",
      to: "/connectivity",
    },
  },
  {
    title: t("navigation.menuItemAccess"),
    value: "analytics-access",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-land-plots-circle",
      to: "/access",
    },
  },

  // Reports block
  // FIXME:

  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupReports"),
    value: "reports",
  },
  {
    title: t("navigation.menuItemReportArea"),
    value: "reports-area",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-file-image-outline",
      to: "/reports/area",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemReportSegment"),
    value: "reports-segment",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-file-percent-outline",
      to: "/reports/segment",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemReportRoute"),
    value: "reports-route",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-file-swap-outline",
      to: "/reports/route",
      disabled: true,
    },
  },

  // Tools block
  // FIXME:

  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupTools"),
    value: "tools",
  },
  {
    title: t("navigation.menuItemToolsDeadhead"),
    value: "tools-deadhead",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-arrow-u-down-left",
      to: "/tools/deadhead",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemToolsPuls"),
    value: "tools-pulls",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-warehouse",
      to: "/tools/pulls",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemToolsSites"),
    value: "tools-sites",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-store-marker-outline",
      to: "/tools/sites",
      disabled: true,
    },
  },

  // Edit block

  {
    type: "divider",
  },
  {
    type: "subheader",
    title: t("navigation.menuGroupEdit"),
    value: "edit",
  },
  {
    title: t("navigation.menuItemEditRoutes"),
    value: "edit-routes",
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
    value: "edit-sites",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-store-edit-outline",
      to: "/edit/sites",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemEditZones"),
    value: "edit-zones",
    props: {
      nav: "nav",
      "prepend-icon": "mdi-view-dashboard-edit-outline",
      to: "/edit/zones",
      disabled: true,
    },
  },
  {
    title: t("navigation.menuItemEditCells"),
    value: "edit-cells",
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
