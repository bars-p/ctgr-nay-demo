<template>
  <v-btn size="x-small" class="button">
    <v-icon size="x-large"> {{ props.iconSymbol }} </v-icon>
  </v-btn>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps(["iconSymbol"]);
</script>
<style scoped>
.button {
  width: 36px;
  height: 35px;
}
</style>
