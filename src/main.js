/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";
import { useI18n } from "vue-i18n";

// Plugins
import { registerPlugins } from "@/plugins";

import "mapbox-gl/dist/mapbox-gl.css";

const app = createApp(App, {
  setup() {
    const { t } = useI18n();
    return { t };
  },
});

registerPlugins(app); // app.use(i18n)

app.mount("#app");
