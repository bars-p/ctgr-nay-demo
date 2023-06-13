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
            v-for="item in categories"
            :key="item.field"
            class="text-body-2"
          >
            <tr>
              <template v-for="(range, i) in item.levels" :key="range.name">
                <td v-if="!i" rowspan="2" class="classification-header">
                  {{ item.name }}
                </td>
                <td class="classification-header">
                  <strong>{{ range.name }}</strong> {{ range.details }}
                </td>
              </template>
            </tr>
            <tr>
              <td
                class="data-block"
                v-for="i in 6"
                :key="i"
                @click="selectRangeItem(item.field, i - 1)"
                :style="`background: rgba(0, 0, 0, ${
                  distribution[item.field][i - 1].percent / 100
                }); color: ${
                  distribution[item.field][i - 1].percent / 100 > 0.4
                    ? '#fff'
                    : 'rgba(0,0,0,0.87)'
                }; border: ${
                  distribution[item.field][i - 1].selected
                    ? '3px solid #4da6ff'
                    : ''
                }`"
              >
                <v-row dense no-gutters>
                  <v-col cols="10" class="mt-1">
                    {{ distribution[item.field][i - 1].percent }}% ({{
                      distribution[item.field][i - 1].number
                    }})
                  </v-col>
                  <v-col cols="2" class="text-right">
                    <v-menu location="start">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-chevron-down"
                          flat
                          size="small"
                          density="comfortable"
                          @click.stop="showItems(item.field, i - 1)"
                          :color="
                            distribution[item.field][i - 1].percent / 100 > 0.2
                              ? 'grey-darken-1'
                              : 'grey-lighten-3'
                          "
                        >
                        </v-btn>
                      </template>
                      <v-list density="compact" max-height="300px">
                        <v-list-item
                          v-for="(obj, j) in props.fieldItems[item.field][
                            i - 1
                          ]"
                          :key="obj.id"
                          :value="obj.id"
                          class="my-0 py-0"
                          min-width="120px"
                          @click.stop="toggleSelectItem(item.field, i - 1, j)"
                        >
                          <v-list-item-title class="text-body-2">
                            <v-icon
                              v-if="obj.selected"
                              size="x-small"
                              color="green"
                              >mdi-check-bold</v-icon
                            >
                            <v-icon v-else size="x-small" color="grey-lighten-1"
                              >mdi-check</v-icon
                            >
                            ({{ obj.id }}) {{ obj.name }} [{{ obj.value }}]
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
          @click="selectDistributionResult"
          :disabled="!props.anySelected"
          min-width="200px"
          >{{ $t("tools.routesDialogSelect") }}</v-btn
        >
        <v-btn
          color="primary"
          @click="dialogOpened = false"
          min-width="200px"
          >{{ $t("tools.routesDialogClose") }}</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import CloseButton from "./elements/CloseButton.vue";

import { computed } from "vue";

const props = defineProps([
  "modelValue",
  "title",
  "categories",
  "fieldLength",
  "selected",
  "anySelected",
  "items",
  "fieldItems",
]);
const emit = defineEmits([
  "update:modelValue",
  "selectFieldGroup",
  "distributed",
  "selectItem",
  "done",
]);

const dialogOpened = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const distribution = computed(() => {
  console.log("😡😡😡 Distribution Calculation");
  const dataObject = {};
  const distributedItems = {};
  props.categories.forEach((item) => {
    dataObject[item.fieldGroup] = new Array(props.fieldLength).fill(null);
    distributedItems[item.fieldGroup] = new Array(props.fieldLength).fill(null);
  });
  Object.keys(dataObject).forEach((group) => {
    for (let i = 0; i < dataObject[group].length; i++) {
      dataObject[group][i] = new Object({
        number: 0,
        percent: 0,
        selected: props.selected[group][i],
      });
      distributedItems[group][i] = new Array();
    }
  });
  props.items.forEach((item) => {
    Object.keys(dataObject).forEach((group) => {
      dataObject[group][item[group]].number++;
      distributedItems[group][item[group]].push({
        id: item.id,
        name: item.name,
        value: Math.round(item[getFieldName(group)]),
        selected: true,
      });
    });
  });
  Object.keys(dataObject).forEach((group) => {
    for (let i = 0; i < dataObject[group].length; i++) {
      dataObject[group][i].percent =
        Math.round(
          (100 * 100 * dataObject[group][i].number) / props.items.length
        ) / 100;
    }
  });
  console.log("TABLE: Distributed Items", distributedItems);
  emit("distributed", distributedItems);
  return dataObject;
});

const selectRangeItem = (fieldGroup, idx) => {
  console.log("Selected:", fieldGroup, idx);

  emit("selectFieldGroup", { fieldGroup: fieldGroup, idx: idx });

  console.log("Distribution", distribution.value);
};

const showItems = (name, idx) => {
  console.log("Show Items for:", name, idx);
};

const toggleSelectItem = (fieldGroup, position, idx) => {
  console.log("Item", fieldGroup, position, idx);
  emit("selectItem", { fieldGroup, position, idx });
  // mockLads.value[idx].selected = !mockLads.value[idx].selected;
};

const selectDistributionResult = () => {
  const selectedItemsIds = new Set();
  Object.keys(props.selected).forEach((fieldGroup) => {
    for (let i = 0; i < props.fieldLength; i++) {
      if (props.selected[fieldGroup][i]) {
        // TODO: If true - process all items in group
        console.log("🟢 Group selected", fieldGroup);
        console.log("🟢 Group items", props.fieldItems[fieldGroup][i]);
        props.fieldItems[fieldGroup][i].forEach((item) => {
          if (item.selected) {
            selectedItemsIds.add(item.id);
          }
        });
      }
    }
  });

  console.log("DISTRIBUTION RESULT", props.fieldItems);
  emit("done", selectedItemsIds);
  dialogOpened.value = false;
};

// FIXME: A bit weird way to get field name
const getFieldName = (groupName) => {
  return groupName.split("_")[0];
};
</script>

<style scoped>
.classification-header {
  color: rgba(0, 0, 0, 0.54) !important;
  border-top: 2px solid black !important;
  width: 300px;
  min-width: 201px;
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
  box-shadow: 0px 0px 12px #8d8d8d;
}
</style>
