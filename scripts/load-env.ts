import { config } from "dotenv";

export function loadEnvConfig() {
  config({ path: ".env" });
}
