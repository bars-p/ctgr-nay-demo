<template>
  <social-tools
    v-if="props.mode === 'social'"
    :title="$t('navigation.menuItemSocial')"
  />
  <demand-tools
    v-else-if="props.mode === 'demand'"
    :title="$t('navigation.menuItemDemand')"
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
import DemandTools from "./MapTools/DemandTools.vue";

const props = defineProps(["mode"]);
</script>
