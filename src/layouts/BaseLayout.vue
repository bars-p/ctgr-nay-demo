<template>
  <div>
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <base-logo />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <router-link to="/">
        <v-btn color="secondary" @click="restoreMain">
          {{ projectName }}
        </v-btn>
      </router-link>
      <v-btn icon>
        <v-avatar>
          <img src="@/assets/male.svg" alt="avatar" />
        </v-avatar>
      </v-btn>
    </v-app-bar>
    <v-footer app elevation="1"
      ><div class="text-body-2">&copy; 2023</div></v-footer
    >
    <v-navigation-drawer v-model="drawer" border width="213">
      <side-menu :key="menuRefresh" class="mx-2" />
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import BaseLogo from "./BaseLogo.vue";
import SideMenu from "./SideMenu.vue";
import { ref, computed } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const drawer = ref(true);
const menuRefresh = ref(0);

const projectName = computed(() => t("navigation.fallbackProjectName")); // TODO: Try to get the Name from Store or use fallback

const restoreMain = () => {
  menuRefresh.value++;
  console.log("Clear Side Menu", menuRefresh.value);
};
</script>
