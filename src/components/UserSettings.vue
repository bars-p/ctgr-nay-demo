<template>
  <v-sheet
    :min-height="200"
    :width="300"
    rounded
    elevation="4"
    class="user-settings text-center mx-auto"
  >
    <v-btn
      icon="mdi-close"
      flat
      size="x-small"
      class="close-icon"
      @click="$emit('close')"
    ></v-btn>
    <v-avatar size="100" color="lightgrey" class="ma-4">
      <img src="@/assets/male.svg" alt="avatar" />
    </v-avatar>
    <p class="mb-5">
      {{ $t("navigation.fallbackUserName") }}
    </p>
    <v-select
      v-model="mapStore.activeMapStyle"
      density="compact"
      variant="outlined"
      flat
      class="px-7"
      :label="$t('navigation.mapStyle')"
      :no-data-text="$t('general.noData')"
      :items="mapStore.mapStyles"
    ></v-select>
  </v-sheet>
</template>

<script setup>
import { useMapStore } from "@/store/map";
const mapStore = useMapStore();
</script>

<style scoped>
.user-settings {
  position: absolute;
  right: 20px;
  top: calc(64px + 20px);
}
.close-icon {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
