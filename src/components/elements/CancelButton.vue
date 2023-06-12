<template>
  <v-btn flat density="compact" icon class="cancel-button">
    <v-icon color="red-lighten-2"> mdi-cancel </v-icon>
    <v-tooltip activator="parent" location="bottom">{{
      $t("general.clear")
    }}</v-tooltip>
  </v-btn>
</template>

<script setup></script>

<style scoped>
.cancel-button {
  position: absolute;
  right: 15px;
}
</style>
