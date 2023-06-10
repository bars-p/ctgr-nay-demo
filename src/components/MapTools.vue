<template>
  <social-tools
    v-if="props.mode === 'social'"
    :title="$t('navigation.menuItemSocial')"
  />
  <demand-tools
    v-else-if="props.mode === 'demand'"
    :title="$t('navigation.menuItemDemand')"
  />
  <routes-tools
    v-else-if="props.mode === 'routes'"
    :title="$t('navigation.menuItemRoutes')"
  />
  <!-- <stops-tools
    v-else-if="props.mode === 'stops'"
    :title="$t('navigation.menuItemStops')"
  /> -->
  <sites-tools
    v-else-if="props.mode === 'sites'"
    :title="$t('navigation.menuItemSites')"
  />
  <connectivity-tools
    v-else-if="props.mode === 'connectivity'"
    :title="$t('navigation.menuItemConnectivity')"
  />
  <access-tools
    v-else-if="props.mode === 'access'"
    :title="$t('tools.accessToolsTitle')"
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
import RoutesTools from "./MapTools/RoutesTools.vue";
// import StopsTools from "./MapTools/StopsTools.vue";
import SitesTools from "./MapTools/SitesTools.vue";
import ConnectivityTools from "./MapTools/ConnectivityTools.vue";
import AccessTools from "./MapTools/AccessTools.vue";

const props = defineProps(["mode"]);
</script>
