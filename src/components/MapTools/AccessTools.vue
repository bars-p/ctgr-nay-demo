<template>
  <tools-component :title="props.title">
    <template #tools>
      <v-row no-gutters>
        <v-col cols="8">
          <v-label class="text-subtitle-2">
            {{ t("tools.accessHighlight") }}:
          </v-label>
        </v-col>
        <v-col cols="2">
          <v-btn
            density="comfortable"
            size="small"
            flat
            icon="mdi-checkbox-blank"
            class="ml-5"
          >
            <v-icon :color="gapColor"></v-icon>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="gapColor" show-swatches></v-color-picker>
            </v-menu>
          </v-btn>
        </v-col>
        <v-col cols="2">
          <apply-button @click="processHighlight"></apply-button>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-3">
        <v-col cols="9" align-self="end">
          <v-label>{{ t("tools.accessPopulation") }}</v-label>
        </v-col>
        <v-col cols="3" align-self="end">
          <v-text-field
            v-model="popLevel"
            density="compact"
            hide-details
            variant="underlined"
            type="number"
            :label="$t('general.level')"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-3">
        <v-col cols="9" align-self="end">
          <v-label>{{ t("tools.accessAccessability") }}</v-label>
        </v-col>
        <v-col cols="3" align-self="end">
          <v-text-field
            v-model="accessLevel"
            density="compact"
            hide-details
            variant="underlined"
            type="number"
            :label="$t('general.level')"
          ></v-text-field>
        </v-col>
      </v-row>
    </template>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";
import ApplyButton from "../elements/ApplyButton.vue";

import { ref } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps(["title"]);

const gapColor = ref("#ff0000");
const popLevel = ref(null);
const accessLevel = ref(null);

const processHighlight = () => {
  console.log(
    "Highlight with color:",
    gapColor.value,
    popLevel.value,
    accessLevel.value
  );
  let errorsFound = false;
  if (!popLevel.value || popLevel.value < 0) {
    popLevel.value = null;
    errorsFound = true;
  }
  if (!accessLevel.value || accessLevel.value < 0) {
    accessLevel.value = null;
    errorsFound = true;
  }
  if (errorsFound) {
    console.warn("Incorrect value");
    return;
  }
};
</script>
