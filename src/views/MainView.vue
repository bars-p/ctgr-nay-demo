<template>
  <div class="text-h5">Main View</div>
  <div class="text-body1">Mode: {{ props.mode }}</div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps(["mode"]);
</script>
