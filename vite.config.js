import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import avatarDirectoryPlugin from "./vite.plugins/avatarDirectory";
import { vite as vidstack } from "vidstack/plugins";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      vidstack(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) =>
              tag.startsWith("swiper-") || tag.startsWith("media-"),
          },
        },
      }),
      tailwindcss(),
      avatarDirectoryPlugin(),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    esbuild: {
      drop: isProd ? ["console"] : [],
    },
    build: {
      target: "es2015",
      sourcemap: isProd ? false : true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router"],
            youtube: ["youtube"],
          },
        },
      },
    },
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
  };
});
