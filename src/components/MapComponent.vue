<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted, defineProps } from "vue";

const props = defineProps(["mode"]);

onMounted(() => {
  console.log("Map onMounted Called", props.mode);
  // TODO: Init map instance
  //
  // TODO: Load Data
  //
  // TODO: Set default view
  //
});
</script>

<style scoped>
#map {
  width: 100%;
  height: calc(100vh - 64px - 36px);
  position: absolute;
  background-color: salmon;
}
</style>
