<template>
  <map-component :mode="props.mode" />
  <map-tools :mode="props.mode" v-show="props.mode !== 'base'" />
  <user-settings
    v-if="mapStore.userSettingsShown"
    @close="closeUserSettings"
  ></user-settings>
</template>

<script setup>
import MapComponent from "@/components/MapComponent.vue";
import MapTools from "@/components/MapTools.vue";
import UserSettings from "@/components/UserSettings.vue";

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["mode"]);

// const showUserSettings = ref(true);

const closeUserSettings = () => {
  mapStore.userSettingsShown = false;
};
</script>

<style scoped></style>
