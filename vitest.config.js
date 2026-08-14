import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    //El primer arranque descarga el binario de mongod; 5s por defecto no alcanza.
    hookTimeout: 120000,
    testTimeout: 20000,
  },
});
