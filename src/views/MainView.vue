<template>
  <map-component :mode="props.mode" />
  <map-tools :mode="props.mode" v-show="props.mode !== 'base'" />
</template>

<script setup>
import MapComponent from "@/components/MapComponent.vue";
import MapTools from "@/components/MapTools.vue";

import { defineProps } from "vue";

const props = defineProps(["mode"]);
</script>

<style scoped></style>
