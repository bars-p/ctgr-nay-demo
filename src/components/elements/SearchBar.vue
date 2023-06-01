<template>
  <v-text-field
    v-if="isSearching"
    v-model="searchString"
    density="compact"
    variant="underlined"
    class="search-field"
    hide-details
  >
    <template v-slot:append-inner>
      <v-btn
        v-show="searchString.length"
        density="compact"
        icon="mdi-close"
        size="small"
        class="mt-1"
        @click="clearSearch"
      >
      </v-btn>
    </template>
  </v-text-field>
  <v-btn
    density="comfortable"
    icon="mdi-magnify"
    size="small"
    @click="toggleSearch"
  >
  </v-btn>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const isSearching = ref(false);

const searchString = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const toggleSearch = () => {
  isSearching.value = !isSearching.value;
  searchString.value = "";
};
const clearSearch = () => {
  searchString.value = "";
};
</script>

<style scoped>
.search-field {
  max-width: 80px;
  padding-bottom: 15px;
}
</style>
