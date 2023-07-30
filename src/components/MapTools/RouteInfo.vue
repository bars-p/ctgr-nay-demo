<template>
  <tools-component :title="props.lad?.name">
    <template #actions>
      <close-button @close="mapStore.showRouteInfo = false"></close-button>
    </template>
    <v-container>
      <v-row v-for="item in props.categories" :key="item.field" no-gutters>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ item.name }}
          </v-label>
          <p class="ml-5">{{ lad[item.field] }}</p>
        </v-col>
      </v-row>
    </v-container>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import CloseButton from "../elements/CloseButton.vue";

import { useMapStore } from "@/store/map";
const mapStore = useMapStore();

const props = defineProps(["lad", "categories"]);
</script>

<style lang="scss" scoped></style>
