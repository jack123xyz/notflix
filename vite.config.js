import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import avatarDirectoryPlugin from "./vite.plugins/avatarDirectory";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // This tells Vue that swiper-* tags are custom elements and not Vue components
            isCustomElement: (tag) => tag.startsWith("swiper-"),
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
      // Drop console.log in production
      drop: isProd ? ["console"] : [],
    },
  };
});
