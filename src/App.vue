<template>
  <v-app>
    <v-main>
      <base-layout />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import BaseLayout from "./layouts/BaseLayout.vue";
</script>
