<template>
  <div>
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <base-logo />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        size="small"
        prepend-icon="mdi-chevron-down-circle"
        width="220"
        :ripple="false"
        class="mr-5"
      >
        {{ getDayTypeTitle }}
        <v-menu activator="parent">
          <v-list v-model:selected="dayTypeSelected" mandatory>
            <v-list-item
              v-for="(item, index) in dayTypes"
              :key="index"
              :value="item.idx"
              :disabled="item.disabled"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <!-- <v-select
        v-model="dayTypeSelected"
        variant="solo"
        flat
        hide-details
        single-line
        density="compact"
        label="Period"
        :items="dayTypes"
        class="period-select mr-5"
        color="red"
      >
      </v-select> -->
      <router-link to="/" class="mr-5">
        <v-btn color="secondary" @click="restoreMain">
          {{ projectName }}
        </v-btn>
      </router-link>
      <v-btn icon @click="toggleUserSettings">
        <v-avatar>
          <img src="@/assets/male.svg" alt="avatar" />
        </v-avatar>
      </v-btn>
    </v-app-bar>
    <v-footer app elevation="1"
      ><div class="text-body-2">&copy; 2023</div></v-footer
    >
    <v-navigation-drawer app v-model="drawer" border width="213">
      <side-menu :key="menuRefresh" class="mx-2" />
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import BaseLogo from "./BaseLogo.vue";
import SideMenu from "./SideMenu.vue";
import { ref, computed } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const drawer = ref(true);
const menuRefresh = ref(0);
// FIXME: Change to the store derived field
const projectNameMock = "Almaty Demo";
// TODO: Try to get the Name from Store or use fallback
const projectName = computed(
  () => projectNameMock || t("navigation.fallbackProjectName")
);

const dayTypes = [
  {
    title: t("general.workdayMorning"),
    value: "work-morning",
    disabled: false,
    idx: 0,
  },
  {
    title: t("general.workdayMidday"),
    value: "work-midday",
    disabled: true,
    idx: 1,
  },
  {
    title: t("general.weekendMidday"),
    value: "weekend-midday",
    disabled: true,
    idx: 2,
  },
];
const dayTypeSelected = ref([0]);
const getDayTypeTitle = computed(() => {
  return dayTypes[dayTypeSelected.value].title;
});

const toggleUserSettings = () => {
  mapStore.userSettingsShown = !mapStore.userSettingsShown;
};

const restoreMain = () => {
  menuRefresh.value++;
  console.log("Clear Side Menu", menuRefresh.value);

  // Clear data
  mapStore.socialColor = null;
  mapStore.socialBars = null;
  mapStore.clearSelectedCells();
  mapStore.clearSavedCellsData();

  mapStore.selectedSiteIds.clear();
  mapStore.currentSitesGroup = null;
  mapStore.savedSitesGroups = [];
  mapStore.useCurrentSiteGroup = false;
  mapStore.sitesSelectionMode = null;

  mapStore.routesSelectedIds.clear();
  mapStore.currentRoutesGroup = null;
  mapStore.savedRoutesGroups = [];
  mapStore.useCurrentRoutesGroup = false;
  mapStore.routesSelectMode = null;

  mapStore.demandResetData();
  mapStore.connectivityResetData();
  mapStore.accessabilityResetData();
};
</script>

<style scoped>
.period-select {
  max-width: 250px;
}
.v-select__selection,
.v-select__selection--comma,
.v-select.v-text-field input {
  color: blue !important;
}
</style>
