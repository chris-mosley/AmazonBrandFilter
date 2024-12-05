import translation from "assets/_locales/en/messages.json";

const resources = {
  translation,
} as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
