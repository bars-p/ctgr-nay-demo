<template>
  <v-sheet rounded elevation="2">
    <v-container>
      <close-button flat @close="closeChart" class="float-right"></close-button>
      <p style="background-color: salmon">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt officia
        omnis iusto, hic nostrum tempora repellendus modi earum provident magni
        consectetur debitis non praesentium necessitatibus rem inventore at
        temporibus nesciunt.
      </p>
    </v-container>
  </v-sheet>
</template>

<script setup>
import CloseButton from "./elements/CloseButton.vue";

const closeChart = () => {
  console.log("Close chart");
};
</script>

<style scoped></style>
