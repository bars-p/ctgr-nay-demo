<template>
  <v-sheet class="tool-box" rounded elevation="2">
    <v-toolbar density="compact" rounded flat>
      <v-btn icon density="compact" @click="toggleHidden">
        <v-icon v-if="hidden">mdi-chevron-down</v-icon>
        <v-icon v-else>mdi-chevron-up</v-icon>
      </v-btn>
      <v-toolbar-title class="text-body-1 font-weight-medium">
        {{ props.title }}
      </v-toolbar-title>
      <!-- <v-spacer></v-spacer> -->
      <slot name="actions"></slot>
    </v-toolbar>
    <div v-if="!hidden">
      <v-divider></v-divider>
      <v-container>
        <slot name="tools"></slot>
      </v-container>
      <v-divider></v-divider>
      <slot></slot>
    </div>
  </v-sheet>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps(["title"]);

const hidden = ref(false);

const toggleHidden = () => (hidden.value = !hidden.value);
</script>
<style scoped>
.tool-box {
  position: relative;
  z-index: 10;
  top: 20px;
  left: 30px;
  width: 300px;
  max-height: calc(100vh - 64px - 100px);
}
</style>
