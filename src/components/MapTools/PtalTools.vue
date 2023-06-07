<template>
  <div>
    <tools-component :title="props.title"></tools-component>
  </div>
</template>

<script setup>
import ToolsComponent from "../ToolsComponent.vue";

const props = defineProps(["title"]);
</script>
