/// <reference types="vite/client" />

declare const __USE_MOCK__: boolean;

interface ImportMetaEnv {
  readonly VITE_MOCK: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
