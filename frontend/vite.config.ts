import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/tasks-tracker/", // Update this to match your GitHub repository name
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
