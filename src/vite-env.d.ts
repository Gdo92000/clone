/// <reference types="vite/client" />

declare const __USE_MOCK__: boolean;
declare const __DB_PROVIDER__: 'memory' | 'postgres';

interface ImportMetaEnv {
  readonly VITE_MOCK: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
