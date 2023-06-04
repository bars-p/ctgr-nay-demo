<template>
  <v-dialog v-model="dialogOpened" width="1600px">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="11">
            <span class="text-h6">{{ title }}</span>
            <v-spacer></v-spacer>
          </v-col>
          <v-col cols="1" class="text-right">
            <close-button flat @close="dialogOpened = false"></close-button>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="overflow-auto">
        <v-table density="compact" class="distribution-table">
          <tbody
            v-for="item in Categories"
            :key="item.name"
            class="text-body-2"
          >
            <tr>
              <template v-for="(range, i) in item.criterias" :key="range.name">
                <td v-if="!i" rowspan="2" class="classification-header">
                  {{ item.name }}
                </td>
                <td class="classification-header">
                  <strong>{{ range.name }}</strong> ({{ range.from }}-{{
                    range.to
                  }})
                </td>
              </template>
            </tr>
            <tr>
              <td
                class="data-block"
                v-for="i in 6"
                :key="i"
                @click="selectRangeItem(item.name, i)"
              >
                <v-row dense no-gutters>
                  <v-col cols="10" class="mt-1"> 19% (7) </v-col>
                  <v-col cols="2" class="text-right">
                    <v-menu location="start">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-chevron-down"
                          flat
                          size="small"
                          density="comfortable"
                          @click.stop="showItems(item.field, i)"
                        >
                        </v-btn>
                      </template>
                      <v-list density="compact" max-height="300px">
                        <v-list-item
                          v-for="(lad, i) in mockLads"
                          :key="lad.name"
                          :value="lad.name"
                          class="my-0 py-0"
                          min-width="120px"
                          @click.stop="toggleSelectLad(lad.name, i)"
                        >
                          <v-list-item-title class="text-body-2">
                            <v-icon
                              v-if="lad.selected"
                              size="x-small"
                              color="green"
                              >mdi-check-bold</v-icon
                            >
                            <v-icon v-else size="x-small" color="grey-lighten-1"
                              >mdi-check</v-icon
                            >
                            {{ lad.name }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-col>
                </v-row>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="dialogOpened = false"
          :disabled="false"
          min-width="200px"
          >!Select</v-btn
        >
        <v-btn color="primary" @click="dialogOpened = false" min-width="200px"
          >!Close</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Categories from "./Distributions";

import CloseButton from "./elements/CloseButton.vue";

import { ref, computed } from "vue";

const props = defineProps(["modelValue", "title"]);
const emit = defineEmits(["update:modelValue"]);

const dialogOpened = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const selectRangeItem = (name, idx) => {
  console.log("Selected:", name, idx);
};

const showItems = (name, idx) => {
  console.log("Show Items for:", name, idx);
};

const mockLads = ref([
  {
    name: "11-0-1",
    selected: true,
  },
  {
    name: "11-0-2",
    selected: true,
  },
  {
    name: "27-0-3",
    selected: false,
  },
  {
    name: "32-0-1",
    selected: false,
  },
  {
    name: "32-0-2",
    selected: true,
  },
]);

const toggleSelectLad = (name, idx) => {
  console.log("LAD", name);
  mockLads.value[idx].selected = !mockLads.value[idx].selected;
};
</script>

<style scoped>
.classification-header {
  color: rgba(0, 0, 0, 0.54) !important;
  border-top: 2px solid black !important;
  width: 300px;
}
.distribution-table tr td {
  border: 1px solid #e0e0e075;
}
.distribution-table {
  border: 1px solid #e0e0e0;
}
.distribution-focus {
  box-shadow: 0px 0px 8px rgb(25, 118, 210);
}
.data-block {
  cursor: pointer;
}
.data-block:hover {
  box-shadow: 0px 0px 8px #8d8d8d;
}
</style>
