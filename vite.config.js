import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Tailwind v4 is wired directly into the Vite pipeline (no PostCSS config needed).
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
