<template>
  <tools-component :title="props.title">
    <template #actions>
      <v-progress-circular
        v-if="selectMode == 'many'"
        indeterminate
        color="primary"
        :width="3"
        :size="25"
        class="mr-4"
      ></v-progress-circular>
    </template>
    <template #tools>
      <v-row dense>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ t("tools.demandDirection") }}
          </v-label>
        </v-col>
        <v-col>
          <v-label class="text-subtitle-2">
            {{ t("tools.demandMode") }}
          </v-label>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <v-btn-toggle
            v-model="demandDirection"
            divided
            variant="outlined"
            density="comfortable"
            mandatory
          >
            <v-tooltip :text="$t('tools.demandFrom')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-upload" value="from"></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('tools.demandTo')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-download" value="to"></v-btn>
              </template>
            </v-tooltip>
          </v-btn-toggle>
        </v-col>
        <v-col>
          <v-btn-toggle
            v-model="selectMode"
            divided
            variant="outlined"
            density="comfortable"
            mandatory
          >
            <v-tooltip :text="$t('tools.demandOne')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-checkbox-blank"
                  value="one"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('tools.demandMany')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-checkbox-multiple-blank"
                  value="many"
                ></v-btn>
              </template>
            </v-tooltip>
          </v-btn-toggle>
          <v-btn
            v-if="selectMode == 'many'"
            icon="mdi-checkbox-marked-circle-outline"
            flat
            density="comfortable"
            class="ml-3"
          >
            <v-icon color="grey-darken-2"></v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="level"
            clearable
            hide-details
            variant="outlined"
            density="compact"
            :label="$t('tools.demandLevel')"
            class="mb-2"
            :items="selectItemsLevel"
            @update:model-value="processLevelSelect"
          ></v-select>
        </v-col>
      </v-row>
    </template>
  </tools-component>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";

import { defineProps, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps(["title"]);

const { t } = useI18n();

const demandDirection = ref("from");
const selectMode = ref("one");
const level = ref(null);

const selectItemsLevel = [
  {
    title: t("tools.demandAdminAreas"),
    value: "district",
  },
  {
    title: t("tools.socialZones"),
    value: "zone",
  },
  {
    title: t("tools.socialSavedDisplay"),
    value: "area",
  },
];
const processLevelSelect = () => {
  console.log("Selected Level", level);
};
</script>
