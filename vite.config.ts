import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = (env.VITE_API_BASE_URL || "https://eyoga.live").replace(/\/$/, "");
  const localApi = (env.VITE_LOCAL_API_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");

  return {
    base: "/",
    build: {
      outDir: "dist",
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiBase,
          changeOrigin: true,
          secure: true,
          router: (req) => {
            const u = req.url || "";
            if (u.startsWith("/api/ping") || u.startsWith("/api/demo")) {
              return localApi;
            }
            return apiBase;
          },
        },
      },
    },
  };
});
