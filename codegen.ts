import { loadEnvConfig } from "./scripts/load-env.js";
import type { CodegenConfig } from "@graphql-codegen/cli";

loadEnvConfig();

const schemaUrl = process.env.VITE_GRAPHQL_URL;

if (!schemaUrl) {
  throw new Error(
    "VITE_GRAPHQL_URL no está definida. Copiá .env.example a .env y asegurate de que el backend esté corriendo (el codegen introspecciona el schema real)."
  );
}

const config: CodegenConfig = {
  schema: schemaUrl,
  documents: ["src/**/*.graphql"],
  generates: {
    "src/graphql/generated/": {
      preset: "client",
      plugins: [],
      config: {
        useTypeImports: true,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
