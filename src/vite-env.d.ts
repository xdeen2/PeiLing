/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_METALPRICE_API_KEY?: string
  readonly VITE_METALS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
