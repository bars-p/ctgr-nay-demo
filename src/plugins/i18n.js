import { createI18n } from "vue-i18n";
import { languages, defaultLocale } from "../translation";

const messages = Object.assign(languages);

export default createI18n({
  // something vue-i18n options here ...
  legacy: false,
  // globalInjection: true,
  fallbackLocale: "en",
  locale: defaultLocale,
  messages: messages,
});
