<template>
  <v-dialog v-model="dialogOpened" width="600px">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="10">
            <span class="text-h6">{{ title }}</span>
            <v-spacer></v-spacer>
          </v-col>
          <v-col cols="2" class="text-right">
            <close-button flat @close="dialogOpened = false"></close-button>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="overflow-auto">
        <v-autocomplete
          :items="searchItems"
          :label="searchLabel"
          v-model="itemsSelected"
          density="compact"
          item-title="name"
          item-value="id"
          chips
          closable-chips
          multiple
          focused
          variant="outlined"
        ></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="processSelect"
          :disabled="false"
          min-width="200px"
          >{{ $t("tools.routesDialogSelect") }}</v-btn
        >
        <v-btn color="primary" @click="closeSearch" min-width="200px">{{
          $t("tools.routesDialogClose")
        }}</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import CloseButton from "./elements/CloseButton.vue";

import { computed, ref } from "vue";

const props = defineProps([
  "modelValue",
  "title",
  "searchLabel",
  "searchItems",
]);
const emit = defineEmits(["update:modelValue", "select"]);

const dialogOpened = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const itemsSelected = ref([]);

const processSelect = () => {
  if (itemsSelected.value.length > 0) {
    console.log("Selected:", itemsSelected.value);
    emit("select", itemsSelected.value);
  }
  closeSearch();
};

const closeSearch = () => {
  if (itemsSelected.value.length > 0) {
    itemsSelected.value = [];
  }
  dialogOpened.value = false;
};

// const mockLads = [
//   {
//     name: "11-0-1",
//     selected: true,
//   },
//   {
//     name: "11-0-2",
//     selected: true,
//   },
//   {
//     name: "27-0-3",
//     selected: false,
//   },
//   {
//     name: "32-0-1",
//     selected: false,
//   },
//   {
//     name: "32-0-2",
//     selected: true,
//   },
//   {
//     name: "111-0-1",
//     selected: true,
//   },
//   {
//     name: "111-0-2",
//     selected: true,
//   },
//   {
//     name: "127-0-3",
//     selected: false,
//   },
//   {
//     name: "132-0-1",
//     selected: false,
//   },
//   {
//     name: "132-0-2",
//     selected: true,
//   },
//   {
//     name: "211-0-1",
//     selected: true,
//   },
//   {
//     name: "211-0-2",
//     selected: true,
//   },
//   {
//     name: "227-0-3",
//     selected: false,
//   },
//   {
//     name: "232-0-1",
//     selected: false,
//   },
//   {
//     name: "232-0-2",
//     selected: true,
//   },
// ];
</script>
