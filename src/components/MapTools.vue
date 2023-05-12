<template>
  <social-tools
    v-if="props.mode === 'social'"
    :title="$t('navigation.menuItemSocial')"
  />
  <tools-component v-else :title="props.mode">
    <template v-slot:actions>
      <v-btn density="comfortable" icon="mdi-magnify" size="small"> </v-btn>
    </template>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "./ToolsComponent.vue";
import SocialTools from "./MapTools/SocialTools.vue";

import { defineProps } from "vue";
const props = defineProps(["mode"]);
</script>
