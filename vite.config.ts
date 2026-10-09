import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    // No sourcemaps in production: the 12MB .js.map was uploaded to
    // Workers on every deploy for zero runtime benefit.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split stable vendor code into hashed chunks so repeat deploys
        // only re-upload changed app code and browsers keep vendor cached.
        // (Vite 8 / Rolldown API: `advancedChunks` replaces `manualChunks`.)
        advancedChunks: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            {
              name: "vendor-data",
              test: /node_modules[\\/](@tanstack|axios|zustand|react-hook-form|@hookform|zod)[\\/]/,
            },
            {
              name: "vendor-ui",
              test: /node_modules[\\/](radix-ui|@radix-ui|sonner|next-themes|clsx|tailwind-merge|class-variance-authority|lucide-react)[\\/]/,
            },
            { name: "charts", test: /node_modules[\\/]recharts[\\/]/ },
            { name: "motion", test: /node_modules[\\/]gsap[\\/]/ },
            { name: "dnd", test: /node_modules[\\/]@dnd-kit[\\/]/ },
            {
              name: "pdf",
              test: /node_modules[\\/](html2pdf\.js|jspdf|html2canvas|escodegen|color-name)[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
})
