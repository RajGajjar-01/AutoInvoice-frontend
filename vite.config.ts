import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

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
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt": a new version waits until the user taps Reload, so an
      // update can never wipe a half-filled invoice form.
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        id: "/",
        name: "UnifiedDesk",
        short_name: "UnifiedDesk",
        description:
          "GST invoices, quotations, payments, customers and stock for Indian businesses.",
        lang: "en-IN",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        theme_color: "#09090b",
        background_color: "#09090b",
        categories: ["business", "finance", "productivity"],
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "New invoice",
            url: "/create-invoice",
            icons: [{ src: "/pwa-192.png", sizes: "192x192" }],
          },
          {
            name: "Invoices",
            url: "/invoices",
            icons: [{ src: "/pwa-192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,webmanifest}"],
        // Heavy, rarely used chunks (PDF export, charts) are cached on first
        // use instead of being downloaded for every install.
        globIgnores: ["**/pdf-*.js", "**/charts-*.js"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/assets\/(pdf|charts)-.*\.js$/.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "heavy-chunks" },
          },
        ],
        // Never answer API or crawler URLs with the app shell. /api is never
        // cached either, so auth cookies and financial data stay network-only.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
        ],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
