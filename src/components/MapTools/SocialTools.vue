<template>
  <tools-component :title="props.title">
    <template v-slot:actions>
      <v-btn density="comfortable" icon="mdi-magnify" size="small"> </v-btn>
    </template>
    <template v-slot:tools>
      <v-select
        clearable
        hide-details
        variant="outlined"
        density="compact"
        :label="$t('tools.socialColor')"
        class="mb-4"
        :items="[
          'Population',
          'Employment',
          'Population +5 years',
          'Employment +5 years',
        ]"
      ></v-select>
      <v-select
        clearable
        hide-details
        variant="outlined"
        density="compact"
        :label="$t('tools.socialBars')"
        class="mb-2"
        :items="[
          'Population',
          'Employment',
          'Population +5 years',
          'Employment +5 years',
        ]"
      ></v-select>
      <v-switch
        density="compact"
        :label="$t('tools.socialMix')"
        hide-details
        class="ml-1"
      ></v-switch>
      <v-label class="mt-1" :text="$t('tools.socialLayers')"></v-label>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialBoundary')"
      ></v-checkbox>
      <v-checkbox
        hide-details
        density="compact"
        :label="$t('tools.socialZones')"
      ></v-checkbox>
    </template>
    <v-container class="data-block">
      <span class="text-body-2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod
        reprehenderit ipsa dolor, exercitationem tempora nisi eligendi quia
        laudantium, adipisci animi rerum cupiditate doloremque odit dolore,
        veniam veritatis voluptates aliquam! Obcaecati. Lorem ipsum dolor sit
        amet consectetur adipisicing elit. Quod reprehenderit ipsa dolor,
        exercitationem tempora nisi eligendi quia laudantium, adipisci animi
        rerum cupiditate doloremque odit dolore, veniam veritatis voluptates
        aliquam! Obcaecati. Lorem ipsum dolor sit amet consectetur adipisicing
        elit. Quod reprehenderit ipsa dolor, exercitationem tempora nisi
        eligendi quia laudantium, adipisci animi rerum cupiditate doloremque
        odit dolore, veniam veritatis voluptates aliquam! Obcaecati. Lorem ipsum
        dolor sit amet consectetur adipisicing elit. Quod reprehenderit ipsa
        dolor, exercitationem tempora nisi eligendi quia laudantium, adipisci
        animi rerum cupiditate doloremque odit dolore, veniam veritatis
        voluptates aliquam! Obcaecati. Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Quod reprehenderit ipsa dolor, exercitationem tempora
        nisi eligendi quia laudantium, adipisci animi rerum cupiditate
        doloremque odit dolore, veniam veritatis voluptates aliquam! Obcaecati.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod
        reprehenderit ipsa dolor, exercitationem tempora nisi eligendi quia
        laudantium, adipisci animi rerum cupiditate doloremque odit dolore,
        veniam veritatis voluptates aliquam! Obcaecati. Lorem ipsum dolor sit
        amet consectetur adipisicing elit. Quod reprehenderit ipsa dolor,
        exercitationem tempora nisi eligendi quia laudantium, adipisci animi
        rerum cupiditate doloremque odit dolore, veniam veritatis voluptates
        aliquam! Obcaecati. Lorem ipsum dolor sit amet consectetur adipisicing
        elit. Quod reprehenderit ipsa dolor, exercitationem tempora nisi
        eligendi quia laudantium, adipisci animi rerum cupiditate doloremque
        odit dolore, veniam veritatis voluptates aliquam! Obcaecati.
      </span>
    </v-container>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";

import { defineProps } from "vue";
const props = defineProps(["title"]);
</script>

<style scoped>
.data-block {
  overflow: auto;
  max-height: calc(100vh - 500px);
}
</style>
