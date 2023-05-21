<template>
  <div>
    <map-button
      icon-symbol="mdi-format-rotate-90"
      @click="$emit('compass')"
      class="button-item"
    ></map-button>
    <map-button
      icon-symbol="mdi-rotate-3d"
      @click="$emit('rotate')"
      class="button-item"
    ></map-button>
  </div>
</template>

<script setup>
import MapButton from "./MapButton.vue";

// const handleCompassClick = () => {
//   console.log("Compass button clicked");
// };
// const handleRotateClick = () => {
//   console.log("Rotate button clicked");
// };
</script>

<style scoped>
.button-item {
  margin-left: 5px;
}
</style>
