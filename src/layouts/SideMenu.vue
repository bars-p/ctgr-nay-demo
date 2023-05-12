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
      "prepend-icon": "mdi-account-group",
      to: "/social",
    },
  },
  {
    title: t("navigation.menuItemDemand"),
    value: 2,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-account-switch",
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
      "prepend-icon": "mdi-sign-real-estate",
      to: "/routes",
    },
  },
  {
    title: t("navigation.menuItemStops"),
    value: 4,
    props: {
      nav: "nav",
      "prepend-icon": "mdi-bus-stop",
      to: "/stops",
    },
  },
];

// const processClick = () => {
//   console.log(itemSelected);
// };
</script>

<style scoped></style>
